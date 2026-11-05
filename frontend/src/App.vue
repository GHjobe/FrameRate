<script setup>
import NavBar from '@/components/NavBar.vue'
import AppFooter from '@/components/AppFooter.vue'
import ToastHost from '@/components/ToastHost.vue'
</script>

<template>
  <div class="app">
    <NavBar />
    <div class="app__main">
      <RouterView />
    </div>
    <AppFooter />
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