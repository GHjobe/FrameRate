<script setup>
defineProps({
  score: { type: Number, required: true },
  ratings: Number, // optional: number of ratings
})
</script>

<template>
  <span class="score">
    <span class="score__num">{{ score.toFixed(1) }}</span>
    <span v-if="ratings !== undefined" class="score__count">({{ ratings }})</span>
  </span>
</template>

<style scoped>
.score {
  display: inline-flex; align-items: center; gap: var(--space-1);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--color-score);
  color: #06260f;
  font-size: var(--text-sm);
  font-weight: 700;
}
.score__count { font-weight: 500; opacity: 0.8; }
</style>