import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBackendApi } from '@/composables/useBackendApi'
import type { Function } from '@/types/api'

interface ExecutionHistory {
  id: string
  function_name: string
  parameters: any
  result?: any
  error?: string
  executed_at: string
  execution_time?: number
  status: 'success' | 'failed'
}

export const useFunctionStore = defineStore('function', () => {
  const api = useBackendApi()
  
  // State
  const availableFunctions = ref<Function[]>([])
  const executionHistory = ref<ExecutionHistory[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isExecuting = ref(false)

  // Getters
  const hasFunctions = computed(() => availableFunctions.value.length > 0)
  const functionsByCategory = computed(() => {
    const grouped: Record<string, Function[]> = {}
    availableFunctions.value.forEach(func => {
      const category = func.category || 'general'
      if (!grouped[category]) grouped[category] = []
      grouped[category].push(func)
    })
    return grouped
  })
  const recentExecutions = computed(() => 
    [...executionHistory.value]
      .sort((a, b) => new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime())
      .slice(0, 10)
  )

  // Actions
  async function loadAvailableFunctions() {
    try {
      isLoading.value = true
      error.value = null
      const data = await api.functions.getAvailableFunctions()
      availableFunctions.value = data
    } catch (err: any) {
      error.value = err.message
      console.error('Failed to load functions:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function executeFunction(functionName: string, parameters: any = {}) {
    try {
      isExecuting.value = true
      error.value = null

      const startTime = Date.now()
      const result = await api.functions.executeFunction(functionName, parameters)
      const endTime = Date.now()
      const executionTime = endTime - startTime

      // Add to execution history
      const execution: ExecutionHistory = {
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
      
    } catch (err: any) {
      // Add failed execution to history
      const execution: ExecutionHistory = {
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

  function getFunctionByName(name: string) {
    return availableFunctions.value.find(func => func.function_name === name)
  }

  function getFunctionsByCategory(category: string) {
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

  function getExecutionById(id: string) {
    return executionHistory.value.find(exec => exec.id === id)
  }

  // Helper functions
  function formatExecutionTime(milliseconds: number): string {
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

  function validateParameters(functionName: string, parameters: any): boolean {
    const func = getFunctionByName(functionName)
    if (!func) {
      throw new Error(`Function '${functionName}' not found`)
    }

    if (!func.parameters) return true

    // Basic parameter validation
    const required = (func.parameters as any[]).filter(p => p.required)
    const missing = required.filter(param => !(param.name in parameters))
    
    if (missing.length > 0) {
      throw new Error(`Missing required parameters: ${missing.map(p => p.name).join(', ')}`)
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
