<template>
  <v-card class="column-card" min-height="400px">
    <v-card-title class="d-flex justify-space-between align-center py-2 column-header">
      <div class="text-subtitle-1 font-weight-bold">
        {{ column.name }} ({{ column.tasks ? column.tasks.length : 0 }})
      </div>
      <div>
        <v-btn icon variant="text" density="compact" @click="$emit('edit')" v-if="isManager">
          <v-icon size="small">mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          icon
          variant="text"
          density="compact"
          color="error"
          @click="$emit('delete')"
          v-if="isManager && canDelete"
        >
          <v-icon size="small">mdi-delete</v-icon>
        </v-btn>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="px-2 py-2 overflow-y-auto" style="max-height: 60vh">
      <div v-if="!column.tasks || column.tasks.length === 0" class="text-center py-5 no-tasks">
        Нет задач
      </div>

      <draggable
        v-model="columnTasks"
        :group="{ name: 'tasks', pull: true, put: true }"
        item-key="id"
        class="tasks-container"
        @change="handleDragChange"
        animation="300"
        :no-transition-on-drag="true"
      >
        <template #item="{ element: task }">
          <task-card
            :task="task"
            @click="$emit('view-task', task)"
            @move="(columnId) => $emit('move-task', task.id, columnId)"
            :columns="availableColumns"
          />
        </template>
      </draggable>
    </v-card-text>

    <v-snackbar v-model="showErrorSnackbar" :timeout="3000" color="error">
      {{ errorMessage }}
    </v-snackbar>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue'
import type { Column, Task } from '@/types'
import { useAuthStore } from '@/stores/authStore'
import TaskCard from '@/components/tasks/TaskCard.vue'
import draggable from 'vuedraggable'

export default defineComponent({
  name: 'ColumnCard',

  components: {
    TaskCard,
    draggable,
  },

  props: {
    column: {
      type: Object as () => Column,
      required: true,
    },
    columns: {
      type: Array as () => Column[],
      default: () => [],
    },
  },

  emits: ['edit', 'delete', 'add-task', 'view-task', 'move-task', 'update-tasks'],

  setup(props, { emit }) {
    const authStore = useAuthStore()

    const isManager = computed(() => authStore.isManager)

    const columnTasks = ref<Task[]>([])
    const showErrorSnackbar = ref(false)
    const errorMessage = ref('')
    const originalTasks = ref<Task[]>([])

    watch(
      () => props.column.tasks,
      (newTasks) => {
        if (newTasks) {
          columnTasks.value = [...newTasks]
          originalTasks.value = [...newTasks]
        } else {
          columnTasks.value = []
          originalTasks.value = []
        }
      },
      { immediate: true, deep: false },
    )

    const handleDragChange = async (event: {
      added?: { element: Task }
      removed?: { element: Task }
    }) => {
      if (event.added) {
        const task = event.added.element
        setTimeout(() => {
          emit('move-task', task.id, props.column.id)
        }, 0)
      }
    }

    const availableColumns = computed(() =>
      props.columns.filter((col) => col.id !== props.column.id),
    )

    const canDelete = computed(() => !props.column.tasks || props.column.tasks.length === 0)

    return {
      isManager,
      availableColumns,
      canDelete,
      columnTasks,
      handleDragChange,
      showErrorSnackbar,
      errorMessage,
    }
  },
})
</script>

<style scoped>
.column-card {
  width: 300px;
  min-width: 250px;
  margin: 0 8px;
  background-color: #e3e8f0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.column-header {
  background-color: #1976d2;
  color: white;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.no-tasks {
  font-style: italic;
  color: #546e7a;
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 15px;
  margin: 10px 0;
  border: 1px dashed #b0bec5;
}

.tasks-container {
  min-height: 10px;
}

.tasks-container > div {
  margin-bottom: 8px;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.sortable-drag {
  cursor: grabbing;
}
</style>
