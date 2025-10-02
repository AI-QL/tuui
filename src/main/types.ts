import {
  ClientResult as McpClientResponse,
  CreateMessageRequest as SamplingRequest,
  CreateMessageResult as SamplingResponse,
  ElicitRequest,
  ElicitResult as ElicitResponse
} from '@modelcontextprotocol/sdk/types.js'

import { McpCallback } from './mcp/types'

export type CommandResponse = {
  prompt: string
  id: string
}

export type CommandRequest = {
  prompt: string
  input: string
}

export { McpClientResponse, SamplingRequest, SamplingResponse, ElicitRequest, ElicitResponse }

export interface IpcMcpEvents {
  msgMcpServersWatch: (_message: McpCallback) => void
}
