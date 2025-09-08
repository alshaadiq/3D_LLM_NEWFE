<template>
  <div class="min-h-screen bg-surface-950 text-surface-50">
    <!-- Header -->
    <header class="bg-surface-900 border-b border-surface-800 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-bold text-primary-400">3D LLM Assistant</h1>
          <div class="flex items-center space-x-2">
            <button
              @click="chatStore.setMessageMode('chat')"
              :class="[
                'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                chatStore.isAgentMode 
                  ? 'bg-surface-800 text-surface-300 hover:bg-surface-700' 
                  : 'bg-primary-600 text-white'
              ]"
            >
              💬 Chat
            </button>
            <button
              @click="chatStore.setMessageMode('agent')"
              :class="[
                'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                chatStore.isAgentMode 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-surface-800 text-surface-300 hover:bg-surface-700'
              ]"
            >
              🤖 Agent
            </button>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- User info -->
          <div v-if="authStore.isAuthenticated" class="text-sm text-surface-300">
            👤 {{ authStore.userName }}
          </div>
          
          <!-- Document upload -->
          <button
            @click="() => fileInput?.click()"
            :disabled="documentStore.isUploading"
            class="flex items-center space-x-2 px-3 py-2 bg-surface-800 hover:bg-surface-700 rounded-md transition-colors disabled:opacity-50"
          >
            <span>📄</span>
            <span v-if="documentStore.isUploading">Uploading...</span>
            <span v-else>Upload Doc</span>
          </button>
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            accept=".pdf,.docx,.txt"
            @change="handleFileUpload"
          />
          
          <!-- New chat -->
          <button
            @click="createNewChat"
            :disabled="chatStore.isLoading"
            class="flex items-center space-x-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 rounded-md transition-colors disabled:opacity-50"
          >
            <span>➕</span>
            <span>New Chat</span>
          </button>
          
          <!-- Logout -->
          <button
            @click="logout"
            class="flex items-center space-x-2 px-3 py-2 bg-surface-800 hover:bg-surface-700 rounded-md transition-colors"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>

    <div class="flex h-[calc(100vh-80px)]">
      <!-- Sidebar - Chat History & Documents -->
      <div class="w-80 bg-surface-900 border-r border-surface-800 flex flex-col">
        <!-- Chat History -->
        <div class="flex-1 p-4">
          <h3 class="text-lg font-semibold mb-4 text-surface-200">Chat History</h3>
          <div class="space-y-2">
            <div
              v-for="chat in chatStore.chatHistory"
              :key="chat.id"
              @click="loadChat(chat.id)"
              :class="[
                'p-3 rounded-lg cursor-pointer transition-colors',
                chatStore.currentChat?.id === chat.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-800 hover:bg-surface-700 text-surface-200'
              ]"
            >
              <div class="font-medium text-sm truncate">
                {{ chatStore.getChatPreview(chat) }}
              </div>
              <div class="text-xs opacity-75 mt-1">
                {{ chat.messages.length }} messages
              </div>
            </div>
          </div>
        </div>
        
        <!-- Document Stats -->
        <div class="p-4 border-t border-surface-800">
          <h4 class="text-sm font-semibold mb-2 text-surface-300">Documents</h4>
          <div class="text-xs text-surface-400 space-y-1">
            <div>📄 {{ documentStore.documentCount }} files</div>
            <div>✅ {{ documentStore.completedDocuments.length }} processed</div>
            <div v-if="documentStore.processingDocuments.length > 0">
              ⏳ {{ documentStore.processingDocuments.length }} processing
            </div>
          </div>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="flex-1 flex flex-col">
        <!-- Loading State -->
        <div v-if="!authStore.isAuthenticated" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div class="text-6xl mb-4">🔐</div>
            <h2 class="text-2xl font-bold mb-2">Authentication Required</h2>
            <p class="text-surface-400">Please log in to access the 3D LLM Assistant</p>
          </div>
        </div>
        
        <!-- No Chat Selected -->
        <div v-else-if="!chatStore.hasChatSelected" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div class="text-6xl mb-4">💬</div>
            <h2 class="text-2xl font-bold mb-2">Welcome to 3D LLM Assistant</h2>
            <p class="text-surface-400 mb-4">Create a new chat or select an existing one to get started</p>
            <button
              @click="createNewChat"
              class="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors"
            >
              Start New Conversation
            </button>
          </div>
        </div>
        
        <!-- Chat Messages -->
        <div v-else class="flex-1 flex flex-col">
          <!-- Messages Container -->
          <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 space-y-4">
            <div
              v-for="message in chatStore.currentChat?.messages || []"
              :key="message.id"
              :class="[
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              ]"
            >
              <div
                :class="[
                  'max-w-3xl px-4 py-3 rounded-lg',
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface-800 text-surface-100'
                ]"
              >
                <!-- Message Header -->
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <span class="text-sm font-medium">
                      {{ message.role === 'user' ? '👤 You' : '🤖 Assistant' }}
                    </span>
                    <span class="text-xs opacity-75">
                      {{ chatStore.getMessageModeIndicator(message) }}
                      {{ message.mode }}
                    </span>
                  </div>
                  <span class="text-xs opacity-75">
                    {{ formatMessageTime(message.date) }}
                  </span>
                </div>
                
                <!-- Message Content -->
                <div class="whitespace-pre-wrap break-words">
                  {{ message.message }}
                </div>
                
                <!-- JSON Mode Indicator -->
                <div v-if="message.json_mode" class="mt-2 text-xs opacity-75">
                  📊 JSON Data
                </div>
              </div>
            </div>
            
            <!-- Loading Message -->
            <div v-if="chatStore.isLoadingMessage" class="flex justify-start">
              <div class="max-w-3xl px-4 py-3 rounded-lg bg-surface-800 text-surface-100">
                <div class="flex items-center space-x-2">
                  <div class="animate-spin">⏳</div>
                  <span>{{ chatStore.isAgentMode ? 'Agent is thinking...' : 'Assistant is typing...' }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Message Input -->
          <div class="border-t border-surface-800 p-6">
            <form @submit.prevent="sendMessage" class="flex space-x-4">
              <input
                v-model="messageInput"
                :disabled="chatStore.isLoadingMessage"
                :placeholder="chatStore.isAgentMode ? 'Ask the agent to perform tasks...' : 'Type your message...'"
                class="flex-1 px-4 py-3 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 placeholder-surface-400 focus:outline-none focus:border-primary-500"
              />
              <button
                type="submit"
                :disabled="!messageInput.trim() || chatStore.isLoadingMessage"
                class="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-surface-700 disabled:text-surface-400 rounded-lg font-medium transition-colors"
              >
                {{ chatStore.isLoadingMessage ? 'Sending...' : 'Send' }}
              </button>
            </form>
            
            <!-- Mode Info -->
            <div class="mt-2 text-xs text-surface-400">
              <span v-if="chatStore.isAgentMode">
                🤖 Agent mode: Can execute functions and perform complex tasks
              </span>
              <span v-else>
                💬 Chat mode: Conversational responses only
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Toast -->
    <div
      v-if="error"
      class="fixed bottom-4 right-4 bg-error-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
    >
      <span>❌</span>
      <span>{{ error }}</span>
      <button @click="clearError" class="ml-2 text-white hover:text-error-200">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore } from '@/stores/chatStore'
