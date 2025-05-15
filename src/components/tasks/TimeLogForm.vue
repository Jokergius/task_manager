<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title class="text-h5">Добавить отметку времени</v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="submit">
          <v-row>
            <v-col cols="12" v-if="isManager">
              <v-select
                v-model="formData.user_id"
                label="Пользователь"
                :items="users"
                item-title="username"
                item-value="id"
                :hint="
                  formData.user_id
                    ? 'Логирование времени для выбранного пользователя'
                    : 'Выберите пользователя'
                "
                persistent-hint
              ></v-select>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model.number="formData.spent_hours"
                label="Потраченное время (часы)"
                type="number"
                min="0.01"
                step="0.25"
                :rules="[rules.required, rules.positive]"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="formData.comment"
                label="Комментарий"
                rows="3"
                counter
                maxlength="500"
                hint="Опишите, что было сделано за это время"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="dialog = false">Отмена</v-btn>
        <v-btn color="primary" variant="text" @click="submit" :loading="loading">Сохранить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="showSnackbar" :color="snackbarColor" :timeout="3000">
    {{ snackbarText }}
    <template v-slot:actions>
      <v-btn color="white" icon="mdi-close" @click="showSnackbar = false" size="small"></v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import type { User } from '@/types'
import { useAuthStore } from '@/stores/authStore'
import timeLogService from '@/api/timeLogService'

export default defineComponent({
  name: 'TimeLogForm',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    taskId: {
      type: Number,
      required: true,
    },
    users: {
      type: Array as () => User[],
      default: () => [],
    },
  },

  emits: ['update:modelValue', 'saved'],

  setup(props, { emit }) {
    const dialog = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    })

    const authStore = useAuthStore()
    const isManager = computed(() => authStore.isManager)
    const currentUser = computed(() => authStore.user)

    const form = ref(null)
    const loading = ref(false)
    const error = ref('')

    const showSnackbar = ref(false)
    const snackbarText = ref('')
    const snackbarColor = ref('success')

    const formData = ref({
      user_id: null as number | null,
      spent_hours: 0.25,
      comment: '',
    })

    const rules = {
      required: (value: any) => !!value || 'Поле обязательно для заполнения',
      positive: (value: number) => value > 0 || 'Значение должно быть больше нуля',
    }

    watch(
      () => props.modelValue,
      (newValue) => {
        if (newValue) {
          resetForm()
        }
      },
    )

    const resetForm = () => {
      formData.value = {
        user_id: isManager.value ? null : currentUser.value?.id || null,
        spent_hours: 0.25,
        comment: '',
      }

      error.value = ''

      const formRef = form.value as any
      if (formRef) {
        formRef.resetValidation()
      }
    }

    const submit = async () => {
      const formRef = form.value as any
      const isValid = formRef?.validate()

      if (!isValid) return

      loading.value = true
      error.value = ''

      try {
        const data: any = {
          spent_hours: formData.value.spent_hours,
        }

        if (formData.value.comment) {
          data.comment = formData.value.comment
        }

        if (isManager.value && formData.value.user_id) {
          data.user_id = formData.value.user_id
        }

        const response = await timeLogService.logTime(props.taskId, data)

        snackbarText.value = response.data.message || 'Время успешно залогировано'
        snackbarColor.value = 'success'
        showSnackbar.value = true

        emit('saved', response.data)

        setTimeout(() => {
          dialog.value = false
        }, 100)
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Произошла ошибка при логировании времени'

        snackbarText.value = errorMessage
        snackbarColor.value = 'error'
        showSnackbar.value = true

        error.value = errorMessage
      } finally {
        loading.value = false
      }
    }

    return {
      dialog,
      formData,
      form,
      loading,
      error,
      rules,
      isManager,
      submit,

      showSnackbar,
      snackbarText,
      snackbarColor,
    }
  },
})
</script>
