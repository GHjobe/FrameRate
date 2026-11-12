<script setup>
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import AppFooter from '@/components/AppFooter.vue'
import ToastHost from '@/components/ToastHost.vue'

const route = useRoute()
</script>

<template>
  <div class="app">
    <NavBar v-if="!route.meta.hideChrome" />
    <div class="app__main">
      <RouterView />
    </div>
    <AppFooter v-if="!route.meta.hideChrome" />
    <ToastHost />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app__main {
  flex: 1;
}
</style>