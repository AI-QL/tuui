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
  GetPromptResult,
  Implementation as McpServerImplementation
} from '@modelcontextprotocol/sdk/types.d.ts'

import { StdioServerParameters } from '@modelcontextprotocol/sdk/client/stdio.js'

import { McpbManifestAny, McpbUserConfigValues } from '@anthropic-ai/mcpb'

export type TypedAsyncFunction<Args extends any[], Result> = (..._args: Args) => Promise<Result>

export type McpAsyncToolsList = TypedAsyncFunction<[ListToolsRequest], ListToolsResult>
export type McpAsyncToolsCall = TypedAsyncFunction<[CallToolRequest], CallToolResult>

export type McpAsyncPromptsList = TypedAsyncFunction<[ListPromptsRequest], ListPromptsResult>
export type McpAsyncPromptsGet = TypedAsyncFunction<[GetPromptRequest], GetPromptResult>

export type McpAsyncResourcesList = TypedAsyncFunction<[ListResourcesRequest], ListResourcesResult>
export type McpAsyncResourcesRead = TypedAsyncFunction<[ReadResourceRequest], ReadResourceResult>

export type AsyncFunction =
  | McpAsyncToolsList
  | McpAsyncToolsCall
  | McpAsyncPromptsList
  | McpAsyncPromptsGet
  | McpAsyncResourcesList
  | McpAsyncResourcesRead

export type userConfigValue = McpbUserConfigValues[string]

export type McpMetadataStdio = {
  name: string
  type: 'metadata__stdio_config'
  config: StdioServerParameters
  description?: McpServerDescription
}

type McpDxtError = {
  field: string
  message: string
}

export type McpDxtErrors = {
  errors: McpDxtError[]
}

export type { McpbManifestAny }

export type McpMetadataDxt = {
  name: string
  type: 'metadata__mcpb_manifest'
  config: McpbManifestAny | McpDxtErrors
  user_config?: McpbUserConfigValues
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

export type McpToolType = ListToolsResult['tools'][number]

export type ToolType = {
  name: McpToolType['name']
  description: McpToolType['description']
  // Rename inputSchema to parameters to comply with the OpenAI SDK
  parameters: McpToolType['inputSchema']
}

export type MCPAPI = Record<string, McpObject>

export type DXTAPI = Record<string, McpbManifestAny>

export type ClientProfile = {
  name: string
  tools?: Record<string, string>
  prompts?: Record<string, string>
  resources?: Record<string, string>
  config?: StdioServerParameters
  description?: McpServerDescription
}

export type McpServerDescription = {
  instructions: string
  implementation: McpServerImplementation
}
