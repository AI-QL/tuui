<script setup lang="ts">
import { ref, watch } from 'vue'
import { SamplingTransfer } from '@/renderer/utils'
import { useSnackbarStore } from '@/renderer/store/snackbar'
import { useChatbotStore } from '@/renderer/store/chatbot'
import { useHistoryStore } from '@/renderer/store/history'
import { useMessageStore } from '@/renderer/store/message'
import { createCompletion } from '@/renderer/composables/chatCompletions'
import ConfigJsonCard from './ConfigJsonCard.vue'

import type { ChatCompletionResponseMessage } from '@/renderer/types/message'
import type {
  CreateMessageRequest,
  SamplingMessage as SamplingResponse
} from '@modelcontextprotocol/sdk/types'

type SamplingRequest = CreateMessageRequest['params']

const snackbarStore = useSnackbarStore()

const allChatbotStore = useChatbotStore()

const messageStore = useMessageStore()

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

type SamplingProgress = {
  auto: boolean
  stage: 1 | 2 // completion -> finishing
  percent: number
}

const samplingProgress = ref<SamplingProgress>({
  auto: true,
  stage: 1,
  percent: 0
})

function startProgress(triggerEvent: Function) {
  const duration = 5000
  const increment = 100 / (duration / 100)
  let current = samplingProgress.value.percent

  const interval = setInterval(() => {
    current += increment
    if (current >= 100) {
      current = 100
      clearInterval(interval)
      triggerEvent()
    }
    if (samplingProgress.value.auto) {
      samplingProgress.value.percent = current
    } else {
      clearInterval(interval)
    }
  }, 100)
}

function triggerChatCompletion() {
  if (samplingProgress.value.auto) {
    tryCompletions()
  }
}

function triggerSamplingReturn() {
  if (samplingProgress.value.auto) finishSampling(samplingResults.value.length - 1)
}

watch(
  () => samplingDialog.value,
  (newVal) => {
    if (newVal) {
      // Dialog opened, clean stage
      samplingProgress.value.stage = 1
      samplingProgress.value.percent = 0
      continueAutoSampling()
    }
  }
)

function continueAutoSampling() {
  samplingProgress.value.auto = true
  startProgress(() => {
    switch (samplingProgress.value.stage) {
      case 1:
        const unwatch = watch(
          () => messageStore.generating,
          (val) => {
            if (val) {
              // If next ChatCompletion triggered, goto stage 2
              // and keep waiting for the finishing
              samplingProgress.value.stage = 2
            } else {
              // If ChatCompletion generating finished, return result
              unwatch()
              samplingProgress.value.percent = 0
              startProgress(triggerSamplingReturn)
            }
          }
        )
        triggerChatCompletion()
        break
      case 2:
        startProgress(triggerSamplingReturn)
        break
      default:
        // Should not happen
        console.log('Undefined stage', samplingProgress.value)
    }
  })
}
</script>

<template>
  <!-- For UI visualization without chat -->
  <!-- <v-btn @click="samplingDialog = true" color="surface-variant" text="Open Dialog" variant="flat"></v-btn> -->
  <v-dialog v-model="samplingDialog" persistent max-width="80vw" max-height="80vh" scrollable>
    <v-card :title="$t('sampling.title')">
      <v-divider></v-divider>
      <v-card-text>
        <ConfigJsonCard
          v-model="samplingParams"
          @on-error="handleError"
          @focus="samplingProgress.auto = false"
        >
        </ConfigJsonCard>
        <v-data-iterator :items="samplingResults" :items-per-page="-1">
          <template #default="{ items }">
            <template v-for="(item, index) in items" :key="index">
              <v-card class="mx-4">
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
      <v-divider></v-divider>
      <v-card-actions>
        <v-progress-linear
          v-model="samplingProgress.percent"
          class="ml-8 mr-4"
          color="primary"
          :indeterminate="Boolean(messageStore.generating)"
          rounded
          @click="samplingProgress.auto = false"
        ></v-progress-linear>
        <v-spacer></v-spacer>
        <v-btn
          v-if="samplingProgress.auto"
          v-tooltip:top="$t('sampling.pause')"
          icon="mdi-pause"
          color="primary"
          variant="plain"
          rounded="lg"
          @click="samplingProgress.auto = false"
        ></v-btn>
        <v-btn
          v-else
          v-tooltip:top="$t('sampling.continue')"
          icon="mdi-play"
          color="primary"
          variant="plain"
          rounded="lg"
          @click="continueAutoSampling()"
        ></v-btn>
        <v-btn
          v-tooltip:top="$t('sampling.reject')"
          icon="mdi-cancel"
          color="error"
          variant="plain"
          rounded="lg"
          @click="rejectSampling"
        ></v-btn>
        <v-btn
          v-tooltip:top="$t('sampling.comp')"
          :icon="samplingResults.length === 0 ? 'mdi-arrow-up' : 'mdi-autorenew'"
          color="primary"
          variant="plain"
          rounded="lg"
          @click="tryCompletions"
        ></v-btn>
        <v-btn
          v-if="samplingResults.length > 0"
          v-tooltip:top="$t('sampling.confirm-last')"
          icon="mdi-check-bold"
          color="success"
          variant="plain"
          rounded="lg"
          @click="finishSampling(samplingResults.length - 1)"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
