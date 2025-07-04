<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { SamplingTransfer } from '@/renderer/utils'
import { useSnackbarStore } from '@/renderer/store/snackbar'
import { useChatbotStore } from '@/renderer/store/chatbot'
import { createCompletion } from '@/renderer/composables/chatCompletions'
import type { ChatCompletionResponseMessage } from '@/renderer/types/message'

const snackbarStore = useSnackbarStore()

const allChatbotStore = useChatbotStore()

const chatbotStore = allChatbotStore.chatbots[allChatbotStore.selectedChatbotId]

const samplingDialog = ref(false)

const samplingParams = ref({})

const samplingResults = ref<ChatCompletionResponseMessage[]>([])

const samplingChannel = ref('')

const jsonError = ref<string | null>(null)

const json2Str = (json: unknown) => {
  return JSON.stringify(json, null, 2)
}

const jsonString = ref(json2Str(samplingParams.value))

// samplingParams -> jsonString -> editableSamplingParams

watch(
  () => samplingParams.value,
  (newVal) => {
    jsonString.value = json2Str(newVal)
  },
  { deep: true }
)

const editableSamplingParams = computed({
  get: () => jsonString.value,
  set: (value) => {
    console.log('Sampling value changed: ', value)
    jsonString.value = value
    try {
      JSON.parse(value)
      jsonError.value = null
    } catch (e: any) {
      jsonError.value = e.toString()
    }
  }
})

const tryCompletions = () => {
  if (jsonError.value) {
    snackbarStore.showErrorMessage(jsonError.value)
  } else {
    const completionParams = JSON.parse(jsonString.value)
    console.log(completionParams)
    const { messages, ...restParams } = completionParams
    restParams.target = samplingResults.value
    createCompletion(messages, restParams)
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
  const bestResponse: any = samplingResults.value[index]
  const response = {
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
  const response = {
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
  <!-- <v-btn @click="samplingDialog = true" color="surface-variant" text="Open Dialog" variant="flat"></v-btn> -->
  <v-dialog v-model="samplingDialog" persistent>
    <v-card :title="$t('sampling.title')">
      <v-card-text>
        <v-textarea
          v-model="editableSamplingParams"
          variant="solo"
          outlined
          auto-grow
          :error-messages="jsonError"
        ></v-textarea>
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
                    icon="mdi-hand-okay"
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
        <!-- <v-textarea v-if="samplingResults.length > 0" variant="solo" :model-value="json2Str(samplingResults)" outlined
          readonly auto-grow></v-textarea> -->
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
          icon="mdi-file-document-refresh-outline"
          color="primary"
          variant="plain"
          rounded="lg"
          @click="tryCompletions"
        ></v-icon-btn>
        <!-- <v-icon-btn v-if="samplingResults.length > 0" v-tooltip:top="$t('sampling.confirm')" icon="mdi-hand-okay"
          color="success" variant="plain" rounded="lg" @click="finishSampling"></v-icon-btn> -->
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
