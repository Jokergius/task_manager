import { defineStore } from 'pinia'
import type { Board } from '@/types'
import boardService from '@/api/boardService'

interface BoardState {
  boards: Board[]
  currentBoard: Board | null
  projectBoards: Board[]
  loading: boolean
  error: string | null
}

export const useBoardStore = defineStore('board', {
  state: (): BoardState => ({
    boards: [],
    currentBoard: null,
    projectBoards: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchBoards() {
      this.loading = true
      this.error = null
      try {
        const response = await boardService.getBoards()
        this.boards = response.data.boards
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при загрузке досок'
        console.error(this.error)
      } finally {
        this.loading = false
      }
    },

    async fetchProjectBoards(projectId: number) {
      this.loading = true
      this.error = null
      try {
        const response = await boardService.getBoards()
        this.projectBoards = response.data.boards.filter(
          (board: Board) => board.project_id === projectId,
        )
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при загрузке досок проекта'
        console.error(this.error)
      } finally {
        this.loading = false
      }
    },

    async fetchBoard(id: number) {
      this.loading = true
      this.error = null
      try {
        const response = await boardService.getBoard(id)
        this.currentBoard = response.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при загрузке доски'
        console.error(this.error)
      } finally {
        this.loading = false
      }
    },

    async createBoard(board: Partial<Board>) {
      this.loading = true
      this.error = null
      try {
        const response = await boardService.createBoard(board)
        const newBoard = response.data.board
        this.boards.push(newBoard)
        if (board.project_id) {
          this.projectBoards.push(newBoard)
        }
        return { success: true, board: newBoard }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при создании доски'
        console.error(this.error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async updateBoard(id: number, board: Partial<Board>) {
      this.loading = true
      this.error = null
      try {
        const response = await boardService.updateBoard(id, board)
        const updatedBoard = response.data.board

        const boardIndex = this.boards.findIndex((b) => b.id === id)
        if (boardIndex !== -1) {
          this.boards[boardIndex] = { ...this.boards[boardIndex], ...updatedBoard }
        }

        const projectBoardIndex = this.projectBoards.findIndex((b) => b.id === id)
        if (projectBoardIndex !== -1) {
          this.projectBoards[projectBoardIndex] = {
            ...this.projectBoards[projectBoardIndex],
            ...updatedBoard,
          }
        }

        if (this.currentBoard?.id === id) {
          this.currentBoard = { ...this.currentBoard, ...updatedBoard }
        }

        return { success: true }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при обновлении доски'
        console.error(this.error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async deleteBoard(id: number) {
      this.loading = true
      this.error = null
      try {
        await boardService.deleteBoard(id)

        this.boards = this.boards.filter((b) => b.id !== id)
        this.projectBoards = this.projectBoards.filter((b) => b.id !== id)

        if (this.currentBoard?.id === id) {
          this.currentBoard = null
        }

        return { success: true }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Ошибка при удалении доски'
        console.error(this.error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },
  },
})
