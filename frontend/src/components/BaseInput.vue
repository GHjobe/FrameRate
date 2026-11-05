<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  error: String,
  disabled: Boolean,
})
const model = defineModel({ type: String, default: '' })

const show = ref(false)
const isPassword = computed(() => props.type === 'password')
const inputType = computed(() => (isPassword.value && show.value ? 'text' : props.type))
</script>

<template>
  <label class="field">
    <span v-if="label" class="field__label">{{ label }}</span>
    <span class="field__wrap">
      <input
        v-model="model"
        :type="inputType"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="['field__control', { 'is-error': error, 'has-toggle': isPassword }]"
      />
      <button
        v-if="isPassword"
        type="button"
        class="field__eye"
        :aria-label="show ? 'Hide password' : 'Show password'"
        :aria-pressed="show"
        @click.prevent="show = !show"
      >
        <svg v-if="!show" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      </button>
    </span>
    <span v-if="error" class="field__error">{{ error }}</span>
  </label>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: var(--space-1); }
.field__label { font-size: var(--text-sm); color: var(--color-text-muted); }
.field__wrap { position: relative; display: flex; }
.field__control {
  width: 100%;
  padding: 10px var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: border-color 0.15s;
}
.field__control.has-toggle { padding-right: 44px; }
.field__control::placeholder { color: var(--color-text-muted); }
.field__control:hover:not(:disabled) { border-color: var(--color-text-muted); }
.field__control:focus-visible { border-color: var(--color-nav-active); outline: none; box-shadow: 0 0 0 2px var(--color-nav-active); }
.field__control:disabled { opacity: 0.5; cursor: not-allowed; }
.field__control.is-error { border-color: var(--color-danger); }
.field__eye {
  position: absolute;
  right: var(--space-2);
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  padding: 6px;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
}
.field__eye:hover { color: var(--color-text); }
.field__eye:focus-visible { outline: 2px solid var(--color-nav-active); }
.field__error { font-size: var(--text-sm); color: var(--color-danger); }
</style>