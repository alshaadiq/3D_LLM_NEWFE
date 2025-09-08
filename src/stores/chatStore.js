import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBackendApi } from '../composables/useBackendApi.js'

export const useChatStore = defineStore('chat', () => {
  const api = useBackendApi()
  
  // State
  const conversations = ref([])
  const currentConversation = ref(null)
  const messages = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const currentMode = ref('agent') // 'chat' or 'agent'
  const isStreaming = ref(false)

  // Getters
  const hasConversations = computed(() => conversations.value.length > 0)
  const currentConversationId = computed(() => currentConversation.value?.id || null)
  const sortedConversations = computed(() => 
    [...conversations.value].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
  )

  // Actions
  async function loadConversations() {
    try {
      isLoading.value = true
      error.value = null
      
      console.log('Loading conversations...')
      
      // Initialize authentication first
      await api.initAuth()
      
      const data = await api.chat.getConversations()
      console.log('Received conversations:', data)
      conversations.value = data
      
      console.log('Conversations loaded successfully:', conversations.value.length)
    } catch (err) {
      console.error('Failed to load conversations:', err)
      // Don't show error for connection refused, 404, or 401 - backend might be starting or auth issues
      if (err.code !== 'ERR_NETWORK' && err.code !== 'ECONNREFUSED' && 
          err.response?.status !== 404 && err.response?.status !== 401) {
        error.value = err.message
        console.error('Failed to load conversations:', err)
      } else {
        console.warn('Conversations endpoint not available or auth issue, starting with empty state')
      }
    } finally {
      isLoading.value = false
    }
  }

  async function createNewConversation(title = null) {
    try {
      isLoading.value = true
      error.value = null
      
      const newTitle = title || `Chat ${new Date().toLocaleString()}`
      const conversation = await api.chat.createConversation(newTitle)
      
      conversations.value.unshift(conversation)
      currentConversation.value = conversation
      messages.value = []
      
      return conversation
    } catch (err) {
      error.value = err.message
      console.error('Failed to create conversation:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function selectConversation(conversationId) {
    try {
      isLoading.value = true
      error.value = null
      
      const conversation = await api.chat.getConversation(conversationId)
      currentConversation.value = conversation
      messages.value = conversation.messages || []
      
    } catch (err) {
      error.value = err.message
      console.error('Failed to load conversation:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function sendMessage(content, attachments = []) {
    if (!content.trim()) return

    try {
      isLoading.value = true
      isStreaming.value = true
      error.value = null

      // Add user message immediately to UI
      const userMessage = {
        id: `temp-${Date.now()}`,
        content,
        role: 'user',
        timestamp: new Date().toISOString(),
        attachments
      }
      messages.value.push(userMessage)

      // If no current conversation, create one
      if (!currentConversation.value) {
        await createNewConversation()
      }

      // Send message to backend
      const response = await api.chat.sendMessage(
        content, 
        currentConversation.value.id,
        currentMode.value
      )

      // Remove temp message and add real messages
      messages.value = messages.value.filter(m => m.id !== userMessage.id)
      
      if (response.messages) {
        messages.value.push(...response.messages)
      } else if (response.message) {
        messages.value.push(response.message)
      }

      // Update conversation in list
      if (response.conversation) {
        const index = conversations.value.findIndex(c => c.id === response.conversation.id)
        if (index >= 0) {
          conversations.value[index] = response.conversation
        }
        currentConversation.value = response.conversation
      }

    } catch (err) {
      error.value = err.message
      console.error('Failed to send message:', err)
      
      // Remove temp message on error
      messages.value = messages.value.filter(m => m.id !== userMessage.id)
      
      // Add error message
      messages.value.push({
        id: `error-${Date.now()}`,
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date().toISOString(),
        error: true
      })
    } finally {
      isLoading.value = false
      isStreaming.value = false
    }
  }

  async function deleteConversation(conversationId) {
    try {
      await api.chat.deleteConversation(conversationId)
      
      // Remove from local state
      conversations.value = conversations.value.filter(c => c.id !== conversationId)
      
      // Clear current conversation if it was deleted
      if (currentConversation.value?.id === conversationId) {
        currentConversation.value = null
        messages.value = []
      }
      
    } catch (err) {
      error.value = err.message
      console.error('Failed to delete conversation:', err)
      throw err
    }
  }

  function setMode(mode) {
    if (['chat', 'agent'].includes(mode.toLowerCase())) {
      currentMode.value = mode.toLowerCase()
    }
  }

  function clearCurrentConversation() {
    currentConversation.value = null
    messages.value = []
  }

  function clearError() {
    error.value = null
  }

  // Initialize store
  function initialize() {
    loadConversations()
  }

  return {
    // State
    conversations,
    currentConversation,
    messages,
    isLoading,
    error,
    currentMode,
    isStreaming,
    
    // Getters
    hasConversations,
    currentConversationId,
    sortedConversations,
    
    // Actions
    loadConversations,
    createNewConversation,
    selectConversation,
    sendMessage,
    deleteConversation,
    setMode,
    clearCurrentConversation,
    clearError,
    initialize
  }
})
