import axios from 'axios'

// Константы для API
export const API_URL = 'https://task-manager-backend-t69k.onrender.com'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        window.location.href = '/login'
      }

      if (error.response.data && error.response.data.message) {
        error.message = error.response.data.message
      } else if (typeof error.response.data === 'string') {
        error.message = error.response.data
      } else {
        error.message = `Ошибка: ${error.response.status} ${error.response.statusText}`
      }
    } else if (error.request) {
      error.message = 'Сервер не отвечает. Проверьте подключение к интернету.'
    } else {
      error.message = error.message || 'Произошла непредвиденная ошибка'
    }

    return Promise.reject(error)
  },
)

export default apiClient
