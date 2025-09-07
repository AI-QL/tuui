import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createStatePersistence } from 'pinia-plugin-state-persistence'

import App from '@/renderer/App.vue'
import router from '@/renderer/router'
import vuetify from '@/renderer/plugins/vuetify'
import i18n from '@/renderer/plugins/i18n'

import Vue3Lottie from 'vue3-lottie'

import type { MCPAPI, DXTAPI } from '@/preload/mcp'
import type { LlmConfig } from '@/preload/llm'
import type { PopupConfig } from '@/preload/popup'
import type { StartupConfig } from '@/preload/startup'

// Add API key defined in contextBridge to window object type
declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    mainApi?: any
    llmApis?: {
      get: () => LlmConfig
    }
    popupApis?: {
      get: () => PopupConfig
    }
    startupApis?: {
      get: () => StartupConfig
    }
    mcpServers?: {
      get: () => MCPAPI
      refresh: () => Promise<{}>
      update: (_name: string) => Promise<{}>
    }
    dxtManifest?: {
      get: () => DXTAPI
      refresh: () => Promise<{}>
      update: (_name: string) => Promise<{}>
    }
  }
}

const app = createApp(App)
const pinia = createPinia()
pinia.use(createStatePersistence())

app.use(vuetify).use(i18n).use(router).use(pinia).use(Vue3Lottie)

app.mount('#app')
