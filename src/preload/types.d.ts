import { DxtManifest } from '@anthropic-ai/dxt'
import { StdioServerParameters } from '@modelcontextprotocol/sdk/client/stdio.js'

export type AsyncFunction = (..._args: any[]) => Promise<any>

export type McpMetadataStdio = {
  name: string
  type: 'metadata__stdio_config'
  config: StdioServerParameters
}

export type McpMetadataDxt = {
  name: string
  type: 'metadata__dxt_manifest'
  config: DxtManifest
}

export type McpMetadata = McpMetadataStdio | McpMetadataDxt

export type McpObject = {
  metadata?: McpMetadata
  tools?: {
    list?: AsyncFunction
    call?: AsyncFunction
  }
  prompts?: {
    list?: AsyncFunction
    get?: AsyncFunction
  }
  resources?: {
    list?: AsyncFunction
    read?: AsyncFunction
  }
}

export type MCPAPI = Record<string, McpObject>

export type DXTAPI = Record<string, DxtManifest>
