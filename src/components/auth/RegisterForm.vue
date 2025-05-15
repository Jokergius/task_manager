<template>
  <v-card class="mx-auto mt-10" max-width="500">
    <v-card-title class="text-center text-h5 py-4"> Регистрация </v-card-title>
    <v-card-text>
      <v-form @submit.prevent="register" ref="form">
        <v-text-field
          v-model="username"
          label="Имя пользователя"
          prepend-icon="mdi-account"
          :rules="[rules.required]"
        ></v-text-field>

        <v-text-field
          v-model="email"
          label="Email"
          prepend-icon="mdi-email"
          :rules="[rules.required, rules.email]"
        ></v-text-field>

        <v-text-field
          v-model="password"
          label="Пароль"
          prepend-icon="mdi-lock"
          :type="showPassword ? 'text' : 'password'"
          :rules="[rules.required, rules.minLength]"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="showPassword = !showPassword"
        ></v-text-field>

        <v-select
          v-model="role"
          label="Роль"
          prepend-icon="mdi-account-cog"
          :items="roles"
          item-title="text"
          item-value="value"
          :rules="[rules.required]"
        ></v-select>

        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>

        <v-btn type="submit" color="primary" block class="mt-4" :loading="loading">
          Зарегистрироваться
        </v-btn>
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-center pb-4">
      <p>
        Уже есть аккаунт?
        <v-btn variant="text" color="primary" @click="$router.push('/login')"> Войти </v-btn>
      </p>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

export default defineComponent({
  name: 'RegisterForm',

  setup() {
    const username = ref('')
    const email = ref('')
    const password = ref('')
    const role = ref('executor')
    const showPassword = ref(false)
    const loading = ref(false)
    const error = ref('')
    const form = ref(null)

    const router = useRouter()
    const authStore = useAuthStore()

    const roles = [
      { text: 'Менеджер', value: 'manager' },
      { text: 'Исполнитель', value: 'executor' },
    ]

    const rules = {
      required: (value: string) => !!value || 'Поле обязательно для заполнения',
      email: (value: string) => {
        const pattern =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return pattern.test(value) || 'Некорректный email'
      },
      minLength: (value: string) => value.length >= 6 || 'Минимальная длина пароля - 6 символов',
    }

    const register = async () => {
      const formRef = form.value as any
      const isValid = formRef?.validate()

      if (!isValid) return

      loading.value = true
      error.value = ''

      try {
        const result = await authStore.register(
          username.value,
          email.value,
          password.value,
          role.value,
        )

        if (result.success) {
          router.push('/')
        } else {
          error.value = result.message || 'Ошибка регистрации'
        }
      } catch (err: any) {
        error.value = err.message || 'Произошла ошибка'
      } finally {
        loading.value = false
      }
    }

    return {
      username,
      email,
      password,
      role,
      roles,
      showPassword,
      loading,
      error,
      form,
      rules,
      register,
    }
  },
})
</script>
