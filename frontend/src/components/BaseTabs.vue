<script setup>
defineProps({ tabs: { type: Array, required: true } })
const model = defineModel({ type: String })
</script>

<template>
  <div class="tabs" role="tablist">
    <button
      v-for="t in tabs"
      :key="t.key"
      type="button"
      role="tab"
      :aria-selected="model === t.key"
      :class="['tab', { 'is-active': model === t.key }]"
      @click="model = t.key"
    >
      {{ t.label }}<span v-if="t.count !== undefined" class="tab__count"> ({{ t.count }})</span>
    </button>
  </div>
</template>

<style scoped>
.tabs { display: flex; gap: var(--space-6); border-bottom: 1px solid var(--color-border); }
.tab {
  padding: var(--space-3) 0;
  color: var(--color-text-muted);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.15s;
}
.tab:hover { color: var(--color-text); }
.tab.is-active { color: var(--color-text); border-bottom-color: var(--color-primary); font-weight: 600; }
</style>