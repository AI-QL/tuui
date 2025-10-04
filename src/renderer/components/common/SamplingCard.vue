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

import { IpcSamplingRequestCallback, SamplingRequestParams, SamplingResponse } from '@/types/ipc'

const snackbarStore = useSnackbarStore()

const allChatbotStore = useChatbotStore()

const messageStore = useMessageStore()

const chatbotStore = allChatbotStore.chatbots[allChatbotStore.selectedChatbotId]

const historyStore = useHistoryStore()

const samplingDialog = ref(false)

const samplingParams = ref<SamplingRequestParams | {}>({})

const samplingResults = ref<ChatCompletionResponseMessage[]>([])

const samplingChannel = ref('')

const jsonError = ref<string | null>(null)

function handleError(errorMessage: string | null) {
  jsonError.value = errorMessage
}

const samplingId = ref('')

const tryCompletions = () => {
  if (jsonError.value) {
    snackbarStore.showErrorMessage(jsonError.value)
  } else {
    if ('messages' in samplingParams.value) {
      // const { messages, ...restParams } = samplingParams.value
      // restParams.target = samplingResults.value
      samplingId.value = historyStore.getDate()
      createCompletion(
        {
          id: samplingId.value,
          messages: samplingResults.value
        },
        samplingParams.value
      )
    }
  }
}

const clearSampling = () => {
  samplingDialog.value = false
  samplingParams.value = {}
  samplingChannel.value = ''
  samplingResults.value.length = 0
  return
}

function responseSampling(response: SamplingResponse) {
  if (samplingChannel.value) {
    SamplingTransfer.response(samplingChannel.value, response)
  }
  clearSampling()
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
  responseSampling(response)
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
  responseSampling(response)
  return
}

const handleProgress: IpcSamplingRequestCallback = (_event, progress) => {
  console.log('Sampling', progress)
  samplingDialog.value = true
  samplingParams.value = progress.request.params
  samplingChannel.value = progress.responseChannel
}

SamplingTransfer.request(handleProgress)

type SamplingProgress = {
  auto: boolean
  percent: number
}

const samplingProgress = ref<SamplingProgress>({
  auto: true,
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
      samplingProgress.value.percent = 0
      continueAutoSampling()
    }
  }
)

function continueAutoSampling() {
  samplingProgress.value.auto = true
  startProgress(() => {
    if (samplingResults.value.length > 0) {
      startProgress(triggerSamplingReturn)
    } else {
      const timeout = setTimeout(() => {
        // Set a timeout if no generation is initiated within a period
        unwatch()
      }, 30000) // 30 sec
      const unwatch = watch(
        () => samplingId.value in messageStore.generating,
        (val) => {
          if (val) {
            // Generation has started, the timer is no longer needed. The watch will track the progress.
            clearTimeout(timeout)
          } else {
            clearTimeout(timeout)
            // If ChatCompletion generating finished, return result
            unwatch()
            samplingProgress.value.percent = 0
            startProgress(triggerSamplingReturn)
          }
        }
      )
      triggerChatCompletion()
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
          :indeterminate="samplingId in messageStore.generating"
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
