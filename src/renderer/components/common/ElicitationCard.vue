<script setup lang="ts">
import { ref, toRaw, computed } from 'vue'
import { ElicitationTransfer } from '@/renderer/utils'
import { IpcElicitRequestCallback, ElicitRequest, ElicitResponse } from '@/types/ipc'
import { validateNumberRange } from '@/renderer/store/dxt'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : K]: T[K]
}

type ElicitRequestParams = RemoveIndexSignature<ElicitRequest['params']>

// type ElicitationProperty = ElicitRequestParams['requestedSchema']['properties'][string]['type']

type ElicitationProperty = string | number | boolean | string[]

type ElicitationEnumKey = 'const' | 'title'

type ElicitationEnum = Record<ElicitationEnumKey, string>

const elicitationResults = ref<Record<string, ElicitationProperty>>({})

const elicitationDialog = ref(false)

const elicitationParams = ref<ElicitRequestParams | {}>({})

const elicitationChannel = ref('')

const normalizedProperties = computed(() => {
  const params = elicitationParams.value
  if (!params || !('requestedSchema' in params)) return []

  const props = params.requestedSchema.properties
  return Object.keys(props).map((key) => {
    const para = props[key]
    return {
      key,
      para,

      hasEnum: 'enum' in para && para.enum !== undefined,
      enums: ('enum' in para ? para.enum : []) as string[],

      hasEnumItems: 'oneOf' in para && para.oneOf !== undefined,
      enumItems: ('oneOf' in para ? para.oneOf : []) as ElicitationEnum[],

      hasMultiEnum: 'items' in para && 'enum' in para.items,
      multiEnums: ('items' in para && 'enum' in para.items ? para.items.enum : []) as string[],

      hasMultiEnumItems: 'items' in para && 'anyOf' in para.items,
      multiEnumItems: ('items' in para && 'anyOf' in para.items
        ? para.items.anyOf
        : []) as ElicitationEnum[],

      isString: para.type === 'string',
      isNumber: para.type === 'number',
      isInteger: para.type === 'integer',
      isBoolean: para.type === 'boolean',

      minLength: 'minLength' in para ? para.minLength : undefined,
      maxLength: 'maxLength' in para ? para.maxLength : undefined,

      minItems: 'minItems' in para ? para.minItems : undefined,
      maxItems: 'maxItems' in para ? para.maxItems : undefined,

      minimum: 'minimum' in para ? para.minimum : undefined,
      maximum: 'maximum' in para ? para.maximum : undefined,

      title: para.title,
      description: para.description,
      label: para.description || para.title,
      default: 'default' in para ? para.default : undefined
    }
  })
})

const configExist = (name: string) => {
  const exists = name in elicitationResults.value
  return {
    exists,
    configValue: exists ? elicitationResults.value[name] : undefined
  }
}

const updateConfigAttribute = (name: string, value: ElicitationProperty | null) => {
  if (value === null) {
    elicitationResults.value[name] = ''
  } else {
    elicitationResults.value[name] = value
  }
}

const dynamicModel = (name: string) => ({
  get: (defaultVal: ElicitationProperty | undefined) => {
    const { exists, configValue } = configExist(name)
    if (defaultVal && !exists) {
      updateConfigAttribute(name, defaultVal)
      return defaultVal
    }
    return configValue
  },
  set: (val: ElicitationProperty | null) => updateConfigAttribute(name, val)
})

const declineElicitation = () => {
  const response: ElicitResponse = {
    action: 'decline'
  }
  ElicitationTransfer.response(elicitationChannel.value, response)
  clearSampling()
  return
}

// const cancelElicitation = () => {
//   const response: ElicitResponse = {
//     "action": "cancel"
//   }
//   ElicitationTransfer.response(elicitationChannel.value, response)
//   clearSampling()
//   return
// }