import { useDocumentStore } from '@/stores/documentStore'

// Store instances
const authStore = useAuthStore()
const chatStore = useChatStore()
const documentStore = useDocumentStore()

// Component state
const messageInput = ref('')
const messagesContainer = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()

// Error handling
const error = computed(() => {
  return chatStore.error || documentStore.error || authStore.error
})

const clearError = () => {
  chatStore.clearError()
  documentStore.clearError()
}

// Initialize
onMounted(async () => {
  await authStore.checkAuth()
  if (authStore.isAuthenticated) {
    await documentStore.loadDocuments()
  }
})

// Chat methods
const createNewChat = async () => {
  try {
    await chatStore.createNewChat()
    scrollToBottom()
  } catch (err) {
    console.error('Failed to create new chat:', err)
  }
}

const loadChat = async (chatId: string) => {
  try {
    await chatStore.loadChat(chatId)
    scrollToBottom()
  } catch (err) {
    console.error('Failed to load chat:', err)
  }
}

const sendMessage = async () => {
  if (!messageInput.value.trim()) return
  
  const message = messageInput.value
  messageInput.value = ''
  
  try {
    await chatStore.sendMessage(message)
    scrollToBottom()
  } catch (err) {
    console.error('Failed to send message:', err)
  }
}

// Document methods
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    await documentStore.uploadDocument(file)
    // Clear the input
    target.value = ''
  } catch (err) {
    console.error('Failed to upload document:', err)
  }
}

// Auth methods
const logout = async () => {
  try {
    await authStore.logout()
    chatStore.clearCurrentChat()
  } catch (err) {
    console.error('Logout failed:', err)
  }
}

// Utility methods
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatMessageTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>
