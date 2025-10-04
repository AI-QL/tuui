import type { ChatConversationMessage } from '@/renderer/types/message'

export type SessionId = string

export type SessionEntry = {
  id: SessionId
  messages: ChatConversationMessage[]
}
