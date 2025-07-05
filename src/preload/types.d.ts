import { DxtManifest } from '@anthropic-ai/dxt'
import { StdioServerParameters } from '@modelcontextprotocol/sdk/client/stdio.js'

export type DXT = {
  name: string
  manifest: DxtManifest
}

export type AsyncFunction = (..._args: any[]) => Promise<any>

export type McpMetadata =
  | {
      name: string
      type: 'metadata__stdio_config'
      config: StdioServerParameters
    }
  | {
      name: string
      type: 'metadata__dxt_manifest'
      config: DxtManifest
    }

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

export type MCPAPI = {
  [key: string]: McpObject
}
