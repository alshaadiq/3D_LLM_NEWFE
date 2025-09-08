import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

// Types for API responses
export interface User {
  id: string
  username: string
  email?: string
  role: string
  created_at: string
  last_login?: string
}

export interface Message {
  id: string
  message: string
  role: 'user' | 'assistant'
  date: string
  mode?: string
  json_mode?: boolean
}

export interface Chat {
  id: string
  messages: Message[]
  summarization?: string
}

export interface Document {
  id: string
  filename: string
  content_type: string
  file_size: number
  upload_date: string
  status: 'processing' | 'completed' | 'failed'
  file_path?: string
  metadata?: Record<string, any>
}

export interface LoginRequest {
  username: string
  password: string
  remember_me?: boolean
}

export interface LoginResponse {
  token: string
  user: User
  expires_in: number
}

export interface CreateMessageRequest {
  message: string
  mode?: 'chat' | 'agent'
}

export interface SearchRequest {
  query: string
  limit?: number
  score_threshold?: number
}

export interface DocumentProcessingResult {
  document_id?: string
  status: string
  chunks_created?: number
  content_length?: number
  error?: string
}

// Backend API composable
export const useBackendApi = () => {
  // Configuration
  const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'
  const fallbackToken = import.meta.env.VITE_BACKEND_TOKEN || 'secret-token'
  
  // Create axios instance
  const api: AxiosInstance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // Request interceptor to add auth token
  api.interceptors.request.use((config) => {
    // Get token from localStorage or use fallback
    const token = localStorage.getItem('auth_token') || fallbackToken
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  })

  // Response interceptor for error handling
  api.interceptors.response.use(
    (response) => {
      console.log(`[API] Response:`, response.data)
      return response
    },
    (error) => {
      console.error('[API] Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      })

      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        // Could redirect to login page here
      }

      throw error
    }
  )

  // Authentication methods
  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials)
    const loginData = response.data as LoginResponse
    
    // Store token and user data
    localStorage.setItem('auth_token', loginData.token)
    localStorage.setItem('auth_user', JSON.stringify(loginData.user))
    
    return loginData
  }

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
  }

  const verifyToken = async (): Promise<{ valid: boolean; user?: User }> => {
    const response = await api.get('/auth/verify')
    return response.data
  }

  const getCurrentUser = async (): Promise<User> => {
    const response = await api.get('/auth/me')
    return response.data
  }

  // Chat methods
  const createChat = async (): Promise<Chat> => {
    const response = await api.post('/chats')
    return response.data
  }

  const getChat = async (chatId: string): Promise<Chat> => {
    const response = await api.get(`/chats/${chatId}`)
    return response.data
  }

  const deleteChat = async (chatId: string): Promise<{ deleted: boolean; chat_id: string }> => {
    const response = await api.delete(`/chats/${chatId}`)
    return response.data
  }

  const sendUserMessage = async (
    chatId: string, 
    message: string, 
    mode: 'chat' | 'agent' = 'chat'
  ): Promise<Message> => {
    const response = await api.post(`/chats/${chatId}/messages/user`, {
      message,
      mode
    })
    return response.data
  }

  const sendAssistantMessage = async (chatId: string, message: string): Promise<Message> => {
    const response = await api.post(`/chats/${chatId}/messages/assistant`, {
      message
    })
    return response.data
  }

  const summarizeChat = async (chatId: string): Promise<{ chat_id: string; summarization: string }> => {
    const response = await api.post(`/chats/${chatId}/summarize`)
    return response.data
  }

  // Document methods
  const uploadDocument = async (file: File): Promise<DocumentProcessingResult> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  const listDocuments = async (): Promise<Document[]> => {
    const response = await api.get('/documents')
    return response.data
  }

  const getDocument = async (documentId: string): Promise<Document> => {
    const response = await api.get(`/documents/${documentId}`)
    return response.data
  }

  const deleteDocument = async (documentId: string): Promise<{ deleted: boolean; document_id: string; status: string }> => {
    const response = await api.delete(`/documents/${documentId}`)
    return response.data
  }

  const getDocumentChunks = async (documentId: string): Promise<any[]> => {
    const response = await api.get(`/documents/${documentId}/chunks`)
    return response.data
  }

  const searchDocuments = async (searchRequest: SearchRequest): Promise<any> => {
    const response = await api.post('/documents/search', searchRequest)
    return response.data
  }

  const getDocumentStats = async (): Promise<any> => {
    const response = await api.get('/documents/stats')
    return response.data
  }

  // Function calling methods
  const getAetosFunctions = async (): Promise<any> => {
    const response = await api.get('/aetos/functions')
    return response.data
  }

  const executeAetosFunction = async (functionName: string, args: Record<string, any>): Promise<any> => {
    const response = await api.post('/aetos/execute', {
      function_name: functionName,
      arguments: args
    })
    return response.data
  }

  const discoverFunctions = async (query: string, maxFunctions = 3, scoreThreshold = 0.3): Promise<any> => {
    const response = await api.get('/functions/discover', {
      params: {
        query,
        max_functions: maxFunctions,
        score_threshold: scoreThreshold
      }
    })
    return response.data
  }

  const agentExecute = async (
    query: string, 
    executionMode = 'auto', 
    includeContext = true
  ): Promise<any> => {
    const response = await api.post('/agent/execute', null, {
      params: {
        query,
        execution_mode: executionMode,
        include_context: includeContext
      }
    })
    return response.data
  }

  // Internal knowledge methods
  const searchInternalKnowledge = async (query: string, k = 5, categories?: string[]): Promise<any> => {
    const response = await api.post('/internal-knowledge/search', {
      query,
      k,
      categories
    })
    return response.data
  }

  const getInternalKnowledgeStats = async (): Promise<any> => {
    const response = await api.get('/internal-knowledge/stats')
    return response.data
  }

  const listInternalKnowledge = async (category?: string): Promise<any> => {
    const response = await api.get('/internal-knowledge', {
      params: category ? { category } : {}
    })
    return response.data
  }

  // Context search
  const searchContext = async (
    query: string,
    includeDocuments = true,
    includeInternal = true,
    includeFunctions = true,
    maxChunks = 5
  ): Promise<any> => {
    const response = await api.get('/context/search', {
      params: {
        query,
        include_documents: includeDocuments,
        include_internal: includeInternal,
        include_functions: includeFunctions,
        max_chunks: maxChunks
      }
    })
    return response.data
  }

  return {
    // Auth
    login,
    logout,
    verifyToken,
    getCurrentUser,
    
    // Chat
    createChat,
    getChat,
    deleteChat,
    sendUserMessage,
    sendAssistantMessage,
    summarizeChat,
    
    // Documents
    uploadDocument,
    listDocuments,
    getDocument,
    deleteDocument,
    getDocumentChunks,
    searchDocuments,
    getDocumentStats,
    
    // Functions
    getAetosFunctions,
    executeAetosFunction,
    discoverFunctions,
    agentExecute,
    
    // Knowledge
    searchInternalKnowledge,
    getInternalKnowledgeStats,
    listInternalKnowledge,
    searchContext,
    
    // Axios instance for custom calls
    api
  }
}
