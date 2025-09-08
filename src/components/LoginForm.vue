<template>
  <div class="min-h-screen bg-surface-950 flex items-center justify-center">
    <div class="max-w-md w-full bg-surface-900 rounded-lg shadow-xl p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="text-6xl mb-4">🤖</div>
        <h1 class="text-3xl font-bold text-primary-400 mb-2">3D LLM Assistant</h1>
        <p class="text-surface-400">Sign in to access your AI assistant</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- Username/Email -->
        <div>
          <label for="username" class="block text-sm font-medium text-surface-300 mb-2">
            Username or Email
          </label>
          <input
            id="username"
            v-model="credentials.username"
            type="text"
            required
            :disabled="authStore.isLoading"
            class="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 placeholder-surface-400 focus:outline-none focus:border-primary-500 disabled:opacity-50"
            placeholder="Enter your username or email"
          />
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-surface-300 mb-2">
            Password
          </label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            required
            :disabled="authStore.isLoading"
            class="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 placeholder-surface-400 focus:outline-none focus:border-primary-500 disabled:opacity-50"
            placeholder="Enter your password"
          />
        </div>

        <!-- Remember Me -->
        <div class="flex items-center">
          <input
            id="remember-me"
            v-model="credentials.remember_me"
            type="checkbox"
            :disabled="authStore.isLoading"
            class="h-4 w-4 text-primary-600 bg-surface-800 border-surface-600 rounded focus:ring-primary-500"
          />
          <label for="remember-me" class="ml-2 text-sm text-surface-300">
            Remember me for 30 days
          </label>
        </div>

        <!-- Error Message -->
        <div v-if="authStore.error" class="bg-error-600/20 border border-error-600/30 rounded-lg p-3">
          <div class="flex items-center space-x-2 text-error-400">
            <span>❌</span>
            <span class="text-sm">{{ authStore.error }}</span>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="!isFormValid || authStore.isLoading"
          class="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-surface-700 disabled:text-surface-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <span v-if="authStore.isLoading" class="animate-spin">⏳</span>
          <span>{{ authStore.isLoading ? 'Signing in...' : 'Sign In' }}</span>
        </button>
      </form>

      <!-- Demo Credentials -->
      <div class="mt-8 p-4 bg-surface-800 rounded-lg border border-surface-700">
        <h3 class="text-sm font-medium text-surface-300 mb-2">Demo Credentials</h3>
        <div class="text-xs text-surface-400 space-y-1">
          <div>Username: <code class="text-primary-400">demo</code></div>
          <div>Password: <code class="text-primary-400">password</code></div>
        </div>
        <button
          @click="setDemoCredentials"
          :disabled="authStore.isLoading"
          class="mt-2 text-xs text-primary-400 hover:text-primary-300 disabled:opacity-50"
        >
          Use demo credentials
        </button>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center text-xs text-surface-500">
        <p>3D LLM Assistant v1.0</p>
        <p class="mt-1">Powered by AI and advanced document processing</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

// Store
const authStore = useAuthStore()

// Form state
const credentials = ref({
  username: '',
  password: '',
  remember_me: false
})

// Computed
const isFormValid = computed(() => {
  return credentials.value.username.trim() && credentials.value.password.trim()
})

// Methods
const handleLogin = async () => {
  if (!isFormValid.value) return
  
  try {
    await authStore.login(credentials.value)
    console.log('Login successful!')
    // Navigation will be handled by the parent component
  } catch (error) {
    console.error('Login failed:', error)
    // Error display is handled by the auth store
  }
}

const setDemoCredentials = () => {
  credentials.value.username = 'demo'
  credentials.value.password = 'password'
  credentials.value.remember_me = false
}

// Initialize
onMounted(() => {
  // Check if already authenticated
  authStore.checkAuth()
})
</script>
