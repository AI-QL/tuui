import { DxtManifest } from '@anthropic-ai/dxt'

export type DXT = {
  name: string
  manifest: DxtManifest
}

export type AsyncFunction = (..._args: any[]) => Promise<any>

export type MCPAPI = {
  [key: string]: {
    config?: Record<string, any>
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
}
