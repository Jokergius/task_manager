<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <h1 class="text-h2 mb-6">404</h1>
        <h2 class="text-h4 mb-6">Страница не найдена</h2>
        <p class="text-body-1 mb-6">
          Извините, но страница, которую вы ищете, не существует или была перемещена.
        </p>
        <v-btn color="primary" size="large" @click="$router.push('/')">
          Вернуться на главную
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NotFoundView',
})
</script>

<style scoped>
.fill-height {
  min-height: calc(100vh - 64px);
}
</style>
