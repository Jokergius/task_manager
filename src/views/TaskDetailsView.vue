<template>
  <v-container>
    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <template v-else-if="task">
      <v-row>
        <v-col cols="12">
          <v-btn icon class="mr-2" @click="$router.back()">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h1 class="d-inline-block">{{ task.code }}: {{ task.title }}</h1>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title>Описание</v-card-title>
            <v-card-text>
              <p>{{ task.description || 'Описание отсутствует' }}</p>
            </v-card-text>
          </v-card>

          <v-card class="mt-4">
            <v-card-title>Комментарии</v-card-title>
            <v-card-text>
              <p class="text-subtitle-1">Функционал комментариев в разработке</p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>Информация</v-card-title>
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-account</v-icon>
                </template>
                <v-list-item-title>Исполнитель</v-list-item-title>
                <v-list-item-subtitle>{{ task.assignee || 'Не назначен' }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-account-edit</v-icon>
                </template>
                <v-list-item-title>Автор</v-list-item-title>
                <v-list-item-subtitle>{{ task.author || 'Неизвестно' }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-flag-variant</v-icon>
                </template>
                <v-list-item-title>Приоритет</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip :color="priorityColor" size="small">
                    {{ task.priority }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-clock-outline</v-icon>
                </template>
                <v-list-item-title>Статус</v-list-item-title>
                <v-list-item-subtitle>{{ task.status }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>

          <v-card class="mt-4">
            <v-card-title>Учет времени</v-card-title>
            <v-list>
              <v-list-item>
                <v-list-item-title>Оценка</v-list-item-title>
                <v-list-item-subtitle>{{ task.estimated_time || 0 }} ч.</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <v-list-item-title>Затрачено</v-list-item-title>
                <v-list-item-subtitle>{{ task.spent_time || 0 }} ч.</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <v-list-item-title>Осталось</v-list-item-title>
                <v-list-item-subtitle
                  >{{ task.remaining_time || task.estimated_time || 0 }} ч.</v-list-item-subtitle
                >
              </v-list-item>
            </v-list>
          </v-card>

          <v-card class="mt-4">
            <v-card-title>Даты</v-card-title>
            <v-list>
              <v-list-item>
                <v-list-item-title>Создана</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(task.created_at) }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <v-list-item-title>Обновлена</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(task.updated_at) }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item v-if="task.start_date">
                <v-list-item-title>Начало работы</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(task.start_date) }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item v-if="task.end_date">
                <v-list-item-title>Завершение</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(task.end_date) }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>

          <v-card class="mt-4">
            <v-card-actions>
              <v-btn color="primary" variant="flat" block @click="openEditDialog">
                <v-icon left>mdi-pencil</v-icon>
                Редактировать задачу
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-row v-else>
      <v-col cols="12" class="text-center">
        <p>Задача не найдена</p>
        <v-btn color="primary" @click="$router.push('/my-tasks')">Вернуться к списку задач</v-btn>
      </v-col>
    </v-row>

    <v-dialog v-model="editDialog" max-width="600px">
      <v-card>
        <v-card-title>Редактирование задачи</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field v-model="editedTask.title" label="Название" required></v-text-field>

            <v-textarea v-model="editedTask.description" label="Описание" rows="4"></v-textarea>

            <v-select
              v-model="editedTask.priority"
              :items="['low', 'medium', 'high']"
              label="Приоритет"
            ></v-select>

            <v-text-field
              v-model="editedTask.estimated_time"
              label="Оценка (часы)"
              type="number"
            ></v-text-field>

            <v-text-field
              v-model="editedTask.spent_time"
              label="Затрачено (часы)"
              type="number"
            ></v-text-field>

            <v-text-field
              v-model="editedTask.remaining_time"
              label="Осталось (часы)"
              type="number"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="editDialog = false">Отмена</v-btn>
          <v-btn color="primary" variant="text" @click="updateTask">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'

export default defineComponent({
  name: 'TaskDetailsView',

  setup() {
    const route = useRoute()
    const router = useRouter()
    const taskStore = useTaskStore()

    const loading = ref(true)
    const task = ref<any>(null)
    const editDialog = ref(false)
    const editedTask = ref<any>({})

    const priorityColor = computed(() => {
      if (!task.value) return ''

      switch (task.value.priority) {
        case 'high':
          return 'red'
        case 'medium':
          return 'orange'
        case 'low':
          return 'green'
        default:
          return 'grey'
      }
    })

    onMounted(async () => {
      const taskId = route.params.id as string
      if (taskId) {
        try {
          loading.value = true
          const response = await taskStore.getTaskById(parseInt(taskId))
          task.value = response
        } catch (error) {
          console.error('Ошибка при загрузке задачи:', error)
        } finally {
          loading.value = false
        }
      }
    })

    const formatDate = (dateString: string | null) => {
      if (!dateString) return 'Не указано'

      const date = new Date(dateString)
      return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    }

    const openEditDialog = () => {
      editedTask.value = { ...task.value }
      editDialog.value = true
    }

    const updateTask = async () => {
      try {
        const updatedTask = await taskStore.updateTask(task.value.id, editedTask.value)
        task.value = updatedTask.task
        editDialog.value = false
      } catch (error) {
        console.error('Ошибка при обновлении задачи:', error)
      }
    }

    return {
      loading,
      task,
      priorityColor,
      formatDate,
      editDialog,
      editedTask,
      openEditDialog,
      updateTask,
    }
  },
})
</script>
