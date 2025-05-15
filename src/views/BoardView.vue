<template>
  <div class="board-view">
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>

    <div v-if="loading" class="d-flex justify-center py-8">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </div>

    <template v-else-if="board">
      <v-card class="mb-4">
        <v-card-title class="d-flex justify-space-between align-center">
          <div>
            <span class="text-h5">{{ board.name }}</span>
            <v-chip class="ml-2" variant="tonal">{{ projectName }}</v-chip>
          </div>
          <div class="d-flex align-center">
            <v-switch
              v-model="showOnlyMyTasks"
              label="Только мои задачи"
              density="compact"
              color="indigo"
              hide-details
              class="mr-4"
            ></v-switch>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="showTaskForm = true">
              Создать задачу
            </v-btn>
            <v-btn
              class="ml-2"
              color="primary"
              variant="outlined"
              prepend-icon="mdi-format-columns"
              @click="showColumnForm = true"
              v-if="isManager"
            >
              Добавить колонку
            </v-btn>
          </div>
        </v-card-title>
      </v-card>

      <div class="board-columns d-flex overflow-x-auto py-2">
        <template v-if="columns.length === 0">
          <v-alert type="info" variant="tonal" class="mx-auto">
            На этой доске пока нет колонок.
            {{ isManager ? 'Добавьте первую колонку!' : 'Скоро появятся колонки.' }}
          </v-alert>
        </template>

        <template v-else>
          <ColumnCard
            v-for="column in columns"
            :key="column.id"
            :column="filterColumnTasks(column)"
            :columns="columns"
            @edit="editColumn(column)"
            @delete="confirmDeleteColumn(column)"
            @add-task="addTaskToColumn(column)"
            @view-task="viewTask"
            @move-task="moveTask"
          />
        </template>
      </div>
    </template>

    <v-alert v-else type="error" variant="tonal"> Доска не найдена </v-alert>

    <ColumnForm
      v-model="showColumnForm"
      :column="selectedColumn"
      :board-id="boardId"
      @save="saveColumn"
    />

    <TaskForm
      v-model="showTaskForm"
      :task="selectedTask"
      :board-id="boardId"
      :column-id="selectedColumnId"
      :users="users"
      @save="saveTask"
    />

    <TaskDetail
      v-model="showTaskDetails"
      :task="selectedTask"
      :users="users"
      @edit="editTask"
      @delete="confirmDeleteTask"
      @refresh="refreshBoardData"
    />

    <v-dialog v-model="showDeleteColumnDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5"> Удаление колонки </v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить колонку "{{ selectedColumn?.name }}"?
          <strong>Это действие возможно только для пустых колонок.</strong>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="showDeleteColumnDialog = false">
            Отмена
          </v-btn>
          <v-btn color="error" variant="text" @click="deleteColumn"> Удалить </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useBoardStore } from '@/stores/boardStore'
import { useColumnStore } from '@/stores/columnStore'
import { useTaskStore } from '@/stores/taskStore'
import type { Column, Task, User } from '@/types'
import ColumnCard from '@/components/columns/ColumnCard.vue'
import ColumnForm from '@/components/columns/ColumnForm.vue'
import TaskForm from '@/components/tasks/TaskForm.vue'
import TaskDetail from '@/components/tasks/TaskDetail.vue'
import axios from 'axios'
import { API_URL } from '@/api/apiClient'

