<template>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h5">
        {{ isEdit ? 'Редактировать доску' : 'Создать новую доску' }}
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="submit">
          <v-text-field
            v-model="boardData.name"
            label="Название доски"
            :rules="[rules.required]"
          ></v-text-field>

          <v-select
            v-model="boardData.project_id"
            label="Проект"
            :items="projects"
            item-title="name"
            item-value="id"
            :rules="[rules.required]"
            :disabled="isEdit || projectFixed"
          ></v-select>
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
import type { Board, Project } from '@/types'

export default defineComponent({
  name: 'BoardForm',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    board: {
      type: Object as () => Board | null,
      default: null,
    },
    projects: {
      type: Array as () => Project[],
      default: () => [],
    },
    projectId: {
      type: Number,
      default: null,
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

    const boardData = ref({
      name: '',
      project_id: props.projectId || null,
    })

    const isEdit = computed(() => !!props.board)
    const projectFixed = computed(() => !!props.projectId)

    const rules = {
      required: (value: any) => !!value || 'Поле обязательно для заполнения',
    }

    const resetForm = () => {
      boardData.value = {
        name: '',
        project_id: props.projectId || null,
      }

      const formRef = form.value as any
      if (formRef) {
        formRef.resetValidation()
      }
    }

    watch(
      () => props.board,
      (newValue) => {
        if (newValue) {
          boardData.value = {
            name: newValue.name || '',
            project_id: newValue.project_id,
          }
        } else {
          resetForm()
        }
      },
      { immediate: true },
    )

    watch(
      () => props.projectId,
      (newValue) => {
        if (newValue && !isEdit.value) {
          boardData.value.project_id = newValue
        }
      },
      { immediate: true },
    )

    const submit = async () => {
      const formRef = form.value as any
      const isValid = formRef?.validate()

      if (!isValid) return

      loading.value = true

      try {
        emit('save', boardData.value)
        dialog.value = false
        resetForm()
      } finally {
        loading.value = false
      }
    }

    return {
      dialog,
      boardData,
      isEdit,
      projectFixed,
      form,
      loading,
      rules,
      submit,
    }
  },
})
</script>
