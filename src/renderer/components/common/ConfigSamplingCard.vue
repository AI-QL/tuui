<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { CreateMessageRequest } from '@modelcontextprotocol/sdk/types'

type SamplingRequest = CreateMessageRequest['params']

const emit = defineEmits(['update:modelValue', 'onError'])

const props = defineProps({
  modelValue: {
    type: Object as () => SamplingRequest | {},
    required: true
  }
})

const json2Str = (json: SamplingRequest | {}) => {
  return JSON.stringify(json, null, 2)
}

const { modelValue: samplingParams } = props

const jsonString = ref(json2Str(samplingParams))

const editableSamplingParams = computed({
  get: () => jsonString.value,
  set: (value) => {
    console.log('Sampling value changed: ', value)
    jsonString.value = value
    try {
      const parsed = JSON.parse(value)
      emit('update:modelValue', parsed)
      jsonError.value = null
      emit('onError', null)
    } catch (e: any) {
      jsonError.value = e.message
      emit('onError', e.message)
    }
  }
})

const jsonError = ref<string | null>(null)

watch(
  () => samplingParams,
  (newVal) => {
    jsonString.value = json2Str(newVal)
  },
  { deep: true }
)
</script>

<template>
  <v-card variant="text">
    <v-card-text>
      <v-textarea
        v-model="editableSamplingParams"
        variant="solo"
        outlined
        auto-grow
        :error-messages="jsonError"
      ></v-textarea>
    </v-card-text>
  </v-card>
</template>
