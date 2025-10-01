import type { ClientResult as McpClientResult } from '@modelcontextprotocol/sdk/types'

import type { SamplingRequest } from '@/main/types'

export type { McpClientResult, SamplingRequest }

export type IpcSamplingRequest = {
  request: SamplingRequest
  responseChannel: string
}

export type IpcSamplingRequestCallback = (_event: Event, _progress: IpcSamplingProgress) => void
