import { defineStore } from 'pinia'
import { useMcpStore } from '@/renderer/store/mcp'
import { getServers } from './mcp'

interface ParamsType {
  name: string
  arguments?: { [key: string]: any }
}

interface PromptType {
  title: string
  name: string
  description: string
  arguments: {
    name: string
    content: ParamsType
  }[]
}

export const usePromptStore = defineStore('promptStore', {
  state: () => ({
    promptDialog: false,
    promptSheet: false,
    promptList: [] as PromptType[],
    promptSelect: {} as PromptType,
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
      return prompts.prompts.map((prompt) => ({
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
            const obj = await func()
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
    select: function (prompt) {
      console.log(prompt.title, prompt.name, prompt.arguments)
      this.promptSelect = prompt
      this.promptSheet = true
      this.promptDialog = false
    },
    fetchSelect: async function () {
      const mcpStore = useMcpStore()
      const mcpServers = getServers()
      const getFun = mcpServers?.[this.promptSelect.title]?.prompts?.get
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
            params.arguments[argument.name] = argument.content
          }
        }
      }

      console.log(params)
      const prompts = await getFun(params)

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
