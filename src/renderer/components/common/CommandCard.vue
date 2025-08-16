<script setup lang="ts">
import { CommandEvent } from '@/renderer/utils'
import { useMessageStore } from '@/renderer/store/message'
const messageStore = useMessageStore()

const handleProgress = (_event, progress) => {
  console.log('Command', progress)
  const params = progress.args[0]
  const conversations = [
    {
      content: params.prompt,
      role: 'user'
    }
  ]
  messageStore.applyPrompt(conversations)
  messageStore.userMessage = params.input
}

CommandEvent.callback(handleProgress)
</script>

<template>
  <slot></slot>
</template>
