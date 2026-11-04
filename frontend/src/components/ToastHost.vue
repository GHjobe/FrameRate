<script setup>
import { useToastStore } from '@/stores/toast'
import BaseToast from './BaseToast.vue'

const toast = useToastStore()
</script>

<template>
  <div class="toast-host">
    <BaseToast v-for="t in toast.items" :key="t.id" :message="t.message" :type="t.type" @close="toast.dismiss(t.id)" />
  </div>
</template>

<style scoped>
.toast-host {
  position: fixed; right: var(--space-6); bottom: var(--space-6);
  display: flex; flex-direction: column; gap: var(--space-2);
  z-index: 1000;
}
</style>