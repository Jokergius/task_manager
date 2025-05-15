<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex justify-space-between align-center">
      <span>{{ board.name }}</span>
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

    <v-card-subtitle> Проект: {{ board.project_name || 'Неизвестный проект' }} </v-card-subtitle>

    <v-card-text>
      <div class="text-caption">Создана: {{ formatDate(board.created_at) }}</div>
    </v-card-text>

    <v-card-actions>
      <v-btn color="primary" @click="$emit('view')"> Открыть доску </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import type { Board } from '@/types'
import { useAuthStore } from '@/stores/authStore'

export default defineComponent({
  name: 'BoardCard',

  props: {
    board: {
      type: Object as () => Board,
      required: true,
    },
  },

  emits: ['edit', 'delete', 'view'],

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
