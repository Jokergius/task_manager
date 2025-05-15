import { createRouter, createWebHistory } from 'vue-router'
import authService from '@/api/authService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'Главная' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: 'Вход', guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { title: 'Регистрация', guest: true },
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('@/views/ProjectsView.vue'),
      meta: { title: 'Проекты', requiresAuth: true },
    },
    {
      path: '/projects/:id',
      name: 'project-details',
      component: () => import('@/views/ProjectDetailsView.vue'),
      meta: { title: 'Детали проекта', requiresAuth: true },
    },
    {
      path: '/boards/:id',
      name: 'board',
      component: () => import('@/views/BoardView.vue'),
      meta: { title: 'Доска', requiresAuth: true },
    },
    {
      path: '/my-tasks',
      name: 'my-tasks',
      component: () => import('@/views/MyTasksView.vue'),
      meta: { title: 'Мои задачи', requiresAuth: true },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/views/UsersView.vue'),
      meta: { title: 'Пользователи', requiresAuth: true, requiresManager: true },
    },
    {
      path: '/tasks/:id',
      name: 'task-details',
      component: () => import('@/views/TaskDetailsView.vue'),
      meta: { title: 'Детали задачи', requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Страница не найдена' },
    },
  ],
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | Канбан-система` || 'Канбан-система'

  const isAuthenticated = authService.isAuthenticated()
  const isManager = authService.isManager()

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
    return
  }

  if (to.meta.requiresManager && !isManager) {
    next({ name: 'home' })
    return
  }

  if (to.meta.guest && isAuthenticated) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
