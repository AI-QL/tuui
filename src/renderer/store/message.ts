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

import type { SessionId, SessionEntry } from '@/renderer/types/session'

type CallToolResultContent = CallToolResult['content']

import type { ToolMessage, UserMessage, ChatConversationMessage } from '@/renderer/types/message'

interface MessageStoreState {
  userMessage: string
  conversation: SessionEntry
  base64: string
  generating: Record<string, 'prepare' | AbortController | 'toolcall'>
}

const EmptyConversation = {
  id: '',
  messages: []
}

export const useMessageStore = defineStore('messageStore', {
  state: (): MessageStoreState => ({
    userMessage: '',
    conversation: EmptyConversation,
    base64: '',
    generating: {}
  }),
  actions: {
    init() {
      const snackbarStore = useSnackbarStore()
      if (this.conversation.messages.length === 0) {
        snackbarStore.showWarningMessage('snackbar.addfail')
      } else {
        this.initConversation([])
        snackbarStore.showSuccessMessage('snackbar.addnew')
      }
    },
    initConversation(conversationMessages: ChatConversationMessage[]) {
      this.setConversation({
        id: '',
        messages: conversationMessages
      })
    },
    setConversation(conversation: SessionEntry) {
      this.conversation = conversation
    },
    stop() {
      this.delete(this.conversation.id)
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
      this.conversation.messages.splice(index, range)
    },
    resendMessage() {
      // const conversation = this.conversation.reduce((newConversation, item) => {
      let index = this.conversation.messages.length - 1
      while (index >= 0 && this.conversation.messages[index].role !== 'user') {
        index--
      }

      // when role == "user" is found，drop followings
      if (index >= 0) {
        this.conversation.messages.splice(index + 1)
        return this.startInference()
      }
    },
    sendMessage() {
      if (this.userMessage) {
        // Add the message to the list

        const imageBase64 = this.base64

        this.conversation.messages.push({
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
    startInference: function () {
      const historyStore = useHistoryStore()

      const conversation = historyStore.init(this.conversation)

      this.clear()

      this.conversation = conversation

      this.processInference(conversation.id)

      return conversation.id
    },
    processInference: function (sessionId: SessionId) {
      const historyStore = useHistoryStore()
      const oldConversation = historyStore.find(sessionId)

      // Verify the old conversation still exist
      if (oldConversation) {
        this.generating[sessionId] = 'prepare'
        createCompletion(oldConversation).then((reason: ChatProcessResult) => {
          if (reason === 'done') {
            this.postToolCall(sessionId)
          }
        })
      }
    },
    postToolCall: async function (sessionId: SessionId) {
      const historyStore = useHistoryStore()

      const last = historyStore.find(sessionId)?.messages.at(-1)

      if (!last || !('tool_calls' in last) || !last.tool_calls) {
        return
      }

      if (isEmptyTools(last.tool_calls)) {
        delete last.tool_calls
        return
      }

      let toolCalled = false
      console.log(last.tool_calls)
      this.generating[sessionId] = 'toolcall'

      const mcpStore = useMcpStore()

      for (const toolCall of last.tool_calls) {
        let result: CallToolResult

        try {
          result = await mcpStore.callTool(toolCall.function.name, toolCall.function.arguments)
          console.log(result)
        } catch (error) {
          result = mcpStore.packReturn(`Error calling tool: ${error}`)
        }

        if (result?.content) {
          toolCalled = true
          const historyStore = useHistoryStore()
          const conversation = historyStore.find(sessionId)
          if (conversation) {
            this.contentConvert(result.content, toolCall.id).forEach((item) => {
              conversation.messages.push(item)
            })
          }
        }
      }

      if (this.delete(sessionId) && toolCalled && sessionId === this.conversation.id) {
        this.processInference(sessionId)
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
