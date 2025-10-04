import { defineStore } from 'pinia'
import localForage from 'localforage'
import { v4 as uuidv4 } from 'uuid'
import { useMessageStore } from '@/renderer/store/message'

import type { ChatConversationMessage } from '@/renderer/types/message'
import type { SessionId, SessionEntry } from '@/renderer/types/session'

interface HistoryStoreState {
  // selected: SessionId[] | undefined
  conversations: SessionEntry[]
}

export const useHistoryStore = defineStore('historyStore', {
  state: (): HistoryStoreState => ({
    // selected: undefined as SessionId[] | undefined,
    conversations: [] as SessionEntry[]
  }),
  persist: {
    include: ['conversations'],
    storage: localForage
  },
  getters: {},
  actions: {
    getDate() {
      const date = new Date().toLocaleString('zh', { timeZoneName: 'short', hour12: false })
      return `${date} ${uuidv4()}`
    },
    resetState() {
      this.$reset()
    },
    deleteById(index: number) {
      this.conversations.splice(index, 1)
    },
    init(conversation: SessionEntry) {
      const oldConversation = this.find(conversation.id)
      console.log(conversation)
      if (!oldConversation) {
        const newId = this.getDate()
        this.conversations.unshift({
          ...conversation,
          id: newId
        })
        // this.selected = [newId]
        return this.conversations[0]
      } else {
        return oldConversation
      }
    },
    find(id: string | undefined) {
      if (id) {
        return this.conversations.find((item) => item.id === id)
      } else {
        return undefined
      }
    },
    select(sessionId: SessionId) {
      const conversation = this.find(sessionId)
      if (conversation) {
        const messageStore = useMessageStore()
        messageStore.setConversation(conversation)
      }
    },
    getColor(index: number) {
      const targetElement = this.conversations[index]?.messages.find(
        (element) => element.role === 'assistant'
      )
      if (targetElement) {
        return 'primary'
      } else {
        return 'grey'
      }
    },
    downloadById(index: number) {
      const name = this.conversations[index].id.replace(/[/: ]/g, '-')
      this.download(this.conversations[index].messages, `history-${name}.json`)
    },
    downloadHistory() {
      this.download(this.conversations, 'history.json')
    },
    download(json: ChatConversationMessage[] | SessionEntry[], filename: string) {
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    }
  }
})
