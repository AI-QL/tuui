import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'
import type { userConfigValue } from '@/preload/types'

export const useDxtStore = defineStore(
  'dxtStore',
  () => {
    const configValues = ref<Record<string, Record<string, userConfigValue>>>({})

    const updateConfigAttribute = (name: string, key: string, value: userConfigValue) => {
      if (!configValues.value[name]) {
        configValues.value[name] = {}
      }
      configValues.value[name][key] = value
    }

    const getConfig = (name: string) => {
      return toRaw(configValues.value[name]) ?? null
    }

    const getConfigAttribute = (name: string, key: string) => {
      return configValues.value[name]?.[key] ?? null
    }

    return { configValues, getConfig, updateConfigAttribute, getConfigAttribute }
  },
  {
    persist: true
  }
)
