<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const query = ref(route.query.q || '')

watch(
  () => route.query.q,
  (value) => {
    query.value = value || ''
  },
)

function submit() {
  const q = query.value.trim()
  router.push(q ? { name: 'search', query: { q } } : { name: 'search' })
}
</script>

<template>
  <form class="search" role="search" @submit.prevent="submit">
    <svg class="search__icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </svg>
    <input
      v-model="query"
      type="search"
      class="search__input"
      placeholder="Search for movies & more"
      aria-label="Search"
    />
  </form>
</template>

<style scoped>
.search {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 360px;
}
.search__icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-muted);
  pointer-events: none;
}
.search__input {
  width: 100%;
  padding: 8px var(--space-3) 8px 38px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  color: var(--color-text);
  font-size: var(--text-sm);
  transition: border-color 0.15s;
}
.search__input::placeholder { color: var(--color-text-muted); }
.search__input:hover { border-color: var(--color-text-muted); }
.search__input:focus-visible {
  border-color: var(--color-nav-active);
  outline: none;
  box-shadow: 0 0 0 2px var(--color-nav-active);
}
</style>