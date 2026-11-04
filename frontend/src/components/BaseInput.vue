<script setup>
defineProps({
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  error: String,
  disabled: Boolean,
})
const model = defineModel({ type: String, default: '' })
</script>

<template>
  <label class="field">
    <span v-if="label" class="field__label">{{ label }}</span>
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="['field__control', { 'is-error': error }]"
    />
    <span v-if="error" class="field__error">{{ error }}</span>
  </label>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: var(--space-1); }
.field__label { font-size: var(--text-sm); color: var(--color-text-muted); }
.field__control {
  padding: 10px var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: border-color 0.15s;
}
.field__control::placeholder { color: var(--color-text-muted); }
.field__control:hover:not(:disabled) { border-color: var(--color-text-muted); }
.field__control:focus-visible { border-color: var(--color-nav-active); outline: none; box-shadow: 0 0 0 2px var(--color-nav-active); }
.field__control:disabled { opacity: 0.5; cursor: not-allowed; }
.field__control.is-error { border-color: var(--color-danger); }
.field__error { font-size: var(--text-sm); color: var(--color-danger); }
</style>