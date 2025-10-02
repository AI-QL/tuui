import {
  ClientResult as McpClientResponse,
  CreateMessageRequest as SamplingRequest,
  CreateMessageResult as SamplingResponse,
  ElicitRequest,
  ElicitResult as ElicitResponse
} from '@modelcontextprotocol/sdk/types.js'

export type CommandResponse = {
  prompt: string
  id: string
}

export type CommandRequest = {
  prompt: string
  input: string
}

export type McpInitResponse =
  | {
      status: 'success'
    }
  | {
      status: 'error'
      error: string
    }

export { McpClientResponse, SamplingRequest, SamplingResponse, ElicitRequest, ElicitResponse }
