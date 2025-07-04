import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createStatePersistence } from 'pinia-plugin-state-persistence'

import App from '@/renderer/App.vue'
import router from '@/renderer/router'
import vuetify from '@/renderer/plugins/vuetify'
import i18n from '@/renderer/plugins/i18n'

import Vue3Lottie from 'vue3-lottie'

// Add API key defined in contextBridge to window object type
declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    mainApi?: any
    mcpServers?: any
    dxtManifest?: any
  }
}

const app = createApp(App)
const pinia = createPinia()
pinia.use(createStatePersistence())

app.use(vuetify).use(i18n).use(router).use(pinia).use(Vue3Lottie)

app.mount('#app')
