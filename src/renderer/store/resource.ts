import { defineStore } from 'pinia'
import { useMcpStore } from '@/renderer/store/mcp'

import { ListResourcesResult, ListResourceTemplatesResult } from '@modelcontextprotocol/sdk/types'

type ResourceTemplatesType = ListResourceTemplatesResult['resourceTemplates']

type ResourcesType = ListResourcesResult['resources']

type CursorType = ListResourcesResult['nextCursor']

type ResourceRecordType = {
  resource: ResourceItemType
  template: ResourceTemplateType
}

type ResourceItemType = {
  perPage: number
  cursor: CursorType
  list: ResourcesType
}

type ResourceTemplateType = {
  perPage: number
  cursor: CursorType
  list: ResourceTemplatesType
}

export const emptyItem: ResourceItemType | ResourceTemplateType = {
  perPage: -1,
  cursor: undefined,
  list: []
}

export const useResourceStore = defineStore('resourceStore', {
  state: () => ({
    data: {} as Record<string, ResourceRecordType>,
    loadingTemplates: false,
    loadingResources: false
  }),
  actions: {
    loadTemplates: function (serverName: string) {
      this.loadingTemplates = true
      const mcpStore = useMcpStore()
      const resourceFunction = mcpStore.getServerFunction({
        serverName,
        primitiveName: 'resources',
        methodName: 'templates/list'
      })
      try {
        resourceFunction().then((result: ListResourceTemplatesResult) => {
          console.log(result)
          this.data[serverName] = this.data[serverName] || {}
          this.data[serverName].template = {
            perPage: -1,
            cursor: result.nextCursor,
            list: result.resourceTemplates
          }
        })
      } catch (error) {
        console.error('Failed to load resource templates:', error)
      } finally {
        this.loadingTemplates = false
      }
    },
    loadResources: async function (serverName: string) {
      // Already loaded
      if (this.data[serverName] && 'resource' in this.data[serverName]) return

      this.loadingResources = true
      const mcpStore = useMcpStore()
      const resourceFunction = mcpStore.getServerFunction({
        serverName,
        primitiveName: 'resources',
        methodName: 'list'
      })

      try {
        const result: ListResourcesResult = await resourceFunction()
        console.log(result)
        const resources: ResourcesType = result.resources
        this.data[serverName] = this.data[serverName] || {}
        this.data[serverName].resource = {
          perPage: resources.length,
          cursor: result.nextCursor,
          list: resources
        }
      } catch (error) {
        console.error('Failed to load resources:', error)
      } finally {
        this.loadingResources = false
      }
    },
    getNextpage: async function (serverName: string) {
      if (!this.data[serverName]?.resource?.cursor) {
        return
      }
      this.loadingResources = true
      const currentResource = this.data[serverName].resource

      try {
        const mcpStore = useMcpStore()
        const resourceFunction = mcpStore.getServerFunction({
          serverName,
          primitiveName: 'resources',
          methodName: 'list'
        })

        const result: ListResourcesResult = await resourceFunction({
          method: 'resources/list',
          params: {
            cursor: currentResource.cursor
          }
        })

        console.log(result)
        const resources: ResourcesType = result.resources

        currentResource.list = [...currentResource.list, ...resources]
        currentResource.cursor = result.nextCursor
      } catch (error) {
        console.error('Failed to load resources:', error)
      } finally {
        this.loadingResources = false
      }
    }
  }
})
