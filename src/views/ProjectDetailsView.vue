<template>
  <div class="project-details-view">
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>

    <v-row>
      <v-col cols="12">
        <v-card v-if="project">
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <span class="text-h5">{{ project.name }}</span>
              <v-chip class="ml-2">{{ project.code }}</v-chip>
            </div>
            <div>
              <v-btn
                color="primary"
                prepend-icon="mdi-pencil"
                variant="text"
                @click="editProject"
                v-if="isManager"
              >
                Редактировать проект
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text>
            <div class="mb-4">{{ project.description }}</div>

            <v-alert type="info" variant="tonal" v-if="!loading && boards.length === 0">
              У этого проекта пока нет досок. {{ isManager ? 'Создайте первую доску!' : '' }}
            </v-alert>
          </v-card-text>
        </v-card>

        <v-skeleton-loader v-else-if="loading" type="card"></v-skeleton-loader>

        <v-alert v-else type="error" variant="tonal"> Проект не найден </v-alert>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h5">Доски</span>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="showBoardForm = true"
              v-if="isManager"
            >
              Создать доску
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-progress-linear
              :active="loading"
              :indeterminate="loading"
              color="primary"
              class="mb-4"
            ></v-progress-linear>

            <v-row>
              <v-col v-for="board in boards" :key="board.id" cols="12" md="6" lg="4">
                <BoardCard
                  :board="board"
                  @edit="editBoard(board)"
                  @delete="confirmDeleteBoard(board)"
                  @view="viewBoard(board.id)"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <ProjectForm v-model="showProjectForm" :project="project" @save="saveProject" />

    <BoardForm
      v-model="showBoardForm"
      :board="selectedBoard"
      :projects="[project].filter(Boolean)"
      :project-id="projectId"
      @save="saveBoard"
    />

    <v-dialog v-model="showDeleteBoardDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5"> Удаление доски </v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить доску "{{ selectedBoard?.name }}"? Это действие нельзя
          отменить.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="showDeleteBoardDialog = false">
            Отмена
          </v-btn>
          <v-btn color="error" variant="text" @click="deleteBoard"> Удалить </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="showSnackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="white" icon="mdi-close" @click="showSnackbar = false" size="small"></v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import { useBoardStore } from '@/stores/boardStore'
import type { Project, Board } from '@/types'
import ProjectForm from '@/components/projects/ProjectForm.vue'
import BoardCard from '@/components/boards/BoardCard.vue'
import BoardForm from '@/components/boards/BoardForm.vue'

export default defineComponent({
  name: 'ProjectDetailsView',

  components: {
    ProjectForm,
    BoardCard,
    BoardForm,
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const projectStore = useProjectStore()
    const boardStore = useBoardStore()

    const projectId = computed(() => {
      const id = route.params.id
      return id ? parseInt(id as string) : 0
    })

    const showProjectForm = ref(false)
    const showBoardForm = ref(false)
    const showDeleteBoardDialog = ref(false)
    const selectedBoard = ref<Board | null>(null)
    const showSnackbar = ref(false)
    const snackbarText = ref('')
    const snackbarColor = ref('success')

    const project = computed(() => projectStore.currentProject)
    const boards = computed(() => boardStore.projectBoards)
    const loading = computed(() => projectStore.loading || boardStore.loading)
    const isManager = computed(() => authStore.isManager)

    const breadcrumbs = computed(() => [
      {
        title: 'Проекты',
        disabled: false,
        href: '/projects',
      },
      {
        title: project.value?.name || 'Загрузка...',
        disabled: true,
      },
    ])

    onMounted(async () => {
      if (projectId.value) {
        await projectStore.fetchProject(projectId.value)
        await boardStore.fetchProjectBoards(projectId.value)
      }
    })

    const editProject = () => {
      showProjectForm.value = true
    }

    const editBoard = (board: Board) => {
      selectedBoard.value = board
      showBoardForm.value = true
    }

    const confirmDeleteBoard = (board: Board) => {
      selectedBoard.value = board
      showDeleteBoardDialog.value = true
    }

    const viewBoard = (boardId: number) => {
      router.push({ name: 'board', params: { id: boardId } })
    }

    const saveProject = async (projectData: Partial<Project>) => {
      if (!project.value) return

      try {
        const result = await projectStore.updateProject(project.value.id, projectData)

        if (result.success) {
          snackbarText.value = 'Проект успешно обновлен'
          snackbarColor.value = 'success'
        } else {
          snackbarText.value = result.message || 'Ошибка при обновлении проекта'
          snackbarColor.value = 'error'
        }

        showSnackbar.value = true
      } catch (error: any) {
        snackbarText.value = error.message || 'Произошла ошибка'
        snackbarColor.value = 'error'
        showSnackbar.value = true
      }
    }

    const saveBoard = async (boardData: Partial<Board>) => {
      try {
        if (selectedBoard.value) {
          const result = await boardStore.updateBoard(selectedBoard.value.id, boardData)

          if (result.success) {
            snackbarText.value = 'Доска успешно обновлена'
            snackbarColor.value = 'success'
          } else {
            snackbarText.value = result.message || 'Ошибка при обновлении доски'
            snackbarColor.value = 'error'
          }
        } else {
          const result = await boardStore.createBoard(boardData)

          if (result.success) {
            snackbarText.value = 'Доска успешно создана'
            snackbarColor.value = 'success'
          } else {
            snackbarText.value = result.message || 'Ошибка при создании доски'
            snackbarColor.value = 'error'
          }
        }

        showSnackbar.value = true
        selectedBoard.value = null
      } catch (error: any) {
        snackbarText.value = error.message || 'Произошла ошибка'
        snackbarColor.value = 'error'
        showSnackbar.value = true
      }
    }

    const deleteBoard = async () => {
      if (!selectedBoard.value) return

      try {
        const result = await boardStore.deleteBoard(selectedBoard.value.id)

        if (result.success) {
          snackbarText.value = 'Доска успешно удалена'
          snackbarColor.value = 'success'
        } else {
          snackbarText.value = result.message || 'Ошибка при удалении доски'
          snackbarColor.value = 'error'
        }

        showSnackbar.value = true
        showDeleteBoardDialog.value = false
        selectedBoard.value = null
      } catch (error: any) {
        snackbarText.value = error.message || 'Произошла ошибка'
        snackbarColor.value = 'error'
        showSnackbar.value = true
      }
    }

    return {
      projectId,
      project,
      boards,
      loading,
      isManager,
      breadcrumbs,
      showProjectForm,
      showBoardForm,
      showDeleteBoardDialog,
      selectedBoard,
      showSnackbar,
      snackbarText,
      snackbarColor,
      editProject,
      editBoard,
      confirmDeleteBoard,
      viewBoard,
      saveProject,
      saveBoard,
      deleteBoard,
    }
  },
})
</script>
