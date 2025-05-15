import { defineStore } from 'pinia'
import type { Project } from '@/types'
import projectService from '@/api/projectService'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  error: string | null
}

export const useProjectStore = defineStore('project', {
  state: (): ProjectState => ({
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchProjects() {
      this.loading = true
      this.error = null
      try {
        const response = await projectService.getProjects()
        this.projects = response.data.projects
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при загрузке проектов'
        console.error(this.error)
      } finally {
        this.loading = false
      }
    },

    async fetchProject(id: number) {
      this.loading = true
      this.error = null
      try {
        const response = await projectService.getProject(id)
        this.currentProject = response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при загрузке проекта'
        console.error(this.error)
      } finally {
        this.loading = false
      }
    },

    async createProject(project: Partial<Project>) {
      this.loading = true
      this.error = null
      try {
        const response = await projectService.createProject(project)
        this.projects.push(response.data.project)
        return { success: true, project: response.data.project }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при создании проекта'
        console.error(this.error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateProject(id: number, project: Partial<Project>) {
      this.loading = true
      this.error = null
      try {
        const response = await projectService.updateProject(id, project)
        const index = this.projects.findIndex((p) => p.id === id)
        if (index !== -1) {
          this.projects[index] = { ...this.projects[index], ...response.data.project }
        }
        if (this.currentProject?.id === id) {
          this.currentProject = { ...this.currentProject, ...response.data.project }
        }
        return { success: true }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при обновлении проекта'
        console.error(this.error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteProject(id: number) {
      this.loading = true
      this.error = null
      try {
        await projectService.deleteProject(id)
        this.projects = this.projects.filter((p) => p.id !== id)
        if (this.currentProject?.id === id) {
          this.currentProject = null
        }
        return { success: true }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при удалении проекта'
        console.error(this.error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },
  },
})
