import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', name: 'home', component: () => import('@/pages/HomePage.vue') },
  { path: '/search', name: 'search', component: () => import('@/pages/SearchPage.vue') },
  { path: '/login', name: 'login', component: () => import('@/pages/AuthPage.vue') },
  { path: '/onboarding', name: 'onboarding', component: () => import('@/pages/OnboardingPage.vue') },
  { path: '/movie/:id', name: 'movie', component: () => import('@/pages/MovieDetailPage.vue') },
  { path: '/watchlist', name: 'watchlist', component: () => import('@/pages/WatchlistPage.vue') },
  { path: '/for-you', name: 'for-you', component: () => import('@/pages/ForYouPage.vue') },
  { path: '/watch-together', name: 'watch-together', component: () => import('@/pages/WatchTogetherPage.vue') },
  { path: '/profile', name: 'profile', component: () => import('@/pages/ProfilePage.vue') },
  {
    path: '/moderation',
    name: 'moderation',
    component: () => import('@/pages/ModerationPage.vue'),
    meta: { requiresModerator: true },
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/pages/NotFoundPage.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresModerator && !auth.isModerator) {
    return { name: 'home' }
  }
})

export default router