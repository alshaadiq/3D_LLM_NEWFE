import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBackendApi } from '../composables/useBackendApi.js'

export const useFunctionStore = defineStore('function', () => {
  const api = useBackendApi()
  
  // State
  const availableFunctions = ref([])
  const executionHistory = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const isExecuting = ref(false)

  // Getters
  const hasFunctions = computed(() => availableFunctions.value.length > 0)
  const functionsByCategory = computed(() => {
    const grouped = {}
    availableFunctions.value.forEach(func => {
      const category = func.category || 'general'
      if (!grouped[category]) grouped[category] = []
      grouped[category].push(func)
    })
    return grouped
  })
  const recentExecutions = computed(() => 
    [...executionHistory.value]
      .sort((a, b) => new Date(b.executed_at) - new Date(a.executed_at))
      .slice(0, 10)
  )

  // Actions
  async function loadAvailableFunctions() {
    try {
      isLoading.value = true
      error.value = null
      
      // Initialize authentication first
      await api.initAuth()
      
      const data = await api.functions.getAvailableFunctions()
      availableFunctions.value = data
    } catch (err) {
      // Don't show error for connection refused or 404 - backend might be starting or endpoint unavailable
      if (err.code !== 'ERR_NETWORK' && err.code !== 'ECONNREFUSED' && err.response?.status !== 404) {
        error.value = err.message
        console.error('Failed to load functions:', err)
      } else {
        console.warn('Functions endpoint not available, starting with empty state')
      }
    } finally {
      isLoading.value = false
    }
  }

  async function executeFunction(functionName, parameters = {}) {
    try {
      isExecuting.value = true
      error.value = null

      const startTime = Date.now()
      const result = await api.functions.executeFunction(functionName, parameters)
      const endTime = Date.now()
      const executionTime = endTime - startTime

      // Add to execution history
      const execution = {
        id: `exec-${Date.now()}`,
        function_name: functionName,
        parameters,
        result,
        executed_at: new Date().toISOString(),
        execution_time: executionTime,
        status: 'success'
      }
      
      executionHistory.value.unshift(execution)
      
      // Keep only last 50 executions
      if (executionHistory.value.length > 50) {
        executionHistory.value = executionHistory.value.slice(0, 50)
      }

      return result
      
    } catch (err) {
      // Add failed execution to history
      const execution = {
        id: `exec-${Date.now()}`,
        function_name: functionName,
        parameters,
        error: err.message,
        executed_at: new Date().toISOString(),
        status: 'failed'
      }
      
      executionHistory.value.unshift(execution)
      
      error.value = err.message
      console.error('Failed to execute function:', err)
      throw err
    } finally {
      isExecuting.value = false
    }
  }

  function getFunctionByName(name) {
    return availableFunctions.value.find(func => func.name === name)
  }

  function getFunctionsByCategory(category) {
    return availableFunctions.value.filter(func => 
      (func.category || 'general') === category
    )
  }

  function clearExecutionHistory() {
    executionHistory.value = []
  }

  function clearError() {
    error.value = null
  }

  function getExecutionById(id) {
    return executionHistory.value.find(exec => exec.id === id)
  }

  // Helper functions
  function formatExecutionTime(milliseconds) {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(1)}s`
    } else {
      const minutes = Math.floor(milliseconds / 60000)
      const seconds = Math.floor((milliseconds % 60000) / 1000)
      return `${minutes}m ${seconds}s`
    }
  }

  function validateParameters(functionName, parameters) {
    const func = getFunctionByName(functionName)
    if (!func) {
      throw new Error(`Function '${functionName}' not found`)
    }

    if (!func.parameters) return true

    // Basic parameter validation
    const required = func.parameters.required || []
    const missing = required.filter(param => !(param in parameters))
    
    if (missing.length > 0) {
      throw new Error(`Missing required parameters: ${missing.join(', ')}`)
    }

    return true
  }

  // Initialize store
  function initialize() {
    loadAvailableFunctions()
  }

  return {
    // State
    availableFunctions,
    executionHistory,
    isLoading,
    error,
    isExecuting,
    
    // Getters
    hasFunctions,
    functionsByCategory,
    recentExecutions,
    
    // Actions
    loadAvailableFunctions,
    executeFunction,
    getFunctionByName,
    getFunctionsByCategory,
    clearExecutionHistory,
    clearError,
    getExecutionById,
    formatExecutionTime,
    validateParameters,
    initialize
  }
})
