<template>
  <div class="register-view">
    <RegisterForm />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'

export default defineComponent({
  name: 'RegisterView',
  components: {
    RegisterForm,
  },
})
</script>
