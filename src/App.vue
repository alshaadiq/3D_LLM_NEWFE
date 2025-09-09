<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useDocumentStore } from '@/stores/documentStore'
import { useFunctionStore } from '@/stores/functionStore'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

// Initialize stores
const chatStore = useChatStore()
const documentStore = useDocumentStore()
const functionStore = useFunctionStore()

// Global navigation state
const sidebarExpanded = ref(false)
const activeTab = ref<'assistant' | 'document' | 'platform'>('assistant')
const selectedMode = ref<'Chat' | 'Agent'>('Agent')

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
  error?: string
}

interface DocPage { id: string; src: string }
interface DocItem { 
  id: string; 
  name: string; 
  size: string; 
  pages: DocPage[];
  filename: string;
  content_type: string;
  file_size: number;
  upload_date: string;
  status: 'processing' | 'completed' | 'failed';
}

const showUploadModal = ref(false)
const uploadItems = ref<UploadItem[]>([])
const selectedFiles = ref<File[]>([])
const dragCounter = ref(0)
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement>()

// Use real document store
const realDocs = computed(() => {
  console.log('realDocs computed:', documentStore.documents.length, 'documents')
  return documentStore.documents.map(doc => ({
    id: doc.id,
    name: doc.filename,
    size: documentStore.formatFileSize(doc.file_size),
    filename: doc.filename,
    content_type: doc.content_type,
    file_size: doc.file_size,
    upload_date: doc.upload_date,
    status: doc.status,
    pages: [] // Will be populated when document viewer is implemented
  }))
})

const hasDocs = computed(() => {
  const hasDocuments = realDocs.value.length > 0
  console.log('hasDocs computed:', hasDocuments, 'realDocs length:', realDocs.value.length)
  return hasDocuments
})
const selectedDocIndex = ref(0)

// Document viewer state
const documentContent = ref('')
const loadingDocumentContent = ref(false)

const currentDoc = computed(() => realDocs.value[selectedDocIndex.value])

// Initialize document store on mount
onMounted(async () => {
  console.log('App mounted, loading documents...')
  try {
    await documentStore.loadDocuments()
    console.log('Documents loaded:', documentStore.documents.length)
  } catch (error) {
    console.error('Error loading documents:', error)
  }
  
  // Initialize function store
  console.log('Initializing function store...')
  try {
    await functionStore.loadAvailableFunctions()
    console.log('Functions loaded:', functionStore.availableFunctions.length)
  } catch (error) {
    console.error('Failed to load functions:', error)
  }
})

// Watch for document changes
watch(() => documentStore.documents, (newDocs) => {
  console.log('Documents changed:', newDocs.length, 'documents')
}, { immediate: true, deep: true })

// Watch for platform tab activation to load functions if not already loaded
watch(activeTab, async (newTab) => {
  if (newTab === 'platform' && !functionStore.hasFunctions && !functionStore.isLoading) {
    console.log('Platform tab activated, loading functions...')
    try {
      await functionStore.loadAvailableFunctions()
      console.log('Functions loaded for platform:', functionStore.availableFunctions.length)
    } catch (error) {
      console.error('Failed to load functions for platform:', error)
    }
  }
})

function openUploadModal() {
  showUploadModal.value = true
  uploadItems.value = []
  selectedFiles.value = []
}

function closeUploadModal() {
  showUploadModal.value = false
  uploadItems.value = []
  selectedFiles.value = []
  isDragging.value = false
  dragCounter.value = 0
}

// Document viewer functions
async function loadDocumentContent(documentId: string) {
  console.log('Starting loadDocumentContent for ID:', documentId)
  loadingDocumentContent.value = true
  documentContent.value = ''
  
  try {
    // Import the useBackendApi to access API methods
    const { useBackendApi } = await import('./composables/useBackendApi.js')
    const api = useBackendApi()
    console.log('API initialized:', api)
    
    try {
      // Try to get document chunks directly via axios
      console.log('Attempting to fetch chunks for document:', documentId)
      const chunksResponse = await (api as any).api.get(`/documents/${documentId}/chunks`)
      console.log('Chunks response:', chunksResponse)
      const chunks = chunksResponse.data
      console.log('Chunks data:', chunks)
      
      if (chunks && chunks.length > 0) {
        console.log('Processing chunks:', chunks)
        console.log('First chunk structure:', chunks[0])
        
        // Try different possible content field names
        let content = ''
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i]
          console.log(`Chunk ${i}:`, chunk)
          
          // Try different possible field names for content
          let chunkContent = chunk.content || chunk.text || chunk.chunk_content || chunk.data || ''
          
          // If still empty, try to extract from nested objects
          if (!chunkContent && typeof chunk === 'object') {
            console.log(`Chunk ${i} keys:`, Object.keys(chunk))
            // Try common nested structures
            chunkContent = chunk.metadata?.content || chunk.page_content || chunk.document_content || ''
          }
          
          console.log(`Chunk ${i} content:`, chunkContent ? `"${chunkContent.substring(0, 100)}..."` : 'EMPTY')
          
          if (chunkContent) {
            content += (content ? '\n\n' : '') + chunkContent
          }
        }
        
        console.log('Combined content length:', content.length)
        console.log('Combined content preview:', content ? `"${content.substring(0, 200)}..."` : 'EMPTY CONTENT')
        
        if (content.trim()) {
          documentContent.value = content
          return
        } else {
          console.log('All chunks appear to be empty')
        }
      } else {
        console.log('No chunks available, length:', chunks?.length)
      }
    } catch (chunkError: any) {
      console.warn('Document chunks not available:', chunkError)
      console.warn('Error details:', {
        message: chunkError?.message,
        status: chunkError?.response?.status,
        data: chunkError?.response?.data
      })
      
      // If chunks endpoint fails, try alternative endpoint
      try {
        console.log('Trying alternative document content endpoint...')
        const contentResponse = await (api as any).api.get(`/documents/${documentId}/content`)
        console.log('Content response:', contentResponse)
        if (contentResponse.data) {
          documentContent.value = contentResponse.data
          return
        }
      } catch (contentError) {
        console.warn('Alternative content endpoint also failed:', contentError)
      }
    }
    
    // Fallback: Show document info
    console.log('Loading document info as fallback')
    const docInfo = await api.documents.getDocument(documentId)
    console.log('Document info:', docInfo)
    documentContent.value = `Document: ${docInfo.filename}\nSize: ${(docInfo.file_size / 1024).toFixed(1)} KB\nType: ${docInfo.content_type}\nStatus: ${docInfo.status}\n\nDocument content preview is not available yet.\nThe document has been processed and can be used in chat conversations.`
    
  } catch (error: any) {
    console.error('Error loading document content:', error)
    documentContent.value = 'Error loading document content. Please try again.'
  } finally {
    loadingDocumentContent.value = false
    console.log('Final document content:', documentContent.value)
  }
}

// Load content for current document in the viewer
async function loadDocumentContentForCurrent() {
  console.log('Loading content for current document:', currentDoc.value)
  if (currentDoc.value?.id) {
    console.log('Document ID:', currentDoc.value.id)
    await loadDocumentContent(currentDoc.value.id)
  } else {
    console.error('No current document or document ID')
  }
}

// Helper function to get document type styling
function getDocumentTypeClass(contentType: string) {
  if (contentType?.includes('pdf')) {
    return 'bg-red-500/20 text-red-400'
  } else if (contentType?.includes('text')) {
    return 'bg-blue-500/20 text-blue-400'
  } else if (contentType?.includes('word')) {
    return 'bg-blue-600/20 text-blue-500'
  } else {
    return 'bg-gray-500/20 text-gray-400'
  }
}

// File handling functions
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  dragCounter.value = 0
  
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
}

function handleDragEnter(event: DragEvent) {
  event.preventDefault()
  dragCounter.value++
  isDragging.value = true
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  dragCounter.value--
  if (dragCounter.value === 0) {
    isDragging.value = false
  }
}

