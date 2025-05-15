<template>
  <div class="users-view">
    <v-card>
      <v-card-title class="text-h5"> Пользователи </v-card-title>

      <v-card-text>
        <v-progress-linear
          :active="loading"
          :indeterminate="loading"
          color="primary"
          class="mb-4"
        ></v-progress-linear>

        <v-table v-if="users.length > 0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя пользователя</th>
              <th>Email</th>
              <th>Роль</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <v-chip size="small" :color="user.role === 'manager' ? 'indigo' : 'teal'">
                  {{ user.role === 'manager' ? 'Менеджер' : 'Исполнитель' }}
                </v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>

        <v-alert v-else-if="!loading" type="info" variant="tonal">
          Пользователи не найдены
        </v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import axios from 'axios'
import { API_URL } from '@/api/apiClient'
import type { User } from '@/types'

export default defineComponent({
  name: 'UsersView',

  setup() {
    const users = ref<User[]>([])
    const loading = ref(true)

    onMounted(async () => {
      loading.value = true

      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${API_URL}/users/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        users.value = response.data.users
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error)
      } finally {
        loading.value = false
      }
    })

    return {
      users,
      loading,
    }
  },
})
</script>
