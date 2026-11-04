<script setup>
import { ref } from 'vue'

const props = defineProps({
  readonly: Boolean,
  max: { type: Number, default: 5 },
  size: { type: Number, default: 20 },
})
const model = defineModel({ type: Number, default: 0 })
const hover = ref(0)

const fill = (i) => {
  const value = hover.value || model.value
  return Math.max(0, Math.min(1, value - (i - 1))) * 100
}
</script>

<template>
  <div class="stars" :style="{ fontSize: size + 'px' }" role="radiogroup" @mouseleave="hover = 0">
    <component
      :is="readonly ? 'span' : 'button'"
      v-for="i in max"
      :key="i"
      :type="readonly ? undefined : 'button'"
      :class="['star', { 'is-interactive': !readonly }]"
      :aria-label="readonly ? undefined : `${i} star${i > 1 ? 's' : ''}`"
      @mouseenter="!readonly && (hover = i)"
      @click="!readonly && (model = i)"
    >
      <span class="star__bg">★</span>
      <span class="star__fg" :style="{ width: fill(i) + '%' }">★</span>
    </component>
  </div>
</template>

<style scoped>
.stars { display: inline-flex; gap: 2px; line-height: 1; }
.star { position: relative; display: inline-block; }
.star__bg { color: var(--color-border); }
.star__fg { position: absolute; left: 0; top: 0; overflow: hidden; color: var(--color-primary); white-space: nowrap; }
.star.is-interactive { cursor: pointer; transition: transform 0.1s; }
.star.is-interactive:hover { transform: scale(1.15); }
</style>