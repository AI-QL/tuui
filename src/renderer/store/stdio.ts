import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'

import type { StdioServerParameters } from '@modelcontextprotocol/sdk/client/stdio.js'

// Other keyof StdioServerParameters are not in use
export type StdioServerKey = 'command' | 'args' | 'env'

export type CustomStdioServerParameters = Partial<StdioServerParameters>

export const useStdioStore = defineStore(
  'stdioStore',
  () => {
    const configValues = ref<Record<string, CustomStdioServerParameters>>({})

    function updateConfigAttribute<K extends StdioServerKey>(
      name: string,
      key: K,
      value: StdioServerParameters[K]
    ) {
      if (!configValues.value[name]) {
        configValues.value[name] = {}
      }
      configValues.value[name][key] = value
    }

    const getConfig = (name: string) => {
      return toRaw(configValues.value[name]) ?? null
    }

    function deleteConfig(name: string) {
      delete configValues.value[name]
    }

    return { configValues, getConfig, deleteConfig, updateConfigAttribute }
  },
  {
    persist: true
  }
)
