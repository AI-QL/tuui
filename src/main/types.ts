import {
  ClientResult as McpClientResponse,
  CreateMessageRequest as SamplingRequest,
  CreateMessageResult as SamplingResponse,
  ElicitRequest,
  ElicitResult as ElicitResponse
} from '@modelcontextprotocol/sdk/types.js'

import { McpCallback } from './mcp/types'

export { McpClientResponse, SamplingRequest, SamplingResponse, ElicitRequest, ElicitResponse }

type CommandRequest = {
  prompt: string
  input: string
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
