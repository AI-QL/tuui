import type { ChatConversationMessage } from '@/renderer/types/message'

import { Tool as McpToolMessage } from '@modelcontextprotocol/sdk/types'

export type SessionId = string

export type { McpToolMessage }

export type SessionEntry = {
  id: SessionId
  messages: ChatConversationMessage[]
  tools?: McpToolMessage[]
}
