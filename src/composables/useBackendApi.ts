import { ref } from 'vue'
import axios from 'axios'
import type { User, LoginRequest, LoginResponse, Message, Conversation, Document, Function } from '@/types/api'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Log the base URL for debugging
console.log('🔗 Backend API URL:', api.defaults.baseURL)

// Add request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = 'secret-token'
    config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Simple authentication method to get token
function getAuthToken() {
  return 'secret-token'
}

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log connection errors once to avoid spam
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('Backend connection failed - server may still be starting up')
    } else if (error.response?.status !== 401) {
      console.error('API Error:', error.response?.data || error.message)
    }
    return Promise.reject(error)
  }
)

export function useBackendApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Initialize authentication
  const initAuth = async () => {
    // No need for complex auth initialization
    return true
  }

  // Auth endpoints
  const auth = {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
      loading.value = true
      error.value = null
      try {
        const response = await api.post('/auth/login', credentials)
        const token = response.data.access_token
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_user', JSON.stringify(response.data.user))
        return response.data
      } catch (err: any) {
        error.value = err.response?.data?.detail || 'Login failed'
        throw err
      } finally {
        loading.value = false
      }
    },

    async logout(): Promise<boolean> {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      return true
    },

    async getCurrentUser(): Promise<User> {
      try {
        const response = await api.get('/auth/me')
        return response.data
      } catch (err: any) {
        error.value = err.response?.data?.detail || 'Failed to get user info'
        throw err
      }
    },

    async verifyToken(): Promise<{ valid: boolean; user?: User }> {
      try {
        const response = await api.get('/auth/verify')
        return response.data
      } catch (err: any) {
        error.value = err.response?.data?.detail || 'Token verification failed'
        throw err
      }
    }
  }

  // Chat endpoints
  const chat = {
    async sendMessage(message: string, conversationId: string | null = null, mode = 'agent'): Promise<any> {
      loading.value = true
      error.value = null
      try {
        // Create chat first if no conversation ID
        let chatId = conversationId
        if (!chatId) {
          const chatResponse = await api.post('/chats')
          chatId = chatResponse.data.id
        }
        
        // Send user message
        const response = await api.post(`/chats/${chatId}/messages/user`, {
          message,
          mode: mode.toLowerCase()
        })
        
        return {
          conversation: { id: chatId },
          message: response.data,
          messages: [response.data]
        }
      } catch (err: any) {
        error.value = err.response?.data?.detail || 'Failed to send message'
        throw err
      } finally {
        loading.value = false
      }
    },

    async getConversations(): Promise<Conversation[]> {
      try {
        // Backend uses /chats to list conversations
        const response = await api.get('/chats')
        return response.data || []
      } catch (err: any) {
        // Don't throw error on 404, just return empty array
        if (err.response?.status === 404) {
          return []
        }
        error.value = err.response?.data?.detail || 'Failed to get conversations'
        throw err
      }
    },

    async getConversation(conversationId: string): Promise<Conversation> {
      try {
        const response = await api.get(`/chats/${conversationId}`)
        return {
          id: response.data.id,
          title: `Chat ${conversationId.slice(0, 8)}`,
          messages: response.data.messages || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      } catch (err: any) {
        error.value = err.response?.data?.detail || 'Failed to get conversation'
        throw err
      }
    },

    async deleteConversation(conversationId: string): Promise<boolean> {
      try {
        await api.delete(`/chats/${conversationId}`)
        return true
      } catch (err: any) {
        error.value = err.response?.data?.detail || 'Failed to delete conversation'
        throw err
      }
    },

    async createConversation(title = 'New Conversation'): Promise<Conversation> {
      try {
        const response = await api.post('/chats')
        return {
          id: response.data.id,
          title,
          messages: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      } catch (err: any) {
        error.value = err.response?.data?.detail || 'Failed to create conversation'
        throw err
      }
    }
  }

  // Document endpoints
  const documents = {
    async uploadDocument(file: File, onProgress?: (progress: number) => void): Promise<Document> {
      loading.value = true
      error.value = null
      try {
        const formData = new FormData()
        formData.append('file', file)

        const config: any = {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }

        if (onProgress) {
          config.onUploadProgress = (progressEvent: any) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        }

        const response = await api.post('/documents/upload', formData, config)
        return response.data
      } catch (err: any) {
        error.value = err.response?.data?.detail || 'Failed to upload document'
        throw err
      } finally {
        loading.value = false
      }
    },

    async getDocuments(): Promise<Document[]> {
      try {
        // Backend may not have a direct documents list endpoint
        // Return empty array for now to avoid 403/404 errors
        return []
      } catch (err: any) {
        // Don't throw error, just return empty array
        console.warn('Documents endpoint not available:', err.message)
        return []
      }
    },

    async getDocument(documentId: string): Promise<Document> {
      try {
        const response = await api.get(`/documents/${documentId}`)
        return response.data
      } catch (err: any) {
        error.value = err.response?.data?.detail || 'Failed to get document'
        throw err
      }
    },

    async deleteDocument(documentId: string): Promise<boolean> {
      try {
        await api.delete(`/documents/${documentId}`)
        return true
      } catch (err: any) {
        error.value = err.response?.data?.detail || 'Failed to delete document'
        throw err
      }
    },

    async searchDocuments(query: string): Promise<any[]> {
      try {
        const response = await api.post('/documents/search', { query })
        return response.data
      } catch (err: any) {
        error.value = err.response?.data?.detail || 'Failed to search documents'
        throw err
      }
    }
  }

  // Function calling endpoints
  const functions = {
    async getAvailableFunctions(): Promise<Function[]> {
      try {
        // Backend may not have a direct functions list endpoint
        // Return empty array for now to avoid 404 errors  
        return []
      } catch (err: any) {
        // Don't throw error, just return empty array
        console.warn('Functions endpoint not available:', err.message)
        return []
      }
    },

    async executeFunction(functionName: string, parameters: any): Promise<any> {
      loading.value = true
      error.value = null
      try {
        // Try Aetos functions first
        const response = await api.post('/aetos/execute', {
          function_name: functionName,
          arguments: parameters
        })
        return response.data
      } catch (err: any) {
        // Fallback to regular function execution if available
        try {
          const response = await api.post('/functions/execute', {
            function_name: functionName,
            parameters
          })
          return response.data
        } catch (fallbackErr: any) {
          error.value = err.response?.data?.detail || 'Failed to execute function'
          throw err
        }
      } finally {
        loading.value = false
      }
    }
  }

  // Health check
  const health = {
    async check(): Promise<any> {
      try {
        const response = await api.get('/health')
        return response.data
      } catch (err: any) {
        error.value = err.response?.data?.detail || 'Health check failed'
        throw err
      }
    }
  }

  return {
    loading,
    error,
    initAuth,
    auth,
    chat,
    documents,
    functions,
    health,
    api // Expose the axios instance for custom requests
  }
}

// Export types for use in other files
export type { User, LoginRequest, LoginResponse, Message, Conversation, Document, Function }
