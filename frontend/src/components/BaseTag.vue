<script setup>
defineProps({ label: String })
</script>

<template>
  <span class="tag"><slot>{{ label }}</slot></span>
</template>

<style scoped>
.tag {
  display: inline-block;
  padding: 2px var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: var(--text-sm);
}
</style>