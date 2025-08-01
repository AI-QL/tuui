import {
  // CreateMessageRequestSchema,

  // CompleteResultSchema,

  ListToolsResultSchema,
  CallToolResultSchema,
  ListPromptsResultSchema,
  GetPromptResultSchema,
  ListResourcesResultSchema,
  ReadResourceResultSchema,
  ListResourceTemplatesResultSchema,
  CreateMessageResult as SamplingResult,
  ElicitRequest
} from '@modelcontextprotocol/sdk/types.js'

import { DxtUserConfigValues, DxtManifest } from '@anthropic-ai/dxt'

import { StdioServerParameters } from '@modelcontextprotocol/sdk/client/stdio.js'

import { Client } from '@modelcontextprotocol/sdk/client/index.js'

import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

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

type McpMetadataStdio = {
  name: string
  type: 'metadata__stdio_config'
  config: ServerConfig
}

type McpMetadataDxt = {
  name: string
  type: 'metadata__dxt_manifest'
  config: DxtManifest
  user_config?: DxtUserConfigValues
}

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

export interface IpcSamplingEvents {
  msgSamplingTransferInvoke: (_message: SamplingResult) => void
}

export interface IpcElicitationEvents {
  msgElicitationTransferInvoke: (_message: ElicitRequest) => void
}
