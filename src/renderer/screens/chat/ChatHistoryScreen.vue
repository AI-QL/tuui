<script setup lang="ts">
import { computed } from 'vue'
import { useHistoryStore } from '@/renderer/store/history'
import { useMessageStore } from '@/renderer/store/message'
import { ChatConversationMessage } from '@/renderer/types/message'
const historyStore = useHistoryStore()
const messageStore = useMessageStore()

function parseContent(content: undefined | string | ChatConversationMessage['content']) {
  if (typeof content === 'string') {
    return content
  } else if (Array.isArray(content)) {
    for (const item of content) {
      if (item.type === 'text') {
        return item.text
      }
    }
    return 'NA'
  } else {
    return content
  }
}

const selectedConversation = computed({
  get: () => [messageStore.conversation.id],
  set: ([value]) => {
    historyStore.select(value)
  }
})
</script>
<template>
  <v-list v-model:selected="selectedConversation" nav>
    <v-list-item
      v-for="(item, index) in historyStore.conversations"
      :key="item.id"
      :ripple="false"
      two-line
      :value="item.id"
      link
      :title="parseContent(item.messages[0]?.content)"
      :subtitle="parseContent(item.messages.at(-1)?.content)"
    >
      <template #append>
        <v-list-item-action>
          <v-icon-btn
            :loading="item.id in messageStore.generating"
            icon="mdi-delete-outline"
            rounded="lg"
            size="small"
            @click="historyStore.deleteById(index)"
          >
          </v-icon-btn>
        </v-list-item-action>
      </template>
    </v-list-item>
  </v-list>
</template>
