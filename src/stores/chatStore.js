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
      
      // Let the API handle the default title generation
      const conversation = await api.chat.createConversation(title)
      
      conversations.value.unshift(conversation)
      currentConversation.value = conversation
      messages.value = []
      
      // Refresh conversation list to ensure backend sync
      try {
        const updatedConversations = await api.chat.getConversations()
        conversations.value = updatedConversations
        console.log('🔄 Conversation list refreshed after creation')
      } catch (refreshErr) {
        console.warn('Failed to refresh conversation list after creation:', refreshErr)
      }
      
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

      console.log('📤 Sending message:', content)

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

      console.log('🎯 Sending to conversation:', currentConversation.value.id, 'Mode:', currentMode.value)

      // Send message to backend
      const response = await api.chat.sendMessage(
        content, 
        currentConversation.value.id,
        currentMode.value
      )

      console.log('📥 Received response:', response)

      // Remove temp message and update with complete conversation
      messages.value = messages.value.filter(m => m.id !== userMessage.id)
      
      // Replace messages with the complete conversation from backend
      if (response.messages && response.messages.length > 0) {
        // Backend returned full message list - replace existing messages
        messages.value = response.messages
        console.log('✅ Messages updated from backend:', response.messages.length, 'total messages')
      } else if (response.message) {
        // Backend returned single message - add both user and assistant
        messages.value.push(userMessage) // Add user message back
        messages.value.push(response.message)
      } else {
        // Fallback - just add user message back
        messages.value.push(userMessage)
        console.warn('No assistant response received')
      }

      // Update conversation in list
      if (response.conversation) {
        const index = conversations.value.findIndex(c => c.id === response.conversation.id)
        if (index >= 0) {
          conversations.value[index] = {
            ...response.conversation,
            title: response.conversation.title || conversations.value[index].title
          }
        }
        currentConversation.value = {
          ...response.conversation,
          title: response.conversation.title || currentConversation.value?.title
        }
      }

      // Refresh conversation list to ensure titles are synced with backend
      try {
        const updatedConversations = await api.chat.getConversations()
        conversations.value = updatedConversations
        console.log('🔄 Conversation list refreshed after message')
      } catch (refreshErr) {
        console.warn('Failed to refresh conversation list:', refreshErr)
      }

      // Trigger reactivity update
      messages.value = [...messages.value]

      console.log('💬 Updated messages:', messages.value.length, 'messages')

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
