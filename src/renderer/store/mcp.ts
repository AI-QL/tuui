import { defineStore } from 'pinia'
import type { MCPAPI } from '@/preload/types'
import type {
  ChatCompletionRequestContent,
  ChatCompletionPromptMessage
} from '@/renderer/types/message'

type McpPrimitiveType = 'tools' | 'resources' | 'prompts' | 'config'
type AllowedPrimitive = Exclude<McpPrimitiveType, 'config'>
type McpMethodType =
  | { type: 'list'; fn: () => any }
  | { type: 'get'; fn: () => any }
  | { type: 'read'; fn: () => any }
  | { type: 'call'; fn: () => any }
  | { type: 'templates/list'; fn: () => any }
  | string

export function getAllowedPrimitive(item: MCPAPI): AllowedPrimitive[] {
  if (!item) return []

  return (Object.keys(item) as Array<keyof typeof item>).filter((key) =>
    ['tools', 'resources', 'prompts'].includes(key as AllowedPrimitive)
  ) as AllowedPrimitive[]
}

export interface FunctionType {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: string
  }
}

export interface McpCoreType {
  server: string
  primitive: McpPrimitiveType
  method: McpMethodType
}

export const useMcpStore = defineStore('mcpStore', {
  // TODO: fix any to type
  state: (): any => ({
    version: 1,
    serverTools: [],
    loading: true,
    selected: undefined as string[] | undefined,
    selectedChips: {} // { key : 0 | 1 | 2}
  }),

  getters: {
    getSelected(state): McpCoreType | null {
      if (state.selected) {
        return this.getSelectedByServer(state.selected[0])
      } else {
        return null
      }
    },
    getSelectedByServer(state) {
      return (serverName: string): McpCoreType | null => {
        const mcpServers = this.getServers()
        if (!mcpServers[serverName]) return null
        const selectedIndex = state.selectedChips[serverName]
        if (typeof selectedIndex === 'number') {
          const selectedPrimitive = {
            server: serverName,
            primitive: Object.keys(mcpServers[serverName])[selectedIndex] as McpPrimitiveType,
            method: Object.values(mcpServers[serverName])[selectedIndex] as McpMethodType
          }
          console.log(selectedPrimitive)
          return selectedPrimitive
        } else {
          return {
            server: serverName,
            primitive: 'config',
            method: JSON.stringify(mcpServers[serverName].config, null, 2)
          }
        }
      }
    }
  },

  actions: {
    getServers: (): MCPAPI => {
      // console.log('MCP:', window.mcpServers)
      return window.mcpServers.get() as MCPAPI
    },
    getAllByServer: function (serverName: string): McpCoreType[] {
      const mcpServers = this.getServers()
      if (!mcpServers) {
        return []
      }
      const mcpServerObject = mcpServers[serverName]
      if (!mcpServerObject) return []

      const allPrimitives = Object.entries(mcpServerObject).map(([key, value]) => {
        return {
          server: serverName,
          primitive: key as McpPrimitiveType,
          method: value as McpMethodType
        }
      })

      return allPrimitives
    },
    updateServers: async function () {
      const servers = await window.mcpServers.refresh()
      console.log(servers)
      return servers
    },
    getServerFunction: function (options: {
      serverName?: string
      primitiveName: string
      methodName: string
    }): Function | null {
      const { serverName, primitiveName, methodName } = options

      let targetServerName

      if (serverName) {
        targetServerName = serverName
      } else {
        targetServerName = this.selected?.[0]
      }

      const allPrimitives = this.getAllByServer(targetServerName)

      const foundItem = allPrimitives.find((item) => item.primitive === primitiveName)

      if (foundItem) {
        return foundItem.method?.[methodName] || null
      } else {
        return null
      }
    },

    listServerTools: async function (serverNames?: string[]) {
      const mcpTools: FunctionType[] = []

      const targets: string[] = serverNames?.length ? serverNames : [this.getSelected?.server]

      const promises = targets
        .filter(Boolean) // filter invalid server
        .map((serverName) =>
          this.getServerFunction({
            serverName,
            primitiveName: 'tools',
            methodName: 'list'
          })?.()?.catch(() => null)
        )

      const results = await Promise.all(promises)
      for (const toolsData of results.filter(Boolean)) {
        if (Array.isArray(toolsData?.tools)) {
          toolsData.tools.forEach((tool) => {
            mcpTools.push({
              type: 'function',
              function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.inputSchema
              }
            })
          })
        }
      }

      return mcpTools
    },

    loadServerTools: function () {
      this.loading = true
      try {
        this.listServerTools().then((tools) => {
          this.serverTools = tools.map((tool) => {
            return {
              name: tool.function.name,
              description: tool.function.description
            }
          })
        })
      } catch (error) {
        console.error('Failed to load tools:', error)
      } finally {
        this.loading = false
      }
    },

    listTools: async function () {
      const mcpServers = this.getServers()
      if (!mcpServers) {
        return null
      }
      const mcpKeys = Object.keys(mcpServers)
      const mcpTools: FunctionType[] = []
      for (const key of mcpKeys) {
        const toolsListFunction = mcpServers[key]?.tools?.list
        if (typeof toolsListFunction === 'function') {
          const tools = await toolsListFunction()
          // console.log(await mcpServers[key]?.prompts?.list())
          // console.log(await mcpServers[key]?.resources['templates/list']())
          // console.log(await mcpServers[key]?.resources?.list())
          if (tools && Array.isArray(tools.tools)) {
            for (const tool of tools.tools) {
              mcpTools.push({
                type: 'function',
                function: {
                  name: tool.name,
                  description: tool.description,
                  parameters: tool.inputSchema
                  // strict: true
                }
              })
            }
          }
        }
      }
      return mcpTools
    },
    getTool: async function (toolName) {
      const mcpServers = this.getServers()
      const mcpKeys = Object.keys(mcpServers)
      const result = await Promise.any(
        mcpKeys.map(async (key) => {
          const toolsListFunction = mcpServers[key]?.tools?.list
          if (typeof toolsListFunction === 'function') {
            const tools = await toolsListFunction()
            if (tools && Array.isArray(tools.tools)) {
              const foundTool = tools.tools.find((tool) => tool.name === toolName)
              if (foundTool) {
                return {
                  server: key,
                  tool: foundTool
                }
              }
            }
          }
          throw new Error(`Tool ${toolName} not found on server ${key}`)
        })
      )

      return result
    },
    callTool: async function (toolName, toolArgs) {
      const tool = await this.getTool(toolName)
      if (!tool) {
        return this.packReturn(`Tool name '${toolName}' not found`)
      }

      let toolArguments = {}

      if (toolArgs) {
        try {
          toolArguments = JSON.parse(toolArgs)
        } catch (e) {
          return this.packReturn(`Arguments JSON parse error: '${e}'`)
        }
      }

      const params = {
        name: toolName,
        arguments: toolArguments
      }

      const result = await this.getServers()[tool.server].tools.call(params)
      return result
    },
    convertItem: function (
      item: ChatCompletionPromptMessage['content']
    ): ChatCompletionRequestContent {
      if (item.type === 'text') {
        return item
      } else if (item.type === 'image') {
        const imageUrl = `data:${item.mimeType};base64,${item.data}`
        return {
          type: 'image_url',
          image_url: { url: imageUrl }
        }
      } else if (item.type === 'resource') {
        return {
          type: 'text',
          text: JSON.stringify(item.resource, null, 2)
        }
      } else {
        return {
          type: 'text',
          text: JSON.stringify(item, null, 2)
        }
      }
    },
    packReturn: (string) => {
      return {
        content: [
          {
            type: 'text',
            text: string
          }
        ]
      }
    }
  }
})
