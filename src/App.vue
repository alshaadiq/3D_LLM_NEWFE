<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import LoginForm from '@/components/LoginForm.vue'
import ChatInterface from '@/components/ChatInterface.vue'

// Store
const authStore = useAuthStore()

// Initialize authentication on app load
onMounted(async () => {
  await authStore.checkAuth()
})
</script>

<template>
  <div id="app">
    <!-- Authentication Check -->
    <LoginForm v-if="!authStore.isAuthenticated" />
    <ChatInterface v-else />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
