import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { useBackendApi } from '@/composables/useBackendApi'

export interface AetosFunction {
  function_name: string
  function_id: string
  app: string
  category: string
  description: string
  parameters: any[]
  use_cases: string[]
}

export interface FunctionExecutionResult {
  function_name: string
  arguments: Record<string, any>
  result: any
  status: string
  timestamp: string
}

export interface AgentExecutionResult {
  query: string
  execution_decision: {
    action: string
    function: string | null
    parameters: Record<string, any>
    confidence: number
    execution_ready: boolean
    system_type: string
  }
  auto_execute_recommended: boolean
  context_summary: {
    functions_discovered: number
    context_chunks_found: number
    top_function: string | null
    confidence: number
  }
  agent_response: string
  function_results: any[]
  timestamp: string
  system_info: {
    type: string
    framework: string
    note: string
  }
}

export const useFunctionStore = defineStore('function', () => {
  const api = useBackendApi()
  
  // State
  const availableFunctions = ref<AetosFunction[]>([])
  const discoveredFunctions = ref<any[]>([])
  const executionHistory = ref<FunctionExecutionResult[]>([])
  const agentResults = ref<AgentExecutionResult[]>([])
  const isLoading = ref(false)
  const isExecuting = ref(false)
  const isDiscovering = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const functionCount = computed(() => availableFunctions.value.length)
  const functionsByApp = computed(() => {
    const grouped: Record<string, AetosFunction[]> = {}
    availableFunctions.value.forEach(func => {
      if (!grouped[func.app]) {
        grouped[func.app] = []
      }
      grouped[func.app].push(func)
    })
    return grouped
  })
  const functionsByCategory = computed(() => {
    const grouped: Record<string, AetosFunction[]> = {}
    availableFunctions.value.forEach(func => {
      if (!grouped[func.category]) {
        grouped[func.category] = []
      }
      grouped[func.category].push(func)
    })
    return grouped
  })
  const recentExecutions = computed(() => 
    executionHistory.value.slice(-10).reverse()
  )

  // Load available functions
  const loadFunctions = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await api.getAetosFunctions()
      availableFunctions.value = response.functions || []
      console.log('Loaded', availableFunctions.value.length, 'functions')
      
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to load functions'
      console.error('Load functions error:', error.value)
    } finally {
      isLoading.value = false
    }
  }

  // Discover functions for a query
  const discoverFunctions = async (query: string, maxFunctions = 3, scoreThreshold = 0.3) => {
    isDiscovering.value = true
    error.value = null
    
    try {
      const response = await api.discoverFunctions(query, maxFunctions, scoreThreshold)
      discoveredFunctions.value = response.discovered_functions || []
      
      console.log('Discovered', discoveredFunctions.value.length, 'functions for query:', query)
      return response
      
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to discover functions'
      console.error('Discover functions error:', error.value)
    } finally {
      isDiscovering.value = false
    }
  }

  // Execute a specific function
  const executeFunction = async (functionName: string, args: Record<string, any>) => {
    isExecuting.value = true
    error.value = null
    
    try {
      const result = await api.executeAetosFunction(functionName, args)
      
      // Add to execution history
      const execution: FunctionExecutionResult = {
        function_name: functionName,
        arguments: args,
        result: result.result,
        status: result.status,
        timestamp: result.timestamp
      }
      
      executionHistory.value.push(execution)
      
      console.log('Function executed:', functionName, result.status)
      return result
      
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to execute function'
      console.error('Execute function error:', error.value)
      throw err
    } finally {
      isExecuting.value = false
    }
  }

  // Agent execution (full workflow)
  const executeAgent = async (
    query: string, 
    executionMode = 'auto', 
    includeContext = true
  ) => {
    isExecuting.value = true
    error.value = null
    
    try {
      const result = await api.agentExecute(query, executionMode, includeContext)
      
      // Add to agent results
      agentResults.value.push(result)
      
      // Add function executions to history
      if (result.function_results) {
        result.function_results.forEach((funcResult: any) => {
          const execution: FunctionExecutionResult = {
            function_name: funcResult.function_name,
            arguments: funcResult.arguments,
            result: funcResult.result,
            status: funcResult.result?.status || 'completed',
            timestamp: result.timestamp
          }
          executionHistory.value.push(execution)
        })
      }
      
      console.log('Agent execution completed:', query)
      return result
      
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to execute agent'
      console.error('Agent execution error:', error.value)
      throw err
    } finally {
      isExecuting.value = false
    }
  }

  // Get function by name
  const getFunctionByName = (functionName: string) => {
    return availableFunctions.value.find(func => func.function_name === functionName)
  }

  // Get functions by app
  const getFunctionsByApp = (appName: string) => {
    return availableFunctions.value.filter(func => func.app === appName)
  }

  // Get functions by category
  const getFunctionsByCategory = (category: string) => {
    return availableFunctions.value.filter(func => func.category === category)
  }

  // Clear execution history
  const clearExecutionHistory = () => {
    executionHistory.value = []
  }

  // Clear discovered functions
  const clearDiscoveredFunctions = () => {
    discoveredFunctions.value = []
  }

  // Clear agent results
  const clearAgentResults = () => {
    agentResults.value = []
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Get execution status color
  const getExecutionStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'text-success-600'
      case 'running':
      case 'executing':
        return 'text-warning-600'
      case 'failed':
      case 'error':
        return 'text-error-600'
      default:
        return 'text-surface-600'
    }
  }

  // Get execution status icon
  const getExecutionStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return '✅'
      case 'running':
      case 'executing':
        return '⏳'
      case 'failed':
      case 'error':
        return '❌'
      default:
        return '🔧'
    }
  }

  // Get app icon
  const getAppIcon = (appName: string) => {
    switch (appName.toLowerCase()) {
      case 'aetos browser':
        return '🛰️'
      case 'aetos cube':
        return '📊'
      case 'aetos terra':
        return '🌍'
      default:
        return '🔧'
    }
  }

  return {
    // State
    availableFunctions: readonly(availableFunctions),
    discoveredFunctions: readonly(discoveredFunctions),
    executionHistory: readonly(executionHistory),
    agentResults: readonly(agentResults),
    isLoading: readonly(isLoading),
    isExecuting: readonly(isExecuting),
    isDiscovering: readonly(isDiscovering),
    error: readonly(error),
    
    // Getters
    functionCount,
    functionsByApp,
    functionsByCategory,
    recentExecutions,
    
    // Actions
    loadFunctions,
    discoverFunctions,
    executeFunction,
    executeAgent,
    getFunctionByName,
    getFunctionsByApp,
    getFunctionsByCategory,
    clearExecutionHistory,
    clearDiscoveredFunctions,
    clearAgentResults,
    clearError,
    
    // Utilities
    getExecutionStatusColor,
    getExecutionStatusIcon,
    getAppIcon
  }
})
