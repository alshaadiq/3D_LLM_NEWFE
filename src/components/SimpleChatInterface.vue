<template>
  <div class="flex flex-col gap-4">
    <!-- Chat Messages -->
    <div v-if="messages.length > 0" class="flex-1 max-h-64 overflow-y-auto space-y-2">
      <div 
        v-for="message in messages" 
        :key="message.id"
        :class="[
          'p-3 rounded max-w-[80%]',
          message.role === 'user' 
            ? 'bg-primary-green text-text-brand ml-auto' 
            : 'bg-surface-secondary text-text-white mr-auto'
        ]"
      >
        <div class="text-sm">{{ message.content }}</div>
        <div class="text-xs opacity-60 mt-1">
          {{ formatTime(message.timestamp) }}
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="flex gap-2">
      <input
        v-model="inputMessage"
        @keypress.enter="sendMessage"
        :disabled="isLoading"
        placeholder="Type your message..."
        class="flex-1 px-3 py-2 bg-surface-primary border border-border-primary text-text-white placeholder-text-neutral text-sm focus:outline-none focus:border-primary-green"
      />
      <button
        @click="sendMessage"
        :disabled="!inputMessage.trim() || isLoading"
        class="px-4 py-2 bg-primary-green text-text-brand hover:bg-primary-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="!isLoading">Send</span>
        <span v-else>...</span>
      </button>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="text-red-400 text-sm">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useChatStore } from '@/stores/chatStore'

const chatStore = useChatStore()
const inputMessage = ref('')

// Computed properties
const messages = computed(() => chatStore.messages)
const isLoading = computed(() => chatStore.isLoading)
const error = computed(() => chatStore.error)

// Methods
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return
  
  const message = inputMessage.value.trim()
  inputMessage.value = ''
  
  try {
    await chatStore.sendMessage(message)
  } catch (err) {
    console.error('Failed to send message:', err)
  }
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Initialize on mount
onMounted(() => {
  chatStore.initialize()
})
</script>
