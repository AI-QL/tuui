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

import { McpMetadataStdio, McpMetadataDxt } from '@/types/mcp'

export const capabilitySchemas = {
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

export type ServerConfig = StdioServerParameters

export interface McpClientTransport {
  client: Client
  transport: StdioClientTransport
}

export interface McpServersConfig {
  [key: string]: ServerConfig
}

export type ConfigObj = {
  [key: string]: ServerConfig
}

export type McpCallback = {
  name: string
  message: string
  status: 'pending' | 'error' | 'success'
}

export type McpProgressCallback = (
  ..._args: [McpCallback['name'], McpCallback['message'], McpCallback['status']]
) => void

export type ConfigMcpMetadata = {
  [key: string]: McpMetadataStdio | McpMetadataDxt
}

export type ClientObj = {
  name: string
  configJson?: ServerConfig
  connection?: McpClientTransport
}

export type FeatureObj = {
  name: string
  config: ClientObj['configJson']
}
