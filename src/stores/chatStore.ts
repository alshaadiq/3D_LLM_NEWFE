import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { useBackendApi, type Chat, type Message } from '@/composables/useBackendApi'

export const useChatStore = defineStore('chat', () => {
  const api = useBackendApi()
  
  // State
  const currentChat = ref<Chat | null>(null)
  const chatHistory = ref<Chat[]>([])
  const isLoading = ref(false)
  const isLoadingMessage = ref(false)
  const error = ref<string | null>(null)
  const messageMode = ref<'chat' | 'agent'>('chat')

  // Getters
  const hasChatSelected = computed(() => !!currentChat.value)
  const messageCount = computed(() => currentChat.value?.messages.length || 0)
  const lastMessage = computed(() => {
    const messages = currentChat.value?.messages || []
    return messages[messages.length - 1] || null
  })
  const isAgentMode = computed(() => messageMode.value === 'agent')

  // Create new chat
  const createNewChat = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const newChat = await api.createChat()
      currentChat.value = newChat
      
      // Add to history if not already there
      const existingIndex = chatHistory.value.findIndex(chat => chat.id === newChat.id)
      if (existingIndex === -1) {
        chatHistory.value.unshift(newChat)
      }
      
      console.log('New chat created:', newChat.id)
      return newChat
      
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to create chat'
      console.error('Create chat error:', error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Load chat by ID
  const loadChat = async (chatId: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const chat = await api.getChat(chatId)
      currentChat.value = chat
      
      // Update chat in history
      const existingIndex = chatHistory.value.findIndex(c => c.id === chatId)
      if (existingIndex >= 0) {
        chatHistory.value[existingIndex] = chat
      }
      
      console.log('Chat loaded:', chatId, 'with', chat.messages.length, 'messages')
      return chat
      
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to load chat'
      console.error('Load chat error:', error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Delete chat
  const deleteChat = async (chatId: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      await api.deleteChat(chatId)
      
      // Remove from history
      chatHistory.value = chatHistory.value.filter(chat => chat.id !== chatId)
      
      // Clear current chat if it was deleted
      if (currentChat.value?.id === chatId) {
        currentChat.value = null
      }
      
      console.log('Chat deleted:', chatId)
      
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to delete chat'
      console.error('Delete chat error:', error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Send user message
  const sendMessage = async (message: string, mode: 'chat' | 'agent' = messageMode.value) => {
    if (!currentChat.value) {
      throw new Error('No chat selected')
    }
    
    isLoadingMessage.value = true
    error.value = null
    
    try {
      // Send user message
      const userMessage = await api.sendUserMessage(currentChat.value.id, message, mode)
      
      // Reload the chat to get the assistant response
      const updatedChat = await api.getChat(currentChat.value.id)
      currentChat.value = updatedChat
      
      // Update chat in history
      const existingIndex = chatHistory.value.findIndex(c => c.id === currentChat.value!.id)
      if (existingIndex >= 0) {
        chatHistory.value[existingIndex] = updatedChat
      }
      
      console.log('Message sent and response received')
      return updatedChat
      
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to send message'
      console.error('Send message error:', error.value)
      throw err
    } finally {
      isLoadingMessage.value = false
    }
  }

  // Summarize current chat
  const summarizeCurrentChat = async () => {
    if (!currentChat.value) {
      throw new Error('No chat selected')
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const result = await api.summarizeChat(currentChat.value.id)
      
      // Update current chat with summarization
      if (currentChat.value) {
        currentChat.value.summarization = result.summarization
      }
      
      console.log('Chat summarized')
      return result
      
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to summarize chat'
      console.error('Summarize chat error:', error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Set message mode
  const setMessageMode = (mode: 'chat' | 'agent') => {
    messageMode.value = mode
    console.log('Message mode set to:', mode)
  }

  // Clear current chat
  const clearCurrentChat = () => {
    currentChat.value = null
    error.value = null
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Get chat preview (for sidebar)
  const getChatPreview = (chat: any) => {
    const messages = chat.messages
    if (messages.length === 0) {
      return 'New Chat'
    }
    
    // Get first user message for preview
    const firstUserMessage = messages.find((m: any) => m.role === 'user')
    if (firstUserMessage) {
      return firstUserMessage.message.slice(0, 50) + (firstUserMessage.message.length > 50 ? '...' : '')
    }
    
    return 'Chat'
  }

  // Get message status indicators
  const getMessageModeIndicator = (message: Message) => {
    if (message.mode === 'agent') {
      return '🤖'
    } else if (message.json_mode) {
      return '📊'
    }
    return ''
  }

  return {
    // State
    currentChat: readonly(currentChat),
    chatHistory: readonly(chatHistory),
    isLoading: readonly(isLoading),
    isLoadingMessage: readonly(isLoadingMessage),
    error: readonly(error),
    messageMode: readonly(messageMode),
    
    // Getters
    hasChatSelected,
    messageCount,
    lastMessage,
    isAgentMode,
    
    // Actions
    createNewChat,
    loadChat,
    deleteChat,
    sendMessage,
    summarizeCurrentChat,
    setMessageMode,
    clearCurrentChat,
    clearError,
    
    // Utilities
    getChatPreview,
    getMessageModeIndicator
  }
})
