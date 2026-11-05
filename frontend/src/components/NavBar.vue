<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseAvatar from './BaseAvatar.vue'
import BaseButton from './BaseButton.vue'
import SearchBar from './SearchBar.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const links = [
  { to: '/', label: 'Discover' },
  { to: '/for-you', label: 'For You' },
  { to: '/watchlist', label: 'Watchlist' },
  { to: '/watch-together', label: 'Watch Together' },
]

const menuOpen = ref(false)
const menuRef = ref(null)

function onClickOutside(event) {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)

function logout() {
  menuOpen.value = false
  auth.logout()
  router.push('/')
}
</script>

<template>
  <header class="nav">
    <div class="nav__inner">
      <RouterLink to="/" class="nav__logo" aria-label="FrameRate home">
        <img src="/logo.png" alt="FrameRate" />
      </RouterLink>

      <nav class="nav__links" aria-label="Main">
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" class="nav__link" exact-active-class="is-active">
          {{ l.label }}
        </RouterLink>
        <RouterLink v-if="auth.isModerator" to="/moderation" class="nav__link" exact-active-class="is-active">
          Moderation
        </RouterLink>
      </nav>

      <div class="nav__right">
        <SearchBar />

        <template v-if="!auth.isLoggedIn">
          <BaseButton variant="text" @click="router.push({ name: 'login' })">Log In</BaseButton>
          <BaseButton @click="router.push({ name: 'login', query: { mode: 'register' } })">Register</BaseButton>
        </template>

        <div v-else ref="menuRef" class="nav__menu">
          <button
            type="button"
            class="nav__avatar"
            aria-label="Account menu"
            :aria-expanded="menuOpen"
            @click="menuOpen = !menuOpen"
          >
            <BaseAvatar :name="auth.user?.username || ''" :size="36" />
          </button>
          <div v-if="menuOpen" class="nav__dropdown" role="menu">
            <RouterLink to="/profile" class="nav__item" role="menuitem">Profile</RouterLink>
            <button type="button" class="nav__item" role="menuitem" @click="logout">Log out</button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--navbar-height);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}
.nav__inner {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  height: 100%;
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 0 var(--space-6);
}
.nav__logo {
  display: inline-flex;
  align-items: center;
  line-height: 0;
}
.nav__logo img {
  height: 32px;
  width: auto;
}
.nav__logo:focus-visible {
  outline: 2px solid var(--color-nav-active);
  outline-offset: 4px;
}
.nav__links { display: flex; gap: var(--space-6); }
.nav__link {
  padding: var(--space-2) 0;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: color 0.15s;
}
.nav__link:hover { color: var(--color-text); }
.nav__link.is-active {
  color: var(--color-text);
  font-weight: 600;
  border-bottom-color: var(--color-nav-active);
}
.nav__right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-left: auto;
}
.nav__menu { position: relative; }
.nav__avatar { border-radius: 50%; line-height: 0; }
.nav__avatar:focus-visible { outline: 2px solid var(--color-nav-active); outline-offset: 2px; }
.nav__dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + var(--space-2));
  min-width: 160px;
  display: flex;
  flex-direction: column;
  padding: var(--space-1);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}
.nav__item {
  padding: var(--space-2) var(--space-3);
  text-align: left;
  color: var(--color-text);
  font-size: var(--text-sm);
  text-decoration: none;
  border-radius: var(--radius-sm);
}
.nav__item:hover { background: var(--color-surface-hover); }
.nav__item:focus-visible { outline: 2px solid var(--color-nav-active); }
</style>