import apiClient from './apiClient'

export default {
  logTime(taskId: number, data: { spent_hours: number; comment?: string; user_id?: number }) {
    return apiClient.post(`/tasks/${taskId}/time`, data)
  },

  getTimeLogs(taskId: number, params = {}) {
    return apiClient.get(`/tasks/${taskId}/time-logs`, { params })
  },

  updateEstimate(taskId: number, data: { estimated_hours: number; remaining_hours?: number }) {
    return apiClient.post(`/tasks/${taskId}/estimate`, data)
  },

  getTimeSummary(params = {}) {
    return apiClient.get('/tasks/time-summary', { params })
  },
}
