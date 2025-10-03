import type {
  SamplingRequest,
  SamplingResponse,
  ElicitRequest,
  ElicitResponse,
  CommandRequest,
  CommandResponse,
  McpInitResponse
} from '@/main/types'

import { McpProgressCallbackObject } from '@/main/mcp/types'

import { SamplingMessage } from '@modelcontextprotocol/sdk/types'

export type {
  SamplingRequest,
  SamplingResponse,
  SamplingMessage,
  ElicitRequest,
  ElicitResponse,
  CommandResponse,
  McpInitResponse
}

export type SamplingRequestParams = SamplingRequest['params']

export type IpcSamplingRequest = {
  request: SamplingRequest
  responseChannel: string
}

export type IpcSamplingRequestCallback = (_event: Event, _progress: IpcSamplingRequest) => void

export type IpcElicitRequest = {
  request: ElicitRequest
  responseChannel: string
}

export type IpcElicitRequestCallback = (_event: Event, _progress: IpcElicitRequest) => void

export type IpcCommandRequest = {
  request: CommandRequest
}

export type IpcCommandRequestCallback = (_event: Event, _progress: IpcCommandRequest) => void

export type IpcMcpInitRequest = {
  callback: McpProgressCallbackObject
}

export type IpcMcpInitRequestCallback = (_event: Event, _progress: IpcMcpInitRequest) => void

export type IpcFileTransferRequest = { name: string; data: ArrayBuffer }

export type IpcFileTransferResponse =
  | { name: string; success: false; reason: string }
  | { name; success: true; path: string }
