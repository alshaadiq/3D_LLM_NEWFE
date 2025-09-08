import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { useBackendApi, type Document, type DocumentProcessingResult, type SearchRequest } from '@/composables/useBackendApi'

export const useDocumentStore = defineStore('document', () => {
  const api = useBackendApi()
  
  // State
  const documents = ref<Document[]>([])
  const selectedDocument = ref<Document | null>(null)
  const isLoading = ref(false)
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const error = ref<string | null>(null)
  const searchResults = ref<any[]>([])
  const isSearching = ref(false)
  const documentStats = ref<any>(null)

  // Getters
  const documentCount = computed(() => documents.value.length)
  const processingDocuments = computed(() => 
    documents.value.filter(doc => doc.status === 'processing')
  )
  const completedDocuments = computed(() => 
    documents.value.filter(doc => doc.status === 'completed')
  )
  const failedDocuments = computed(() => 
    documents.value.filter(doc => doc.status === 'failed')
  )
  const totalFileSize = computed(() => 
    documents.value.reduce((total, doc) => total + doc.file_size, 0)
  )

  // Load all documents
  const loadDocuments = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const docList = await api.listDocuments()
      documents.value = docList
      console.log('Loaded', docList.length, 'documents')
      
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to load documents'
      console.error('Load documents error:', error.value)
    } finally {
      isLoading.value = false
    }
  }

  // Upload document
  const uploadDocument = async (file: File) => {
    isUploading.value = true
    uploadProgress.value = 0
    error.value = null
    
    try {
      console.log('Uploading document:', file.name, file.size, 'bytes')
      
      const result = await api.uploadDocument(file)
      
      uploadProgress.value = 100
      console.log('Document uploaded:', result)
      
      // Reload documents to get the new one
      await loadDocuments()
      
      return result
      
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to upload document'
      console.error('Upload document error:', error.value)
      throw err
    } finally {
      isUploading.value = false
      uploadProgress.value = 0
    }
  }

  // Delete document
  const deleteDocument = async (documentId: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      await api.deleteDocument(documentId)
      
      // Remove from local state
      documents.value = documents.value.filter(doc => doc.id !== documentId)
      
      // Clear selected document if it was deleted
      if (selectedDocument.value?.id === documentId) {
        selectedDocument.value = null
      }
      
      console.log('Document deleted:', documentId)
      
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to delete document'
      console.error('Delete document error:', error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get document details
  const getDocument = async (documentId: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const document = await api.getDocument(documentId)
      selectedDocument.value = document
      console.log('Document loaded:', documentId)
      return document
      
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to load document'
      console.error('Get document error:', error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get document chunks
  const getDocumentChunks = async (documentId: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const chunks = await api.getDocumentChunks(documentId)
      console.log('Document chunks loaded:', documentId, chunks.length, 'chunks')
      return chunks
      
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to load document chunks'
      console.error('Get document chunks error:', error.value)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Search documents
  const searchDocuments = async (query: string, limit = 5, scoreThreshold = 0.0) => {
    isSearching.value = true
    error.value = null
    
    try {
      const searchRequest: SearchRequest = {
        query,
        limit,
        score_threshold: scoreThreshold
      }
      
      const results = await api.searchDocuments(searchRequest)
      searchResults.value = results.results || []
      
      console.log('Document search completed:', query, results.total_results, 'results')
      return results
      
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to search documents'
      console.error('Search documents error:', error.value)
      throw err
    } finally {
      isSearching.value = false
    }
  }

  // Load document statistics
  const loadDocumentStats = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const stats = await api.getDocumentStats()
      documentStats.value = stats
      console.log('Document stats loaded:', stats)
      return stats
      
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to load document stats'
      console.error('Load document stats error:', error.value)
    } finally {
      isLoading.value = false
    }
  }

  // Clear search results
  const clearSearchResults = () => {
    searchResults.value = []
  }

  // Clear selected document
  const clearSelectedDocument = () => {
    selectedDocument.value = null
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  // Get document status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success-600'
      case 'processing':
        return 'text-warning-600'
      case 'failed':
        return 'text-error-600'
      default:
        return 'text-surface-600'
    }
  }

  // Get document status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅'
      case 'processing':
        return '⏳'
      case 'failed':
        return '❌'
      default:
        return '📄'
    }
  }

  return {
    // State
    documents: readonly(documents),
    selectedDocument: readonly(selectedDocument),
    isLoading: readonly(isLoading),
    isUploading: readonly(isUploading),
    uploadProgress: readonly(uploadProgress),
    error: readonly(error),
    searchResults: readonly(searchResults),
    isSearching: readonly(isSearching),
    documentStats: readonly(documentStats),
    
    // Getters
    documentCount,
    processingDocuments,
    completedDocuments,
    failedDocuments,
    totalFileSize,
    
    // Actions
    loadDocuments,
    uploadDocument,
    deleteDocument,
    getDocument,
    getDocumentChunks,
    searchDocuments,
    loadDocumentStats,
    clearSearchResults,
    clearSelectedDocument,
    clearError,
    
    // Utilities
    formatFileSize,
    getStatusColor,
    getStatusIcon
  }
})
