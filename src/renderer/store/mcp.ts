import { defineStore } from 'pinia'

type McpPrimitiveType = 'tools' | 'resources' | 'prompts'
type McpMethodType =
  | { type: 'list'; fn: () => any }
  | { type: 'get'; fn: () => any }
  | { type: 'read'; fn: () => any }
  | { type: 'call'; fn: () => any }
  | { type: 'templates/list'; fn: () => any }

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
    serverTools: [],
    loading: true,
    selected: [''],
    selectedChips: {} // { key : 0 | 1 | 2}
  }),

  getters: {
    getSelected(state): McpCoreType | null {
      const server = state.selected[0]
      if (!server) return null
      return this.getByServer(server)
    },
    getByServer(state) {
      return (serverName: string): McpCoreType | null => {
        const mcpServers = this.getServers
        if (!mcpServers[serverName]) return null
        const selectedIndex = state.selectedChips[serverName] || 0
        const selectedPrimitive = {
          server: serverName,
          primitive: Object.keys(mcpServers[serverName])[selectedIndex] as McpPrimitiveType,
          method: Object.values(mcpServers[serverName])[selectedIndex] as McpMethodType
        }
        console.log(selectedPrimitive)
        return selectedPrimitive
      }
    },
    getServers: () => {
      // console.log('MCP:', window.mcpServers)
      return window.mcpServers
    }
  },

  actions: {
    getServerFunction: function (options: {
      serverName?: string
      primitiveName: string
      methodName: string
    }): Function | null {
      let selected: McpCoreType
      const { serverName, primitiveName, methodName } = options

      if (serverName !== undefined) {
        selected = this.getByServer(serverName)
      } else {
        selected = this.getSelected
      }

      if (selected?.primitive === primitiveName) {
        return selected.method[methodName] || null
      }
      return null
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

    //   getServerFunction: function (param1: string, param2: string, param3?: string): Function | null {
    //     let selected: McpCoreType;
    //     let primitiveName: string;
    //     let methodName: string;
    //     if (param3) {
    //         // Three parameters case: (serverName, primitiveName, methodName)
    //         const serverName = param1;
    //         primitiveName = param2;
    //         methodName = param3;
    //         selected = this.getByServer(serverName);
    //     } else {
    //         // Two parameters case: (primitiveName, methodName)
    //         primitiveName = param1;
    //         methodName = param2;
    //         selected = this.getSelected;
    //     }

    //     if (selected && selected.primitive === primitiveName) {
    //         const fun = selected.method[methodName];
    //         return fun;
    //     } else {
    //       return null
    //     }
    // },

    //   listServerTools: async function () {
    //     const mcpTools: any = []
    //     const fun = this.getServerFunction('tools', 'list')
    //     if (typeof fun === 'function') {
    //       const tools = await fun()
    //       if (tools && Array.isArray(tools.tools)) {
    //         for (const tool of tools.tools) {
    //           const unit = {
    //             type: 'function',
    //             function: {
    //               name: tool.name,
    //               description: tool.description,
    //               parameters: tool.inputSchema
    //               // strict: true
    //             }
    //           }
    //           console.log(unit)
    //           mcpTools.push(unit)
    //         }
    //       }
    //     }
    //     return mcpTools
    //   },

    // getServerFunction: function (primitiveName: string, methodName: string) {
    //   const selected = this.getSelected
    //   // const selected = this.getByServer(serverName)
    //   if (selected && selected.primitive === primitiveName) {
    //     const fun = selected.method[methodName]
    //     return fun
    //   }
    //   return null
    // },

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
      const mcpServers = this.getServers
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
      const mcpServers = this.getServers
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

      const result = await this.getServers[tool.server].tools.call(params)
      return result
    },
    convertItem: function (item) {
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
