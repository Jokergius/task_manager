import { defineStore } from 'pinia'
import type { Column, Task } from '@/types'
import columnService from '@/api/columnService'

interface ColumnState {
  columns: Column[]
  loading: boolean
  error: string | null
}

export const useColumnStore = defineStore('column', {
  state: (): ColumnState => ({
    columns: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchBoardColumns(boardId: number) {
      this.loading = true
      this.error = null
      try {
        const response = await columnService.getBoardColumns(boardId)
        this.columns = response.data.columns
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при загрузке колонок'
        console.error(this.error)
      } finally {
        this.loading = false
      }
    },

    async createColumn(column: Partial<Column>) {
      this.loading = true
      this.error = null
      try {
        const response = await columnService.createColumn(column)
        const newColumn = response.data.column
        this.columns.push(newColumn)
        return { success: true, column: newColumn }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при создании колонки'
        console.error(this.error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateColumn(id: number, column: Partial<Column>) {
      this.loading = true
      this.error = null
      try {
        const response = await columnService.updateColumn(id, column)
        const updatedColumn = response.data.column

        const index = this.columns.findIndex((c) => c.id === id)
        if (index !== -1) {
          this.columns[index] = { ...this.columns[index], ...updatedColumn }
        }

        return { success: true }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при обновлении колонки'
        console.error(this.error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteColumn(id: number) {
      this.loading = true
      this.error = null
      try {
        await columnService.deleteColumn(id)
        this.columns = this.columns.filter((c) => c.id !== id)
        return { success: true }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при удалении колонки'
        console.error(this.error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async reorderColumns(columnIds: { id: number; order: number }[]) {
      this.loading = true
      this.error = null
      try {
        await columnService.reorderColumns(columnIds)

        columnIds.forEach((item) => {
          const index = this.columns.findIndex((c) => c.id === item.id)
          if (index !== -1) {
            this.columns[index].order = item.order
          }
        })

        this.columns.sort((a, b) => a.order - b.order)

        return { success: true }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при изменении порядка колонок'
        console.error(this.error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    updateColumnTasks(columnId: number, tasks: Task[]) {
      const index = this.columns.findIndex((c) => c.id === columnId)
      if (index !== -1) {
        this.columns[index].tasks = tasks
      }
    },
  },
})
