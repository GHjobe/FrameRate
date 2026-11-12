<script setup>
import MovieCard from './MovieCard.vue'
import SkeletonLoader from './SkeletonLoader.vue'

defineProps({
  title: { type: String, required: true },
  movies: { type: Array, default: () => [] },
  loading: Boolean,
  seeAllTo: { type: [String, Object], default: null },
})
const emit = defineEmits(['add'])
</script>

<template>
  <section class="row">
    <header class="row__head">
      <h2 class="row__title">{{ title }}</h2>
      <RouterLink v-if="seeAllTo" :to="seeAllTo" class="row__all">See all</RouterLink>
    </header>
    <div class="row__list">
      <template v-if="loading">
        <SkeletonLoader v-for="n in 5" :key="n" width="180px" height="320px" />
      </template>
      <template v-else>
        <MovieCard v-for="m in movies" :key="m.id" :movie="m" @add="emit('add', $event)" />
      </template>
    </div>
  </section>
</template>

<style scoped>
.row { margin-top: var(--space-8); }
.row__head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: var(--space-4); }
.row__title { font-family: var(--font-body); font-size: var(--text-lg); font-weight: 600; }
.row__all { color: var(--color-nav-active); font-size: var(--text-sm); }
.row__all:hover { text-decoration: underline; }
.row__list { display: flex; gap: var(--space-4); overflow-x: auto; padding-bottom: var(--space-3); }
</style>