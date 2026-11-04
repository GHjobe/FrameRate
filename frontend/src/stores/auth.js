import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    role: 'guest', // 'guest' | 'user' | 'moderator'
    user: null,
  }),
  getters: {
    isLoggedIn: (s) => s.role !== 'guest',
    isModerator: (s) => s.role === 'moderator',
  },
  actions: {
    fakeLogin(role = 'user') {
      this.role = role
      this.user = { username: role === 'moderator' ? 'mod_demo' : 'demo_user' }
    },
    logout() {
      this.role = 'guest'
      this.user = null
    },
  },
})