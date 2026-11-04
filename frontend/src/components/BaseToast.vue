<script setup>
defineProps({
  message: String,
  type: { type: String, default: 'success' }, // success | error
})
const emit = defineEmits(['close'])
</script>

<template>
  <div :class="['toast', `toast--${type}`]" role="status">
    <span>{{ message }}</span>
    <button type="button" class="toast__close" aria-label="Close" @click="emit('close')">×</button>
  </div>
</template>

<style scoped>
.toast {
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-4);
  min-width: 260px;
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-score);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}
.toast--error { border-left-color: var(--color-danger); }
.toast__close { font-size: 20px; color: var(--color-text-muted); }
.toast__close:hover { color: var(--color-text); }
</style>