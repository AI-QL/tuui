import { defineStore } from 'pinia'
import { useSnackbarStore } from '@/renderer/store/snackbar'
import { useMcpStore } from '@/renderer/store/mcp'
import { useHistoryStore } from '@/renderer/store/history'
import {
  createCompletion,
  isEmptyTools,
  ChatProcessResult
} from '@/renderer/composables/chatCompletions'

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

type CallToolResultContent = CallToolResult['content']

import type { ToolMessage, UserMessage, ChatConversationMessage } from '@/renderer/types/message'

interface MessageStoreState {
  userMessage: string
  conversation: ChatConversationMessage[]
  historyId: string
  base64: string
  generating: Record<string, 'prepare' | AbortController | 'toolcall'>
}

export const useMessageStore = defineStore('messageStore', {
  state: (): MessageStoreState => ({
    userMessage: '',
    conversation: [],
    historyId: '',
    base64: '',
    generating: {}
  }),
  actions: {
    init() {
      const snackbarStore = useSnackbarStore()
      if (this.conversation.length === 0) {
        snackbarStore.showWarningMessage('snackbar.addfail')
      } else {
        this.initConversation([])
        snackbarStore.showSuccessMessage('snackbar.addnew')
      }
    },
    initConversation(conversationArray: ChatConversationMessage[]) {
      this.conversation = conversationArray
      this.historyId = ''
    },
    stop() {
      this.delete(this.historyId)
      const snackbarStore = useSnackbarStore()
      snackbarStore.showInfoMessage('snackbar.stopped')
    },
    delete(id: string) {
      if (id in this.generating) {
        if (this.generating[id] instanceof AbortController) {
          this.generating[id].abort()
        }
        delete this.generating[id]
        return true
      } else {
        return false
      }
    },
    clear() {
      this.userMessage = ''
    },
    handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Enter' && e.shiftKey) {
        //  A new line by default
      } else if (e.key === 'Enter') {
        // Only Enter is pressed, send message
        e.preventDefault()
        this.sendMessage()
      }
    },
    deleteMessage({ index, range }: { index: number; range: number }) {
      this.conversation.splice(index, range)
    },
    resendMessage() {
      // const conversation = this.conversation.reduce((newConversation, item) => {
      let index = this.conversation.length - 1
      while (index >= 0 && this.conversation[index].role !== 'user') {
        index--
      }

      // when role == "user" is found，drop followings
      if (index >= 0) {
        this.conversation.splice(index + 1)
        return this.startInference()
      }
    },
    sendMessage() {
      if (this.userMessage) {
        // Add the message to the list

        const imageBase64 = this.base64

        this.conversation.push({
          content: imageBase64
            ? [
                { type: 'image_url', image_url: { url: imageBase64 } },
                { type: 'text', text: this.userMessage }
              ]
            : this.userMessage,
          role: 'user'
        })

        return this.startInference()
      }
    },
    syncHistory: function (): string {
      const historyStore = useHistoryStore()
      if (!this.historyId) {
        const historyId = historyStore.init(this.conversation)
        this.historyId = historyId
        return historyId
      }

      const foundHistoryId = historyStore.find(this.historyId)?.id

      if (!foundHistoryId) {
        const historyId = historyStore.init(this.conversation)
        this.historyId = historyId
        return historyId
      } else {
        return foundHistoryId
      }
    },
    applyPrompt: function (messages: ChatConversationMessage[]) {
      this.initConversation(messages)
      // this.syncHistory()
    },
    startInference: function () {
      const historyId = this.syncHistory()
      this.clear()

      this.generating[historyId] = 'prepare'

      createCompletion(this.conversation, historyId).then((reason: ChatProcessResult) => {
        if (reason === 'done') {
          this.postToolCall(historyId)
        }
      })

      return historyId
    },
    postToolCall: async function (historyId: string) {
      const mcpStore = useMcpStore()
      const last = this.conversation.at(-1)

      if (!last || !('tool_calls' in last) || !last.tool_calls) {
        return
      }

      if (isEmptyTools(last.tool_calls)) {
        delete last.tool_calls
        return
      }

      let toolCalled = false
      console.log(last.tool_calls)
      this.generating[historyId] = 'toolcall'

      for (const toolCall of last.tool_calls) {
        let result: CallToolResult

        try {
          result = await mcpStore.callTool(toolCall.function.name, toolCall.function.arguments)
          console.log(result)
        } catch (error) {
          result = mcpStore.packReturn(`Error calling tool: ${error}`)
        }

        if (result?.content) {
          this.contentConvert(result.content, toolCall.id).forEach((item) => {
            this.conversation.push(item)
          })
          toolCalled = true
        }
      }

      if (this.delete(historyId) && toolCalled) {
        this.startInference()
      }
    },
    contentConvert: function (
      content: CallToolResultContent,
      toolCallId: string
    ): Array<UserMessage | ToolMessage> {
      const mcpStore = useMcpStore()
      const msg = content.map((item) => mcpStore.convertItem(item))
      console.log(msg)
      if (msg.find((item) => item.type === 'image_url')) {
        return [
          {
            role: 'tool',
            content: mcpStore.packReturn('Image provided in next user message').content,
            tool_call_id: toolCallId
          },
          {
            role: 'user',
            content: msg
          }
        ]
      } else {
        return [
          {
            role: 'tool',
            content: msg.map((item) => item.text).join('\n'), // If the LLM can support array in tool, use msg directly
            tool_call_id: toolCallId
          }
        ]
      }
    }
  }
})
