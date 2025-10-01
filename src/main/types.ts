import {
  CreateMessageRequest as SamplingRequest,
  CreateMessageResult as SamplingResponse,
  ElicitRequest
} from '@modelcontextprotocol/sdk/types.js'

import { McpCallback } from './mcp/types'

export { SamplingRequest, SamplingResponse }

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
