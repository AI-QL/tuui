import {
  ListToolsResultSchema,
  CallToolResultSchema,
  ListPromptsResultSchema,
  GetPromptResultSchema,
  ListResourcesResultSchema,
  ReadResourceResultSchema,
  ListResourceTemplatesResultSchema
} from '@modelcontextprotocol/sdk/types.js'

import { Client } from '@modelcontextprotocol/sdk/client/index.js'

import {
  StdioClientTransport,
  StdioServerParameters
} from '@modelcontextprotocol/sdk/client/stdio.js'

import { McpMetadata } from '@/types/mcp'

export const McpServerCapabilitySchemas = {
  tools: {
    list: ListToolsResultSchema,
    call: CallToolResultSchema
  },
  prompts: {
    list: ListPromptsResultSchema,
    get: GetPromptResultSchema
  },
  resources: {
    list: ListResourcesResultSchema,
    read: ReadResourceResultSchema,
    'templates/list': ListResourceTemplatesResultSchema
  }
}

export type McpServerConfig = StdioServerParameters

export interface McpClientTransport {
  client: Client
  transport: StdioClientTransport
}

export type McpCallback = {
  name: string
  message: string
  status: 'pending' | 'error' | 'success'
}

export type McpProgressCallback = (
  ..._args: [McpCallback['name'], McpCallback['message'], McpCallback['status']]
) => void

export type McpMetadataConfig = {
  [key: string]: McpMetadata
}

export type McpClientObject = {
  name: string
  configJson?: McpServerConfig
  connection?: McpClientTransport
}

export type McpFeatureObject = {
  name: string
  config: McpClientObject['configJson']
}
