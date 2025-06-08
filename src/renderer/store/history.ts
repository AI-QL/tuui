import { defineStore } from 'pinia'
import localForage from 'localforage'
import { v4 as uuidv4 } from 'uuid'
import { useMessageStore } from '@/renderer/store/message'

type ConversationID = string

export type MessageEntry = {
  role: string
  content: any
  reasoning_content?: string
  [key: string]: any
}

type ConversationEntry = {
  id: ConversationID
  messages: MessageEntry[]
}

export const useHistoryStore = defineStore('historyStore', {
  state: () => ({
    selected: undefined as ConversationID[] | undefined,
    conversation: [] as ConversationEntry[]
  }),
  persist: {
    include: ['conversation'],
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
      this.conversation.splice(index, 1)
    },
    init(conversation: MessageEntry[]) {
      const newId = this.getDate()
      this.conversation.unshift({
        id: newId,
        messages: conversation
      })
      this.selected = [newId]
      return newId
    },
    replace(index: number) {
      this.deleteById(index)
      const messageStore = useMessageStore()
      this.init(messageStore.conversation)
    },
    find(id: string) {
      return this.conversation.find((item) => item.id === id)
    },
    select(index: number) {
      const messageStore = useMessageStore()
      messageStore.conversation = this.conversation[index].messages
    },
    getColor(index: number) {
      const targetElement = this.conversation[index]?.messages.find(
        (element) => element.role === 'assistant'
      )
      if (targetElement) {
        return 'primary'
      } else {
        return 'grey'
      }
    },
    downloadById(index: number) {
      const name = this.conversation[index].id.replace(/[/: ]/g, '-')
      this.download(this.conversation[index].messages, `history-${name}.json`)
    },
    downloadHistory() {
      this.download(this.conversation, 'history.json')
    },
    download(json, filename) {
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
