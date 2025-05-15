<template>
  <div class="home">
    <v-row>
      <v-col cols="12" lg="6">
        <v-card class="mb-4">
          <v-card-title class="text-h5"> Добро пожаловать в Канбан-систему </v-card-title>
          <v-card-text>
            <p>
              Система предназначена для управления проектами и задачами с использованием методологии
              Канбан.
            </p>
            <v-list class="bg-transparent" v-if="isAuthenticated">
              <v-list-item
                prepend-icon="mdi-view-dashboard"
                title="Просмотрите доски"
                subtitle="Управление задачами через канбан-доски"
                @click="$router.push('/projects')"
              ></v-list-item>
              <v-list-item
                prepend-icon="mdi-clipboard-check"
                title="Мои задачи"
                subtitle="Просмотр и управление моими задачами"
                @click="$router.push('/my-tasks')"
              ></v-list-item>
              <v-list-item
                v-if="isManager"
                prepend-icon="mdi-folder-plus"
                title="Создать проект"
                subtitle="Добавить новый проект в систему"
                @click="$router.push('/projects')"
              ></v-list-item>
            </v-list>
            <div v-else>
              <v-btn color="primary" class="mr-2 mt-4" @click="$router.push('/login')">
                Войти
              </v-btn>
              <v-btn color="secondary" class="mt-4" @click="$router.push('/register')">
                Зарегистрироваться
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card class="mb-4">
          <v-card-title class="text-h5"> Основные функции </v-card-title>
          <v-card-text>
            <v-list class="bg-transparent">
              <v-list-item
                prepend-icon="mdi-folder-multiple"
                title="Проекты"
                subtitle="Организация задач по проектам"
              ></v-list-item>
              <v-list-item
                prepend-icon="mdi-view-dashboard"
                title="Канбан-доски"
                subtitle="Визуальное управление задачами"
              ></v-list-item>
              <v-list-item
                prepend-icon="mdi-format-list-bulleted"
                title="Задачи"
                subtitle="Отслеживание и управление задачами"
              ></v-list-item>
              <v-list-item
                prepend-icon="mdi-account-group"
                title="Роли пользователей"
                subtitle="Менеджеры и исполнители с разными правами"
              ></v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="isAuthenticated && myTasks.length > 0">
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5">
            Мои задачи
            <v-btn variant="text" class="ml-2" @click="$router.push('/my-tasks')">
              Подробнее
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>Код</th>
                  <th>Название</th>
                  <th>Приоритет</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="task in myTasks.slice(0, 5)"
                  :key="task.id"
                  @click="$router.push(`/tasks/${task.id}`)"
                  style="cursor: pointer"
                >
                  <td>{{ task.code }}</td>
                  <td>{{ task.title }}</td>
                  <td>
                    <v-chip size="small" :color="getPriorityColor(task.priority)">
                      {{ task.priority }}
                    </v-chip>
                  </td>
                  <td>{{ task.status }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useTaskStore } from '@/stores/taskStore'
import type { Task } from '@/types'

export default defineComponent({
  name: 'HomeView',

  setup() {
    const authStore = useAuthStore()
    const taskStore = useTaskStore()

    const myTasks = ref<Task[]>([])
    const loading = ref(false)

    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const isManager = computed(() => authStore.isManager)

    onMounted(async () => {
      if (isAuthenticated.value) {
        loading.value = true
        await taskStore.fetchMyTasks()
        myTasks.value = taskStore.myTasks
        loading.value = false
      }
    })

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'high':
          return 'error'
        case 'medium':
          return 'warning'
        case 'low':
          return 'success'
        default:
          return 'grey'
      }
    }

    return {
      isAuthenticated,
      isManager,
      myTasks,
      loading,
      getPriorityColor,
    }
  },
})
</script>
