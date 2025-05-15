import apiClient from './apiClient'
import type { Project } from '@/types'

export default {
  getProjects() {
    return apiClient.get('/projects/')
  },

  getProject(id: number) {
    return apiClient.get(`/projects/${id}`)
  },

  createProject(project: Partial<Project>) {
    return apiClient.post('/projects/', project)
  },

  updateProject(id: number, project: Partial<Project>) {
    return apiClient.put(`/projects/${id}`, project)
  },

  deleteProject(id: number) {
    return apiClient.delete(`/projects/${id}`)
  },

  getProjectBoards(id: number) {
    return apiClient.get(`/projects/${id}/boards`)
  },
}
