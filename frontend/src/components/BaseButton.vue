<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | text | danger
  disabled: Boolean,
  type: { type: String, default: 'button' },
})
</script>

<template>
  <button :type="type" :disabled="disabled" :class="['btn', `btn--${variant}`]">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 10px var(--space-6);
  border-radius: var(--radius-md);
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid transparent;
  transition: background 0.15s, border-color 0.15s, opacity 0.15s;
}
.btn--primary { background: var(--color-primary); color: #1a1205; }
.btn--primary:hover:not(:disabled) { background: var(--color-primary-hover); }

.btn--secondary { background: transparent; border-color: var(--color-border); color: var(--color-text); }
.btn--secondary:hover:not(:disabled) { background: var(--color-surface-hover); }

.btn--text { background: transparent; color: var(--color-text-muted); padding: 10px var(--space-3); }
.btn--text:hover:not(:disabled) { color: var(--color-text); background: var(--color-surface); }

.btn--danger { background: var(--color-danger); color: #fff; }
.btn--danger:hover:not(:disabled) { background: var(--color-danger-hover); }

.btn:disabled { opacity: 0.5; }
</style>