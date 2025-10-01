import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'
import type { userConfigValue } from '@/types/mcp'
import { useI18n } from 'vue-i18n'

export const validateNumberRange = (min: number | undefined, max: number | undefined) => {
  const minNum = min ?? '-∞'
  const maxNum = max ?? '+∞'
  const { t } = useI18n()
  return t('dxt.number-range', { min: minNum, max: maxNum })
}

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
