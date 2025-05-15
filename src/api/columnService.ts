import apiClient from './apiClient'
import type { Column } from '@/types'

export default {
  getBoardColumns(boardId: number) {
    return apiClient.get(`/columns/board/${boardId}`)
  },

  createColumn(column: Partial<Column>) {
    return apiClient.post('/columns/', column)
  },

  updateColumn(id: number, column: Partial<Column>) {
    return apiClient.put(`/columns/${id}`, column)
  },

  deleteColumn(id: number) {
    return apiClient.delete(`/columns/${id}`)
  },

  reorderColumns(columns: { id: number; order: number }[]) {
    return apiClient.post('/columns/reorder', { columns })
  },
}
