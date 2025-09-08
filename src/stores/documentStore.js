import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBackendApi } from '../composables/useBackendApi.js'

export const useDocumentStore = defineStore('document', () => {
  const api = useBackendApi()
  
  // State
  const documents = ref([])
  const currentDocument = ref(null)
  const uploadProgress = ref({})
  const isLoading = ref(false)
  const error = ref(null)
  const searchResults = ref([])
  const isSearching = ref(false)

  // Getters
  const hasDocuments = computed(() => documents.value.length > 0)
  const sortedDocuments = computed(() => 
    [...documents.value].sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
  )
  const documentsByType = computed(() => {
    const grouped = {}
    documents.value.forEach(doc => {
      const type = doc.file_type || 'unknown'
      if (!grouped[type]) grouped[type] = []
      grouped[type].push(doc)
    })
    return grouped
  })

  // Actions
  async function loadDocuments() {
    try {
      isLoading.value = true
      error.value = null
      
      // Initialize authentication first
      await api.initAuth()
      
      const data = await api.documents.getDocuments()
      documents.value = data
    } catch (err) {
      // Don't show error for connection refused, 403, or 404 - backend might be starting or endpoint unavailable
      if (err.code !== 'ERR_NETWORK' && err.code !== 'ECONNREFUSED' && 
          err.response?.status !== 403 && err.response?.status !== 404) {
        error.value = err.message
        console.error('Failed to load documents:', err)
      } else {
        console.warn('Documents endpoint not available, starting with empty state')
      }
    } finally {
      isLoading.value = false
    }
  }

  async function uploadDocument(file) {
    const fileId = `upload-${Date.now()}-${file.name}`
    
    try {
      // Initialize progress tracking
      uploadProgress.value[fileId] = {
        name: file.name,
        size: formatFileSize(file.size),
        progress: 0,
        status: 'pending'
      }

      const onProgress = (progress) => {
        uploadProgress.value[fileId].progress = progress
      }

      const result = await api.documents.uploadDocument(file, onProgress)
      
      // Update progress to success
      uploadProgress.value[fileId].status = 'success'
      uploadProgress.value[fileId].progress = 100

      // Add to documents list
      documents.value.unshift(result)
      
      return result
      
    } catch (err) {
      // Update progress to failed
      if (uploadProgress.value[fileId]) {
        uploadProgress.value[fileId].status = 'failed'
        uploadProgress.value[fileId].error = err.message
      }
      
      error.value = err.message
      console.error('Failed to upload document:', err)
      throw err
    }
  }

  async function uploadMultipleDocuments(files) {
    const results = []
    const errors = []

    for (const file of files) {
      try {
        const result = await uploadDocument(file)
        results.push(result)
      } catch (err) {
        errors.push({ file: file.name, error: err.message })
      }
    }

    return { results, errors }
  }

  async function deleteDocument(documentId) {
    try {
      await api.documents.deleteDocument(documentId)
      
      // Remove from local state
      documents.value = documents.value.filter(doc => doc.id !== documentId)
      
      // Clear current document if it was deleted
      if (currentDocument.value?.id === documentId) {
        currentDocument.value = null
      }
      
    } catch (err) {
      error.value = err.message
      console.error('Failed to delete document:', err)
      throw err
    }
  }

  async function selectDocument(documentId) {
    try {
      isLoading.value = true
      error.value = null
      
      const document = await api.documents.getDocument(documentId)
      currentDocument.value = document
      
    } catch (err) {
      error.value = err.message
      console.error('Failed to load document:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function searchDocuments(query) {
    if (!query.trim()) {
      searchResults.value = []
      return
    }

    try {
      isSearching.value = true
      error.value = null
      
      const results = await api.documents.searchDocuments(query)
      searchResults.value = results
      
      return results
      
    } catch (err) {
      error.value = err.message
      console.error('Failed to search documents:', err)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  function clearUploadProgress(fileId = null) {
    if (fileId) {
      delete uploadProgress.value[fileId]
    } else {
      uploadProgress.value = {}
    }
  }

  function clearSearch() {
    searchResults.value = []
  }

  function clearError() {
    error.value = null
  }

  function getDocumentById(id) {
    return documents.value.find(doc => doc.id === id)
  }

  // Helper functions
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  function getFileIcon(fileType) {
    const iconMap = {
      'pdf': '📄',
      'doc': '📝',
      'docx': '📝',
      'txt': '📃',
      'xlsx': '📊',
      'xls': '📊',
      'ppt': '📈',
      'pptx': '📈',
      'default': '📄'
    }
    return iconMap[fileType?.toLowerCase()] || iconMap.default
  }

  // Initialize store
  function initialize() {
    loadDocuments()
  }

  return {
    // State
    documents,
    currentDocument,
    uploadProgress,
    isLoading,
    error,
    searchResults,
    isSearching,
    
    // Getters
    hasDocuments,
    sortedDocuments,
    documentsByType,
    
    // Actions
    loadDocuments,
    uploadDocument,
    uploadMultipleDocuments,
    deleteDocument,
    selectDocument,
    searchDocuments,
    clearUploadProgress,
    clearSearch,
    clearError,
    getDocumentById,
    formatFileSize,
    getFileIcon,
    initialize
  }
})
