<template>
  <v-dialog v-model="dialog" max-width="800px">
    <v-card v-if="task">
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <div class="text-h6">{{ task.code }}: {{ task.title }}</div>
        </div>
        <div>
          <v-btn icon variant="text" @click="$emit('edit')">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon variant="text" color="error" @click="$emit('delete')">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <v-tabs v-model="activeTab" bg-color="primary">
        <v-tab value="details">Детали задачи</v-tab>
        <v-tab value="time">Трекинг времени</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="activeTab">
          <v-window-item value="details">
            <v-row>
              <v-col cols="12" md="8">
                <div class="text-subtitle-1 mb-2">Описание:</div>
                <div class="mb-4 task-description">{{ task.description || 'Нет описания' }}</div>

                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="text-subtitle-1">Учет времени:</div>
                  <div>
                    <v-btn
                      color="primary"
                      variant="text"
                      size="small"
                      prepend-icon="mdi-clock-edit"
                      @click="showEstimateForm = true"
                    >
                      Изменить оценку
                    </v-btn>
                    <v-btn
                      color="primary"
                      variant="text"
                      size="small"
                      prepend-icon="mdi-timer-plus"
                      @click="showTimeLogForm = true"
                      class="ml-2"
                    >
                      Добавить время
                    </v-btn>
                  </div>
                </div>
                <v-row class="mb-4">
                  <v-col cols="4">
                    <div class="text-caption">Оценка времени:</div>
                    <div>{{ task.estimated_time || 0 }} часов</div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-caption">Осталось времени:</div>
                    <div>{{ task.remaining_time || 0 }} часов</div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-caption">Затрачено времени:</div>
                    <div>{{ task.spent_time || 0 }} часов</div>
                  </v-col>
                </v-row>

                <div v-if="task.estimated_time > 0" class="mb-4">
                  <div class="d-flex justify-space-between">
                    <div class="text-caption">Прогресс:</div>
                    <div class="text-caption">{{ progressPercent }}%</div>
                  </div>
                  <v-progress-linear
                    :model-value="progressPercent"
                    color="primary"
                    height="10"
                    rounded
                  ></v-progress-linear>
                </div>
              </v-col>

              <v-col cols="12" md="4">
                <v-list density="compact">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon size="small">mdi-flag</v-icon>
                    </template>
                    <v-list-item-title>Приоритет:</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip size="small" :color="getPriorityColor(task.priority)">
                        {{ getPriorityText(task.priority) }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon size="small">mdi-format-list-bulleted-square</v-icon>
                    </template>
                    <v-list-item-title>Статус:</v-list-item-title>
                    <v-list-item-subtitle>{{ task.status }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon size="small">mdi-account</v-icon>
                    </template>
                    <v-list-item-title>Автор:</v-list-item-title>
                    <v-list-item-subtitle>{{ task.author || 'Не указан' }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon size="small">mdi-account-check</v-icon>
                    </template>
                    <v-list-item-title>Исполнитель:</v-list-item-title>
                    <v-list-item-subtitle>{{
                      task.assignee || 'Не назначен'
                    }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-divider class="my-2"></v-divider>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon size="small">mdi-calendar</v-icon>
                    </template>
                    <v-list-item-title>Создана:</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDate(task.created_at) }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item v-if="task.started_at">
                    <template v-slot:prepend>
                      <v-icon size="small">mdi-calendar-start</v-icon>
                    </template>
                    <v-list-item-title>Начата:</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDate(task.started_at) }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item v-if="task.completed_at">
                    <template v-slot:prepend>
                      <v-icon size="small">mdi-calendar-check</v-icon>
                    </template>
                    <v-list-item-title>Завершена:</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDate(task.completed_at) }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="time">
            <time-log-list
              :task-id="task.id"
              :users="users"
              @add-time="showTimeLogForm = true"
              ref="timeLogList"
            />
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn color="primary" variant="tonal" @click="dialog = false"> Закрыть </v-btn>
      </v-card-actions>
    </v-card>

    <time-log-form
      v-model="showTimeLogForm"
      :task-id="task?.id || 0"
      :users="users"
      @saved="onTimeLogSaved"
    />

    <time-estimate-form
      v-model="showEstimateForm"
      :task-id="task?.id || 0"
      :task="task"
      @saved="onEstimateUpdated"
    />
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import type { Task, User } from '@/types'
import TimeLogForm from './TimeLogForm.vue'
import TimeEstimateForm from './TimeEstimateForm.vue'
import TimeLogList from './TimeLogList.vue'

export default defineComponent({
  name: 'TaskDetails',

  components: {
    TimeLogForm,
    TimeEstimateForm,
    TimeLogList,
  },

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    task: {
      type: Object as () => Task | null,
      default: null,
    },
    users: {
      type: Array as () => User[],
      default: () => [],
    },
  },

  emits: ['update:modelValue', 'edit', 'delete', 'refresh'],

  setup(props, { emit }) {
    const dialog = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit('update:modelValue', value)

        if (!value) {
          emit('refresh')
        }
      },
    })

    const activeTab = ref('details')
    const showTimeLogForm = ref(false)
    const showEstimateForm = ref(false)
    const timeLogList = ref(null)

    const progressPercent = computed(() => {
      if (!props.task) return 0
      if (!props.task.estimated_time || props.task.estimated_time <= 0) return 0

      const spent = props.task.spent_time || 0
      const percent = Math.floor((spent / props.task.estimated_time) * 100)
      return Math.min(100, Math.max(0, percent))
    })

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

    const formatDate = (dateString: string) => {
      if (!dateString) return 'Не указана'

      const date = new Date(dateString)
      return date.toLocaleString()
    }

    const onTimeLogSaved = () => {
      emit('refresh')

      if (activeTab.value === 'time' && timeLogList.value) {
        const timeLogListRef = timeLogList.value as any
        if (timeLogListRef.loadTimeLogs) {
          timeLogListRef.loadTimeLogs()
        }
      }
    }

    const onEstimateUpdated = () => {
      emit('refresh')
    }

    return {
      dialog,
      activeTab,
      showTimeLogForm,
      showEstimateForm,
      timeLogList,
      progressPercent,
      getPriorityColor,
      getPriorityText,
      formatDate,
      onTimeLogSaved,
      onEstimateUpdated,
    }
  },
})
</script>

<style scoped>
.task-description {
  white-space: pre-line;
  min-height: 100px;
}
</style>
