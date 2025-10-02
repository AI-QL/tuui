<script setup lang="ts">
import { CommandEvent } from '@/renderer/utils'
import { useMessageStore } from '@/renderer/store/message'
import type { IpcCommandRequestCallback } from '@/types/ipc'
import type { ChatConversationMessage } from '@/renderer/types/message'
const messageStore = useMessageStore()

const handleProgress: IpcCommandRequestCallback = (_event, progress) => {
  console.log('Command', progress)
  const params = progress.request
  const conversations = [
    {
      content: params.prompt,
      role: 'user'
    } as ChatConversationMessage
  ]
  messageStore.applyPrompt(conversations)
  messageStore.userMessage = params.input
}

CommandEvent.request(handleProgress)
</script>

<template>
  <slot></slot>
</template>
