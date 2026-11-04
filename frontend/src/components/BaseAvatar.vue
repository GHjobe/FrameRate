<script setup>
import { computed } from 'vue'

const props = defineProps({
  src: String,
  name: { type: String, default: '' },
  size: { type: Number, default: 36 },
})
const initial = computed(() => (props.name || '?').charAt(0).toUpperCase())
</script>

<template>
  <span class="avatar" :style="{ width: size + 'px', height: size + 'px', fontSize: size * 0.4 + 'px' }">
    <img v-if="src" :src="src" :alt="name" />
    <span v-else>{{ initial }}</span>
  </span>
</template>

<style scoped>
.avatar {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: var(--color-nav-active);
  color: #fff;
  font-weight: 600;
  overflow: hidden;
  flex-shrink: 0;
}
.avatar img { width: 100%; height: 100%; object-fit: cover; }
</style>