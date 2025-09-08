<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useDocumentStore } from '@/stores/documentStore'
import { useFunctionStore } from '@/stores/functionStore'

// Initialize stores
const chatStore = useChatStore()
const documentStore = useDocumentStore()
const functionStore = useFunctionStore()

// Global navigation state
const sidebarExpanded = ref(false)
const activeTab = ref<'assistant' | 'document' | 'platform'>('assistant')
const selectedMode = ref<'Chat' | 'Agent'>('Agent')

const toggleSidebar = () => {
  sidebarExpanded.value = !sidebarExpanded.value
}

// Chat functionality
const chatInput = ref('')

const sendChatMessage = async () => {
  if (!chatInput.value.trim() || chatStore.isLoading) return
  
  const message = chatInput.value.trim()
  chatInput.value = ''
  
  // Set the mode in the store
  chatStore.setMode(selectedMode.value.toLowerCase())
  
  await chatStore.sendMessage(message)
}

const startNewChat = async () => {
  await chatStore.createNewConversation()
}

// Document tab UI-only state
interface UploadItem {
  id: string
  name: string
  size: string
  progress: number // 0..100
  status: 'pending' | 'success' | 'failed'
}

interface DocPage { id: string; src: string }
interface DocItem { id: string; name: string; size: string; pages: DocPage[] }

const showUploadModal = ref(false)
const uploadItems = ref<UploadItem[]>([
  { id: 'u1', name: 'File name', size: '12 MB', progress: 100, status: 'success' },
  { id: 'u2', name: 'File name', size: '12 MB', progress: 47, status: 'pending' },
  { id: 'u3', name: 'File name', size: '12 MB', progress: 38, status: 'failed' },
])

const docs = ref<DocItem[]>([])
const hasDocs = computed(() => docs.value.length > 0)
const selectedDocIndex = ref(0)

const samplePages: DocPage[] = [
  { id: 'p1', src: 'https://api.builder.io/api/v1/image/assets/TEMP/9b035dce95b5eb1d6c623560ffd96eba34583262?width=1384' },
  { id: 'p2', src: 'https://api.builder.io/api/v1/image/assets/TEMP/19ab7c5495ce5fdfa7186ca8ac9504157cd45f75?width=1384' },
  { id: 'p3', src: 'https://api.builder.io/api/v1/image/assets/TEMP/0a019a6610f3c1dd0f929ba5e5b86ebe28a08427?width=1384' },
]

function openUploadModal() {
  showUploadModal.value = true
}

function closeUploadModal() {
  showUploadModal.value = false
}

function confirmUpload() {
  // UI-only: create a sample document from successful uploads
  const successes = uploadItems.value.filter((u) => u.status === 'success')
  if (successes.length) {
    docs.value = successes.map((s, i) => ({
      id: `d${i + 1}`,
      name: `${s.name} 5466 TNMJ....pdf`,
      size: s.size,
      pages: samplePages,
    }))
    selectedDocIndex.value = 0
  }
  closeUploadModal()
}

function deleteDoc(idx: number) {
  docs.value.splice(idx, 1)
  if (selectedDocIndex.value >= docs.value.length) selectedDocIndex.value = Math.max(0, docs.value.length - 1)
}

const currentDoc = computed(() => docs.value[selectedDocIndex.value])

// Initialize stores on mount
onMounted(async () => {
  // Initialize stores - they will handle their own authentication
  chatStore.initialize()
  documentStore.initialize()
  functionStore.initialize()
})

// Watch for mode changes to update chat behavior
watch(selectedMode, (newMode) => {
  chatStore.setMode(newMode.toLowerCase())
})
</script>

