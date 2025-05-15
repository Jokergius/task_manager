import apiClient from './apiClient'
import type { Board } from '@/types'

export default {
  getBoards() {
    return apiClient.get('/boards/')
  },

  getBoard(id: number) {
    return apiClient.get(`/boards/${id}`)
  },

  createBoard(board: Partial<Board>) {
    return apiClient.post('/boards/', board)
  },

  updateBoard(id: number, board: Partial<Board>) {
    return apiClient.put(`/boards/${id}`, board)
  },

  deleteBoard(id: number) {
    return apiClient.delete(`/boards/${id}`)
  },
}
