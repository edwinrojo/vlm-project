import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'upload',
          component: () => import('@/pages/UploadPage.vue'),
          meta: {
            title: 'Upload & Detect',
            description:
              'Upload highway images for automated damage classification powered by the VLM backend.',
          },
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/pages/DashboardPage.vue'),
          meta: {
            title: 'Analytics Dashboard',
            description:
              'Monitor road damage trends, risk level distribution, and geographic hotspots across Davao City.',
          },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFoundPage.vue'),
    },
  ],
})

router.afterEach((to) => {
  const title = (to.meta.title as string | undefined) ?? 'Road Damage Detection'
  document.title = `${title} | Davao City Road AI`
})

export default router
