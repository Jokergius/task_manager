<template>
  <div class="login-view">
    <LoginForm />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import LoginForm from '@/components/auth/LoginForm.vue'

export default defineComponent({
  name: 'LoginView',
  components: {
    LoginForm,
  },
})
</script>
