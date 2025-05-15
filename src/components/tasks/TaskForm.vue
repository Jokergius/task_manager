<template>
  <v-dialog v-model="dialog" max-width="700px">
    <v-card>
      <v-card-title class="text-h5">
        {{ isEdit ? 'Редактировать задачу' : 'Создать новую задачу' }}
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="submit">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="taskData.title"
                label="Название задачи"
                :rules="[rules.required]"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-textarea v-model="taskData.description" label="Описание" rows="3"></v-textarea>
            </v-col>

            <v-col cols="6">
              <v-select
                v-model="taskData.priority"
                label="Приоритет"
                :items="priorityItems"
                item-title="text"
                item-value="value"
              ></v-select>
            </v-col>

            <v-col cols="6">
              <v-select
                v-model="taskData.assignee_id"
                label="Исполнитель"
                :items="users"
                item-title="username"
                item-value="id"
                clearable
              ></v-select>
            </v-col>

            <v-col cols="4">
              <v-text-field
                v-model.number="taskData.estimated_time"
                label="Оценка (часы)"
                type="number"
                min="0"
              ></v-text-field>
            </v-col>

            <v-col cols="4" v-if="isEdit">
              <v-text-field
                v-model.number="taskData.remaining_time"
                label="Осталось (часы)"
                type="number"
                min="0"
              ></v-text-field>
            </v-col>

            <v-col cols="4" v-if="isEdit">
              <v-text-field
                v-model.number="taskData.spent_time"
                label="Затрачено (часы)"
                type="number"
                min="0"
              ></v-text-field>
            </v-col>
          </v-row>
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
import type { Task, User } from '@/types'

export default defineComponent({
  name: 'TaskForm',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    task: {
      type: Object as () => Task | null,
      default: null,
    },
    boardId: {
      type: Number,
      default: null,
    },
    columnId: {
      type: Number,
      default: null,
    },
    users: {
      type: Array as () => User[],
      default: () => [],
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

    const priorityItems = [
      { text: 'Высокий', value: 'high' },
      { text: 'Средний', value: 'medium' },
      { text: 'Низкий', value: 'low' },
    ]

    const taskData = ref({
      title: '',
      description: '',
      priority: 'medium',
      assignee_id: null as number | null,
      estimated_time: 0,
      remaining_time: 0,
      spent_time: 0,
      board_id: props.boardId,
      column_id: props.columnId,
    })

    const isEdit = computed(() => !!props.task)

    const rules = {
      required: (value: string) => !!value || 'Поле обязательно для заполнения',
    }

    const resetForm = () => {
      taskData.value = {
        title: '',
        description: '',
        priority: 'medium',
        assignee_id: null,
        estimated_time: 0,
        remaining_time: 0,
        spent_time: 0,
        board_id: props.boardId,
        column_id: props.columnId,
      }

      const formRef = form.value as any
      if (formRef) {
        formRef.resetValidation()
      }
    }

    watch(
      () => props.task,
      (newValue) => {
        if (newValue) {
          taskData.value = {
            title: newValue.title || '',
            description: newValue.description || '',
            priority: newValue.priority || 'medium',
            assignee_id: newValue.assignee_id || null,
            estimated_time: newValue.estimated_time || 0,
            remaining_time: newValue.remaining_time || 0,
            spent_time: newValue.spent_time || 0,
            board_id: props.boardId,
            column_id: newValue.column_id,
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
        if (!isEdit.value) {
          taskData.value.board_id = newValue
        }
      },
    )

    watch(
      () => props.columnId,
      (newValue) => {
        if (!isEdit.value) {
          taskData.value.column_id = newValue
        }
      },
    )

    const submit = async () => {
      const formRef = form.value as any
      const isValid = formRef?.validate()

      if (!isValid) return

      loading.value = true

      try {
        emit('save', taskData.value)
        dialog.value = false
        resetForm()
      } finally {
        loading.value = false
      }
    }

    return {
      dialog,
      taskData,
      isEdit,
      form,
      loading,
      priorityItems,
      rules,
      submit,
    }
  },
})
</script>
