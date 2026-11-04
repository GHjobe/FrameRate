<script setup>
import ScoreBadge from './ScoreBadge.vue'

defineProps({ movie: { type: Object, required: true } })
const emit = defineEmits(['add'])
</script>

<template>
  <article class="card">
    <RouterLink :to="`/movie/${movie.id}`" class="card__link">
      <div class="card__poster">
        <img v-if="movie.poster" :src="movie.poster" :alt="movie.title" />
        <span v-else class="card__placeholder">{{ movie.title }}</span>
      </div>
      <h3 class="card__title">{{ movie.title }}</h3>
    </RouterLink>
    <div class="card__meta">
      <span class="card__year">{{ movie.year }}</span>
      <ScoreBadge :score="movie.score" :ratings="movie.ratings" />
    </div>
    <button type="button" class="card__add" :aria-label="`Add ${movie.title} to watchlist`" @click="emit('add', movie)">+</button>
  </article>
</template>

<style scoped>
.card { position: relative; width: 180px; flex-shrink: 0; }
.card__poster {
  aspect-ratio: 2 / 3;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.15s, box-shadow 0.15s;
}
.card__link:hover .card__poster { transform: translateY(-3px); box-shadow: var(--shadow-card); }
.card__poster img { width: 100%; height: 100%; object-fit: cover; }
.card__placeholder { padding: var(--space-3); text-align: center; color: var(--color-text-muted); font-size: var(--text-sm); }
.card__title {
  margin-top: var(--space-2);
  font-family: var(--font-body);
  font-size: var(--text-md);
  font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.card__meta { display: flex; align-items: center; justify-content: space-between; margin-top: var(--space-1); }
.card__year { color: var(--color-text-muted); font-size: var(--text-sm); }
.card__add {
  position: absolute; top: var(--space-2); right: var(--space-2);
  width: 30px; height: 30px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #1a1205;
  font-size: 20px; font-weight: 700; line-height: 1;
  transition: background 0.15s;
}
.card__add:hover { background: var(--color-primary-hover); }
</style>