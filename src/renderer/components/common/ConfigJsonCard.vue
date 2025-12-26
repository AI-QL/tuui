<script setup lang="ts">
import { ref, computed, watch } from 'vue'

defineOptions({
  inheritAttrs: false
})

const emit = defineEmits(['update:modelValue', 'onError', 'focus', 'blur'])

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue }

const props = defineProps({
  modelValue: {
    type: Object as () => {},
    required: true
  }
})

const handleFocus = () => {
  emit('focus')
}

const handleBlur = () => {
  emit('blur')
}

const json2Str = (json: JSONValue | {}) => {
  return JSON.stringify(json, null, 2)
}

const { modelValue: jsonParams } = props

const jsonString = ref(json2Str(jsonParams))

const editableSamplingParams = computed({
  get: () => jsonString.value,
  set: (value) => {
    console.log('JSON changed: ', value)
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
  () => jsonParams,
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
        v-bind="$attrs"
        :error-messages="jsonError"
        :hide-details="!Boolean(jsonError ?? '')"
        @focus="handleFocus"
        @blur="handleBlur"
      ></v-textarea>
    </v-card-text>
  </v-card>
</template>
