<template>
  <div class="projects-view">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h5">Проекты</span>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="showProjectForm = true"
              v-if="isManager"
            >
              Создать проект
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-progress-linear
              :active="loading"
              :indeterminate="loading"
              color="primary"
              class="mb-4"
            ></v-progress-linear>

            <v-alert
              v-if="!loading && projects.length === 0"
              type="info"
              color="info"
              variant="tonal"
            >
              Проекты не найдены.
              {{ isManager ? 'Создайте первый проект!' : 'Скоро появятся новые проекты.' }}
            </v-alert>

            <v-row v-else>
              <v-col v-for="project in projects" :key="project.id" cols="12" md="6" lg="4">
                <ProjectCard
                  :project="project"
                  @edit="editProject(project)"
                  @delete="confirmDeleteProject(project)"
                  @view-boards="viewBoards(project.id)"
                  @view-tasks="viewTasks(project.id)"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <ProjectForm v-model="showProjectForm" :project="selectedProject" @save="saveProject" />

    <v-dialog v-model="showDeleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5"> Удаление проекта </v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить проект "{{ selectedProject?.name }}"? Это действие нельзя
          отменить.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="showDeleteDialog = false">
            Отмена
          </v-btn>
          <v-btn color="error" variant="text" @click="deleteProject"> Удалить </v-btn>
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import type { Project } from '@/types'
import ProjectCard from '@/components/projects/ProjectCard.vue'
import ProjectForm from '@/components/projects/ProjectForm.vue'

export default defineComponent({
  name: 'ProjectsView',

  components: {
    ProjectCard,
    ProjectForm,
  },

  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const projectStore = useProjectStore()

    const showProjectForm = ref(false)
    const showDeleteDialog = ref(false)
    const selectedProject = ref<Project | null>(null)
    const showSnackbar = ref(false)
    const snackbarText = ref('')
    const snackbarColor = ref('success')

    const projects = computed(() => projectStore.projects)
    const loading = computed(() => projectStore.loading)
    const isManager = computed(() => authStore.isManager)

    onMounted(async () => {
      await projectStore.fetchProjects()
    })

    const editProject = (project: Project) => {
      selectedProject.value = project
      showProjectForm.value = true
    }

    const confirmDeleteProject = (project: Project) => {
      selectedProject.value = project
      showDeleteDialog.value = true
    }

    const viewBoards = (projectId: number) => {
      router.push({ name: 'project-details', params: { id: projectId } })
    }

    const viewTasks = (projectId: number) => {
      router.push({
        name: 'my-tasks',
        query: { projectId: projectId.toString() },
      })
    }

    const saveProject = async (projectData: Partial<Project>) => {
      try {
        if (selectedProject.value) {
          const result = await projectStore.updateProject(selectedProject.value.id, projectData)

          if (result.success) {
            snackbarText.value = 'Проект успешно обновлен'
            snackbarColor.value = 'success'
          } else {
            snackbarText.value = result.message || 'Ошибка при обновлении проекта'
            snackbarColor.value = 'error'
          }
        } else {
          const result = await projectStore.createProject(projectData)

          if (result.success) {
            snackbarText.value = 'Проект успешно создан'
            snackbarColor.value = 'success'
          } else {
            snackbarText.value = result.message || 'Ошибка при создании проекта'
            snackbarColor.value = 'error'
          }
        }

        showSnackbar.value = true
        selectedProject.value = null
      } catch (error: any) {
        snackbarText.value = error.message || 'Произошла ошибка'
        snackbarColor.value = 'error'
        showSnackbar.value = true
      }
    }

    const deleteProject = async () => {
      if (!selectedProject.value) return

      try {
        const result = await projectStore.deleteProject(selectedProject.value.id)

        if (result.success) {
          snackbarText.value = 'Проект успешно удален'
          snackbarColor.value = 'success'
        } else {
          snackbarText.value = result.message || 'Ошибка при удалении проекта'
          snackbarColor.value = 'error'
        }

        showSnackbar.value = true
        showDeleteDialog.value = false
        selectedProject.value = null
      } catch (error: any) {
        snackbarText.value = error.message || 'Произошла ошибка'
        snackbarColor.value = 'error'
        showSnackbar.value = true
      }
    }

    return {
      projects,
      loading,
      isManager,
      showProjectForm,
      showDeleteDialog,
      showSnackbar,
      snackbarText,
      snackbarColor,
      selectedProject,
      editProject,
      confirmDeleteProject,
      viewBoards,
      viewTasks,
      saveProject,
      deleteProject,
    }
  },
})
</script>
