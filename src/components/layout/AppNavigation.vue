<template>
  <v-navigation-drawer v-model="drawer" temporary>
    <v-list-item title="Канбан-система" subtitle="Управление задачами"></v-list-item>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item
        v-for="item in navigationItems"
        :key="item.title"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
      ></v-list-item>
    </v-list>

    <template v-slot:append>
      <div class="pa-4">
        <v-btn v-if="isAuthenticated" block color="error" @click="logout"> Выйти </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'AppNavigation',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const authStore = useAuthStore()
    const router = useRouter()

    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const isManager = computed(() => authStore.isManager)

    const drawer = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    })

    const navigationItems = computed(() => {
      const items = [{ title: 'Главная', icon: 'mdi-home', to: '/' }]

      if (isAuthenticated.value) {
        items.push(
          { title: 'Проекты', icon: 'mdi-folder-multiple', to: '/projects' },
          { title: 'Мои задачи', icon: 'mdi-clipboard-check', to: '/my-tasks' },
        )

        if (isManager.value) {
          items.push({ title: 'Пользователи', icon: 'mdi-account-group', to: '/users' })
        }
      }

      return items
    })

    const logout = () => {
      authStore.logout()
      router.push('/login')
    }

    return {
      drawer,
      navigationItems,
      isAuthenticated,
      logout,
    }
  },
})
</script>
