import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '@/layout/AppLayout.vue'
import { useUserStore } from '@/stores/userStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
    },
    {
      path: '/',
      component: AppLayout,
      name: 'home',
      redirect: { name: 'list_annotations' },
      children: [
        {
          path: 'annotations',
          name: 'list_annotations',
          component: () => import('@/views/annotations/ListView.vue'),
        },
        {
          path: 'identification_tasks',
          children: [
            {
              path: '',
              name: 'list_identification_tasks',
              component: () => import('@/views/identification_task/ListView.vue'),
            },
            {
              path: ':observationUuid',
              children: [
                {
                  path: '',
                  name: 'identification_task',
                  component: () => import('@/views/identification_task/DetailView.vue'),
                  props: true,
                },
                {
                  path: 'annotations/new',
                  name: 'annotate_identification_task',
                  component: () => import('@/views/annotations/CreateView.vue'),
                  props: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const publicPages = ['login']
  const authRequired = !publicPages.includes(to.name as string)
  // Check if the user is authenticated
  const userStore = useUserStore()
  if (authRequired && !userStore.user) {
    // Redirect to the login page if not authenticated
    next({
      name: 'login',
      query: {
        next: to.fullPath,
      },
    })
  } else {
    // Proceed to the requested route
    next()
  }
})

export default router
