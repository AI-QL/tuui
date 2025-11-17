import { defineStore } from 'pinia'
import { useMcpStore } from '@/renderer/store/mcp'
import { getServers } from './mcp'

import type { Prompt as PromptType, GetPromptRequest } from '@modelcontextprotocol/sdk/types.d.ts'

type ParamsType = GetPromptRequest['params']


// Extend the argument content to be sent to the MCP server
type ExtendedArgument = NonNullable<PromptType['arguments']>[number] & {
  content?: string;
};

type ExtendedPromptType = Omit<PromptType, 'arguments'> & {
  arguments?: ExtendedArgument[];
};

export const usePromptStore = defineStore('promptStore', {
  state: () => ({
    promptDialog: false,
    promptSheet: false,
    promptList: [] as ExtendedPromptType[],
    promptSelect: {} as ExtendedPromptType,
    search: '',
    loading: false
  }),
  actions: {
    loadPrompts: function () {
      this.loading = true
      try {
        this.fetchPrompts().then((prompts) => {
          console.log(prompts)
          this.promptList = prompts
        })
      } catch (error) {
        console.error('Failed to load prompts:', error)
      } finally {
        this.loading = false
      }
    },
    fetchPrompts: async function () {
      const mcpStore = useMcpStore()
      const mcpServers = mcpStore.getSelected
      const prompts = await mcpServers.method.list()
      return prompts.prompts.map((prompt: PromptType) => ({
        title: mcpServers.server,
        ...prompt
      }))
    },
    fetchAllPrompts: async function () {
      const mcpServers = getServers()
      if (!mcpServers) {
        return []
      }
      const mcpKeys = Object.keys(mcpServers)
      const allPrompts = [] as PromptType[]
      for (const key of mcpKeys) {
        const func = mcpServers[key]?.prompts?.list

        if (func) {
          try {
            const obj = await func({ method: 'prompts/list' })
            if (obj) {
              obj.prompts.forEach((prompt) => allPrompts.push({ title: key, ...prompt }))
            }
          } catch (error) {
            console.error(`Error fetching prompts from ${key}:`, error)
          }
        }
      }

      return allPrompts
    },
    select: function (prompt: PromptType) {
      console.log(prompt.title, prompt.name, prompt.arguments)
      this.promptSelect = prompt
      this.promptSheet = true
      this.promptDialog = false
    },
    fetchSelect: async function () {
      const mcpStore = useMcpStore()
      const mcpServers = getServers()
      const title = this.promptSelect.title
      if (!title) {
        return []
      }
      const getFun = mcpServers?.[title]?.prompts?.get
      if (!getFun) {
        return []
      }
      const params: ParamsType = {
        name: this.promptSelect.name
      }
      if (this.promptSelect.arguments) {
        for (const argument of this.promptSelect.arguments) {
          if (argument.name) {
            if (!params.arguments) {
              params.arguments = {}
            }
            params.arguments[argument.name] = argument.content as string
          }
        }
      }

      console.log(params)
      const prompts = await getFun({ method: 'prompts/get', params })

      const conversations = prompts.messages.map((item) => {
        const content = mcpStore.convertItem(item.content)
        const conversation = {
          role: item.role,
          content: item.role === 'user' ? [content] : content.text
        }
        return conversation
      })

      this.promptSheet = false

      return conversations
    }
  }
})
