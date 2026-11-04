<script setup>
defineProps({ selected: Boolean, disabled: Boolean })
</script>

<template>
  <button type="button" :disabled="disabled" :aria-pressed="selected" :class="['chip', { 'is-selected': selected }]">
    <slot />
  </button>
</template>

<style scoped>
.chip {
  padding: 6px var(--space-4);
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: var(--text-sm);
  transition: background 0.15s, border-color 0.15s;
}
.chip:hover:not(:disabled) { background: var(--color-surface-hover); }
.chip.is-selected { background: var(--color-primary); border-color: var(--color-primary); color: #1a1205; font-weight: 600; }
.chip:disabled { opacity: 0.5; }
</style>