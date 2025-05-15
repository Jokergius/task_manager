<template>
  <div class="my-tasks-view">
    <v-card>
      <v-card-title class="text-h5"> Мои задачи </v-card-title>

      <v-card-text>
        <v-progress-linear
          :active="loading"
          :indeterminate="loading"
          color="primary"
          class="mb-4"
        ></v-progress-linear>

        <v-row>
          <v-col cols="12" sm="3">
            <v-select
              v-model="filterPriority"
              label="Приоритет"
              :items="priorityItems"
              item-title="text"
              item-value="value"
              clearable
              variant="outlined"
              density="comfortable"
              @update:model-value="applyFilters"
            ></v-select>
          </v-col>

          <v-col cols="12" sm="3">
            <v-select
              v-model="filterStatus"
              label="Статус"
              :items="statusItems"
              clearable
              variant="outlined"
              density="comfortable"
              @update:model-value="applyFilters"
            ></v-select>
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              v-model="searchQuery"
              label="Поиск"
              prepend-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              @update:model-value="applyFilters"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-alert v-if="!loading && filteredTasks.length === 0" type="info" variant="tonal">
          Задачи не найдены
        </v-alert>

        <v-table v-else>
          <thead>
            <tr>
              <th>Код</th>
              <th>Название</th>
              <th>Приоритет</th>
              <th>Статус</th>
              <th>Дата начала</th>
              <th>Дата окончания</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in filteredTasks" :key="task.id">
              <td>{{ task.code }}</td>
              <td>{{ task.title }}</td>
              <td>
                <v-chip size="small" :color="getPriorityColor(task.priority)">
                  {{ task.priority }}
                </v-chip>
              </td>
              <td>{{ task.status }}</td>
              <td>{{ formatDate(task.started_at) }}</td>
              <td>{{ formatDate(task.completed_at) }}</td>
              <td>
                <v-btn icon variant="text" size="small" @click="viewTask(task)">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn icon variant="text" size="small" @click="editTask(task)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <TaskDetail
      v-model="showTaskDetails"
      :task="selectedTask"
      @edit="openEditTask"
      @delete="confirmDeleteTask"
    />

    <TaskForm
      v-model="showTaskForm"
      :task="selectedTask"
      :board-id="null"
      :column-id="null"
      :users="[]"
      @save="saveTask"
    />

    <v-dialog v-model="showDeleteTaskDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5"> Удаление задачи </v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить задачу "{{ selectedTask?.title }}"? Это действие нельзя
          отменить.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="showDeleteTaskDialog = false">
            Отмена
          </v-btn>
          <v-btn color="error" variant="text" @click="deleteTask"> Удалить </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="showSnackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="white" icon="mdi-close" @click="showSnackbar = false" size="small"></v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import type { Task } from '@/types'
import TaskDetail from '@/components/tasks/TaskDetail.vue'
import TaskForm from '@/components/tasks/TaskForm.vue'

export default defineComponent({
  name: 'MyTasksView',

  components: {
    TaskDetail,
    TaskForm,
  },

  setup() {
    const taskStore = useTaskStore()

    const loading = ref(true)
    const showTaskDetails = ref(false)
    const showTaskForm = ref(false)
    const showDeleteTaskDialog = ref(false)
    const selectedTask = ref<Task | null>(null)

    const showSnackbar = ref(false)
    const snackbarText = ref('')
    const snackbarColor = ref('success')

    const searchQuery = ref('')
    const filterPriority = ref('')
    const filterStatus = ref('')

    const priorityItems = [
      { text: 'Высокий', value: 'high' },
      { text: 'Средний', value: 'medium' },
      { text: 'Низкий', value: 'low' },
    ]

    const statusItems = computed(() => {
      const statuses = new Set<string>()

      taskStore.myTasks.forEach((task) => {
        if (task.status) {
          statuses.add(task.status)
        }
      })

      return Array.from(statuses)
    })

    const filteredTasks = computed(() => {
      let result = [...taskStore.myTasks]

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(
          (task) =>
            task.title.toLowerCase().includes(query) ||
            task.code.toLowerCase().includes(query) ||
            (task.description && task.description.toLowerCase().includes(query)),
        )
      }

      if (filterPriority.value) {
        result = result.filter((task) => task.priority === filterPriority.value)
      }

      if (filterStatus.value) {
        result = result.filter((task) => task.status === filterStatus.value)
      }

      return result
    })

    onMounted(async () => {
      loading.value = true

      try {
        await taskStore.fetchMyTasks()
      } catch (error) {
        console.error('Ошибка при загрузке задач:', error)
        snackbarText.value = 'Ошибка при загрузке задач'
        snackbarColor.value = 'error'
        showSnackbar.value = true
      } finally {
        loading.value = false
      }
    })

    const formatDate = (dateString: string | undefined) => {
      if (!dateString) return '-'

      const date = new Date(dateString)
      return date.toLocaleDateString()
    }

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

    const viewTask = (task: Task) => {
      selectedTask.value = task
      showTaskDetails.value = true
    }

    const editTask = (task: Task) => {
      selectedTask.value = task
      showTaskForm.value = true
    }

    const openEditTask = () => {
      showTaskDetails.value = false
      showTaskForm.value = true
    }

    const confirmDeleteTask = () => {
      showTaskDetails.value = false
      showDeleteTaskDialog.value = true
    }

    const applyFilters = () => {}

    const saveTask = async (taskData: Partial<Task>) => {
      if (!selectedTask.value) return

      try {
        const result = await taskStore.updateTask(selectedTask.value.id, taskData)

        if (result.success) {
          snackbarText.value = 'Задача успешно обновлена'
          snackbarColor.value = 'success'

          await taskStore.fetchMyTasks()
        } else {
          snackbarText.value = result.message || 'Ошибка при обновлении задачи'
          snackbarColor.value = 'error'
        }

        showSnackbar.value = true
        selectedTask.value = null
      } catch (error: any) {
        snackbarText.value = error.message || 'Произошла ошибка'
        snackbarColor.value = 'error'
        showSnackbar.value = true
      }
    }

    const deleteTask = async () => {
      if (!selectedTask.value) return

      try {
        const result = await taskStore.deleteTask(selectedTask.value.id)

        if (result.success) {
          snackbarText.value = 'Задача успешно удалена'
          snackbarColor.value = 'success'

          await taskStore.fetchMyTasks()
        } else {
          snackbarText.value = result.message || 'Ошибка при удалении задачи'
          snackbarColor.value = 'error'
        }

        showSnackbar.value = true
        showDeleteTaskDialog.value = false
        selectedTask.value = null
      } catch (error: any) {
        snackbarText.value = error.message || 'Произошла ошибка'
        snackbarColor.value = 'error'
        showSnackbar.value = true
      }
    }

    return {
      loading,
      filteredTasks,
      showTaskDetails,
      showTaskForm,
      showDeleteTaskDialog,
      selectedTask,
      showSnackbar,
      snackbarText,
      snackbarColor,
      searchQuery,
      filterPriority,
      filterStatus,
      priorityItems,
      statusItems,
      formatDate,
      getPriorityColor,
      viewTask,
      editTask,
      openEditTask,
      confirmDeleteTask,
      applyFilters,
      saveTask,
      deleteTask,
    }
  },
})
</script>
