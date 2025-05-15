<template>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h5">
        {{ isEdit ? 'Редактировать проект' : 'Создать новый проект' }}
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="submit">
          <v-text-field
            v-model="projectData.name"
            label="Название проекта"
            :rules="[rules.required]"
          ></v-text-field>

          <v-text-field
            v-model="projectData.code"
            label="Код проекта"
            :rules="[rules.required, rules.code]"
            :disabled="isEdit"
            hint="Должен содержать только буквы латинского алфавита (2-10 символов)"
          ></v-text-field>

          <v-textarea v-model="projectData.description" label="Описание" rows="3"></v-textarea>
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
import type { Project } from '@/types'

export default defineComponent({
  name: 'ProjectForm',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    project: {
      type: Object as () => Project | null,
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

    const projectData = ref({
      name: '',
      code: '',
      description: '',
    })

    const isEdit = computed(() => !!props.project)

    const rules = {
      required: (value: string) => !!value || 'Поле обязательно для заполнения',
      code: (value: string) => {
        const pattern = /^[A-Za-z]{2,10}$/
        return pattern.test(value) || 'Код должен содержать только латинские буквы (2-10 символов)'
      },
    }

    const resetForm = () => {
      projectData.value = {
        name: '',
        code: '',
        description: '',
      }

      const formRef = form.value as any
      if (formRef) {
        formRef.resetValidation()
      }
    }

    watch(
      () => props.project,
      (newValue) => {
        if (newValue) {
          projectData.value = {
            name: newValue.name || '',
            code: newValue.code || '',
            description: newValue.description || '',
          }
        } else {
          resetForm()
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
        const data = {
          ...projectData.value,
          code: projectData.value.code.toUpperCase(),
        }

        emit('save', data)
        dialog.value = false
        resetForm()
      } finally {
        loading.value = false
      }
    }

    return {
      dialog,
      projectData,
      isEdit,
      form,
      loading,
      rules,
      submit,
    }
  },
})
</script>
