import apiClient from './apiClient'
import type { User } from '../types'

export default {
  login(username: string, password: string) {
    return apiClient.post('/auth/login', { username, password })
  },

  register(username: string, email: string, password: string, role: string) {
    return apiClient.post('/auth/register', { username, email, password, role })
  },

  getCurrentUser() {
    return apiClient.get('/auth/me')
  },

  setUser(token: string, user: User) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      return JSON.parse(userStr)
    }
    return null
  },

  getToken(): string | null {
    return localStorage.getItem('token')
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  isManager(): boolean {
    const user = this.getUser()
    return user ? user.role === 'manager' : false
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
}