function addFiles(files: File[]) {
  // Filter for supported file types
  const supportedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain', 'text/markdown']
  const validFiles = files.filter(file => supportedTypes.includes(file.type) || file.name.endsWith('.txt') || file.name.endsWith('.md'))
  
  if (validFiles.length !== files.length) {
    // Show warning for unsupported files
    console.warn('Some files were skipped due to unsupported format')
  }
  
  // Add valid files to selection
  selectedFiles.value = [...selectedFiles.value, ...validFiles]
  
  // Create upload items for display
  validFiles.forEach(file => {
    const uploadItem: UploadItem = {
      id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: formatFileSize(file.size),
      progress: 0,
      status: 'pending'
    }
    uploadItems.value.push(uploadItem)
  })
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function removeFile(index: number) {
  selectedFiles.value.splice(index, 1)
  uploadItems.value.splice(index, 1)
}

async function confirmUpload() {
  if (selectedFiles.value.length === 0) return
  
  // Set uploading status for all files
  uploadItems.value.forEach(item => {
    item.status = 'pending'
    item.progress = 0
  })
  
  let successCount = 0
  let failedCount = 0
  
  try {
    // Upload files one by one using document store
    for (let i = 0; i < selectedFiles.value.length; i++) {
      const file = selectedFiles.value[i]
      const uploadItem = uploadItems.value[i]
      
      try {
        console.log(`Uploading file: ${file.name}`)
        
        // Update status to show upload in progress
        uploadItem.status = 'pending'
        uploadItem.progress = 10
        
        // Use document store's upload method which handles FormData properly
        const result = await documentStore.uploadDocument(file)
        console.log(`Upload result for ${file.name}:`, result)
        
        uploadItem.status = 'success'
        uploadItem.progress = 100
        successCount++
        
      } catch (error: any) {
        console.error(`Error uploading ${file.name}:`, error)
        uploadItem.status = 'failed'
        
        // Extract error message 
        let errorMessage = 'Upload failed'
        if (error?.response?.data?.detail) {
          errorMessage = error.response.data.detail
        } else if (error?.data?.detail) {
          errorMessage = error.data.detail
        } else if (error?.message) {
          errorMessage = error.message
        }
        
        uploadItem.error = errorMessage
        failedCount++
      }
    }
    
    console.log(`Upload completed: ${successCount}/${selectedFiles.value.length} files`)
    
    // Close modal after delay if all succeeded
    if (successCount === selectedFiles.value.length) {
      setTimeout(() => {
        closeUploadModal()
      }, 2000)
    }
    
  } catch (error) {
    console.error('Upload error:', error)
  }
}

function deleteDoc(index: number) {
  const doc = realDocs.value[index]
  if (doc && confirm(`Are you sure you want to delete "${doc.filename}"?`)) {
    documentStore.deleteDocument(doc.id)
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

// Platform state
const platformSearchQuery = ref('')
const selectedPlatformApp = ref('App (All)')
const expandedFunctions = ref<Set<string>>(new Set())

// Use function store for platform functions
const platformFunctions = computed(() => {
  if (!functionStore.hasFunctions) {
    return []
  }
  
  // Convert functions to platform format
  return functionStore.availableFunctions.map(func => ({
    id: func.function_id,
    name: func.function_name,
    category: func.app || func.category,
    description: func.description,
    parameters: func.parameters,
    use_cases: func.use_cases
  })).filter(func => {
    // Filter by search query
    if (platformSearchQuery.value.trim()) {
      const query = platformSearchQuery.value.toLowerCase()
      return func.name.toLowerCase().includes(query) ||
             func.description.toLowerCase().includes(query) ||
             func.category.toLowerCase().includes(query)
    }
    
    // Filter by selected app
    if (selectedPlatformApp.value !== 'App (All)') {
      return func.category.toLowerCase() === selectedPlatformApp.value.toLowerCase()
    }
    
    return true
  })
})

// Get function counts by category for platform cards
const platformAppCounts = computed(() => {
  const counts = { browser: 0, cube: 0, terra: 0 }
  
  functionStore.availableFunctions.forEach(func => {
    const category = (func.app || func.category || '').toLowerCase()
    if (category.includes('browser')) counts.browser++
    else if (category.includes('cube')) counts.cube++
    else if (category.includes('terra')) counts.terra++
  })
  
  return counts
})

const toggleFunctionExpanded = (functionId: string) => {
  if (expandedFunctions.value.has(functionId)) {
    expandedFunctions.value.delete(functionId)
  } else {
    expandedFunctions.value.add(functionId)
  }
}

// Function to get conversation title from first user message
const getConversationTitle = (conversation: any) => {
  // If conversation has a title and it's not "New Chat", use it
  if (conversation.title && conversation.title !== "New Chat" && conversation.title.trim() !== "") {
    return conversation.title
  }
  
  if (!conversation.messages || conversation.messages.length === 0) {
    return "New Chat"
  }
  
  // Find the first user message
  const firstUserMessage = conversation.messages.find((msg: any) => msg.role === 'user')
  if (firstUserMessage) {
    const content = firstUserMessage.content || firstUserMessage.message || ''
    if (content.trim()) {
      // Limit to first 50 characters for display
      return content.length > 50 ? content.substring(0, 47) + '...' : content
    }
  }
  
  return "New Chat"
}

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
    <div 
      class="bg-surface-primary border-r border-border-primary flex flex-col row-span-3 transition-all duration-300 ease-out group"
      @mouseenter="sidebarExpanded = true"
      @mouseleave="sidebarExpanded = false"
    >
      <!-- Logo -->
      <div class="h-14 border-b border-border-primary flex items-center justify-center transition-all duration-300" :class="sidebarExpanded ? 'px-6' : 'px-4'">
        <div v-if="sidebarExpanded" class="flex items-center justify-between w-full animate-fade-in" style="animation-delay: 100ms; animation-fill-mode: forwards; opacity: 0;">
          <img src="https://api.builder.io/api/v1/image/assets/TEMP/19abb9443add1cd33dcb83c578474ebfbaa3de42?width=222" alt="AetosNeuro" class="h-5.5 w-auto transition-all duration-300" />
        </div>
        <div v-else class="flex justify-center transition-all duration-300">
          <svg class="w-8 h-5 fill-text-white transition-all duration-300 group-hover:scale-110" viewBox="0 0 34 23"><path d="M23.6128 8.25781L23.9263 8.7832H23.9312V8.78223L29.5298 7.17578L33.1763 9.92773L30.7827 9.28711L26.0347 12.2607L26.0366 12.2637L32.1909 22.4707H26.1353L26.0063 17.3301L24.2544 22.4707L21.2495 18.8477C22.7223 16.9051 24.7279 14.1225 25.8823 12.3584C25.8835 12.3566 25.8841 12.3543 25.8853 12.3525L25.8765 12.3584L24.1011 13.4717V13.4658L25.9771 12.2012H25.9761L24.1001 13.4658L19.4038 16.6318L15.5171 19.252L10.7505 22.4707H0.82373L5.56592 14.4326H17.5425L15.0493 11.4287L15.0796 11.4238L14.6313 10.8828L19.936 9.78027L13.1587 9.1084L8.99951 4.09961L18.7173 6.65137L6.12256 0.529297H18.9507L23.6128 8.25781Z"/></svg>
        </div>
      </div>

      <!-- Navigation Items -->
        <div class="flex flex-col gap-2 p-3">
          <!-- AI Assistant -->
          <button
            class="flex h-14 items-center gap-2 px-3 group/nav relative overflow-hidden transition-all duration-300 ease-out hover:scale-105"
            :class="activeTab === 'assistant' ? 'bg-white bg-opacity-10 shadow-lg' : 'hover:bg-white hover:bg-opacity-5'"
            @click="activeTab = 'assistant'"
          >
          <div class="absolute inset-0 bg-gradient-to-r from-primary-green/20 to-transparent opacity-0 transition-opacity duration-300" :class="{ 'opacity-100': activeTab === 'assistant' }"></div>
          <div class="flex items-center gap-2 relative z-10">
            <svg class="w-5 h-5 transition-all duration-300 group-hover/nav:scale-110" viewBox="0 0 20 20" fill="none" stroke="#B3B3B3" stroke-width="1.5">
              <path d="M9.16667 9.16666V5.83333M13.3333 9.16666V5.83333M17.5 1.66666H2.5V15H6.66667V18.3333L10 15H14.1667L17.5 11.6667V1.66666Z"/>
            </svg>
            <span v-if="sidebarExpanded" class="text-sm transition-all duration-300 animate-slide-in-right" style="animation-delay: 150ms; animation-fill-mode: forwards; opacity: 0;" :class="activeTab==='assistant' ? 'text-text-white font-medium' : 'text-text-neutral'">AI Assistant</span>
          </div>
        </button>

        <!-- Document -->
        <button
          class="flex h-14 items-center gap-2 px-3 group/nav relative overflow-hidden transition-all duration-300 ease-out hover:scale-105"
          :class="activeTab === 'document' ? 'bg-white bg-opacity-10 shadow-lg' : 'hover:bg-white hover:bg-opacity-5'"
          @click="activeTab = 'document'"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-primary-green/20 to-transparent opacity-0 transition-opacity duration-300" :class="{ 'opacity-100': activeTab === 'document' }"></div>
          <div class="flex items-center gap-2 relative z-10">
            <svg class="w-5 h-5 transition-all duration-300 group-hover/nav:scale-110" viewBox="0 0 20 20" fill="none" stroke="#B3B3B3" stroke-width="1.5">
              <path d="M11.6667 1.66667H5C4.55797 1.66667 4.13405 1.84227 3.82149 2.15483C3.50893 2.46739 3.33333 2.89131 3.33333 3.33334V16.6667C3.33333 17.1087 3.50893 17.5326 3.82149 17.8452C4.13405 18.1577 4.55797 18.3333 5 18.3333H15C15.442 18.3333 15.866 18.1577 16.1785 17.8452C16.4911 17.5326 16.6667 17.1087 16.6667 16.6667V6.66667M11.6667 1.66667L16.6667 6.66667M11.6667 1.66667L11.6667 6.66667H16.6667M13.3333 10.8333H6.66667M13.3333 14.1667H6.66667M8.33333 7.5H6.66667"/>
            </svg>
            <span v-if="sidebarExpanded" class="text-sm transition-all duration-300 animate-slide-in-right" style="animation-delay: 200ms; animation-fill-mode: forwards; opacity: 0;" :class="activeTab==='document' ? 'text-text-white font-medium' : 'text-text-neutral'">Document</span>
          </div>
        </button>

        <!-- Aetos Platform -->
        <button
          class="flex h-14 items-center gap-2 px-3 group/nav relative overflow-hidden transition-all duration-300 ease-out hover:scale-105"
          :class="activeTab === 'platform' ? 'bg-white bg-opacity-10 shadow-lg' : 'hover:bg-white hover:bg-opacity-5'"
          @click="activeTab = 'platform'"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-primary-green/20 to-transparent opacity-0 transition-opacity duration-300" :class="{ 'opacity-100': activeTab === 'platform' }"></div>
          <div class="flex items-center gap-2 relative z-10">
            <svg class="w-5 h-5 transition-all duration-300 group-hover/nav:scale-110" viewBox="0 0 20 20" fill="none" stroke="#B3B3B3" stroke-width="1.5">
              <path d="M13.3333 15L18.3333 10L13.3333 5M6.66667 5L1.66667 10L6.66667 15"/>
            </svg>
            <span v-if="sidebarExpanded" class="text-sm transition-all duration-300 animate-slide-in-right" style="animation-delay: 250ms; animation-fill-mode: forwards; opacity: 0;" :class="activeTab==='platform' ? 'text-text-white font-medium' : 'text-text-neutral'">Aetos Platform</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Header -->
    <div class="bg-surface-primary border-b border-border-primary flex items-center justify-between px-6 col-span-2">
      <div class="flex items-center gap-2">
        <span class="text-sm text-text-white">
          <template v-if="activeTab === 'assistant'"></template>
          <template v-else-if="activeTab === 'document'"></template>
          <template v-else></template>
        </span>
      </div>
      <div class="flex items-center gap-4">


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
      <!-- Show chat controls only in assistant tab -->
      <div v-if="activeTab === 'assistant'" class="flex items-center gap-4">

        <div class="flex border border-border-primary bg-surface-primary">
          <button class="px-3 py-2 text-sm" :class="selectedMode==='Chat' ? 'bg-surface-secondary text-text-white' : 'text-text-neutral'" @click="selectedMode='Chat'">Chat</button>
          <button class="px-3 py-2 text-sm" :class="selectedMode==='Agent' ? 'bg-surface-secondary text-text-white' : 'text-text-neutral'" @click="selectedMode='Agent'">Agent</button>
        </div>
        <button class="px-3 py-3 bg-primary-green text-text-brand text-base font-medium hover:bg-primary-green/90 transition-colors">New Chat</button>
      </div>
    </div>

    <!-- Row 2 (Document header) -->
    <div v-else-if="activeTab === 'document'" class="bg-surface-primary border-b border-border-primary flex items-center justify-between px-6 col-span-2">
      <div class="flex items-center gap-4">
        <div class="flex flex-col justify-center">
          <h1 class="text-xl font-light text-text-white">Document Management</h1>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <button 
          @click="openUploadModal"
          class="px-3 py-3 bg-primary-green text-text-brand text-base font-medium hover:bg-primary-green/90 transition-colors"
        >
          Upload Document
        </button>
      </div>
    </div>

    <!-- Row 2 (Platform header) -->
    <div v-else class="bg-surface-primary border-b border-border-primary flex items-center justify-between px-6 col-span-2">
      <div class="flex items-center gap-4">
        <div class="flex flex-col justify-center">
          <h1 class="text-xl font-light text-text-white">Aetos Platform</h1>
        </div>
      </div>
    </div>

    <!-- Content columns vary per tab -->

    <!-- Left column (340px) -->
    <div class="bg-surface-primary border-r border-t border-border-primary flex flex-col overflow-hidden h-full">
      <!-- Assistant: search + empty chat list -->
      <template v-if="activeTab === 'assistant'">
        <div class="p-5 border-b border-border-primary flex-shrink-0">
          <div class="relative">
            <input type="text" placeholder="Search" class="w-full h-12 px-3 pr-10 bg-surface-primary border border-border-primary text-text-neutral placeholder-text-neutral text-sm focus:outline-none focus:border-primary-green" />
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 14L11.1 11.1M12.6667 7.33333C12.6667 10.2789 10.2789 12.6667 7.33333 12.6667C4.38781 12.6667 2 10.2789 2 7.33333C2 4.38781 4.38781 2 7.33333 2C10.2789 2 12.6667 4.38781 12.6667 7.33333Z"/></svg>
          </div>
        </div>
        <div v-if="!chatStore.hasConversations && !chatStore.isLoading" class="flex-1 flex flex-col items-center justify-center gap-3 px-6">
          <svg class="w-12 h-12 text-text-neutral" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M42 30C42 31.0609 41.5786 32.0783 40.8284 32.8284C40.0783 33.5786 39.0609 34 38 34H14L6 42V10C6 8.93913 6.42143 7.92172 7.17157 7.17157C7.92172 6.42143 8.93913 6 10 6H38C39.0609 6 40.0783 6.42143 40.8284 7.17157C41.5786 7.92172 42 8.93913 42 10V30Z"/></svg>
          <span class="text-base text-text-tertiary">No conversation yet</span>
        </div>
        
        <div v-else-if="chatStore.isLoading" class="flex-1 flex flex-col items-center justify-center gap-3 px-6">
          <div class="w-8 h-8 border-2 border-primary-green border-t-transparent rounded-full animate-spin"></div>
          <span class="text-base text-text-tertiary">Loading conversations...</span>
        </div>
        
        <div v-else class="flex-1 overflow-hidden flex flex-col min-h-0">
          <div class="px-4 py-4 text-text-neutral text-sm flex-shrink-0">
            CONVERSATIONS ({{ chatStore.conversations.length }})
          </div>
          <div class="flex-1 overflow-y-auto scrollbar-thin min-h-0">
            <div class="flex flex-col">
              <div 
                v-for="conversation in chatStore.sortedConversations" 
                :key="conversation.id" 
                class="group flex items-center gap-3 px-4 py-4 hover:bg-surface-secondary cursor-pointer border-l-2 border-transparent flex-shrink-0"
                :class="{ 'border-l-primary-green bg-surface-secondary': chatStore.currentConversationId === conversation.id }"
                @click="chatStore.selectConversation(conversation.id)"
              >
                <div class="w-8 h-8 bg-primary-green/20 rounded flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-primary-green" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12ZM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2Z"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm text-text-white truncate">{{ conversation.title || getConversationTitle(conversation) }}</div>
                  <div class="text-xs text-text-neutral">{{ conversation.messages?.length || 0 }} messages</div>
                  <div class="text-xs text-text-neutral">{{ new Date(conversation.updated_at).toLocaleDateString() }}</div>
                </div>
                <button 
                  class="w-5 h-5 text-text-neutral hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  @click.stop="chatStore.deleteConversation(conversation.id)"
                  title="Delete conversation"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                    <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </div>
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
          <button 
            @click="documentStore.loadDocuments()" 
            class="px-3 py-1 text-xs border border-border-primary text-text-white hover:border-primary-green"
          >
            Refresh (Debug)
          </button>
        </div>
        <div v-else class="flex-1 overflow-auto">
          <div class="px-4 py-4 text-text-neutral">HISTORY ({{ realDocs.length }} documents)</div>
          <div class="flex flex-col divide-y divide-border-primary">
            <div v-for="(d, idx) in realDocs" :key="d.id" class="flex items-center gap-3 px-4 py-4 hover:bg-surface-secondary cursor-pointer" 
                 @click="selectedDocIndex = idx">
              <div class="w-10 h-10 flex items-center justify-center">
                <div class="w-8 h-10 rounded flex items-center justify-center" :class="getDocumentTypeClass(d.content_type)">
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path v-if="d.content_type?.includes('pdf')" d="M12,2A3,3 0 0,1 15,5V7H19A2,2 0 0,1 21,9V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V9A2,2 0 0,1 5,7H9V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V7H13V5A1,1 0 0,0 12,4Z"/>
                    <path v-else-if="d.content_type?.includes('text')" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    <path v-else-if="d.content_type?.includes('word')" d="M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6M6,4H13V9H18V20H6V4Z"/>
                    <path v-else d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
              </div>
              <div class="flex-1">
                <div class="text-base text-text-white">{{ d.name }}</div>
                <div class="text-sm text-text-neutral">{{ d.size }}</div>
                <div class="text-xs text-text-neutral">{{ d.status }}</div>
              </div>
              <button class="w-5 h-5" @click.stop="deleteDoc(idx)">
                <svg viewBox="0 0 20 20" fill="none" stroke="white"><path d="M2.5 5H17.5M15.833 5V16.667C15.833 17.5 15 18.333 14.167 18.333H5.833C5 18.333 4.167 17.5 4.167 16.667V5M6.667 5V3.333C6.667 2.5 7.5 1.667 8.333 1.667H11.667C12.5 1.667 13.333 2.5 13.333 3.333V5M8.333 9.167V14.167M11.667 9.167V14.167" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      </template>

    </div>

    <!-- Right main content -->
    <div 
      class="bg-surface-primary flex flex-col border-t border-border-primary overflow-hidden transition-all duration-300"
      :class="activeTab === 'platform' ? 'col-span-1' : ''"
    >
      <!-- Tab transition wrapper with enhanced animations -->
      <transition 
        name="tab-transition" 
        mode="out-in"
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 transform translate-y-4 scale-98"
        enter-to-class="opacity-100 transform translate-y-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 transform translate-y-0 scale-100"
        leave-to-class="opacity-0 transform translate-y-2 scale-98"
      >
        <div :key="activeTab" class="h-full flex flex-col">
          <!-- Assistant main -->
          <template v-if="activeTab === 'assistant'">
            <!-- Welcome screen when no conversation is selected -->
            <div v-if="!chatStore.currentConversation" class="flex-1 flex flex-col items-center justify-center gap-6 px-12 py-20">
            <div class="flex flex-col items-center gap-10 max-w-4xl animate-fade-in-up" style="animation-delay: 200ms; animation-fill-mode: forwards; opacity: 0;">
              <div class="w-18 h-18 bg-primary-green border-2 border-primary-green rounded flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg">
                <svg class="w-15 h-10 fill-text-brand transition-all duration-300" viewBox="0 0 62 42"><path d="M43.6582 14.7939L44.2578 15.7988H44.2676L46.2676 19.1152L48.2012 22.3213V22.332L48.2021 22.3311V22.3213L46.2686 19.1152L44.2686 15.7979L54.9844 12.7227L61.9658 17.9893L57.3838 16.7637L48.293 22.457L48.2969 22.4629L60.0791 42.001H48.4873L48.2402 32.1611L44.8867 42.001L39.1338 35.0654C41.9531 31.3469 45.7921 26.0205 48.002 22.6436C48.0044 22.6398 48.0063 22.6356 48.0088 22.6318L47.9922 22.6426L44.5918 24.7734V24.7637L35.5996 30.8242L28.1611 35.8389L19.0361 42H0.0341797L9.11133 26.6133H32.0381L27.2656 20.8643L27.3232 20.8545L26.4658 19.8193L36.6191 17.708L23.6465 16.4219L15.6836 6.83398L34.2861 11.7178L10.1777 -0.000976562H34.7334L43.6582 14.7939Z"/></svg>
              </div>
              <div class="text-center">
                <h2 class="text-2xl font-normal text-text-white mb-2 tracking-tight">How can I help you?</h2>
                <p class="text-base text-text-neutral">Let's start your conversation</p>
              </div>
              <div class="flex gap-6">
                <button 
                  @click="selectedMode = 'Chat'"
                  :class="[
                    'flex border transition-all duration-300 hover:border-primary-green hover:shadow-lg hover:scale-105 hover:-translate-y-1',
                    selectedMode === 'Chat' 
                      ? 'border-primary-green bg-primary-green/10 shadow-lg transform scale-105' 
                      : 'border-border-primary hover:bg-surface-secondary/50'
                  ]"
                >
                  <div class="px-4 py-6 flex flex-col items-center gap-4">
                    <div class="p-3 bg-opacity-200 rounded transition-all duration-300">
                      <svg 
                        class="w-10 h-10 transition-all duration-300" 
                        viewBox="0 0 40 40" 
                        fill="none" 
                        :stroke="selectedMode === 'Chat' ? '#BEF975' : '#8E8E93'" 
                        stroke-width="2"
                      >
                      <path d="M13.3333 16.6667H13.35M20 16.6667H20.0167M26.6667 16.6667H26.6833M35 25C35 25.8841 34.6488 26.7319 34.0237 27.357C33.3986 27.9821 32.5507 28.3333 31.6667 28.3333H11.6667L5 35V8.33333C5 7.44928 5.35119 6.60143 5.97631 5.97631C6.60143 5.35119 7.44928 5 8.33333 5H31.6667C32.5507 5 33.3986 5.35119 34.0237 5.97631C34.6488 6.60143 35 7.44928 35 8.33333V25Z"/>
                    </svg>
                  </div>
                  <div class="text-center">
                    <div :class="[
                      'text-lg font-medium',
                      selectedMode === 'Chat' ? 'text-primary-green' : 'text-text-white'
                    ]">Chat</div>
                    <div class="text-base text-text-neutral">Regular Conversation Mode</div>
                  </div>
                </div>
              </button>
              <button 
                @click="selectedMode = 'Agent'"
                :class="[
                  'flex border transition-all duration-200 hover:border-primary-green hover:shadow-lg',
                  selectedMode === 'Agent' 
                    ? 'border-primary-green bg-primary-green/10 shadow-lg' 
                    : 'border-border-primary hover:bg-surface-secondary/50'
                ]"
              >
                <div class="px-4 py-6 flex flex-col items-center gap-4">
                  <div class="p-3 bg-opacity-200 rounded">
                    <svg 
                      class="w-10 h-10" 
                      viewBox="0 0 40 40" 
                      fill="none" 
                      :stroke="selectedMode === 'Agent' ? '#BEF975' : '#8E8E93'" 
                      stroke-width="2"
                    >
                      <path d="M20 10V3.33334H13.3334M3.33337 20H6.66671M15 18.3333V21.6667M25 18.3333V21.6667M33.3334 20H36.6667M13.3334 30L6.66671 36.6667V13.3333C6.66671 12.4493 7.0179 11.6014 7.64302 10.9763C8.26814 10.3512 9.11599 10 10 10H30C30.8841 10 31.7319 10.3512 32.3571 10.9763C32.9822 11.6014 33.3334 12.4493 33.3334 13.3333V26.6667C33.3334 27.5507 32.9822 28.3986 32.3571 29.0237C31.7319 29.6488 30.8841 30 30 30H13.3334Z"/>
                    </svg>
                  </div>
                  <div class="text-center">
                    <div :class="[
                      'text-lg font-medium',
                      selectedMode === 'Agent' ? 'text-primary-green' : 'text-text-white'
                    ]">Agent</div>
                    <div class="text-base text-text-neutral">Smart document capabilities</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Chat interface when conversation is selected -->
        <div v-else class="flex-1 flex flex-col overflow-hidden">
          <!-- Chat header -->
          <div class="border-b border-border-primary bg-surface-primary px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <h3 class="text-lg text-text-white">{{ getConversationTitle(chatStore.currentConversation) }}</h3>
              <span class="px-2 py-1 bg-primary-green/20 text-primary-green text-xs rounded">{{ selectedMode }}</span>
            </div>
            <div class="flex items-center gap-2">
              <button 
                @click="startNewChat"
                class="px-3 py-2 text-sm text-text-neutral hover:text-text-white transition-colors"
              >
                New Chat
              </button>
              <button 
                @click="chatStore.clearCurrentConversation"
                class="w-8 h-8 text-text-neutral hover:text-text-white transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Messages area -->
          <div class="flex-1 overflow-auto p-6 space-y-4">
            <div v-if="chatStore.messages.length === 0" class="flex items-center justify-center h-full text-text-neutral">
              <p>No messages yet. Start the conversation!</p>
            </div>
            
            <div v-for="message in chatStore.messages" :key="message.id" class="flex gap-4">
              <!-- User message -->
              <div v-if="message.role === 'user'" class="flex gap-3 max-w-[80%] ml-auto">
                <div class="flex flex-col gap-1">
                  <div class="bg-primary-green text-text-brand px-4 py-3 rounded-lg rounded-br-sm">
                    <MarkdownRenderer :content="(message as any).content || (message as any).message" />
                  </div>
                  <div class="text-xs text-text-neutral text-right">
                    {{ new Date((message as any).timestamp || (message as any).date).toLocaleTimeString() }}
                  </div>
                </div>
                <div class="w-8 h-8 bg-primary-green rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-text-brand" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"/>
                  </svg>
                </div>
              </div>

              <!-- Assistant message -->
              <div v-else class="flex gap-3 max-w-[80%]">
                <div class="w-8 h-8 bg-surface-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-primary-green" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492ZM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0Z"/>
                    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319Z"/>
                  </svg>
                </div>
                <div class="flex flex-col gap-1">
                  <div 
                    class="bg-surface-secondary text-text-white px-4 py-3 rounded-lg rounded-bl-sm"
                    :class="{ 'border border-red-500': message.error }"
                  >
                    <MarkdownRenderer :content="(message as any).content || (message as any).message" />
                  </div>
                  <div class="text-xs text-text-neutral">
                    {{ new Date((message as any).timestamp || (message as any).date).toLocaleTimeString() }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Loading indicator -->
            <div v-if="chatStore.isStreaming" class="flex gap-3 max-w-[80%]">
              <div class="w-8 h-8 bg-surface-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-primary-green" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492ZM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0Z"/>
                  <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319Z"/>
                </svg>
              </div>
              <div class="flex flex-col gap-1">
                <div class="bg-surface-secondary text-text-white px-4 py-3 rounded-lg rounded-bl-sm">
                  <div class="flex items-center gap-2">
                    <div class="flex gap-1">
                      <div class="w-2 h-2 bg-primary-green rounded-full animate-bounce"></div>
                      <div class="w-2 h-2 bg-primary-green rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                      <div class="w-2 h-2 bg-primary-green rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    </div>
                    <span class="text-text-neutral text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area with enhanced styling and animations -->
        <div class="border-t border-border-primary bg-surface-primary px-10 py-4 transition-all duration-300 hover:bg-surface-secondary/30">
          <div class="flex gap-3 items-center">
            <div class="flex-1 relative group">
              <input 
                v-model="chatInput" 
                @keypress.enter="sendChatMessage"
                :disabled="chatStore.isLoading"
                placeholder="Describe your thinking..."
                class="w-full px-4 py-3 bg-surface-primary text-text-white placeholder-text-neutral text-sm focus:outline-none transition-all duration-300 focus-ring hover:bg-surface-secondary/30 disabled:opacity-50"
              />
              <!-- Animated border effect -->
              <div class="absolute inset-0 rounded bg-gradient-to-r from-primary-green/20 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none group-focus-within:opacity-100"></div>
            </div>
            <div class="flex items-center gap-3">
              <button 
                @click="startNewChat"
                class="px-4 py-3 border border-border-secondary text-sm text-text-white hover:border-primary-green transition-all duration-300 hover:scale-105 hover:shadow-lg micro-bounce"
              >
                Start New Chat
              </button>
              <button class="w-10 h-10 border border-border-primary bg-surface-primary flex items-center justify-center hover:border-primary-green transition-all duration-300 hover:scale-110 micro-bounce">
                <svg class="w-4.5 h-4.5 transition-all duration-300" viewBox="0 0 18 18" fill="none" stroke="#444444" stroke-width="1">
                  <path d="M13 7.72727V9C13 10.1814 12.5786 11.3144 11.8284 12.1498C11.0783 12.9852 10.0609 13.4545 9 13.4545M9 13.4545C7.93913 13.4545 6.92172 12.9852 6.17157 12.1498C5.42143 11.3144 5 10.1814 5 9V7.72727M9 13.4545V16M6.71429 16H11.2857M9 2C8.54534 2 8.10931 2.20114 7.78782 2.55916C7.46633 2.91718 7.28571 3.40277 7.28571 3.90909V9C7.28571 9.50632 7.46633 9.99191 7.78782 10.3499C8.10931 10.708 8.54534 10.9091 9 10.9091C9.45466 10.9091 9.89069 10.708 10.2122 10.3499C10.5337 9.99191 10.7143 9.50632 10.7143 9V3.90909C10.7143 3.40277 10.5337 2.91718 10.2122 2.55916C9.89069 2.20114 9.45466 2 9 2Z"/>
                </svg>
              </button>
              <button 
                @click="sendChatMessage" 
                :disabled="!chatInput.trim() || chatStore.isLoading"
                class="w-10 h-10 border border-primary-green bg-primary-green flex items-center justify-center hover:bg-primary-green/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 hover:shadow-lg btn-primary micro-bounce"
                :class="{ 'animate-pulse-glow': !chatInput.trim() && !chatStore.isLoading }"
              >
                <svg v-if="!chatStore.isLoading" class="w-4.5 h-4.5 fill-text-brand transition-all duration-300" viewBox="0 0 18 18">
                  <path d="M3.86462 1.6764C2.43116 0.959877 0.93044 2.5247 1.70969 3.92695L3.89776 7.86431C4.03005 8.10237 4.28099 8.25 4.55334 8.25L9 8.25C9.41421 8.25 9.75 8.58579 9.75 9C9.75 9.41421 9.41421 9.75 9 9.75L4.55349 9.75C4.28115 9.75 4.03021 9.89763 3.89792 10.1357L1.70969 14.0733C0.930439 15.4756 2.43116 17.0404 3.86462 16.3239L15.5985 10.4587C16.8006 9.85778 16.8006 8.14251 15.5985 7.5416L3.86462 1.6764Z"/>
                </svg>
                <div v-else class="w-4 h-4 border-2 border-text-brand border-t-transparent rounded-full animate-spin"></div>
              </button>
            </div>
          </div>
          <div v-if="chatStore.error" class="text-red-400 text-sm mt-2 animate-fade-in" style="animation-fill-mode: forwards; opacity: 0;">
            {{ chatStore.error }}
          </div>
        </div>
      </template>

      <!-- Document main with enhanced animations -->
      <template v-else-if="activeTab === 'document'" key="document">
        <div v-if="!hasDocs" class="flex-1 flex items-center justify-center">
          <div class="flex flex-col items-center justify-center gap-8 opacity-0 animate-fade-in-up" style="animation-delay: 200ms;">
            <div class="text-2xl text-text-white text-center gradient-text">Upload to view your document</div>
            <div class="border border-dashed border-border-secondary bg-surface-secondary p-12 flex flex-col items-center gap-4 w-[480px] h-[200px] justify-center cursor-pointer hover:border-primary-green transition-all duration-300 hover:scale-105 hover:shadow-lg hover-lift" @click="openUploadModal">
              <svg class="w-16 h-16 transition-all duration-300 micro-grow" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M49 35V44.3333C49 45.571 48.5083 46.758 47.6332 47-6332C46.758 48.5083 45.571 49 44.3333 49H11.6667C10.429 49 9.242 48.5083 8.36683 47.6332C7.49167 46.758 7 45.571 7 44.3333V35M39.6667 18.6667L28 7M28 7L16.3333 18.6667M28 7V35" stroke="#BEF975" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <div class="text-lg text-text-white text-center">Drag and drop AOI files here.</div>
            </div>
          </div>
        </div>
        <div v-else class="flex-1">
          <!-- Document Content Viewer -->
          <div class="w-full h-full overflow-auto flex flex-col">
            <!-- Document Header -->
            <div class="flex items-center justify-between p-4 border-b border-border-primary bg-surface-secondary">
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 rounded flex items-center justify-center" :class="getDocumentTypeClass(currentDoc?.content_type)">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path v-if="currentDoc?.content_type?.includes('pdf')" d="M12,2A3,3 0 0,1 15,5V7H19A2,2 0 0,1 21,9V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V9A2,2 0 0,1 5,7H9V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V7H13V5A1,1 0 0,0 12,4Z"/>
                    <path v-else-if="currentDoc?.content_type?.includes('text')" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    <path v-else-if="currentDoc?.content_type?.includes('word')" d="M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6M6,4H13V9H18V20H6V4Z"/>
                    <path v-else d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-medium text-text-white">{{ currentDoc?.filename || 'No Document Selected' }}</h3>
                  <div class="text-xs text-text-neutral">{{ currentDoc?.size }} • {{ currentDoc?.content_type }}</div>
                </div>
              </div>
              <button 
                v-if="currentDoc && currentDoc.status === 'completed'" 
                class="px-3 py-1 text-xs bg-primary-green/20 text-primary-green rounded hover:bg-primary-green/30 transition-colors"
                @click="loadDocumentContentForCurrent()"
              >
                Load Content
              </button>
            </div>
            
            <!-- Document Content -->
            <div class="flex-1 overflow-hidden">
              <div v-if="!currentDoc" class="flex items-center justify-center h-full">
                <div class="text-center text-text-neutral">
                  <div class="text-lg mb-2">📄</div>
                  <div>Select a document to view its content</div>
                </div>
              </div>
              
              <div v-else-if="currentDoc.status !== 'completed'" class="flex items-center justify-center h-full">
                <div class="text-center text-text-neutral">
                  <div class="text-lg mb-2">⏳</div>
                  <div>Document is {{ currentDoc.status === 'processing' ? 'being processed' : 'not available' }}</div>
                  <div class="text-sm mt-2">Status: {{ currentDoc.status }}</div>
                </div>
              </div>
              
              <div v-else-if="loadingDocumentContent" class="flex items-center justify-center h-full">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-6 h-6 border-2 border-primary-green border-t-transparent rounded-full animate-spin"></div>
                  <span class="text-text-neutral text-sm">Loading document content...</span>
                </div>
              </div>
              
              <div v-else-if="documentContent" class="h-full overflow-y-auto scrollbar-thin p-4">
                <pre class="whitespace-pre-wrap text-text-white text-sm leading-relaxed font-mono">{{ documentContent }}</pre>
              </div>
              
              <div v-else class="flex items-center justify-center h-full">
                <div class="text-center text-text-neutral">
                  <div class="text-lg mb-2">📄</div>
                  <div>Click "Load Content" to view document text</div>
                  <div class="text-sm mt-2">{{ currentDoc?.filename }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload Modal -->
        <div v-if="showUploadModal" class="fixed inset-0 z-50">
          <div class="absolute inset-0 bg-black/80" @click="closeUploadModal"></div>
          <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] bg-surface-primary border border-border-primary">
            <div class="flex items-center justify-between px-6 py-4 border-b border-white/20">
              <div class="text-lg text-text-white">Upload Document</div>
              <button class="w-6 h-6" @click="closeUploadModal">
                <svg viewBox="0 0 24 24" fill="white"><path d="M3.219 4.281a1 1 0 0 1 1.414 0L12 11.647l7.367-7.366a1 1 0 1 1 1.414 1.414L13.415 13.06l7.366 7.367a1 1 0 0 1-1.414 1.414L12 14.475l-7.367 7.366A1 1 0 0 1 3.219 20.427L10.586 13.06 3.219 5.695a1 1 0 0 1 0-1.414Z"/></svg>
              </button>
            </div>
            <div class="p-6 flex flex-col gap-4 max-h-[480px] overflow-auto">
              <!-- Drop Area -->
              <div 
                class="border border-dashed border-border-secondary bg-surface-secondary p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors"
                :class="isDragging ? 'border-primary-green bg-primary-green/10' : 'hover:border-primary-green'"
                @click="triggerFileInput"
                @drop="handleDrop"
                @dragover="handleDragOver"
                @dragenter="handleDragEnter"
                @dragleave="handleDragLeave"
              >
                <svg class="w-14 h-14" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M49 35V44.3333C49 45.571 48.5083 46.758 47.6332 47.6332C46.758 48.5083 45.571 49 44.3333 49H11.6667C10.429 49 9.242 48.5083 8.36683 47.6332C7.49167 46.758 7 45.571 7 44.3333V35M39.6667 18.6667L28 7M28 7L16.3333 18.6667M28 7V35" stroke="#BEF975" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <div class="text-base text-text-white text-center">
                  <div>{{ isDragging ? 'Drop files here' : 'Drag and drop files here or click to browse' }}</div>
                  <div class="text-sm text-text-neutral mt-1">Supports PDF, DOCX, TXT, MD files (max 10MB)</div>
                </div>
              </div>

              <!-- Hidden file input -->
              <input
                ref="fileInput"
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt,.md"
                @change="handleFileSelect"
                class="hidden"
              />

              <!-- Upload Progress -->
              <div v-if="uploadItems.length > 0">
                <div v-for="(u, index) in uploadItems" :key="u.id" class="border border-border-primary p-3 space-y-2">
                  <div class="flex items-center gap-2">
                    <svg class="w-8 h-8" viewBox="0 0 32 32" fill="#B3B3B3"><path d="M26.92 8.865 19.71 1.645 19.56 1.5H7A2.5 2.5 0 0 0 4.5 4v24A2.5 2.5 0 0 0 7 30.5h18A2.5 2.5 0 0 0 27.5 28V8.94l-.58-.075ZM19.855 3.205l5.44 5.44H20.855a1.49 1.49 0 0 1-1.49-1.49V3.205Z"/></svg>
                    <div class="flex-1">
                      <div class="text-sm text-text-white">{{ u.name }}</div>
                      <div class="text-xs text-text-neutral">{{ u.size }}</div>
                      <div v-if="u.error" class="text-xs text-red-400 mt-1">{{ u.error }}</div>
                    </div>
                    <div class="flex items-center gap-2">
                      <!-- Remove file button (only if not uploading) -->
                      <button 
                        v-if="u.status === 'pending' && u.progress === 0"
                        @click="removeFile(index)"
                        class="w-6 h-6 text-text-neutral hover:text-red-400"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.219 4.281a1 1 0 0 1 1.414 0L12 11.647l7.367-7.366a1 1 0 1 1 1.414 1.414L13.415 13.06l7.366 7.367a1 1 0 0 1-1.414 1.414L12 14.475l-7.367 7.366A1 1 0 0 1 3.219 20.427L10.586 13.06 3.219 5.695a1 1 0 0 1 0-1.414Z"/></svg>
                      </button>
                      <!-- Status icon -->
                      <div class="w-4 h-4">
                        <svg v-if="u.status==='success'" class="w-4 h-4 text-primary-green" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.5 15L6 12.5l1.5-1.5 3 3 7-7L19 8.5l-8.5 8.5z"/></svg>
                        <svg v-else-if="u.status==='failed'" class="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 11.5L15 15l-3-3-3 3-1.5-1.5 3-3-3-3L9 6l3 3 3-3 1.5 1.5-3 3 3 3z"/></svg>
                        <div v-else-if="u.status==='pending' && u.progress > 0" class="w-4 h-4 border-2 border-primary-green border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                  </div>
                  <!-- Progress bar -->
                  <div class="relative h-2">
                    <div class="absolute inset-y-0 left-0 right-0 bg-border-primary rounded"></div>
                    <div
                      class="absolute inset-y-0 left-0 rounded transition-all duration-300"
                      :class="u.status==='failed' ? 'bg-red-400' : 'bg-primary-green'"
                      :style="{ width: (u.status==='failed' ? Math.max(10, u.progress) : u.progress) + '%' }"
                    ></div>
                    <div class="absolute right-0 -top-5 text-xs" :class="u.status==='failed' ? 'text-red-400' : 'text-primary-green'">
                      {{ u.status==='failed' ? 'Failed' : u.status==='success' ? 'Complete' : u.progress + '%' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="px-6 py-3 border-t border-white/20 flex items-center justify-between">
              <div class="text-xs text-primary-green">
                {{ uploadItems.filter(u => u.status === 'success').length > 0 ? `Success ${uploadItems.filter(u => u.status === 'success').length}/${uploadItems.length}` : '' }}
              </div>
              <div class="flex items-center gap-3">
                <button 
                  class="px-4 py-2 border border-border-primary text-text-white hover:border-text-white transition-colors" 
                  @click="closeUploadModal"
                >
                  Cancel
                </button>
                <button 
                  v-if="selectedFiles.length > 0"
                  class="px-4 py-2 bg-primary-green text-text-brand hover:bg-primary-green/90 transition-colors disabled:opacity-50" 
                  @click="confirmUpload"
                  :disabled="uploadItems.some(u => u.status === 'pending' && u.progress > 0)"
                >
                  {{ uploadItems.some(u => u.status === 'pending' && u.progress > 0) ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)` }}
                </button>
              </div>
              <div class="text-xs text-red-400">
                {{ uploadItems.filter(u => u.status === 'failed').length > 0 ? `Failed ${uploadItems.filter(u => u.status === 'failed').length}/${uploadItems.length}` : '' }}
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Platform main -->
      <template v-else>
        <!-- Platform Cards Section -->
        <div class="p-6 border-b border-border-primary">
            <div class="grid grid-cols-3 gap-4 max-w-6xl">
              <!-- Aetos Browser Card -->
              <div class="border border-border-primary bg-surface-secondary p-4">
                <div class="flex items-start gap-3 mb-3">
                  <div class="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <img src="/src/assets/logos/aetos-browser-logo.svg" alt="Aetos Browser" class="w-8 h-8" />
                  </div>
                  <div class="flex-1">
                    <h3 class="text-base font-medium text-text-white">Aetos Browser</h3>
                    <p class="text-sm text-text-neutral">Satellite Imagery Platform</p>
                  </div>
                </div>
                <p class="text-sm text-text-neutral mb-3">Search, download, and manage satellite imagery from multiple providers</p>
                <div class="text-xs text-primary-green font-medium">{{ platformAppCounts.browser }} functions available</div>
              </div>

              <!-- Aetos Cube Card -->
              <div class="border border-border-primary bg-surface-secondary p-4">
                <div class="flex items-start gap-3 mb-3">
                  <div class="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <img src="/src/assets/logos/aetos-cube-logo.svg" alt="Aetos Cube" class="w-8 h-8" />
                  </div>
                  <div class="flex-1">
                    <h3 class="text-base font-medium text-text-white">Aetos Cube</h3>
                    <p class="text-sm text-text-neutral">Datacube Platform</p>
                  </div>
                </div>
                <p class="text-sm text-text-neutral mb-3">Store, query, and analyze geospatial datasets in datacube format</p>
                <div class="text-xs text-primary-green font-medium">{{ platformAppCounts.cube }} functions available</div>
              </div>

              <!-- Aetos Terra Card -->
              <div class="border border-border-primary bg-surface-secondary p-4">
                <div class="flex items-start gap-3 mb-3">
                  <div class="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <img src="/src/assets/logos/aetos-terra-logo.svg" alt="Aetos Terra" class="w-8 h-8" />
                  </div>
                  <div class="flex-1">
                    <h3 class="text-base font-medium text-text-white">Aetos Terra</h3>
                    <p class="text-sm text-text-neutral">3D Visualization & Analysis</p>
                  </div>
                </div>
                <p class="text-sm text-text-neutral mb-3">3D visualization, spatial analysis, and geospatial data processing</p>
                <div class="text-xs text-primary-green font-medium">{{ platformAppCounts.terra }} functions available</div>
              </div>
            </div>
          </div>

          <!-- Search Section with enhanced styling -->
          <div class="p-6 border-b border-border-primary bg-surface-secondary/30 backdrop-blur-sm">
            <div class="flex gap-3 max-w-6xl">
              <div class="relative flex-1 group">
                <input 
                  v-model="platformSearchQuery"
                  type="text" 
                  placeholder="Search functions..." 
                  class="w-full h-12 px-3 pr-10 bg-surface-primary border border-border-primary text-text-neutral placeholder-text-neutral text-sm focus:outline-none focus:border-primary-green transition-all duration-300 focus-ring hover:bg-surface-secondary/30" 
                />
                <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-white transition-all duration-300 group-focus-within:text-primary-green group-hover:scale-110" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 14L11.1 11.1M12.6667 7.33333C12.6667 10.2789 10.2789 12.6667 7.33333 12.6667C4.38781 12.6667 2 10.2789 2 7.33333C2 4.38781 4.38781 2 7.33333 2C10.2789 2 12.6667 4.38781 12.6667 7.33333Z"/></svg>
                <!-- Animated focus border -->
                <div class="absolute inset-0 rounded bg-gradient-to-r from-primary-green/20 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none group-focus-within:opacity-100"></div>
              </div>
              <div class="relative group">
                <select 
                  v-model="selectedPlatformApp"
                  class="h-12 px-4 pr-8 bg-surface-primary border border-border-primary text-text-white text-sm focus:outline-none focus:border-primary-green appearance-none min-w-[120px] transition-all duration-300 hover:bg-surface-secondary/30 focus-ring"
                >
                  <option>App (All)</option>
                  <option>Browser</option>
                  <option>Cube</option>
                  <option>Terra</option>
                </select>
                <svg class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-white pointer-events-none transition-all duration-300 group-hover:text-primary-green" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 10.5L3.5 6L4.5 5L8 8.5L11.5 5L12.5 6L8 10.5Z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Function List with enhanced loading states -->
          <div class="flex-1 overflow-auto p-6">
            <!-- Enhanced loading state with skeleton loaders -->
            <div v-if="functionStore.isLoading" class="space-y-4">
              <div class="text-center mb-8">
                <div class="w-8 h-8 border-2 border-primary-green border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p class="text-text-neutral animate-fade-in" style="animation-fill-mode: forwards; opacity: 0;">Loading functions...</p>
              </div>
              <!-- Skeleton loading cards -->
              <div v-for="i in 3" :key="i" class="border border-border-primary bg-surface-secondary">
                <div class="p-4 flex items-center justify-between">
                  <div class="flex items-center gap-4 flex-1">
                    <div class="flex items-center gap-3 flex-1">
                      <div class="h-4 bg-border-primary rounded skeleton-loading" style="width: 120px;"></div>
                      <div class="h-6 bg-border-primary rounded skeleton-loading" style="width: 60px;"></div>
                    </div>
                  </div>
                  <div class="w-4 h-4 bg-border-primary rounded skeleton-loading"></div>
                </div>
              </div>
            </div>
            
            <!-- Enhanced error state -->
            <div v-else-if="functionStore.error" class="flex items-center justify-center py-12">
              <div class="text-center animate-fade-in-up" style="animation-delay: 200ms; animation-fill-mode: forwards; opacity: 0;">
                <div class="w-16 h-16 mx-auto mb-4 text-red-400 animate-bounce">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
                    <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/>
                  </svg>
                </div>
                <p class="text-text-neutral mb-2 text-lg">Failed to load functions</p>
                <p class="text-sm text-red-400 mb-4">{{ functionStore.error }}</p>
                <button 
                  @click="functionStore.loadAvailableFunctions()"
                  class="px-6 py-3 bg-primary-green text-text-brand text-sm hover:bg-primary-green/90 transition-all duration-300 hover:scale-105 hover:shadow-lg btn-primary micro-bounce"
                >
                  Try Again
                </button>
              </div>
            </div>
            
            <!-- Enhanced empty state -->
            <div v-else-if="!functionStore.hasFunctions" class="flex items-center justify-center py-12">
              <div class="text-center animate-fade-in-up" style="animation-delay: 200ms; animation-fill-mode: forwards; opacity: 0;">
                <div class="w-16 h-16 mx-auto mb-4 text-text-neutral animate-pulse">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
                    <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                  </svg>
                </div>
                <p class="text-text-neutral text-lg gradient-text">No functions available</p>
                <p class="text-sm text-text-tertiary mt-2">Functions will appear here when the backend is running</p>
              </div>
            </div>
            
            <!-- Function list with enhanced animations -->
            <div v-else class="space-y-4 max-w-6xl">
              <!-- Dynamic Function List with staggered animations -->
              <transition-group 
                name="function-list" 
                tag="div"
                class="space-y-4"
                enter-active-class="transition-all duration-500 ease-out"
                enter-from-class="opacity-0 transform translate-y-4 scale-95"
                enter-to-class="opacity-100 transform translate-y-0 scale-100"
                leave-active-class="transition-all duration-300 ease-in"
                leave-from-class="opacity-100 transform translate-y-0 scale-100"
                leave-to-class="opacity-0 transform -translate-y-4 scale-95"
              >
                <div 
                  v-for="(func, index) in platformFunctions" 
                  :key="func.id" 
                  class="border border-border-primary bg-surface-secondary hover-lift platform-card animate-fade-in"
                  :style="{ 'animation-delay': `${index * 100}ms`, 'animation-fill-mode': 'forwards', 'opacity': '0' }"
                >
                  <div 
                    class="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-primary/50 transition-all duration-300 group"
                    @click="toggleFunctionExpanded(func.id)"
                  >
                    <div class="flex items-center gap-4">
                      <div class="flex items-center gap-3">
                        <span class="text-sm text-primary-green font-medium transition-colors duration-300 group-hover:text-primary-green/80">{{ func.name }}</span>
                        <span class="px-2 py-1 bg-surface-primary text-xs text-text-neutral rounded transition-all duration-300 group-hover:bg-primary-green/20 group-hover:text-primary-green">{{ func.category }}</span>
                      </div>
                    </div>
                    <svg 
                      class="w-4 h-4 text-text-neutral transform transition-all duration-300 group-hover:text-primary-green group-hover:scale-110" 
                      :class="{ 'rotate-90': expandedFunctions.has(func.id) }"
                      viewBox="0 0 16 16" 
                      fill="currentColor"
                    >
                      <path d="M8 4L12 8L8 12L7 11L10 8L7 5L8 4Z"/>
                    </svg>
                  </div>
                  
                  <!-- Expandable content with smooth animation -->
                  <transition
                    name="expand"
                    enter-active-class="transition-all duration-300 ease-out"
                    enter-from-class="opacity-0 max-h-0 transform scale-y-0"
                    enter-to-class="opacity-100 max-h-96 transform scale-y-100"
                    leave-active-class="transition-all duration-200 ease-in"
                    leave-from-class="opacity-100 max-h-96 transform scale-y-100"
                    leave-to-class="opacity-0 max-h-0 transform scale-y-0"
                  >
                    <div 
                      v-if="expandedFunctions.has(func.id)"
                      class="px-4 pb-4 origin-top"
                    >
                      <p class="text-sm text-text-neutral mt-2 mb-3 animate-fade-in" style="animation-fill-mode: forwards; opacity: 0;">{{ func.description }}</p>
                      
                      <!-- Parameters with enhanced styling -->
                      <div v-if="func.parameters && func.parameters.length > 0" class="mb-3">
                        <h4 class="text-xs text-text-white font-medium mb-2 gradient-text">Parameters:</h4>
                        <div class="space-y-1">
                          <div 
                            v-for="(param, paramIndex) in func.parameters" 
                            :key="param.name" 
                            class="text-xs animate-slide-in-right"
                            :style="{ 'animation-delay': `${paramIndex * 50}ms`, 'animation-fill-mode': 'forwards', 'opacity': '0' }"
                          >
                            <span class="text-primary-green font-medium">{{ param.name }}</span>
                            <span v-if="param.required" class="text-red-400 ml-1">*</span>
                            <span class="text-text-neutral ml-2">{{ param.description }}</span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Use cases with enhanced styling -->
                      <div v-if="func.use_cases && func.use_cases.length > 0">
                        <h4 class="text-xs text-text-white font-medium mb-2 gradient-text">Use Cases:</h4>
                        <div class="flex flex-wrap gap-1">
                          <span 
                            v-for="(useCase, useCaseIndex) in func.use_cases.slice(0, 3)" 
                            :key="useCase"
                            class="px-2 py-1 bg-primary-green/20 text-primary-green text-xs rounded transition-all duration-300 hover:bg-primary-green/30 hover:scale-105 animate-scale-in"
                            :style="{ 'animation-delay': `${useCaseIndex * 100}ms`, 'animation-fill-mode': 'forwards', 'opacity': '0' }"
                          >
                            {{ useCase }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </transition>
                </div>
              </transition-group>
              
              <!-- No filtered results -->
              <div v-if="platformFunctions.length === 0 && functionStore.hasFunctions" class="text-center py-12">
                <p class="text-text-neutral">No functions match your search criteria</p>
                <p class="text-sm text-text-tertiary mt-1">Try adjusting your search or filter settings</p>
              </div>
            </div>
          </div>
        </template>
        </div>
      </transition>
    </div>
  </div>
  
  <!-- Enhanced floating upload button -->
  <transition
    name="fab"
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="opacity-0 transform translate-y-4 scale-0"
    enter-to-class="opacity-100 transform translate-y-0 scale-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 transform translate-y-0 scale-100"
    leave-to-class="opacity-0 transform translate-y-4 scale-0"
  >
    <button 
      v-if="activeTab==='document' && !hasDocs && !showUploadModal" 
      @click="openUploadModal"
      class="fixed bottom-6 right-6 bg-primary-green text-text-brand px-6 py-3 rounded-lg shadow-lg hover:bg-primary-green/90 transition-all duration-300 hover:scale-110 hover:shadow-xl btn-primary animate-pulse-glow group"
    >
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
        <span class="font-medium">Upload</span>
      </div>
    </button>
  </transition>
</template>

<style scoped>
/* Custom scrollbar styles */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #2a2a2a;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #444444;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #555555;
}

/* Enhanced animations */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(190, 249, 117, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(190, 249, 117, 0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

.animate-slide-in-right {
  animation: slide-in-right 0.4s ease-out forwards;
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out forwards;
}

.animate-pulse-glow {
  animation: pulse-glow 2s infinite;
}

/* Transition effects */
.tab-transition-enter-active {
  transition: all 0.4s ease-out;
}

.tab-transition-leave-active {
  transition: all 0.2s ease-in;
}

.tab-transition-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
}

.tab-transition-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.message-list-enter-active {
  transition: all 0.5s ease-out;
}

.message-list-leave-active {
  transition: all 0.3s ease-in;
}

.message-list-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.95);
}

.message-list-leave-to {
  opacity: 0;
  transform: translateY(-16px) scale(0.95);
}

.message-list-move {
  transition: transform 0.3s ease;
}

/* Hover effect enhancements */
.hover-lift {
  transition: all 0.2s ease-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Loading states */
.skeleton-loading {
  background: linear-gradient(90deg, #2a2a2a 25%, #353535 50%, #2a2a2a 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Button hover effects */
.btn-primary {
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.btn-primary:hover::before {
  left: 100%;
}

/* Platform card animations */
.platform-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.platform-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 24px rgba(190, 249, 117, 0.15);
}

/* Enhanced focus states */
.focus-ring {
  transition: all 0.2s ease-out;
}

.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(190, 249, 117, 0.3);
}

/* Smooth transitions for responsive elements */
.responsive-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Gradient text effect */
.gradient-text {
  background: linear-gradient(135deg, #BEF975, #4ADE80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Improved bounce animation */
@keyframes enhanced-bounce {
  0%, 20%, 53%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translateY(0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translateY(-6px);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translateY(-3px);
  }
  80% {
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translateY(0);
  }
  90% {
    transform: translateY(-1px);
  }
}

/* Micro-interactions */
.micro-bounce:active {
  transform: scale(0.95);
  transition: transform 0.1s ease-out;
}

.micro-grow:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease-out;
}

/* Firefox scrollbar */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #444444 #2a2a2a;
}
</style>
