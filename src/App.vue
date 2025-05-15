<template>
  <v-app>
    <app-header v-model:drawer="drawer" />
    <app-navigation v-model="drawer" />

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppNavigation from '@/components/layout/AppNavigation.vue'
import { useAuthStore } from '@/stores/authStore'

export default defineComponent({
  name: 'App',

  components: {
    AppHeader,
    AppNavigation,
  },

  setup() {
    const drawer = ref(false)
    const authStore = useAuthStore()

    onMounted(() => {
      authStore.checkAuth()
    })

    return {
      drawer,
    }
  },
})
</script>
