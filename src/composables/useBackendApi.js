import { ref } from 'vue'
import axios from 'axios'

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

// Add request interceptor for auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Use fixed token for now
    const token = 'secret-token'
    
    // Don't override headers if they're already set for FormData
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // For FormData uploads, don't set Content-Type - let browser handle it
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Simple authentication method to get token
async function getAuthToken() {
  // Just return the fixed token for now
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
  const error = ref(null)

  // Initialize authentication
  const initAuth = async () => {
    try {
      await getAuthToken()
    } catch (error) {
      console.warn('Initial authentication failed:', error.message)
    }
  }

  // Auth endpoints
  const auth = {
    async login(username, password) {
      loading.value = true
      error.value = null
      try {
        const response = await api.post('/auth/login', { username, password })
        const token = response.data.access_token
        localStorage.setItem('auth_token', token)
        return response.data
      } catch (err) {
        error.value = err.response?.data?.detail || 'Login failed'
        throw err
      } finally {
        loading.value = false
      }
    },

    async logout() {
      localStorage.removeItem('auth_token')
      return true
    },

    async getCurrentUser() {
      try {
        const response = await api.get('/auth/me')
        return response.data
      } catch (err) {
        error.value = err.response?.data?.detail || 'Failed to get user info'
        throw err
      }
    }
  }

  // Chat endpoints
  const chat = {
    async sendMessage(message, conversationId = null, mode = 'agent') {
      loading.value = true
      error.value = null
      try {
        // Create chat first if no conversation ID
        let chatId = conversationId
        if (!chatId) {
          const chatResponse = await api.post('/chats')
          chatId = chatResponse.data.id
        }
        
        // Send user message - backend returns full conversation with AI response
        const response = await api.post(`/chats/${chatId}/messages/user`, {
          message,
          mode: mode.toLowerCase()
        })
        
        // Process the conversation response
        const conversation = response.data
        const messages = conversation.messages || []
        
        // Backend returns the complete conversation object with all messages
        return {
          conversation: {
            ...conversation,
            title: conversation.title || "New Chat", // Trust backend title
            message_count: messages.length,
            updated_at: conversation.updated_at || new Date().toISOString()
          },
          messages: messages
        }
      } catch (err) {
        error.value = err.response?.data?.detail || 'Failed to send message'
        throw err
      } finally {
        loading.value = false
      }
    },

    async getConversations() {
      try {
        // Backend uses /chats to list conversations
        const response = await api.get('/chats')
        const conversations = response.data || []
        
        console.log('Raw conversations from backend:', conversations)
        
        // Trust the backend completely - it now handles title and message_count correctly
        const processedConversations = conversations.map(conversation => {
          console.log(`Processing conversation ${conversation.id}:`, {
            backendTitle: conversation.title,
            backendMessageCount: conversation.message_count,
            messagesLength: conversation.messages?.length
          })
          
          return {
            ...conversation,
            // Only use "New Chat" if there's absolutely no title and no messages
            title: conversation.title || (conversation.messages?.length > 0 ? null : "New Chat"),
            // Use backend-provided message count or calculate from messages
            message_count: conversation.message_count || conversation.messages?.length || 0
          }
        })
        
        console.log('Processed conversations:', processedConversations)
        return processedConversations
      } catch (err) {
        // Don't throw error on 404, just return empty array
        if (err.response?.status === 404) {
          return []
        }
        error.value = err.response?.data?.detail || 'Failed to get conversations'
        throw err
      }
    },

    async getConversation(conversationId) {
      try {
        const response = await api.get(`/chats/${conversationId}`)
        const conversation = response.data
        const messages = conversation.messages || []
        
        return {
          id: conversation.id,
          title: conversation.title || "New Chat", // Trust backend title
          messages,
          message_count: messages.length,
          created_at: conversation.created_at || new Date().toISOString(),
          updated_at: conversation.updated_at || conversation.created_at || new Date().toISOString()
        }
      } catch (err) {
        error.value = err.response?.data?.detail || 'Failed to get conversation'
        throw err
      }
    },

    async deleteConversation(conversationId) {
      try {
        await api.delete(`/chats/${conversationId}`)
        return true
      } catch (err) {
        error.value = err.response?.data?.detail || 'Failed to delete conversation'
        throw err
      }
    },

    async createConversation(title = null) {
      try {
        const response = await api.post('/chats')
        const fallbackTitle = title || `Chat ${new Date().toLocaleDateString()}`
        
        return {
          id: response.data.id,
          title: fallbackTitle,
          messages: [],
          message_count: 0,
          created_at: response.data.created_at || new Date().toISOString(),
          updated_at: response.data.updated_at || response.data.created_at || new Date().toISOString()
        }
      } catch (err) {
        error.value = err.response?.data?.detail || 'Failed to create conversation'
        throw err
      }
    }
  }

  // Document endpoints
  const documents = {
    async uploadDocument(file, onProgress = null) {
      try {
        console.log('Starting upload for:', file.name)
        console.log('File details:', {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        })
        
        // Create FormData exactly like the working 3D_LLM_FE implementation
        const formData = new FormData()
        formData.append('file', file)
        
        // Debug: log what's in FormData
        console.log('FormData entries:')
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value)
          if (value instanceof File) {
            console.log(`  File name: ${value.name}`)
            console.log(`  File size: ${value.size}`)
            console.log(`  File type: ${value.type}`)
          }
        }
        
        // Simple config like the working version - don't override Content-Type
        const config = {
          timeout: 60000,
          // Explicitly ensure headers don't interfere with FormData
          headers: {}
        }
        
        // Add progress tracking if provided
        if (onProgress) {
          config.onUploadProgress = (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        }
        
        console.log('Upload config:', config)
        console.log('Uploading to:', `${api.defaults.baseURL}/documents/upload`)
        
        // Use the axios instance directly like other endpoints
        const response = await api.post('/documents/upload', formData, config)
        
        console.log('Upload response:', response.data)
        return response.data
        
      } catch (error) {
        console.error('Upload error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config
        })
        
        // Handle specific error cases like the working implementation
        if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please check your credentials.')
        } else if (error.response?.status === 413) {
          throw new Error('File too large. Please choose a smaller file.')
        } else if (error.response?.status === 422) {
          // Handle validation errors properly
          let detail = 'Invalid file format or validation error'
          if (error.response?.data?.detail) {
            if (Array.isArray(error.response.data.detail)) {
              // Extract validation error messages
              detail = error.response.data.detail.map(err => {
                if (typeof err === 'string') return err
                if (err.msg) return err.msg
                if (err.message) return err.message
                return JSON.stringify(err)
              }).join(', ')
            } else if (typeof error.response.data.detail === 'string') {
              detail = error.response.data.detail
            } else {
              detail = JSON.stringify(error.response.data.detail)
            }
          }
          console.error('422 Validation error details:', error.response.data)
          console.error('Extracted detail:', detail)
          throw new Error(detail)
        } else if (error.response?.status >= 500) {
          throw new Error('Server error. Please try again later.')
        } else if (error.code === 'ERR_NETWORK') {
          throw new Error('Network error. Please check your connection and try again.')
        }
        
        // Re-throw the original error if no specific handling
        throw error
      }
    },

    async getDocuments() {
      try {
        const response = await api.get('/documents')
        return response.data
      } catch (err) {
        // Don't throw error for connection issues, just return empty array
        if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || 
            err.response?.status === 403 || err.response?.status === 404) {
          console.warn('Documents endpoint not available, starting with empty state')
          return []
        }
        error.value = err.response?.data?.detail || 'Failed to get documents'
        throw err
      }
    },

    async getDocument(documentId) {
      try {
        const response = await api.get(`/documents/${documentId}`)
        return response.data
      } catch (err) {
        error.value = err.response?.data?.detail || 'Failed to get document'
        throw err
      }
    },

    async deleteDocument(documentId) {
      try {
        await api.delete(`/documents/${documentId}`)
        return true
      } catch (err) {
        error.value = err.response?.data?.detail || 'Failed to delete document'
        throw err
      }
    },

    async searchDocuments(query) {
      try {
        const response = await api.post('/documents/search', { query })
        return response.data
      } catch (err) {
        error.value = err.response?.data?.detail || 'Failed to search documents'
        throw err
      }
    },

    async getDocumentChunks(documentId) {
      try {
        const response = await api.get(`/documents/${documentId}/chunks`)
        return response.data
      } catch (err) {
        error.value = err.response?.data?.detail || 'Failed to get document chunks'
        throw err
      }
    }
  }

  // Function calling endpoints
  const functions = {
    async getAvailableFunctions() {
      try {
        // Backend may not have a direct functions list endpoint
        // Return empty array for now to avoid 404 errors  
        return []
      } catch (err) {
        // Don't throw error, just return empty array
        console.warn('Functions endpoint not available:', err.message)
        return []
      }
    },

    async executeFunction(functionName, parameters) {
      loading.value = true
      error.value = null
      try {
        // Try Aetos functions first
        const response = await api.post('/aetos/execute', {
          function_name: functionName,
          arguments: parameters
        })
        return response.data
      } catch (err) {
        // Fallback to regular function execution if available
        try {
          const response = await api.post('/functions/execute', {
            function_name: functionName,
            parameters
          })
          return response.data
        } catch (fallbackErr) {
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
    async check() {
      try {
        const response = await api.get('/health')
        return response.data
      } catch (err) {
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
