<template>
  <div class="time-log-list">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6">История трекинга времени</h3>

      <div class="d-flex">
        <v-btn
          color="primary"
          variant="text"
          prepend-icon="mdi-refresh"
          @click="loadTimeLogs"
          :loading="loading"
          class="mr-2"
        >
          Обновить
        </v-btn>

        <v-btn color="primary" prepend-icon="mdi-plus" @click="$emit('add-time')">
          Добавить время
        </v-btn>
      </div>
    </div>

    <v-card v-if="filters" class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filters.user_id"
              label="Исполнитель"
              :items="users"
              item-title="username"
              item-value="id"
              clearable
              density="compact"
              @update:model-value="loadTimeLogs"
            ></v-select>
          </v-col>

          <v-col cols="12" sm="6" md="3" v-if="isManager">
            <v-select
              v-model="filters.logged_by_id"
              label="Логировщик"
              :items="users"
              item-title="username"
              item-value="id"
              clearable
              density="compact"
              @update:model-value="loadTimeLogs"
            ></v-select>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="filters.from_date"
              label="С даты"
              type="date"
              density="compact"
              @update:model-value="loadTimeLogs"
            ></v-text-field>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="filters.to_date"
              label="По дату"
              type="date"
              density="compact"
              @update:model-value="loadTimeLogs"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <div v-if="loading" class="d-flex justify-center py-4">
      <v-progress-circular indeterminate></v-progress-circular>
    </div>

    <div v-else-if="timeLogs.length === 0" class="text-center py-4">
      <p class="text-body-1 text-medium-emphasis">История трекинга времени пуста</p>
      <v-btn color="primary" variant="text" class="mt-2" @click="$emit('add-time')">
        Добавить первую запись
      </v-btn>
    </div>

    <template v-else>
      <v-card v-for="log in timeLogs" :key="log.id" class="mb-2 time-log-item">
        <v-card-text>
          <div class="d-flex align-center">
            <v-avatar size="32" color="primary" class="mr-2">
              <span class="text-caption white--text">{{ getInitials(log.username) }}</span>
            </v-avatar>

            <div>
              <div class="d-flex align-center">
                <span class="font-weight-medium">{{ log.username }}</span>
                <span
                  class="text-caption mx-2 text-medium-emphasis"
                  v-if="log.user_id !== log.logged_by_id"
                >
                  (добавлено пользователем {{ log.logged_by_username }})
                </span>
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ formatDate(log.logged_at) }}
              </div>
            </div>

            <v-spacer></v-spacer>

            <v-chip size="small" color="primary" class="font-weight-bold">
              {{ log.spent_hours }}ч
            </v-chip>
          </div>

          <div v-if="log.comment" class="mt-2 text-body-2">
            {{ log.comment }}
          </div>
        </v-card-text>
      </v-card>

      <div class="d-flex justify-center mt-4">
        <v-pagination
          v-if="totalPages > 1"
          v-model="currentPage"
          :length="totalPages"
          @update:model-value="loadTimeLogs"
        ></v-pagination>
      </div>
    </template>

    <v-alert v-if="error" type="error" variant="tonal" class="mt-4">
      {{ error }}
    </v-alert>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import type { TimeLog, User, TimeLogFilter } from '@/types'
import { useAuthStore } from '@/stores/authStore'
import timeLogService from '@/api/timeLogService'

export default defineComponent({
  name: 'TimeLogList',

  props: {
    taskId: {
      type: Number,
      required: true,
    },
    users: {
      type: Array as () => User[],
      default: () => [],
    },
  },

  emits: ['add-time'],

  setup(props) {
    const authStore = useAuthStore()
    const isManager = computed(() => authStore.isManager)

    const timeLogs = ref<TimeLog[]>([])
    const loading = ref(false)
    const error = ref('')

    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const totalItems = ref(0)
    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

    const filters = ref<TimeLogFilter>({
      user_id: undefined,
      logged_by_id: undefined,
      from_date: undefined,
      to_date: undefined,
      sort: 'desc',
      page: 1,
      per_page: itemsPerPage.value,
    })

    watch(currentPage, (newPage) => {
      filters.value.page = newPage
    })

    const loadTimeLogs = async () => {
      loading.value = true
      error.value = ''

      try {
        const response = await timeLogService.getTimeLogs(props.taskId, filters.value)

        if (response.data && response.data.time_logs) {
          timeLogs.value = response.data.time_logs.map(
            (log: {
              id: number
              task_id: number
              user: { id: number; username: string }
              logged_by: { id: number; username: string }
              spent_hours: number
              comment?: string
              created_at: string
            }) => ({
              id: log.id,
              task_id: log.task_id,
              user_id: log.user.id,
              username: log.user.username,
              logged_by_id: log.logged_by.id,
              logged_by_username: log.logged_by.username,
              spent_hours: log.spent_hours,
              comment: log.comment,
              logged_at: log.created_at,
            }),
          )

          if (response.data.pagination) {
            totalItems.value = response.data.pagination.total_items || 0
            currentPage.value = response.data.pagination.current_page || 1
          }
        } else {
          error.value = 'Ошибка в формате данных от сервера'
          timeLogs.value = []
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : 'Произошла ошибка при загрузке истории трекинга времени'
        error.value = errorMsg
        timeLogs.value = []
      } finally {
        loading.value = false
      }
    }

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
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    onMounted(() => {
      loadTimeLogs()
    })

    return {
      timeLogs,
      loading,
      error,
      filters,
      currentPage,
      totalPages,
      isManager,
      loadTimeLogs,
      getInitials,
      formatDate,
    }
  },
})
</script>

<style scoped>
.time-log-item {
  transition: all 0.2s ease;
}

.time-log-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
