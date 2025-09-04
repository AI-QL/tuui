<script setup lang="tsx">
import { ref } from 'vue'
import { useSnackbarStore } from '@/renderer/store/snackbar'

interface MessageContentItem {
  type: string
  text: string
}

interface Message {
  content: string | MessageContentItem[]
}

const props = defineProps({
  index: { type: Number, required: true },
  range: { type: Number, default: 1 },
  messages: { type: Object, required: true },
  showContent: { type: Boolean, default: false },
  showDelete: { type: Boolean, default: true },
  showReduce: { type: Boolean, default: true },
  showModify: { type: Boolean, default: false },
  showCopy: { type: Boolean, default: true }
})

const emit = defineEmits<{
  (_e: 'delete-messages', _payload: { index: number; range: number }): void
}>()

const emitDeleteMessage = () => {
  emit('delete-messages', {
    index: props.index,
    range: props.range
  })
}

const emitDeleteMessageRange = () => {
  emit('delete-messages', {
    index: 0,
    range: props.index
  })
}

const showcontent = ref(false)
const showmodify = ref(false)
const snackbarStore = useSnackbarStore()

const copyToClipboard = async (msg: Message) => {
  let textToCopy = ''

  try {
    if (typeof msg.content === 'string') {
      textToCopy = msg.content
    } else if (Array.isArray(msg.content)) {
      for (const item of msg.content) {
        if (item.type === 'text' && typeof item.text === 'string') {
          textToCopy = item.text
          break // 只取第一个文本内容
        }
      }
    }

    await navigator.clipboard.writeText(textToCopy)
    snackbarStore.showSuccessMessage('snackbar.copied')
  } catch (err) {
    snackbarStore.showErrorMessage(err instanceof Error ? err.message : String(err))
  }
}
</script>
<template>
  <v-hover open-delay="100">
    <template #default="{ isHovering, props: hoverProps }">
      <v-card v-bind="hoverProps" :elevation="isHovering ? 4 : 2" width="100vw" max-width="100%">
        <slot :showcontent="showcontent" :showmodify="showmodify" />
        <v-expand-transition>
          <div v-if="isHovering">
            <v-divider />
            <v-card-actions>
              <!-- Copy Button -->
              <v-btn
                v-if="showCopy"
                color="primary"
                icon="mdi-content-copy"
                size="x-small"
                variant="plain"
                @click="copyToClipboard(messages[index])"
              />

              <!-- Modify Button -->
              <v-btn
                v-if="showModify"
                color="primary"
                :icon="showmodify ? 'mdi-check-bold' : 'mdi-lead-pencil'"
                size="x-small"
                variant="plain"
                @click="showmodify = !showmodify"
              />

              <!-- Content Toggle Button -->
              <v-btn
                v-if="showContent"
                color="primary"
                :icon="showcontent ? 'mdi-eye-remove' : 'mdi-eye'"
                size="x-small"
                variant="plain"
                @click="showcontent = !showcontent"
              />

              <v-spacer />

              <!-- Reduce Button -->
              <v-btn
                v-if="showReduce && index > 0"
                color="error"
                icon="mdi-format-align-top"
                size="x-small"
                variant="plain"
                @click="emitDeleteMessageRange"
              />

              <!-- Delete Button -->
              <v-btn
                v-if="showDelete"
                color="error"
                icon="mdi-delete-outline"
                size="x-small"
                variant="plain"
                @click="emitDeleteMessage"
              />
            </v-card-actions>
          </div>
        </v-expand-transition>
      </v-card>
    </template>
  </v-hover>
</template>
