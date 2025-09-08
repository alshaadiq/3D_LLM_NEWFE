import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { useBackendApi, type User, type LoginRequest } from '@/composables/useBackendApi'

export const useAuthStore = defineStore('auth', () => {
  const api = useBackendApi()
  
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || 'guest')
  const userName = computed(() => user.value?.username || '')

  // Initialize auth state from localStorage
  const initAuth = () => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    
    if (storedToken && storedUser) {
      token.value = storedToken
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        console.error('Failed to parse stored user data:', e)
        clearAuth()
      }
    }
  }

  // Clear auth state
  const clearAuth = () => {
    user.value = null
    token.value = null
    error.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  // Login
  const login = async (credentials: LoginRequest) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.login(credentials)
      
      // Update state
      user.value = response.user
      token.value = response.token
      
      console.log('Login successful:', response.user.username)
      return response
      
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Login failed'
      console.error('Login error:', error.value)
      clearAuth()
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Logout
  const logout = async () => {
    isLoading.value = true
    
    try {
      await api.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      clearAuth()
      isLoading.value = false
    }
  }

  // Verify token validity
  const verifyToken = async () => {
    if (!token.value) return false
    
    try {
      const response = await api.verifyToken()
      
      if (response.valid && response.user) {
        user.value = response.user
        return true
      } else {
        clearAuth()
        return false
      }
    } catch (err) {
      console.error('Token verification failed:', err)
      clearAuth()
      return false
    }
  }

  // Refresh user data
  const refreshUser = async () => {
    if (!token.value) return
    
    try {
      const userData = await api.getCurrentUser()
      user.value = userData
      localStorage.setItem('auth_user', JSON.stringify(userData))
    } catch (err) {
      console.error('Failed to refresh user data:', err)
      // Don't clear auth here as it might be a temporary error
    }
  }

  // Auto-login check
  const checkAuth = async () => {
    initAuth()
    
    if (token.value) {
      const isValid = await verifyToken()
      if (isValid) {
        await refreshUser()
      }
    }
  }

  return {
    // State
    user: readonly(user),
    token: readonly(token),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Getters
    isAuthenticated,
    userRole,
    userName,
    
    // Actions
    login,
    logout,
    verifyToken,
    refreshUser,
    checkAuth,
    clearAuth,
    initAuth
  }
})
