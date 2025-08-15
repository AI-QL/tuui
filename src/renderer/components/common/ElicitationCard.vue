<script setup lang="ts">
import { ref, toRaw } from 'vue'
import { ElicitationTransfer } from '@/renderer/utils'
import type { ElicitRequest, ElicitResult } from '@modelcontextprotocol/sdk/types'
import { validateNumberRange } from '@/renderer/store/dxt'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

type ElicitRequestParams = ElicitRequest['params']

// type ElicitationProperty = ElicitRequestParams['requestedSchema']['properties'][string]['type']

type ElicitationProperty = string | number | boolean | null

const elicitationResults = ref<Record<string, ElicitationProperty>>({})

const elicitationDialog = ref(false)

const elicitationParams = ref<ElicitRequestParams | {}>({})

const elicitationChannel = ref('')

const getConfigAttribute = (name: string) => {
  return elicitationResults.value[name] ?? null
}

const updateConfigAttribute = (name: string, value: ElicitationProperty) => {
  elicitationResults.value[name] = value
}

const dynamicModel = (name: string) => ({
  get: () => getConfigAttribute(name),
  set: (val: ElicitationProperty) => updateConfigAttribute(name, val)
})

const declineElicitation = () => {
  const response: ElicitResult = {
    action: 'decline'
  }
  ElicitationTransfer.response(elicitationChannel.value, response)
  clearSampling()
  return
}

// const cancelElicitation = () => {
//   const response: ElicitResult = {
//     "action": "cancel"
//   }
//   ElicitationTransfer.response(elicitationChannel.value, response)
//   clearSampling()
//   return
// }

const acceptElicitation = () => {
  const response: ElicitResult = {
    action: 'accept',
    content: toRaw(elicitationResults.value)
  }
  ElicitationTransfer.response(elicitationChannel.value, response)
  clearSampling()
  return
}

const clearSampling = () => {
  elicitationDialog.value = false
  elicitationParams.value = {}
  elicitationChannel.value = ''
  elicitationResults.value = {}
  return
}

const getErrorState = (key: string): boolean => {
  const value = elicitationParams.value

  if (value && typeof value === 'object' && 'requestedSchema' in value) {
    const isRequired = value.requestedSchema.required

    if (isRequired && isRequired.length > 0) {
      return isRequired.includes(key)
    } else {
      return false
    }
  } else {
    return false
  }
}

const getErrorMessages = (key: string) => {
  return getErrorState(key) ? [t('dxt.required')] : []
}

const validateStringLength = (
  min: number | undefined | unknown,
  max: number | undefined | unknown
) => {
  return (value: string | null | unknown): boolean | string => {
    if (!value || typeof value !== 'string') return true

    const num = value.length

    if (min !== undefined && num < Number(min)) {
      return t('elicitation.string.too-short', { min })
    }

    if (max !== undefined && num > Number(max)) {
      return t('elicitation.string.too-long', { max })
    }

    return true
  }
}

const handleProgress = (_event, progress) => {
  console.log('Elicitation', progress)
  elicitationDialog.value = true
  elicitationParams.value = progress.args[0].params
  elicitationChannel.value = progress.responseChannel
}

ElicitationTransfer.request(handleProgress)
</script>

<template>
  <!-- For UI visualization without chat -->
  <!-- <v-btn @click="elicitationDialog = true" color="surface-variant" text="Open Dialog" variant="flat"></v-btn> -->
  <v-dialog v-model="elicitationDialog" persistent max-width="80vw" max-height="80vh" scrollable>
    <v-card :title="$t('elicitation.title')">
      <v-divider></v-divider>
      <v-card-text>
        {{ 'message' in elicitationParams ? elicitationParams?.message : null }}
      </v-card-text>
      <v-card-text
        v-if="
          elicitationParams &&
          'requestedSchema' in elicitationParams &&
          typeof elicitationParams.requestedSchema === 'object' &&
          'properties' in elicitationParams.requestedSchema
        "
      >
        <v-row
          v-for="(para, key) in elicitationParams.requestedSchema.properties"
          :key="key"
          class="mx-3 mb-3"
        >
          <v-select
            v-if="para.enum"
            prepend-icon="mdi-list-box-outline"
            :label="para.title || para.description"
            variant="outlined"
            density="compact"
            :items="para.enum as string[]"
            :model-value="dynamicModel(key).get() as string"
            clearable
            @update:model-value="dynamicModel(key).set($event)"
          ></v-select>
          <v-text-field
            v-else-if="para.type === 'string'"
            prepend-icon="mdi-alphabetical"
            :label="para.title || para.description"
            density="compact"
            variant="outlined"
            :placeholder="para.description"
            :rules="[validateStringLength(para.minLength, para.maxLength)]"
            :model-value="dynamicModel(key).get()"
            clearable
            :error="getErrorState(key)"
            :error-messages="getErrorMessages(key)"
            @update:model-value="dynamicModel(key).set($event)"
          >
          </v-text-field>
          <v-number-input
            v-else-if="para.type === 'integer'"
            prepend-icon="mdi-numeric"
            :model-value="dynamicModel(key).get() as number"
            :label="para.title || para.description"
            density="compact"
            variant="outlined"
            :placeholder="para.description"
            :max="para.maximum"
            :min="para.minimum"
            :hint="validateNumberRange(para.minimum, para.maximum)"
            clearable
            :error="getErrorState(key)"
            :error-messages="getErrorMessages(key)"
            @update:model-value="dynamicModel(key).set($event)"
          ></v-number-input>
          <v-checkbox
            v-else-if="para.type === 'boolean'"
            v-tooltip:top="para.description"
            :model-value="dynamicModel(key).get()"
            :label="para.title"
            @update:model-value="dynamicModel(key).set($event)"
          ></v-checkbox>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-icon-btn
          v-tooltip:top="$t('elicitation.decline')"
          icon="mdi-cancel"
          color="error"
          variant="plain"
          rounded="lg"
          @click="declineElicitation"
        ></v-icon-btn>
        <v-icon-btn
          v-tooltip:top="$t('elicitation.accept')"
          icon="mdi-hand-okay"
          color="success"
          variant="plain"
          rounded="lg"
          @click="acceptElicitation()"
        ></v-icon-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
