// Type definitions for the backend API
export interface User {
  id: string
  username: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
  conversation_id?: string
  mode?: string
  attachments?: any[]
  function_calls?: any[]
  error?: boolean
}

export interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  messages: Message[]
  mode?: string
  user_id?: string
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
  pages?: { id: string; src: string }[]
}

export interface Function {
  function_name: string
  function_id: string
  app: string
  category: string
  description: string
  parameters: any[]
  use_cases: string[]
}

export interface UploadProgress {
  name: string
  size: string
  progress: number
  status: 'pending' | 'success' | 'failed'
  error?: string
}