<template>
  <div
    class="h-screen w-screen bg-surface-primary grid"
    :class="[
      'grid-rows-[56px_96px_1fr]',
      sidebarExpanded ? 'grid-cols-[210px_340px_1fr]' : 'grid-cols-[64px_340px_1fr]'
    ]"
  >
    <!-- Sidebar -->
    <div class="bg-surface-primary border-r border-border-primary flex flex-col row-span-3">
      <!-- Logo -->
      <div class="h-14 border-b border-border-primary flex items-center justify-center" :class="sidebarExpanded ? 'px-6' : 'px-4'">
        <div v-if="sidebarExpanded" class="flex items-center justify-between w-full">
          <img src="https://api.builder.io/api/v1/image/assets/TEMP/19abb9443add1cd33dcb83c578474ebfbaa3de42?width=222" alt="AetosNeuro" class="h-5.5 w-auto" />
          <button @click="toggleSidebar" class="w-5 h-5 text-text-neutral hover:text-text-white transition-colors">
            <svg viewBox="0 0 20 21" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.75 3.625C3.40482 3.625 3.125 3.90482 3.125 4.25V16.75C3.125 17.0952 3.40482 17.375 3.75 17.375H16.25C16.5952 17.375 16.875 17.0952 16.875 16.75V4.25C16.875 3.90482 16.5952 3.625 16.25 3.625H3.75ZM1.875 4.25C1.875 3.21447 2.71447 2.375 3.75 2.375H16.25C17.2855 2.375 18.125 3.21447 18.125 4.25V16.75C18.125 17.7855 17.2855 18.625 16.25 18.625H3.75C2.71447 18.625 1.875 17.7855 1.875 16.75V4.25Z"/></svg>
          </button>
        </div>
        <div v-else class="flex justify-center">
          <button @click="toggleSidebar">
            <svg class="w-8 h-5 fill-text-white" viewBox="0 0 34 23"><path d="M23.6128 8.25781L23.9263 8.7832H23.9312V8.78223L29.5298 7.17578L33.1763 9.92773L30.7827 9.28711L26.0347 12.2607L26.0366 12.2637L32.1909 22.4707H26.1353L26.0063 17.3301L24.2544 22.4707L21.2495 18.8477C22.7223 16.9051 24.7279 14.1225 25.8823 12.3584C25.8835 12.3566 25.8841 12.3543 25.8853 12.3525L25.8765 12.3584L24.1011 13.4717V13.4658L25.9771 12.2012H25.9761L24.1001 13.4658L19.4038 16.6318L15.5171 19.252L10.7505 22.4707H0.82373L5.56592 14.4326H17.5425L15.0493 11.4287L15.0796 11.4238L14.6313 10.8828L19.936 9.78027L13.1587 9.1084L8.99951 4.09961L18.7173 6.65137L6.12256 0.529297H18.9507L23.6128 8.25781Z"/></svg>
          </button>
        </div>
      </div>

      <!-- Navigation Items -->
      <div class="flex flex-col gap-2 p-3">
        <!-- AI Assistant -->
        <button
          class="flex h-14 items-center gap-2 px-3 group"
          :class="activeTab === 'assistant' ? 'bg-opacity-100' : ''"
          @click="activeTab = 'assistant'"
        >
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="#B3B3B3" stroke-width="1.5">
              <path d="M9.16667 9.16666V5.83333M13.3333 9.16666V5.83333M17.5 1.66666H2.5V15H6.66667V18.3333L10 15H14.1667L17.5 11.6667V1.66666Z"/>
            </svg>
            <span v-if="sidebarExpanded" class="text-sm" :class="activeTab==='assistant' ? 'text-text-white' : 'text-text-neutral'">AI Assistant</span>
          </div>
        </button>

        <!-- Document -->
        <button
          class="flex h-14 items-center gap-2 px-3 group"
          :class="activeTab === 'document' ? 'bg-opacity-100 bg-opacity-5' : ''"
          @click="activeTab = 'document'"
        >
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="#B3B3B3" stroke-width="1.5">
              <path d="M11.6667 1.66667H5C4.55797 1.66667 4.13405 1.84227 3.82149 2.15483C3.50893 2.46739 3.33333 2.89131 3.33333 3.33334V16.6667C3.33333 17.1087 3.50893 17.5326 3.82149 17.8452C4.13405 18.1577 4.55797 18.3333 5 18.3333H15C15.442 18.3333 15.866 18.1577 16.1785 17.8452C16.4911 17.5326 16.6667 17.1087 16.6667 16.6667V6.66667M11.6667 1.66667L16.6667 6.66667M11.6667 1.66667L11.6667 6.66667H16.6667M13.3333 10.8333H6.66667M13.3333 14.1667H6.66667M8.33333 7.5H6.66667"/>
            </svg>
            <span v-if="sidebarExpanded" class="text-sm" :class="activeTab==='document' ? 'text-text-white' : 'text-text-neutral'">Document</span>
          </div>
        </button>

        <!-- Aetos Platform -->
        <button
          class="flex h-14 items-center gap-2 px-3 group"
          :class="activeTab === 'platform' ? 'bg-opacity-100' : ''"
          @click="activeTab = 'platform'"
        >
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="#B3B3B3" stroke-width="1.5">
              <path d="M13.3333 15L18.3333 10L13.3333 5M6.66667 5L1.66667 10L6.66667 15"/>
            </svg>
            <span v-if="sidebarExpanded" class="text-sm text-text-neutral">Aetos Platform</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Header -->
    <div class="bg-surface-primary border-b border-border-primary flex items-center justify-between px-6 col-span-2">
      <div class="flex items-center gap-2">
        <span class="text-sm text-text-white">Create Work Order</span>
      </div>
      <div class="flex items-center gap-4">
        <!-- Show chat controls only in assistant tab -->
        <template v-if="activeTab === 'assistant'">
          <div class="w-10 h-10 bg-primary-green-bg rounded flex items-center justify-center">
            <svg class="w-7 h-5 fill-primary-green" viewBox="0 0 28 20"><path d="M19.7236 7.19238L19.9941 7.64746H19.999L24.8438 6.25586L28 8.63867L25.9287 8.08398L21.8184 10.6592L21.8203 10.6611L27.1475 19.5H21.9062L21.7949 15.0488L20.2793 19.5L17.6777 16.3623C18.9523 14.6803 20.6874 12.2707 21.6865 10.7432C21.6874 10.7418 21.6876 10.7397 21.6885 10.7383L21.6826 10.7432L20.1455 11.707V11.7021L16.0801 14.4443L12.7168 16.7129L8.59082 19.499H0L4.10352 12.5391H14.4697L12.3115 9.93848L12.3379 9.93359L11.9502 9.46582L16.541 8.51074L10.6758 7.92871L7.0752 3.5918L15.4863 5.80176L4.58691 0.5H15.6885L19.7236 7.19238Z"/></svg>
          </div>
          <div class="flex border border-border-primary bg-surface-primary">
            <button class="px-3 py-2 text-sm" :class="selectedMode==='Chat' ? 'bg-surface-secondary text-text-white' : 'text-text-neutral'" @click="selectedMode='Chat'">Chat</button>
            <button class="px-3 py-2 text-sm" :class="selectedMode==='Agent' ? 'bg-surface-secondary text-text-white' : 'text-text-neutral'" @click="selectedMode='Agent'">Agent</button>
          </div>
          <button class="px-3 py-3 bg-primary-green text-text-brand text-base font-medium hover:bg-primary-green/90 transition-colors">New Chat</button>
        </template>

        <div class="w-px h-14 bg-border-primary"></div>
        <button class="w-6 h-6 text-text-white hover:text-primary-green transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"/>
            <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"/>
          </svg>
        </button>
        <img src="https://api.builder.io/api/v1/image/assets/TEMP/aaf0d44bc5d7d11f6c6379c297acdc154c2f3a0c?width=56" alt="Profile" class="w-7 h-7 rounded" />
      </div>
    </div>

    <!-- Row 2 (Welcome for assistant only) -->
    <div v-if="activeTab === 'assistant'" class="bg-surface-primary border-b border-border-primary flex items-center justify-between px-6 col-span-2">
      <div class="flex items-center gap-4">
        <div class="flex flex-col justify-center">
          <h1 class="text-xl font-light text-text-white">Welcome to AetosNeuro!</h1>
        </div>
      </div>
      <div />
    </div>

    <!-- Content columns vary per tab -->

    <!-- Left column (340px) -->
    <div class="bg-surface-primary border-r border-border-primary border-t border-border-primary flex flex-col">
      <!-- Assistant: search + empty chat list -->
      <template v-if="activeTab === 'assistant'">
        <div class="p-5 border-b border-border-primary">
          <div class="relative">
            <input type="text" placeholder="Search" class="w-full h-12 px-3 pr-10 bg-surface-primary border border-border-primary text-text-neutral placeholder-text-neutral text-sm focus:outline-none focus:border-primary-green" />
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 14L11.1 11.1M12.6667 7.33333C12.6667 10.2789 10.2789 12.6667 7.33333 12.6667C4.38781 12.6667 2 10.2789 2 7.33333C2 4.38781 4.38781 2 7.33333 2C10.2789 2 12.6667 4.38781 12.6667 7.33333Z"/></svg>
          </div>
          <button 
            @click="chatStore.loadConversations()" 
            class="mt-2 w-full px-3 py-2 bg-primary-green text-text-brand text-sm hover:bg-primary-green/90 transition-colors"
          >
            Reload Conversations
          </button>
        </div>
        <div v-if="!chatStore.hasConversations && !chatStore.isLoading" class="flex-1 flex flex-col items-center justify-center gap-3 px-6">
          <svg class="w-12 h-12 text-text-neutral" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M42 30C42 31.0609 41.5786 32.0783 40.8284 32.8284C40.0783 33.5786 39.0609 34 38 34H14L6 42V10C6 8.93913 6.42143 7.92172 7.17157 7.17157C7.92172 6.42143 8.93913 6 10 6H38C39.0609 6 40.0783 6.42143 40.8284 7.17157C41.5786 7.92172 42 8.93913 42 10V30Z"/></svg>
          <span class="text-base text-text-tertiary">No conversation yet</span>
        </div>
        
        <div v-else-if="chatStore.isLoading" class="flex-1 flex flex-col items-center justify-center gap-3 px-6">
          <div class="w-8 h-8 border-2 border-primary-green border-t-transparent rounded-full animate-spin"></div>
          <span class="text-base text-text-tertiary">Loading conversations...</span>
        </div>
        
        <div v-else class="flex-1 overflow-auto">
          <div class="px-4 py-4 text-text-neutral text-sm">CONVERSATIONS</div>
          <div class="flex flex-col">
            <div 
              v-for="conversation in chatStore.sortedConversations" 
              :key="conversation.id" 
              class="flex items-center gap-3 px-4 py-4 hover:bg-surface-secondary cursor-pointer border-l-2 border-transparent"
              :class="{ 'border-l-primary-green bg-surface-secondary': chatStore.currentConversationId === conversation.id }"
              @click="chatStore.selectConversation(conversation.id)"
            >
              <div class="w-8 h-8 bg-primary-green/20 rounded flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-primary-green" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12ZM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2Z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm text-text-white truncate">{{ conversation.title || `Chat ${new Date(conversation.created_at).toLocaleDateString()}` }}</div>
                <div class="text-xs text-text-neutral">{{ conversation.message_count || 0 }} messages</div>
                <div class="text-xs text-text-neutral">{{ new Date(conversation.updated_at).toLocaleDateString() }}</div>
              </div>
              <button 
                class="w-5 h-5 text-text-neutral hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                @click.stop="chatStore.deleteConversation(conversation.id)"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.5 4.5a2.5 2.5 0 0 1 5 0V5h1.5a.5.5 0 0 1 0 1h-1V15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6H2.5a.5.5 0 0 1 0-1H4v-.5A2.5 2.5 0 0 1 8.5 4.5ZM5 6v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6H5Z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- Document: search + history or empty -->
      <template v-else-if="activeTab === 'document'">
        <div class="p-5 border-b border-border-primary">
          <div class="relative">
            <input type="text" placeholder="Search" class="w-full h-12 px-3 pr-10 bg-surface-primary border border-border-primary text-text-neutral placeholder-text-neutral text-sm focus:outline-none focus:border-primary-green" />
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 14L11.1 11.1M12.6667 7.33333C12.6667 10.2789 10.2789 12.6667 7.33333 12.6667C4.38781 12.6667 2 10.2789 2 7.33333C2 4.38781 4.38781 2 7.33333 2C10.2789 2 12.6667 4.38781 12.6667 7.33333Z"/></svg>
          </div>
        </div>
        <div v-if="!hasDocs" class="flex-1 flex flex-col items-center justify-center gap-3 px-6">
          <svg class="w-12 h-12 text-text-neutral" viewBox="0 0 48 48" fill="none" stroke="#71717A" stroke-width="2"><path d="M42 14H36C34.9391 14 33.9217 13.5786 33.1716 12.8284C32.4214 12.0783 32 11.0609 32 10V4M14 16V33.6C14 34.2 14.4 34.8 14.8 35.2C15.2 35.6 15.8 36 16.4 36H30M6 24V41.6C6 42.2 6.4 42.8 6.8 43.2C7.2 43.6 7.8 44 8.4 44H22M42 12V25C42 26.6 40.6 28 39 28H25C23.4 28 22 26.6 22 25V7C22 5.4 23.4 4 25 4H34L42 12Z"/></svg>
          <span class="text-base text-text-tertiary">No document yet</span>
        </div>
        <div v-else class="flex-1 overflow-auto">
          <div class="px-4 py-4 text-text-neutral">HISTORY</div>
          <div class="flex flex-col divide-y divide-border-primary">
            <div v-for="(d, idx) in docs" :key="d.id" class="flex items-center gap-3 px-4 py-4 hover:bg-opacity-100 hover:bg-opacity-5 cursor-pointer" @click="selectedDocIndex = idx">
              <div class="w-10 h-10 flex items-center justify-center">
                <div class="w-6 h-8 bg-text-neutral/50"></div>
              </div>
              <div class="flex-1">
                <div class="text-base text-text-white">{{ d.name }}</div>
                <div class="text-sm text-text-neutral">{{ d.size }}</div>
              </div>
              <button class="w-5 h-5" @click.stop="deleteDoc(idx)">
                <svg viewBox="0 0 20 20" fill="none" stroke="white"><path d="M2.5 5H17.5M15.833 5V16.667C15.833 17.5 15 18.333 14.167 18.333H5.833C5 18.333 4.167 17.5 4.167 16.667V5M6.667 5V3.333C6.667 2.5 7.5 1.667 8.333 1.667H11.667C12.5 1.667 13.333 2.5 13.333 3.333V5M8.333 9.167V14.167M11.667 9.167V14.167" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- Placeholder for platform tab -->
      <template v-else>
        <div class="flex-1 flex items-center justify-center text-text-neutral">Select a platform feature</div>
      </template>
    </div>

    <!-- Right main content -->
    <div class="bg-surface-primary flex flex-col border-t border-border-primary overflow-hidden">
      <!-- Assistant main -->
      <template v-if="activeTab === 'assistant'">
        <div class="flex-1 flex flex-col items-center justify-center gap-6 px-12 py-20">
          <div class="flex flex-col items-center gap-10 max-w-4xl">
            <div class="w-18 h-18 bg-primary-green border-2 border-primary-green rounded flex items-center justify-center">
              <svg class="w-15 h-10 fill-text-brand" viewBox="0 0 62 42"><path d="M43.6582 14.7939L44.2578 15.7988H44.2676L46.2676 19.1152L48.2012 22.3213V22.332L48.2021 22.3311V22.3213L46.2686 19.1152L44.2686 15.7979L54.9844 12.7227L61.9658 17.9893L57.3838 16.7637L48.293 22.457L48.2969 22.4629L60.0791 42.001H48.4873L48.2402 32.1611L44.8867 42.001L39.1338 35.0654C41.9531 31.3469 45.7921 26.0205 48.002 22.6436C48.0044 22.6398 48.0063 22.6356 48.0088 22.6318L47.9922 22.6426L44.5918 24.7734V24.7637L35.5996 30.8242L28.1611 35.8389L19.0361 42H0.0341797L9.11133 26.6133H32.0381L27.2656 20.8643L27.3232 20.8545L26.4658 19.8193L36.6191 17.708L23.6465 16.4219L15.6836 6.83398L34.2861 11.7178L10.1777 -0.000976562H34.7334L43.6582 14.7939Z"/></svg>
            </div>
            <div class="text-center">
              <h2 class="text-2xl font-normal text-text-white mb-2 tracking-tight">How can I help you?</h2>
              <p class="text-base text-text-neutral">Let's start your conversation</p>
            </div>
            <div class="flex gap-6">
              <div class="flex border border-border-primary">
                <div class="px-4 py-6 flex flex-col items-center gap-4">
                  <div class="p-3 bg-opacity-200 rounded">
                    <svg class="w-10 h-10" viewBox="0 0 40 40" fill="none" stroke="#BEF975" stroke-width="2"><path d="M13.3333 16.6667H13.35M20 16.6667H20.0167M26.6667 16.6667H26.6833M35 25C35 25.8841 34.6488 26.7319 34.0237 27.357C33.3986 27.9821 32.5507 28.3333 31.6667 28.3333H11.6667L5 35V8.33333C5 7.44928 5.35119 6.60143 5.97631 5.97631C6.60143 5.35119 7.44928 5 8.33333 5H31.6667C32.5507 5 33.3986 5.35119 34.0237 5.97631C34.6488 6.60143 35 7.44928 35 8.33333V25Z"/></svg>
                  </div>
                  <div class="text-center">
                    <div class="text-lg font-medium text-text-white">Chat</div>
                    <div class="text-base text-text-neutral">Regular Conversation Mode</div>
                  </div>
                </div>
              </div>
              <div class="flex border border-border-primary">
                <div class="px-4 py-6 flex flex-col items-center gap-4">
                  <div class="p-3 bg-opacity-200 rounded">
                    <svg class="w-10 h-10" viewBox="0 0 40 40" fill="none" stroke="#BEF975" stroke-width="2"><path d="M20 10V3.33334H13.3334M3.33337 20H6.66671M15 18.3333V21.6667M25 18.3333V21.6667M33.3334 20H36.6667M13.3334 30L6.66671 36.6667V13.3333C6.66671 12.4493 7.0179 11.6014 7.64302 10.9763C8.26814 10.3512 9.11599 10 10 10H30C30.8841 10 31.7319 10.3512 32.3571 10.9763C32.9822 11.6014 33.3334 12.4493 33.3334 13.3333V26.6667C33.3334 27.5507 32.9822 28.3986 32.3571 29.0237C31.7319 29.6488 30.8841 30 30 30H13.3334Z"/></svg>
                  </div>
                  <div class="text-center">
                    <div class="text-lg font-medium text-text-white">Agent</div>
                    <div class="text-base text-text-neutral">Smart document capabilities</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="border-t border-border-primary bg-surface-primary px-10 py-4">
          <div class="flex flex-col gap-4">
            <div class="text-sm text-text-neutral"><span class="text-primary-green">|</span>Describe your thinking...</div>
            <div class="flex gap-3">
              <div class="flex-1 relative">
                <input 
                  v-model="chatInput" 
                  @keypress.enter="sendChatMessage"
                  :disabled="chatStore.isLoading"
                  placeholder="Type your message here..."
                  class="w-full px-4 py-3 bg-surface-primary border border-border-primary text-text-white placeholder-text-neutral text-sm focus:outline-none focus:border-primary-green"
                />
              </div>
              <div class="flex items-center gap-3">
                <button 
                  @click="startNewChat"
                  class="px-4 py-3 border border-border-secondary text-sm text-text-white hover:border-primary-green transition-colors"
                >
                  New Chat
                </button>
                <button class="w-10 h-10 border border-border-primary bg-surface-primary flex items-center justify-center hover:border-primary-green transition-colors">
                  <svg class="w-4.5 h-4.5" viewBox="0 0 18 18" fill="none" stroke="#444444" stroke-width="1">
                    <path d="M13 7.72727V9C13 10.1814 12.5786 11.3144 11.8284 12.1498C11.0783 12.9852 10.0609 13.4545 9 13.4545M9 13.4545C7.93913 13.4545 6.92172 12.9852 6.17157 12.1498C5.42143 11.3144 5 10.1814 5 9V7.72727M9 13.4545V16M6.71429 16H11.2857M9 2C8.54534 2 8.10931 2.20114 7.78782 2.55916C7.46633 2.91718 7.28571 3.40277 7.28571 3.90909V9C7.28571 9.50632 7.46633 9.99191 7.78782 10.3499C8.10931 10.708 8.54534 10.9091 9 10.9091C9.45466 10.9091 9.89069 10.708 10.2122 10.3499C10.5337 9.99191 10.7143 9.50632 10.7143 9V3.90909C10.7143 3.40277 10.5337 2.91718 10.2122 2.55916C9.89069 2.20114 9.45466 2 9 2Z"/>
                  </svg>
                </button>
                <button 
                  @click="sendChatMessage" 
                  :disabled="!chatInput.trim() || chatStore.isLoading"
                  class="w-10 h-10 border border-primary-green bg-primary-green flex items-center justify-center hover:bg-primary-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="!chatStore.isLoading" class="w-4.5 h-4.5 fill-text-brand" viewBox="0 0 18 18">
                    <path d="M3.86462 1.6764C2.43116 0.959877 0.93044 2.5247 1.70969 3.92695L3.89776 7.86431C4.03005 8.10237 4.28099 8.25 4.55334 8.25L9 8.25C9.41421 8.25 9.75 8.58579 9.75 9C9.75 9.41421 9.41421 9.75 9 9.75L4.55349 9.75C4.28115 9.75 4.03021 9.89763 3.89792 10.1357L1.70969 14.0733C0.930439 15.4756 2.43116 17.0404 3.86462 16.3239L15.5985 10.4587C16.8006 9.85778 16.8006 8.14251 15.5985 7.5416L3.86462 1.6764Z"/>
                  </svg>
                  <div v-else class="w-4 h-4 border-2 border-text-brand border-t-transparent rounded-full animate-spin"></div>
                </button>
              </div>
            </div>
            <div v-if="chatStore.error" class="text-red-400 text-sm">
              {{ chatStore.error }}
            </div>
          </div>
        </div>
      </template>

      <!-- Document main -->
      <template v-else-if="activeTab === 'document'">
        <div class="flex-1 grid grid-cols-[150px_1fr]">
          <!-- Thumbnails -->
          <div class="border-r border-border-primary overflow-auto p-4" v-if="hasDocs">
            <div v-for="(p, i) in currentDoc?.pages || []" :key="p.id" class="mb-4">
              <img :src="p.src" :alt="`Page ${i+1}`" class="rounded w-full object-cover" />
              <div class="text-sm text-text-white mt-1">{{ i + 1 }}</div>
            </div>
          </div>
          <!-- Viewer or drop area -->
          <div class="flex items-center justify-center">
            <div v-if="!hasDocs" class="flex flex-col items-center gap-6">
              <div class="text-2xl text-text-white">Upload to view your document</div>
              <div class="border border-dashed border-border-default-teriary bg-surface-secondary p-8 flex flex-col items-center gap-3 w-[552px] h-[180px] justify-center" @click="openUploadModal">
                <svg class="w-14 h-14" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M49 35V44.3333C49 45.571 48.5083 46.758 47.6332 47.6332C46.758 48.5083 45.571 49 44.3333 49H11.6667C10.429 49 9.242 48.5083 8.36683 47.6332C7.49167 46.758 7 45.571 7 44.3333V35M39.6667 18.6667L28 7M28 7L16.3333 18.6667M28 7V35" stroke="#BEF975" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <div class="text-lg text-text-white">Drag and drop AOI files here.</div>
              </div>
            </div>
            <div v-else class="w-full h-full overflow-auto p-6">
              <img v-for="p in currentDoc?.pages || []" :key="p.id" :src="p.src" class="w-full mb-6 rounded" />
            </div>
          </div>
        </div>

        <!-- Upload Modal -->
        <div v-if="showUploadModal" class="fixed inset-0 z-50">
          <div class="absolute inset-0 bg-black/80"></div>
          <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] bg-surface-primary border border-border-primary">
            <div class="flex items-center justify-between px-6 py-4 border-b border-white/20">
              <div class="text-lg text-text-white">Upload Document</div>
              <button class="w-6 h-6" @click="closeUploadModal">
                <svg viewBox="0 0 24 24" fill="white"><path d="M3.219 4.281a1 1 0 0 1 1.414 0L12 11.647l7.367-7.366a1 1 0 1 1 1.414 1.414L13.415 13.06l7.366 7.367a1 1 0 0 1-1.414 1.414L12 14.475l-7.367 7.366A1 1 0 0 1 3.219 20.427L10.586 13.06 3.219 5.695a1 1 0 0 1 0-1.414Z"/></svg>
              </button>
            </div>
            <div class="p-6 flex flex-col gap-4 max-h-[480px] overflow-auto">
              <div class="border border-dashed border-border-secondary bg-surface-secondary p-8 flex flex-col items-center gap-3">
                <svg class="w-14 h-14" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M49 35V44.3333C49 45.571 48.5083 46.758 47.6332 47.6332C46.758 48.5083 45.571 49 44.3333 49H11.6667C10.429 49 9.242 48.5083 8.36683 47.6332C7.49167 46.758 7 45.571 7 44.3333V35M39.6667 18.6667L28 7M28 7L16.3333 18.6667M28 7V35" stroke="#BEF975" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <div class="text-base text-text-white">Drag and drop AOI files here.</div>
              </div>

              <div v-for="u in uploadItems" :key="u.id" class="border border-border-primary p-3 space-y-2">
                <div class="flex items-center gap-2">
                  <svg class="w-8 h-8" viewBox="0 0 32 32" fill="#B3B3B3"><path d="M26.92 8.865 19.71 1.645 19.56 1.5H7A2.5 2.5 0 0 0 4.5 4v24A2.5 2.5 0 0 0 7 30.5h18A2.5 2.5 0 0 0 27.5 28V8.94l-.58-.075ZM19.855 3.205l5.44 5.44H20.855a1.49 1.49 0 0 1-1.49-1.49V3.205Z"/></svg>
                  <div class="flex-1">
                    <div class="text-sm text-text-white">{{ u.name }}</div>
                    <div class="text-xs text-text-neutral">{{ u.size }}</div>
                  </div>
                  <div class="w-4 h-4" v-if="u.status==='success'"></div>
                </div>
                <div class="relative h-4">
                  <div class="absolute inset-y-1 left-0 right-0 bg-border-primary"></div>
                  <div
                    class="absolute inset-y-1 left-0"
                    :class="u.status==='failed' ? 'bg-[rgb(210,43,40)]' : 'bg-text-brand'"
                    :style="{ width: (u.status==='failed' ? Math.max(10, u.progress) : u.progress) + '%' }"
                  ></div>
                  <div class="absolute right-0 -top-4 text-xs" :class="u.status==='failed' ? 'text-[rgb(255,4,0)]' : 'text-primary-green'">
                    {{ u.status==='failed' ? 'Failed' : u.progress + '%' }}
                  </div>
                </div>
              </div>
            </div>
            <div class="px-6 py-3 border-t border-white/20 flex items-center justify-between">
              <div class="text-xs text-primary-green">Success 12/123</div>
              <div class="flex items-center gap-3">
                <button class="px-4 py-2 border border-border-default-teriary text-text-white">Cancel</button>
                <button class="px-4 py-2 bg-primary-green text-text-brand" @click="confirmUpload">Confirm</button>
              </div>
              <div class="text-xs text-[rgb(255,4,0)]">Failed 6/123</div>
            </div>
          </div>
        </div>
      </template>

      <!-- Platform placeholder -->
      <template v-else>
        <div class="flex-1 flex items-center justify-center text-text-neutral">Platform coming soon</div>
      </template>
    </div>
  </div>

  <!-- Open upload modal button (for demo) hidden when in assistant) -->
  <button v-if="activeTab==='document' && !hasDocs && !showUploadModal" class="fixed bottom-6 right-6 bg-primary-green text-text-brand px-4 py-2" @click="openUploadModal">Upload</button>
</template>

<style scoped></style>
