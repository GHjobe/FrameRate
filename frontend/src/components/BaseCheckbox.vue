<script setup>
defineProps({ label: String, disabled: Boolean, error: String })
const model = defineModel({ type: Boolean, default: false })
</script>

<template>
  <div>
    <label :class="['check', { 'is-disabled': disabled, 'is-error': error }]">
      <input v-model="model" type="checkbox" :disabled="disabled" />
      <span class="check__box" />
      <span class="check__label"><slot>{{ label }}</slot></span>
    </label>
    <span v-if="error" class="check__error">{{ error }}</span>
  </div>
</template>

<style scoped>
.check { display: inline-flex; align-items: center; gap: var(--space-2); cursor: pointer; }
.check input { position: absolute; opacity: 0; width: 0; height: 0; }
.check__box {
  width: 18px; height: 18px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  display: inline-flex; align-items: center; justify-content: center;
  transition: background 0.15s, border-color 0.15s;
}
.check:hover .check__box { border-color: var(--color-text-muted); }
.check input:checked + .check__box { background: var(--color-primary); border-color: var(--color-primary); }
.check input:checked + .check__box::after { content: '✓'; color: #1a1205; font-size: 13px; font-weight: 700; }
.check input:focus-visible + .check__box { outline: 2px solid var(--color-nav-active); outline-offset: 2px; }
.check.is-error .check__box { border-color: var(--color-danger); }
.check.is-disabled { opacity: 0.5; cursor: not-allowed; }
.check__error { display: block; margin-top: var(--space-1); font-size: var(--text-sm); color: var(--color-danger); }
</style>