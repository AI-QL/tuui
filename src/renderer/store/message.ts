import { defineStore } from 'pinia'
import { useSnackbarStore } from '@/renderer/store/snackbar'
import { useMcpStore } from '@/renderer/store/mcp'
import { useHistoryStore } from '@/renderer/store/history'
import { createCompletion, isEmptyTools } from '@/renderer/composables/chatCompletions'

export const useMessageStore = defineStore('messageStore', {
  // TODO: fix any to type
  state: (): any => ({
    userMessage: '',
    conversation: [],
    historyId: '',
    images: [],
    base64: '',
    generating: false
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
    initConversation(conversationArray) {
      this.conversation = conversationArray
      this.historyId = ''
    },
    stop() {
      const snackbarStore = useSnackbarStore()
      this.generating = false
      snackbarStore.showInfoMessage('snackbar.stopped')
    },
    clear() {
      this.userMessage = ''
      this.images = []
    },
    handleKeydown(e) {
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
        this.startInference()
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

        this.startInference()
      }
    },
    syncHistory: function () {
      const historyStore = useHistoryStore()
      if (!this.historyId) {
        this.historyId = historyStore.init(this.conversation)
        return
      }

      if (!historyStore.find(this.historyId)) {
        this.historyId = historyStore.init(this.conversation)
      }
    },
    applyPrompt: function (messages) {
      this.initConversation(messages)
      // this.syncHistory()
    },
    startInference: async function () {
      this.syncHistory()
      this.clear()
      await createCompletion(this.conversation)
      await this.postToolCall()
    },
    postToolCall: async function () {
      const mcpStore = useMcpStore()
      const last = this.conversation.at(-1)
      if (!last || !last.tool_calls) {
        return
      }
      if (isEmptyTools(last.tool_calls)) {
        delete last.tool_calls
        //   return
      } else {
        let toolCalled = false
        console.log(last.tool_calls)

        const callNextTool = async (toolCalls, index) => {
          if (index >= toolCalls.length) {
            return
          }

          const toolCall = toolCalls[index]

          let result

          try {
            result = await mcpStore.callTool(toolCall.function.name, toolCall.function.arguments)
            console.log(result)
          } catch (error) {
            result = mcpStore.packReturn(`Error calling tool: ${error}`)
          }

          if (result.content) {
            this.contentConvert(result.content, toolCall.id).forEach((item) => {
              this.conversation.push(item)
            })
            toolCalled = true
          }
        }

        await callNextTool(last.tool_calls, 0)

        if (toolCalled) {
          this.startInference()
        }
      }
    },
    contentConvert: function (content, toolCallId) {
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
