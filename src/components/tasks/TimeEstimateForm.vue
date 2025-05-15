<template>
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title class="text-h5">Обновить оценку времени</v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="submit">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model.number="formData.estimated_hours"
                label="Оценка времени (часы)"
                type="number"
                min="0.01"
                step="0.25"
                :rules="[rules.required, rules.positive]"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model.number="formData.remaining_hours"
                label="Оставшееся время (часы)"
                type="number"
                min="0"
                step="0.25"
                :rules="[rules.nonNegative]"
                :hint="remainingHint"
                persistent-hint
              ></v-text-field>
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
import type { Task } from '@/types'
import timeLogService from '@/api/timeLogService'

export default defineComponent({
  name: 'TimeEstimateForm',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    taskId: {
      type: Number,
      required: true,
    },
    task: {
      type: Object as () => Task | null,
      default: null,
    },
  },

  emits: ['update:modelValue', 'saved'],

  setup(props, { emit }) {
    const dialog = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    })

    const form = ref(null)
    const loading = ref(false)
    const error = ref('')

    const showSnackbar = ref(false)
    const snackbarText = ref('')
    const snackbarColor = ref('success')

    const formData = ref({
      estimated_hours: 0,
      remaining_hours: 0,
    })

    const remainingHint = computed(() => {
      return 'Если не указано, будет рассчитано автоматически как (оценка - затраченное время)'
    })

    const rules = {
      required: (value: any) => !!value || 'Поле обязательно для заполнения',
      positive: (value: number) => value > 0 || 'Значение должно быть больше нуля',
      nonNegative: (value: number) => value >= 0 || 'Значение не может быть отрицательным',
    }

    watch(
      () => [props.modelValue, props.task],
      ([newVisible, newTask]) => {
        if (newVisible && newTask) {
          formData.value = {
            estimated_hours: (newTask as Task).estimated_time || 0,
            remaining_hours: (newTask as Task).remaining_time || 0,
          }
        }
      },
      { immediate: true },
    )

    const submit = async () => {
      const formRef = form.value as any
      const isValid = formRef?.validate()

      if (!isValid) return

      loading.value = true
      error.value = ''

      try {
        const response = await timeLogService.updateEstimate(props.taskId, {
          estimated_hours: formData.value.estimated_hours,
          remaining_hours: formData.value.remaining_hours,
        })

        snackbarText.value = response.data.message || 'Оценка времени успешно обновлена'
        snackbarColor.value = 'success'
        showSnackbar.value = true

        emit('saved', response.data)

        setTimeout(() => {
          dialog.value = false
        }, 100)
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Произошла ошибка при обновлении оценки времени'

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
      remainingHint,
      submit,

      showSnackbar,
      snackbarText,
      snackbarColor,
    }
  },
})
</script>
