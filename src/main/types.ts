import {
  CreateMessageResult as SamplingResult,
  ElicitRequest
} from '@modelcontextprotocol/sdk/types.js'

import { McpCallback } from './mcp/types'

type CommandRequest = {
  prompt: string
  input: string
}

export interface IpcSamplingEvents {
  msgSamplingTransferInvoke: (_message: SamplingResult) => void
}

export interface IpcElicitationEvents {
  msgElicitationTransferInvoke: (_message: ElicitRequest) => void
}

export interface IpcCommandEvents {
  msgCommandSelectionInvoke: (_message: CommandRequest) => void
}

export interface IpcMcpEvents {
  msgMcpServersWatch: (_message: McpCallback) => void
}