export default defineComponent({
  name: 'BoardView',

  components: {
    ColumnCard,
    ColumnForm,
    TaskForm,
    TaskDetail,
  },

  setup() {
    const route = useRoute()
    const authStore = useAuthStore()
    const boardStore = useBoardStore()
    const columnStore = useColumnStore()
    const taskStore = useTaskStore()

    const boardId = computed(() => {
      const id = route.params.id
      return id ? parseInt(id as string) : 0
    })

    const loading = ref(true)
    const users = ref<User[]>([])
    const showOnlyMyTasks = ref(false)

    const showColumnForm = ref(false)
    const showTaskForm = ref(false)
    const showTaskDetails = ref(false)
    const showDeleteColumnDialog = ref(false)
    const showDeleteTaskDialog = ref(false)

    const selectedColumn = ref<Column | null>(null)
    const selectedTask = ref<Task | null>(null)
    const selectedColumnId = ref<number | undefined>(undefined)

    const showSnackbar = ref(false)
    const snackbarText = ref('')
    const snackbarColor = ref('success')

    const board = computed(() => boardStore.currentBoard)
    const columns = computed(() => columnStore.columns)
    const isManager = computed(() => authStore.isManager)
    const currentUserId = computed(() => authStore.user?.id)

    const projectName = computed(() => {
      if (board.value && board.value.project_name) {
        return board.value.project_name
      }
      return ''
    })

    const breadcrumbs = computed(() => [
      {
        title: 'Проекты',
        disabled: false,
        href: '/projects',
      },
      {
        title: projectName.value || 'Проект',
        disabled: false,
        href: board.value ? `/projects/${board.value.project_id}` : '/projects',
      },
      {
        title: board.value?.name || 'Загрузка...',
        disabled: true,
      },
    ])

    const filterColumnTasks = (column: Column): Column => {
      if (!showOnlyMyTasks.value || !column.tasks) {
        return column
      }

      // Создаем копию колонки с фильтрованными задачами
      const filteredColumn = { ...column }
      filteredColumn.tasks = column.tasks.filter(
        (task) =>
          task.assignee_id === currentUserId.value || task.author_id === currentUserId.value,
      )

      return filteredColumn
    }

    onMounted(async () => {
      loading.value = true

      try {
        if (boardId.value) {
          await boardStore.fetchBoard(boardId.value)
          await columnStore.fetchBoardColumns(boardId.value)

          const token = localStorage.getItem('token')
          const response = await axios.get(`${API_URL}/users/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          users.value = response.data.users
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка'
        snackbarText.value = errorMessage
        snackbarColor.value = 'error'
        showSnackbar.value = true
      } finally {
        loading.value = false
      }
    })

    const editColumn = (column: Column) => {
      selectedColumn.value = column
      showColumnForm.value = true
    }

    const confirmDeleteColumn = (column: Column) => {
      selectedColumn.value = column
      showDeleteColumnDialog.value = true
    }

    const addTaskToColumn = (column: Column) => {
      selectedTask.value = null
      selectedColumnId.value = column.id
      showTaskForm.value = true
    }

    const viewTask = (task: Task) => {
      selectedTask.value = task
      showTaskDetails.value = true
    }

    const editTask = () => {
      showTaskDetails.value = false
      showTaskForm.value = true
    }

    const confirmDeleteTask = () => {
      showTaskDetails.value = false
      showDeleteTaskDialog.value = true
    }

    const moveTask = async (taskId: number, targetColumnId: number) => {
      try {
        const result = await taskStore.moveTaskToColumn(taskId, targetColumnId)

        if (result.success) {
          await columnStore.fetchBoardColumns(boardId.value)

          snackbarText.value = 'Задача успешно перемещена'
          snackbarColor.value = 'success'
        } else {
          snackbarText.value = result.message || 'Ошибка при перемещении задачи'
          snackbarColor.value = 'error'

          await columnStore.fetchBoardColumns(boardId.value)
        }

        showSnackbar.value = true
      } catch (error: unknown) {
        let errorMessage = 'Произошла ошибка при перемещении задачи'

        if (error instanceof Error) {
          errorMessage = error.message

          if (
            errorMessage.includes('403') ||
            errorMessage.toLowerCase().includes('запрещено') ||
            errorMessage.toLowerCase().includes('forbidden') ||
            errorMessage.toLowerCase().includes('доступ')
          ) {
            errorMessage = 'У вас нет прав для перемещения этой задачи'
          }
        }

        snackbarText.value = errorMessage
        snackbarColor.value = 'error'
        showSnackbar.value = true

        await columnStore.fetchBoardColumns(boardId.value)
      }
    }

    const saveColumn = async (columnData: Partial<Column>) => {
      try {
        if (selectedColumn.value) {
          const result = await columnStore.updateColumn(selectedColumn.value.id, columnData)

          if (result.success) {
            snackbarText.value = 'Колонка успешно обновлена'
            snackbarColor.value = 'success'
          } else {
            snackbarText.value = result.message || 'Ошибка при обновлении колонки'
            snackbarColor.value = 'error'
          }
        } else {
          const result = await columnStore.createColumn(columnData)

          if (result.success) {
            snackbarText.value = 'Колонка успешно создана'
            snackbarColor.value = 'success'
          } else {
            snackbarText.value = result.message || 'Ошибка при создании колонки'
            snackbarColor.value = 'error'
          }
        }

        showSnackbar.value = true
        selectedColumn.value = null
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка'
        snackbarText.value = errorMessage
        snackbarColor.value = 'error'
        showSnackbar.value = true
      }
    }

    const saveTask = async (taskData: Partial<Task>) => {
      try {
        if (selectedTask.value) {
          const result = await taskStore.updateTask(selectedTask.value.id, taskData)

          if (result.success) {
            snackbarText.value = 'Задача успешно обновлена'
            snackbarColor.value = 'success'

            await columnStore.fetchBoardColumns(boardId.value)
          } else {
            snackbarText.value = result.message || 'Ошибка при обновлении задачи'
            snackbarColor.value = 'error'
          }
        } else {
          const result = await taskStore.createTask(taskData)

          if (result.success) {
            snackbarText.value = 'Задача успешно создана'
            snackbarColor.value = 'success'

            await columnStore.fetchBoardColumns(boardId.value)
          } else {
            snackbarText.value = result.message || 'Ошибка при создании задачи'
            snackbarColor.value = 'error'
          }
        }

        showSnackbar.value = true
        selectedTask.value = null
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка'
        snackbarText.value = errorMessage
        snackbarColor.value = 'error'
        showSnackbar.value = true
      }
    }

    const deleteColumn = async () => {
      if (!selectedColumn.value) return

      try {
        const result = await columnStore.deleteColumn(selectedColumn.value.id)

        if (result.success) {
          snackbarText.value = 'Колонка успешно удалена'
          snackbarColor.value = 'success'
        } else {
          snackbarText.value = result.message || 'Ошибка при удалении колонки'
          snackbarColor.value = 'error'
        }

        showSnackbar.value = true
        showDeleteColumnDialog.value = false
        selectedColumn.value = null
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка'
        snackbarText.value = errorMessage
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

          await columnStore.fetchBoardColumns(boardId.value)
        } else {
          snackbarText.value = result.message || 'Ошибка при удалении задачи'
          snackbarColor.value = 'error'
        }

        showSnackbar.value = true
        showDeleteTaskDialog.value = false
        selectedTask.value = null
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка'
        snackbarText.value = errorMessage
        snackbarColor.value = 'error'
        showSnackbar.value = true
      }
    }

    const refreshBoardData = async () => {
      try {
        await boardStore.fetchBoard(boardId.value)
        await columnStore.fetchBoardColumns(boardId.value)

        if (boardId.value) {
          await taskStore.fetchTasks({ board_id: boardId.value })
        }

        if (selectedTask.value) {
          await taskStore.fetchTask(selectedTask.value.id)
          selectedTask.value = taskStore.currentTask
        }

        snackbarText.value = 'Данные успешно обновлены'
        snackbarColor.value = 'success'
        showSnackbar.value = true
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка'
        snackbarText.value = errorMessage
        snackbarColor.value = 'error'
        showSnackbar.value = true
      }
    }

    return {
      boardId,
      board,
      columns,
      loading,
      isManager,
      projectName,
      breadcrumbs,
      users,
      showColumnForm,
      showTaskForm,
      showTaskDetails,
      showDeleteColumnDialog,
      showDeleteTaskDialog,
      selectedColumn,
      selectedTask,
      selectedColumnId,
      showSnackbar,
      snackbarText,
      snackbarColor,
      editColumn,
      confirmDeleteColumn,
      addTaskToColumn,
      viewTask,
      editTask,
      confirmDeleteTask,
      moveTask,
      saveColumn,
      saveTask,
      deleteColumn,
      deleteTask,
      refreshBoardData,
      showOnlyMyTasks,
      filterColumnTasks,
    }
  },
})
</script>

<style scoped>
.board-columns {
  min-height: 500px;
}
</style>
