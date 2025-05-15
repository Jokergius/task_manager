import { defineStore } from 'pinia'
import type { Task, TimeLog } from '@/types'
import taskService from '@/api/taskService'
import timeLogService from '@/api/timeLogService'

interface TaskState {
  tasks: Task[]
  currentTask: Task | null
  myTasks: Task[]
  timeLogs: TimeLog[]
  loading: boolean
  error: string | null
}

export const useTaskStore = defineStore('task', {
  state: (): TaskState => ({
    tasks: [],
    currentTask: null,
    myTasks: [],
    timeLogs: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchTasks(filters = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await taskService.getTasks(filters)
        this.tasks = response.data.tasks
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при загрузке задач'
        console.error(this.error)
      } finally {
        this.loading = false
      }
    },

    async fetchMyTasks() {
      this.loading = true
      this.error = null
      try {
        const response = await taskService.getMyTasks()
        this.myTasks = response.data.tasks
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при загрузке моих задач'
        console.error(this.error)
      } finally {
        this.loading = false
      }
    },

    async fetchTask(id: number) {
      this.loading = true
      this.error = null
      try {
        const response = await taskService.getTask(id)
        this.currentTask = response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при загрузке задачи'
        console.error(this.error)
      } finally {
        this.loading = false
      }
    },

    async createTask(task: Partial<Task>) {
      this.loading = true
      this.error = null
      try {
        const response = await taskService.createTask(task)
        const newTask = response.data.task

        this.tasks.push(newTask)

        if (task.assignee_id) {
          const authStore = JSON.parse(localStorage.getItem('user') || '{}')
          if (authStore?.id === task.assignee_id) {
            this.myTasks.push(newTask)
          }
        }

        return { success: true, task: newTask }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при создании задачи'
        console.error(this.error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async createTaskInColumn(columnId: number, task: Partial<Task>) {
      this.loading = true
      this.error = null
      try {
        const response = await taskService.createTaskInColumn(columnId, task)
        const newTask = response.data.task

        this.tasks.push(newTask)

        if (task.assignee_id) {
          const authStore = JSON.parse(localStorage.getItem('user') || '{}')
          if (authStore?.id === task.assignee_id) {
            this.myTasks.push(newTask)
          }
        }

        return { success: true, task: newTask }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при создании задачи'
        console.error(this.error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateTask(id: number, task: Partial<Task>) {
      this.loading = true
      this.error = null
      try {
        const response = await taskService.updateTask(id, task)
        const updatedTask = response.data.task

        const taskIndex = this.tasks.findIndex((t) => t.id === id)
        if (taskIndex !== -1) {
          this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updatedTask }
        }

        const myTaskIndex = this.myTasks.findIndex((t) => t.id === id)
        if (myTaskIndex !== -1) {
          this.myTasks[myTaskIndex] = { ...this.myTasks[myTaskIndex], ...updatedTask }
        }

        if (this.currentTask?.id === id) {
          this.currentTask = { ...this.currentTask, ...updatedTask }
        }

        return { success: true }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при обновлении задачи'
        console.error(this.error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async moveTaskToColumn(taskId: number, columnId: number) {
      this.loading = true
      this.error = null
      try {
        const response = await taskService.moveTaskToColumn(taskId, columnId)
        const updatedTask = response.data.task

        const taskIndex = this.tasks.findIndex((t) => t.id === taskId)
        if (taskIndex !== -1) {
          this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updatedTask }
        }

        const myTaskIndex = this.myTasks.findIndex((t) => t.id === taskId)
        if (myTaskIndex !== -1) {
          this.myTasks[myTaskIndex] = { ...this.myTasks[myTaskIndex], ...updatedTask }
        }

        if (this.currentTask?.id === taskId) {
          this.currentTask = { ...this.currentTask, ...updatedTask }
        }

        return { success: true }
      } catch (error: any) {
        if (error.response && error.response.status === 403) {
          this.error = 'У вас нет прав для перемещения этой задачи'
        } else {
          this.error = error.response?.data?.message || 'Ошибка при перемещении задачи'
        }
        console.error(this.error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteTask(id: number) {
      this.loading = true
      this.error = null
      try {
        await taskService.deleteTask(id)

        this.tasks = this.tasks.filter((t) => t.id !== id)
        this.myTasks = this.myTasks.filter((t) => t.id !== id)

        if (this.currentTask?.id === id) {
          this.currentTask = null
        }

        return { success: true }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при удалении задачи'
        console.error(this.error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async logTime(
      taskId: number,
      data: { spent_hours: number; comment?: string; user_id?: number },
    ) {
      this.loading = true
      this.error = null
      try {
        const response = await timeLogService.logTime(taskId, data)

        if (response.data.task) {
          const updatedTask = response.data.task

          const taskIndex = this.tasks.findIndex((t) => t.id === taskId)
          if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updatedTask }
          }

          const myTaskIndex = this.myTasks.findIndex((t) => t.id === taskId)
          if (myTaskIndex !== -1) {
            this.myTasks[myTaskIndex] = { ...this.myTasks[myTaskIndex], ...updatedTask }
          }

          if (this.currentTask?.id === taskId) {
            this.currentTask = { ...this.currentTask, ...updatedTask }
          }
        }

        return { success: true, data: response.data }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при логировании времени'
        console.error(this.error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async getTimeLogs(taskId: number, filters = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await timeLogService.getTimeLogs(taskId, filters)
        this.timeLogs = response.data.time_logs || []
        return response.data
      } catch (error: any) {
        this.error =
          error.response?.data?.message || 'Ошибка при получении истории трекинга времени'
        console.error(this.error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateEstimate(
      taskId: number,
      data: { estimated_hours: number; remaining_hours?: number },
    ) {
      this.loading = true
      this.error = null
      try {
        const response = await timeLogService.updateEstimate(taskId, data)

        if (response.data.task) {
          const updatedTask = response.data.task

          const taskIndex = this.tasks.findIndex((t) => t.id === taskId)
          if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updatedTask }
          }

          const myTaskIndex = this.myTasks.findIndex((t) => t.id === taskId)
          if (myTaskIndex !== -1) {
            this.myTasks[myTaskIndex] = { ...this.myTasks[myTaskIndex], ...updatedTask }
          }

          if (this.currentTask?.id === taskId) {
            this.currentTask = { ...this.currentTask, ...updatedTask }
          }
        }

        return { success: true, data: response.data }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при обновлении оценки времени'
        console.error(this.error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async getTimeSummary(filters = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await timeLogService.getTimeSummary(filters)
        return response.data
      } catch (error: any) {
        this.error =
          error.response?.data?.message || 'Ошибка при получении сводной информации о времени'
        console.error(this.error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },
  },
})
