<script setup lang="ts">
import { ref } from 'vue'
import { SamplingTransfer } from '@/renderer/utils'
import { useSnackbarStore } from '@/renderer/store/snackbar'
import { useChatbotStore } from '@/renderer/store/chatbot'
import { useHistoryStore } from '@/renderer/store/history'
import { createCompletion } from '@/renderer/composables/chatCompletions'
import ConfigSamplingCard from './ConfigSamplingCard.vue'

import type { ChatCompletionResponseMessage } from '@/renderer/types/message'
import type {
  CreateMessageRequest,
  SamplingMessage as SamplingResponse
} from '@modelcontextprotocol/sdk/types'

type SamplingRequest = CreateMessageRequest['params']

const snackbarStore = useSnackbarStore()

const allChatbotStore = useChatbotStore()

const chatbotStore = allChatbotStore.chatbots[allChatbotStore.selectedChatbotId]

const historyStore = useHistoryStore()

const samplingDialog = ref(false)

const samplingParams = ref<SamplingRequest | {}>({})

const samplingResults = ref<ChatCompletionResponseMessage[]>([])

const samplingChannel = ref('')

const jsonError = ref<string | null>(null)

function handleError(errorMessage: string | null) {
  jsonError.value = errorMessage
}

const tryCompletions = () => {
  if (jsonError.value) {
    snackbarStore.showErrorMessage(jsonError.value)
  } else {
    const { messages, ...restParams } = samplingParams.value as SamplingRequest
    restParams.target = samplingResults.value
    createCompletion(messages, historyStore.getDate(), restParams)
  }
}

const clearSampling = () => {
  samplingDialog.value = false
  samplingParams.value = {}
  samplingChannel.value = ''
  samplingResults.value.length = 0
  return
}

const finishSampling = (index: number) => {
  const bestResponse: ChatCompletionResponseMessage = samplingResults.value[index]
  const response: SamplingResponse = {
    model: chatbotStore.model,
    role: bestResponse?.role || 'assistant',
    content: {
      type: 'text',
      text:
        bestResponse?.content ||
        bestResponse?.reasoning_content ||
        `No response from model ${chatbotStore.model}`
    }
  }
  SamplingTransfer.response(samplingChannel.value, response)
  clearSampling()
  return
}

const rejectSampling = () => {
  const response: SamplingResponse = {
    model: 'N/A',
    role: 'assistant',
    stopReason: 'Reject by user',
    content: {
      type: 'text',
      text: 'The sampling request was rejected by the user for containing non-compliant content.'
    }
  }
  SamplingTransfer.response(samplingChannel.value, response)
  clearSampling()
  return
}

const handleProgress = (_event, progress) => {
  console.log('Sampling', progress)
  samplingDialog.value = true
  samplingParams.value = progress.args[0].params
  samplingChannel.value = progress.responseChannel
}

SamplingTransfer.request(handleProgress)
</script>

<template>
  <!-- For UI visualization without chat -->
  <!-- <v-btn @click="samplingDialog = true" color="surface-variant" text="Open Dialog" variant="flat"></v-btn> -->
  <v-dialog v-model="samplingDialog" persistent max-width="80vw" max-height="80vh" scrollable>
    <v-card :title="$t('sampling.title')">
      <v-card-text>
        <ConfigSamplingCard v-model="samplingParams" @on-error="handleError"></ConfigSamplingCard>
        <v-data-iterator :items="samplingResults" :items-per-page="-1">
          <template #default="{ items }">
            <template v-for="(item, index) in items" :key="index">
              <v-card>
                <v-card-text>
                  <v-textarea
                    v-if="item.raw.reasoning_content"
                    class="conversation-area text-disabled font-italic"
                    variant="plain"
                    :model-value="item.raw.reasoning_content.trim()"
                    outlined
                    readonly
                    auto-grow
                  ></v-textarea>
                  <v-textarea
                    v-if="item.raw.content"
                    variant="plain"
                    :model-value="item.raw.content.trim()"
                    outlined
                    readonly
                    auto-grow
                  ></v-textarea>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-icon-btn
                    v-tooltip:start="$t('sampling.confirm')"
                    icon="mdi-check-bold"
                    color="success"
                    variant="plain"
                    rounded="lg"
                    @click="finishSampling(index)"
                  ></v-icon-btn>
                </v-card-actions>
              </v-card>
              <br />
            </template>
          </template>
        </v-data-iterator>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-icon-btn
          v-tooltip:top="$t('sampling.reject')"
          icon="mdi-cancel"
          color="error"
          variant="plain"
          rounded="lg"
          @click="rejectSampling"
        ></v-icon-btn>
        <v-icon-btn
          v-tooltip:top="$t('sampling.comp')"
          :icon="samplingResults.length === 0 ? 'mdi-arrow-up' : 'mdi-autorenew'"
          color="primary"
          variant="plain"
          rounded="lg"
          @click="tryCompletions"
        ></v-icon-btn>
        <v-icon-btn
          v-if="samplingResults.length > 0"
          v-tooltip:top="$t('sampling.confirm-last')"
          icon="mdi-check-bold"
          color="success"
          variant="plain"
          rounded="lg"
          @click="finishSampling(samplingResults.length - 1)"
        ></v-icon-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
