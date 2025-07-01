import { defineStore } from 'pinia'
import {
  ChatbotConfig,
  CHATBOT_DEFAULTS,
  CHATBOT_QWEN,
  CHATBOT_OPENAI,
  CHATBOT_DEEPINFRA
} from '@/renderer/types'
import { v4 as uuidv4 } from 'uuid'

export interface ChatbotStoreState {
  chatbots: ChatbotConfig[]
  currentChatbotId: number // chatbots array index, being modified
  selectedChatbotId: number // chatbots array index, being selected
}

export const useChatbotStore = defineStore('chatbotStore', {
  state: (): ChatbotStoreState => ({
    chatbots: [
      { ...CHATBOT_DEFAULTS, name: 'Chatbot Default', mcp: true, reasoningEffort: 1 },
      {
        ...CHATBOT_DEFAULTS,
        ...CHATBOT_QWEN
      },
      {
        ...CHATBOT_DEFAULTS,
        ...CHATBOT_OPENAI
      },
      {
        ...CHATBOT_DEFAULTS,
        ...CHATBOT_DEEPINFRA
      }
    ],
    currentChatbotId: 0, // points to first chatbot by default
    selectedChatbotId: 0
  }),

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
      this.chatbots.push({ ...CHATBOT_DEFAULTS, name: 'Chatbot ' + uuidv4() })
    },

    removeChatbot(index: number) {
      this.chatbots.splice(index, 1)
      // Adjust current index if needed
      if (this.currentChatbotId >= index) {
        this.currentChatbotId = Math.max(0, this.currentChatbotId - 1)
      }
    },

    updateStoreFromJSON(json: { chatbots: ChatbotConfig[] | ChatbotConfig }) {
      this.$reset()
      this.chatbots = []
      if (json.chatbots) {
        if (Array.isArray(json.chatbots)) {
          json.chatbots.forEach((newChatbot, _index) => {
            this.chatbots.push({ ...CHATBOT_DEFAULTS, ...newChatbot })
          })
        } else {
          // Handle case when chatbots is a single object
          this.chatbots.push({ ...CHATBOT_DEFAULTS, ...json.chatbots })
        }
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
