<template>
  <v-app-bar color="primary" flat>
    <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>

    <v-toolbar-title class="text-uppercase"> Канбан-система </v-toolbar-title>

    <v-spacer></v-spacer>

    <div v-if="isAuthenticated">
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title>{{ userInfo.username }}</v-list-item-title>
            <v-list-item-subtitle>{{
              userInfo.role === 'manager' ? 'Менеджер' : 'Исполнитель'
            }}</v-list-item-subtitle>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="logout">
            <v-list-item-title>Выйти</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <div v-else>
      <v-btn variant="text" @click="$router.push('/login')"> Войти </v-btn>
      <v-btn variant="text" @click="$router.push('/register')"> Регистрация </v-btn>
    </div>
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'AppHeader',

  props: {
    drawer: {
      type: Boolean,
      required: true,
    },
  },

  emits: ['update:drawer'],

  setup(props, { emit }) {
    const authStore = useAuthStore()
    const router = useRouter()

    const isAuthenticated = computed(() => authStore.isAuthenticated)

    const userInfo = computed(() => ({
      username: authStore.user?.username || '',
      role: authStore.user?.role || '',
    }))

    const toggleDrawer = () => {
      emit('update:drawer', !props.drawer)
    }

    const logout = () => {
      authStore.logout()
      router.push('/login')
    }

    return {
      isAuthenticated,
      userInfo,
      toggleDrawer,
      logout,
    }
  },
})
</script>
