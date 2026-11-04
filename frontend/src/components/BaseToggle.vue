<script setup>
defineProps({ label: String, disabled: Boolean })
const model = defineModel({ type: Boolean, default: false })
</script>

<template>
  <div class="toggle-row">
    <button
      type="button"
      role="switch"
      :aria-checked="model"
      :disabled="disabled"
      :class="['toggle', { 'is-on': model }]"
      @click="model = !model"
    >
      <span class="toggle__thumb" />
    </button>
    <span v-if="label" class="toggle__label">{{ label }}</span>
  </div>
</template>

<style scoped>
.toggle-row { display: inline-flex; align-items: center; gap: var(--space-3); }
.toggle {
  width: 44px; height: 24px;
  border-radius: var(--radius-pill);
  background: var(--color-border);
  position: relative;
  transition: background 0.15s;
}
.toggle:hover:not(:disabled) { background: var(--color-text-muted); }
.toggle.is-on { background: var(--color-primary); }
.toggle__thumb {
  position: absolute; top: 3px; left: 3px;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.15s;
}
.toggle.is-on .toggle__thumb { transform: translateX(20px); }
.toggle:disabled { opacity: 0.5; }
</style>