import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '@/layout/AppLayout.vue'
import { useUserStore } from '@/stores/userStore'
import LegalView from '@/views/legal/LegalView.vue'
import InfoView from '@/views/info/InfoView.vue'
import ForbiddenView from '@/views/ForbiddenView.vue'
import { usePermissionsStore } from '../stores/permissionsStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/',
      component: AppLayout,
      name: 'home',
      redirect: { name: 'list_identification_tasks' },
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
        {
          path: 'messages',
          meta: { requiresAbility: ['view', 'Message'] },
          children: [
            {
              path: '',
              name: 'list_messages',
              component: () => import('@/views/messages/ListView.vue'),
            },
            {
              path: ':messageId',
              name: 'message_detail',
              component: () => import('@/views/messages/DetailView.vue'),
              props: (route) => ({
                messageId: Number(route.params.messageId),
              }),
            },
          ],
        },
        {
          path: 'statistics',
          children: [
            {
              path: '',
              name: 'participation_statistics',
              meta: { requiresAbility: ['view', 'Statistics'] },
              component: () => import('@/views/statistics/ParticipationView.vue'),
            },
          ],
        },
      ],
    },
    // ------------------------
    // Legal Pages
    // ------------------------
    {
      path: '/:lang?/legal/:doc',
      name: 'Legal',
      component: LegalView,
      props: (route) => ({ lang: route.params.lang, doc: route.params.doc }),
      meta: {
        requiresAuth: false,
      },
    },

    // ------------------------
    // Info Pages
    // ------------------------
    {
      path: '/:lang?/info/:doc',
      name: 'Info',
      component: InfoView,
      props: (route) => ({ lang: route.params.lang, doc: route.params.doc }),
      meta: {
        requiresAuth: false,
      },
    },
    // ------------------------
    // Forbidden Pages
    {
      path: '/:lang?/forbidden',
      name: 'forbidden',
      component: ForbiddenView,
      props: (route) => ({ lang: route.params.lang }),
      meta: {
        requiresAuth: false,
      },
    },
    // ------------------------
  ],
})

router.beforeEach(async (to, from, next) => {
  const authRequired = to.meta.requiresAuth !== false
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
  } else if (authRequired) {
    const permissionsStore = usePermissionsStore()

    // Make sure permissions are loaded before checking abilities (e.g. after a hard refresh).
    await permissionsStore.ensurePermissionsLoaded()
    // Check if the user has the required ability
    const required = to.meta.requiresAbility
    if (required && !permissionsStore.ability.can(...required)) {
      next({ name: 'forbidden' })
      return
    }
    next()
  } else {
    // Proceed to the requested route
    next()
  }
})

export default router
