<template>
  <v-card class="mx-auto mt-10" max-width="500">
    <v-card-title class="text-center text-h5 py-4"> Вход в систему </v-card-title>
    <v-card-text>
      <v-form @submit.prevent="login" ref="form">
        <v-text-field
          v-model="username"
          label="Имя пользователя"
          prepend-icon="mdi-account"
          :rules="[rules.required]"
        ></v-text-field>

        <v-text-field
          v-model="password"
          label="Пароль"
          prepend-icon="mdi-lock"
          :type="showPassword ? 'text' : 'password'"
          :rules="[rules.required]"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="showPassword = !showPassword"
        ></v-text-field>

        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>

        <v-btn type="submit" color="primary" block class="mt-4" :loading="loading"> Войти </v-btn>
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-center pb-4">
      <p>
        Нет аккаунта?
        <v-btn variant="text" color="primary" @click="$router.push('/register')">
          Зарегистрироваться
        </v-btn>
      </p>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

export default defineComponent({
  name: 'LoginForm',

  setup() {
    const username = ref('')
    const password = ref('')
    const showPassword = ref(false)
    const loading = ref(false)
    const error = ref('')
    const form = ref(null)

    const router = useRouter()
    const authStore = useAuthStore()

    const rules = {
      required: (value: string) => !!value || 'Поле обязательно для заполнения',
    }

    const login = async () => {
      const formRef = form.value as any
      const isValid = formRef?.validate()

      if (!isValid) return

      loading.value = true
      error.value = ''

      try {
        const result = await authStore.login(username.value, password.value)

        if (result.success) {
          router.push('/')
        } else {
          error.value = result.message || 'Ошибка входа'
        }
      } catch (err: any) {
        error.value = err.message || 'Произошла ошибка'
      } finally {
        loading.value = false
      }
    }

    return {
      username,
      password,
      showPassword,
      loading,
      error,
      form,
      rules,
      login,
    }
  },
})
</script>
