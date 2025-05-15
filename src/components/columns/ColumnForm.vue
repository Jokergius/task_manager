<template>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h5">
        {{ isEdit ? 'Редактировать колонку' : 'Создать новую колонку' }}
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="submit">
          <v-text-field
            v-model="columnData.name"
            label="Название колонки"
            :rules="[rules.required]"
          ></v-text-field>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="dialog = false"> Отмена </v-btn>
        <v-btn color="primary" variant="text" @click="submit" :loading="loading">
          {{ isEdit ? 'Сохранить' : 'Создать' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import type { Column } from '@/types'

export default defineComponent({
  name: 'ColumnForm',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    column: {
      type: Object as () => Column | null,
      default: null,
    },
    boardId: {
      type: Number,
      required: true,
    },
  },

  emits: ['update:modelValue', 'save'],

  setup(props, { emit }) {
    const dialog = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    })

    const form = ref(null)
    const loading = ref(false)

    const columnData = ref({
      name: '',
      board_id: props.boardId,
    })

    const isEdit = computed(() => !!props.column)

    const rules = {
      required: (value: string) => !!value || 'Поле обязательно для заполнения',
    }

    const resetForm = () => {
      columnData.value = {
        name: '',
        board_id: props.boardId,
      }

      const formRef = form.value as any
      if (formRef) {
        formRef.resetValidation()
      }
    }

    watch(
      () => props.column,
      (newValue) => {
        if (newValue) {
          columnData.value = {
            name: newValue.name || '',
            board_id: props.boardId,
          }
        } else {
          resetForm()
        }
      },
      { immediate: true },
    )

    watch(
      () => props.boardId,
      (newValue) => {
        columnData.value.board_id = newValue
      },
    )

    const submit = async () => {
      const formRef = form.value as any
      const isValid = formRef?.validate()

      if (!isValid) return

      loading.value = true

      try {
        emit('save', columnData.value)
        dialog.value = false
        resetForm()
      } finally {
        loading.value = false
      }
    }

    return {
      dialog,
      columnData,
      isEdit,
      form,
      loading,
      rules,
      submit,
    }
  },
})
</script>
