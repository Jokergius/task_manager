import apiClient from './apiClient'
import type { Task } from '../types'

export default {
  getTasks(filters = {}) {
    return apiClient.get('/tasks/', { params: filters })
  },

  getTask(id: number) {
    return apiClient.get(`/tasks/${id}`)
  },

  createTask(task: Partial<Task>) {
    return apiClient.post('/tasks/', task)
  },

  createTaskInColumn(columnId: number, task: Partial<Task>) {
    return apiClient.post(`/tasks/column/${columnId}`, task)
  },

  updateTask(id: number, task: Partial<Task>) {
    return apiClient.put(`/tasks/${id}`, task)
  },

  moveTaskToColumn(taskId: number, columnId: number) {
    return apiClient.put(`/tasks/${taskId}`, { column_id: columnId })
  },

  deleteTask(id: number) {
    return apiClient.delete(`/tasks/${id}`)
  },

  getMyTasks() {
    return apiClient.get('/tasks/', { params: { my_tasks: true } })
  },

  getTasksByPriority(priority: string) {
    return apiClient.get('/tasks/', { params: { priority } })
  },
}
