<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { getServers } from '@/renderer/store/mcp'
import { useStdioStore, CustomStdioServerParameters, StdioServerKey } from '@/renderer/store/stdio'

import ConfigJsonCard from '@/renderer/components/common/ConfigJsonCard.vue'

const stdioStore = useStdioStore()

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  name: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const internalDialog = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newVal) => {
    internalDialog.value = newVal
  }
)

watch(internalDialog, (newVal) => {
  emit('update:modelValue', newVal)
})

const closeDialog = () => {
  internalDialog.value = false
}

function findConfig(jsonConfig): CustomStdioServerParameters {
  if (!jsonConfig) return {}
  if ('command' in jsonConfig) {
    return jsonConfig
  } else {
    return findConfig(Object.values(jsonConfig)[0])
  }
}

const updateConfig = () => {
  const jsonConfig = findConfig(jsonParams.value)

  ;(['command', 'args', 'env'] as StdioServerKey[]).forEach((key) => {
    const value = jsonConfig[key]
    if (value) {
      stdioStore.updateConfigAttribute(props.name, key, value)
    }
  })

  closeDialog()
}

const jsonError = ref<string | null>(null)

function handleError(errorMessage: string | null) {
  jsonError.value = errorMessage
}

const jsonParams = ref<CustomStdioServerParameters>({})

onMounted(() => {
  const configs = getServers()
  if (!configs) return
  const config = configs[props.name]
  if (!config) return
  const stdioConfig = config.metadata?.config
  if (stdioConfig) {
    jsonParams.value = stdioConfig as CustomStdioServerParameters
  }
})
</script>

<template>
  <v-dialog v-model="internalDialog" persistent max-width="80vw" max-height="80vh" scrollable>
    <v-card>
      <v-card-title>
        {{ props.name }}
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="mt-2">
        <ConfigJsonCard v-model="jsonParams" @on-error="handleError"></ConfigJsonCard>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          variant="plain"
          rounded="lg"
          icon="mdi-close-box"
          color="error"
          @click="closeDialog"
        ></v-btn>
        <v-btn
          variant="plain"
          rounded="lg"
          icon="mdi-content-save-plus"
          :disabled="Boolean(jsonError ?? '')"
          color="success"
          @click="updateConfig()"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
