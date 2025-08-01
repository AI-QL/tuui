import type {
  CallToolRequest,
  CallToolResult,
  ListToolsRequest,
  ListToolsResult,
  ListResourcesRequest,
  ListResourcesResult,
  ReadResourceRequest,
  ReadResourceResult,
  ListPromptsRequest,
  ListPromptsResult,
  GetPromptRequest,
  GetPromptResult
} from '@modelcontextprotocol/sdk/types.d.ts'

import { DxtManifest, DxtUserConfigValues } from '@anthropic-ai/dxt'
import { StdioServerParameters } from '@modelcontextprotocol/sdk/client/stdio.js'

export type TypedAsyncFunction<Args extends any[], Result> = (...args: Args) => Promise<Result>

export type McpAsyncToolsList = TypedAsyncFunction<[ListToolsRequest], ListToolsResult>
export type McpAsyncToolsCall = TypedAsyncFunction<[CallToolRequest], CallToolResult>

export type McpAsyncPromptsList = TypedAsyncFunction<[ListPromptsRequest], ListPromptsResult>
export type McpAsyncPromptsGet = TypedAsyncFunction<[GetPromptRequest], GetPromptResult>

export type McpAsyncResourcesList = TypedAsyncFunction<[ListResourcesRequest], ListResourcesResult>
export type McpAsyncResourcesRead = TypedAsyncFunction<[ReadResourceRequest], ReadResourceResult>

export type McpMetadataStdio = {
  name: string
  type: 'metadata__stdio_config'
  config: StdioServerParameters
}

export type userConfigValue = DxtUserConfigValues[string]

export type McpMetadataDxt = {
  name: string
  type: 'metadata__dxt_manifest'
  config: DxtManifest
  user_config?: DxtUserConfigValues
}

export type McpMetadata = McpMetadataStdio | McpMetadataDxt

export type McpObject = {
  metadata?: McpMetadata
  tools?: {
    list?: McpAsyncToolsList
    call?: McpAsyncToolsCall
  }
  prompts?: {
    list?: McpAsyncPromptsList
    get?: McpAsyncPromptsGet
  }
  resources?: {
    list?: McpAsyncResourcesList
    read?: McpAsyncResourcesRead
  }
}

export type MCPAPI = Record<string, McpObject>

export type DXTAPI = Record<string, DxtManifest>