const acceptElicitation = () => {
  const response: ElicitResponse = {
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
  const { exists } = configExist(key)
  if (exists) {
    return false
  }

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

const validateEnumLength = (
  min: number | undefined | unknown,
  max: number | undefined | unknown
) => {
  return (value: string[] | null): boolean | string => {
    if (!value || !value.length) return true

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

const handleProgress: IpcElicitRequestCallback = (_event, progress) => {
  console.log('Elicitation', progress)
  elicitationDialog.value = true
  elicitationParams.value = progress.request.params as ElicitRequestParams
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
        <v-row v-for="item in normalizedProperties" :key="item.key" class="mx-3 mb-2 mt-1">
          <!-- Single-select enum (without titles) -->
          <v-select
            v-if="item.hasEnum"
            prepend-icon="mdi-list-box-outline"
            :label="item.label"
            variant="outlined"
            density="compact"
            :items="item.enums"
            :model-value="dynamicModel(item.key).get(item.default) as string"
            clearable
            @update:model-value="dynamicModel(item.key).set($event)"
          ></v-select>
          <!-- Single-select enum (with titles) -->
          <v-select
            v-else-if="item.hasEnumItems"
            prepend-icon="mdi-list-box-outline"
            :label="item.label"
            variant="outlined"
            density="compact"
            :items="item.enumItems"
            item-value="const"
            :model-value="dynamicModel(item.key).get(item.default)"
            clearable
            @update:model-value="dynamicModel(item.key).set($event)"
          ></v-select>
          <!-- Multi-select enum (without titles) -->
          <v-select
            v-else-if="item.hasMultiEnum"
            prepend-icon="mdi-list-box-outline"
            :label="item.label"
            variant="outlined"
            density="compact"
            :items="item.multiEnums"
            :multiple="true"
            :rules="[validateEnumLength(item.minItems, item.maxItems)]"
            clearable
            :model-value="dynamicModel(item.key).get(item.default) as string[]"
            @update:model-value="dynamicModel(item.key).set($event)"
          ></v-select>
          <!-- Multi-select enum (with titles) -->
          <v-select
            v-else-if="item.hasMultiEnumItems"
            prepend-icon="mdi-list-box-outline"
            :label="item.label"
            variant="outlined"
            density="compact"
            :items="item.multiEnumItems"
            :multiple="true"
            item-value="const"
            :rules="[validateEnumLength(item.minItems, item.maxItems)]"
            clearable
            :model-value="dynamicModel(item.key).get(item.default) as string[]"
            @update:model-value="dynamicModel(item.key).set($event)"
          ></v-select>
          <v-text-field
            v-else-if="item.isString"
            prepend-icon="mdi-alphabetical"
            :label="item.label"
            density="compact"
            variant="outlined"
            :placeholder="item.title"
            :rules="[validateStringLength(item.minLength, item.maxLength)]"
            :model-value="dynamicModel(item.key).get(item.default)"
            clearable
            :error="getErrorState(item.key)"
            :error-messages="getErrorMessages(item.key)"
            @update:model-value="dynamicModel(item.key).set($event)"
          >
          </v-text-field>
          <v-number-input
            v-else-if="item.isInteger"
            prepend-icon="mdi-numeric"
            :model-value="dynamicModel(item.key).get(item.default) as number"
            :label="item.label"
            density="compact"
            variant="outlined"
            :placeholder="item.title"
            :max="item.maximum"
            :min="item.minimum"
            :hint="validateNumberRange(item.minimum, item.maximum)"
            clearable
            :error="getErrorState(item.key)"
            :error-messages="getErrorMessages(item.key)"
            @update:model-value="dynamicModel(item.key).set($event)"
          ></v-number-input>
          <v-checkbox
            v-else-if="item.isBoolean"
            v-tooltip:bottom="item.title"
            color="secondary"
            :model-value="dynamicModel(item.key).get(item.default)"
            :label="item.label"
            @update:model-value="dynamicModel(item.key).set($event)"
            hide-details
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
          icon="mdi-check-bold"
          color="success"
          variant="plain"
          rounded="lg"
          @click="acceptElicitation()"
        ></v-icon-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
