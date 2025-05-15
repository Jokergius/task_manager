<template>
  <v-card class="task-card" @click="$emit('click')" elevation="3">
    <div class="task-card-header" :class="priorityClass">
      <div class="code-chip">{{ task.code }}</div>
      <div class="title-text">{{ task.title }}</div>
    </div>

    <v-card-text class="pa-2">
      <div class="d-flex justify-space-between align-center mb-2">
        <v-chip
          size="small"
          :color="getPriorityColor(task.priority)"
          variant="elevated"
          class="mr-1"
        >
          {{ getPriorityText(task.priority) }}
        </v-chip>

        <div class="task-metrics">
          <span class="time-metric" v-if="task.estimated_time">
            <v-icon size="x-small" color="grey">mdi-clock-outline</v-icon>
            {{ task.estimated_time }}ч
          </span>
          <span
            class="time-metric"
            v-if="task.remaining_time !== undefined && task.remaining_time !== null"
          >
            <v-icon size="x-small" color="grey">mdi-timer-sand</v-icon>
            {{ task.remaining_time }}ч
          </span>
        </div>
      </div>

      <div class="d-flex align-center justify-space-between mb-2">
        <div v-if="task.assignee" class="task-assignee">
          <v-avatar size="24" color="primary" class="mr-1">
            <span class="text-caption white--text">{{ getInitials(task.assignee) }}</span>
          </v-avatar>
          <span class="text-caption">{{ task.assignee }}</span>
        </div>

        <div class="task-date-group">
          <div v-if="task.created_at" class="task-date">
            <v-icon size="x-small" color="grey">mdi-calendar-check</v-icon>
            <span class="text-caption">{{ formatDate(task.created_at) }}</span>
          </div>

          <div v-if="task.completed_at" class="task-date completed ml-2">
            <v-icon size="x-small" color="success">mdi-check-circle</v-icon>
            <span class="text-caption">{{ formatDate(task.completed_at) }}</span>
          </div>

          <div v-else-if="deadlineDate" class="task-date ml-2" :class="{ overdue: isOverdue }">
            <v-icon size="x-small" :color="isOverdue ? 'error' : 'grey'">mdi-calendar-clock</v-icon>
            <span class="text-caption">{{ formatDate(deadlineDate) }}</span>
          </div>
        </div>
      </div>

      <p v-if="task.description" class="text-caption text-grey description-preview">
        {{ truncateDescription(task.description) }}
      </p>

      <div v-if="showProgress" class="progress-container mt-2">
        <div class="progress-label">
          <span class="text-caption">Прогресс: {{ progressPercent }}%</span>
        </div>
        <v-progress-linear
          :model-value="progressPercent"
          height="4"
          :color="progressColor"
          rounded
        ></v-progress-linear>
      </div>
    </v-card-text>

    <v-divider v-if="columns.length > 0"></v-divider>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import type { Task, Column } from '@/types'

export default defineComponent({
  name: 'TaskCard',

  props: {
    task: {
      type: Object as () => Task,
      required: true,
    },
    columns: {
      type: Array as () => Column[],
      default: () => [],
    },
  },

  emits: ['click', 'move'],

  setup(props) {
    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'high':
          return 'error'
        case 'medium':
          return 'warning'
        case 'low':
          return 'success'
        default:
          return 'grey'
      }
    }

    const getPriorityText = (priority: string) => {
      switch (priority) {
        case 'high':
          return 'Высокий'
        case 'medium':
          return 'Средний'
        case 'low':
          return 'Низкий'
        default:
          return 'Не указан'
      }
    }

    const priorityClass = computed(() => {
      switch (props.task.priority) {
        case 'high':
          return 'priority-high'
        case 'medium':
          return 'priority-medium'
        case 'low':
          return 'priority-low'
        default:
          return ''
      }
    })

    const getInitials = (name: string) => {
      if (!name) return ''
      const names = name.split(' ')
      if (names.length > 1) {
        return (names[0][0] + names[1][0]).toUpperCase()
      }
      return name[0].toUpperCase()
    }

    const formatDate = (dateString: string) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
    }

    const truncateDescription = (description: string, maxLength = 50) => {
      if (!description) return ''
      if (description.length <= maxLength) return description
      return description.substring(0, maxLength) + '...'
    }

    const deadlineDate = computed(() => {
      if (!props.task.created_at) return null
      const createdDate = new Date(props.task.created_at)
      const deadline = new Date(createdDate)
      deadline.setDate(deadline.getDate() + 5)
      return deadline.toISOString()
    })

    const isOverdue = computed(() => {
      if (!deadlineDate.value || props.task.completed_at) return false
      return new Date(deadlineDate.value) < new Date()
    })

    const progressPercent = computed(() => {
      if (!props.task.estimated_time || props.task.estimated_time <= 0) return 0
      if (props.task.remaining_time === undefined || props.task.remaining_time === null) return 0

      const spent = props.task.estimated_time - props.task.remaining_time
      const percent = Math.floor((spent / props.task.estimated_time) * 100)

      return Math.max(0, Math.min(100, percent))
    })

    const progressColor = computed(() => {
      if (progressPercent.value >= 100) return 'success'
      if (isOverdue.value) return 'error'
      return 'primary'
    })

    const showProgress = computed(() => {
      return (
        props.task.estimated_time > 0 &&
        props.task.remaining_time !== undefined &&
        props.task.remaining_time !== null
      )
    })

    return {
      getPriorityColor,
      getPriorityText,
      priorityClass,
      getInitials,
      formatDate,
      truncateDescription,
      deadlineDate,
      isOverdue,
      progressPercent,
      progressColor,
      showProgress,
    }
  },
})
</script>

<style scoped>
.task-card {
  cursor: pointer;
  background-color: white;
  margin-bottom: 10px;
  border-radius: 6px;
  overflow: hidden;
}

.task-card-header {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background-color: #f5f5f5;
  display: flex;
  gap: 8px;
  align-items: center;
}

.task-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
  transition: all 0.3s;
}

.priority-high {
  border-left: 5px solid #d32f2f;
  background-color: #ffebee;
}

.priority-medium {
  border-left: 5px solid #f57c00;
  background-color: #fff3e0;
}

.priority-low {
  border-left: 5px solid #388e3c;
  background-color: #e8f5e9;
}

.code-chip {
  background-color: #e0e0e0;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: bold;
}

.title-text {
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.task-assignee {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.task-date-group {
  display: flex;
  align-items: center;
}

.task-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #757575;
}

.task-date.overdue {
  color: #d32f2f;
}

.task-date.completed {
  color: #388e3c;
}

.task-metrics {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-metric {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #757575;
}

.description-preview {
  font-size: 12px;
  line-height: 1.3;
  color: #616161;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-container {
  margin-top: 4px;
}

.progress-label {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2px;
}
</style>
