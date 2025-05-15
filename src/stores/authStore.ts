import { defineStore } from 'pinia'
import type { User } from '@/types'
import authService from '@/api/authService'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: authService.getUser(),
    token: authService.getToken(),
    isAuthenticated: authService.isAuthenticated(),
  }),

  getters: {
    isManager(): boolean {
      return this.user?.role === 'manager' || false
    },

    isExecutor(): boolean {
      return this.user?.role === 'executor' || false
    },

    userFullName(): string {
      return this.user ? this.user.username : 'Гость'
    },
  },

  actions: {
    async login(username: string, password: string) {
      try {
        const response = await authService.login(username, password)
        const { access_token, user } = response.data

        authService.setUser(access_token, user)

        this.user = user
        this.token = access_token
        this.isAuthenticated = true

        return { success: true }
      } catch (error: any) {
        const message = error.response?.data?.message || 'Ошибка авторизации'
        return { success: false, message }
      }
    },

    async register(username: string, email: string, password: string, role: string) {
      try {
        const response = await authService.register(username, email, password, role)
        const { access_token, user } = response.data

        authService.setUser(access_token, user)

        this.user = user
        this.token = access_token
        this.isAuthenticated = true

        return { success: true }
      } catch (error: any) {
        const message = error.response?.data?.message || 'Ошибка регистрации'
        return { success: false, message }
      }
    },

    async checkAuth() {
      if (!this.token) return false

      try {
        const response = await authService.getCurrentUser()
        this.user = response.data
        return true
      } catch (error) {
        this.logout()
        return false
      }
    },

    logout() {
      authService.logout()
      this.user = null
      this.token = null
      this.isAuthenticated = false
    },
  },
})
