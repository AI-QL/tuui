import { defineStore } from 'pinia'
import { CHATBOT_DEFAULTS } from '@/renderer/types'
import type { ChatbotConfig } from '@/preload/llm'
import { v4 as uuidv4 } from 'uuid'

export interface ChatbotStoreState {
  chatbots: ChatbotConfig[]
  currentChatbotId: number // chatbots array index, being modified
  selectedChatbotId: number // chatbots array index, being selected
}

export function getLLMs(): ChatbotConfig[] {
  return window.llmApis?.get().custom || []
}

export function getDefaultLLM(): ChatbotConfig {
  return window.llmApis?.get().default || CHATBOT_DEFAULTS
}

export const useChatbotStore = defineStore('chatbotStore', {
  state: (): ChatbotStoreState => {
    const llms = getLLMs()

    const chatbots = llms
      ? llms.map((llm) => ({ ...getDefaultLLM(), ...llm }))
      : [{ ...getDefaultLLM(), name: 'Chatbot Default', mcp: true, reasoningEffort: 1 }]

    return {
      chatbots: chatbots,
      currentChatbotId: 0, // points to first chatbot by default
      selectedChatbotId: 0
    }
  },

  persist: {
    exclude: ['currentChatbotId']
  },

  actions: {
    resetState() {
      this.$reset()
    },

    updateChatbotConfig(index: number, patch: Partial<ChatbotConfig>) {
      if (index < 0 || index >= this.chatbots.length) {
        console.log('No chatbot found at index', index)
        return
      }
      Object.assign(this.chatbots[index], patch)
    },

    addChatbot() {
      this.chatbots.push({ ...getDefaultLLM(), name: 'Chatbot ' + uuidv4() })
    },

    removeChatbot(index: number) {
      this.chatbots.splice(index, 1)
      // Adjust current index if needed
      if (this.currentChatbotId >= index) {
        this.currentChatbotId = Math.max(0, this.currentChatbotId - 1)
      }
    },

    updateStoreFromJSON(chatbotConfigJson: ChatbotConfig[] | ChatbotConfig) {
      this.$reset()
      this.chatbots = []
      if (Array.isArray(chatbotConfigJson)) {
        chatbotConfigJson.forEach((newChatbot, _index) => {
          this.chatbots.push({ ...getDefaultLLM(), ...newChatbot })
        })
      } else {
        // Handle case when chatbots is a single object
        this.chatbots.push({ ...getDefaultLLM(), ...chatbotConfigJson })
      }
    },

    // Helper method to find chatbot by name
    findChatbotIndexByName(name: string): number {
      return this.chatbots.findIndex((chatbot) => chatbot.name === name)
    },

    // Action to set current chatbot by name
    setCurrentChatbotByName(name: string) {
      const index = this.findChatbotIndexByName(name)
      if (index !== -1) {
        this.currentChatbotId = index
      }
    }
  },

  getters: {
    currentConfig(state): ChatbotConfig | null {
      if (state.currentChatbotId < 0 || state.currentChatbotId >= state.chatbots.length) {
        return null
      }
      return state.chatbots[state.currentChatbotId]
    },

    getChatbotByName: (state) => {
      return (name: string) => state.chatbots.find((chatbot) => chatbot.name === name)
    },

    getChatbotByIndex: (state) => {
      return (index: number) => state.chatbots[index]
    },

    // Get all chatbot names
    chatbotNames(state): string[] {
      return state.chatbots.map((chatbot) => chatbot.name)
    }
  }
})
