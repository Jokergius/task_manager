<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex justify-space-between align-center">
      <span>{{ project.name }}</span>
      <div>
        <v-btn icon variant="text" size="small" @click="$emit('edit')" v-if="isManager">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          icon
          variant="text"
          size="small"
          color="error"
          @click="$emit('delete')"
          v-if="isManager"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </v-card-title>

    <v-card-subtitle> Код проекта: {{ project.code }} </v-card-subtitle>

    <v-card-text>
      <div>{{ project.description }}</div>
      <div class="mt-2 text-caption">Создан: {{ formatDate(project.created_at) }}</div>
    </v-card-text>

    <v-card-actions>
      <v-btn color="primary" variant="text" @click="$emit('view-boards')"> Доски </v-btn>
      <v-btn color="primary" variant="text" @click="$emit('view-tasks')"> Задачи </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import type { Project } from '@/types'
import { useAuthStore } from '@/stores/authStore'

export default defineComponent({
  name: 'ProjectCard',

  props: {
    project: {
      type: Object as () => Project,
      required: true,
    },
  },

  emits: ['edit', 'delete', 'view-boards', 'view-tasks'],

  setup() {
    const authStore = useAuthStore()

    const isManager = computed(() => authStore.isManager)

    const formatDate = (dateString: string) => {
      if (!dateString) return ''

      const date = new Date(dateString)
      return date.toLocaleString()
    }

    return {
      isManager,
      formatDate,
    }
  },
})
</script>
