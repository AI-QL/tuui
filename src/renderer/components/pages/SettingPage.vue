<script setup lang="ts">
import { ref, watch } from 'vue'
import { REASONING_EFFORT } from '@/renderer/types'
import { useI18n } from 'vue-i18n'
import { useLayoutStore } from '@/renderer/store/layout'
import { v4 as uuidv4 } from 'uuid'
import { getApiToken, listenStdioProgress, removeListenStdioProgress } from '@/renderer/utils'

import type { ChatbotConfig } from '@/preload/llm'

const layoutStore = useLayoutStore()
const { t } = useI18n()
const isLoading = ref(false)
const apiDialog = ref(false)

const stderr = ref<string[]>([])
const stdout = ref<string[]>([])

interface Props {
  config: ChatbotConfig
}

interface Emits {
  (_e: 'update:config', _value: Partial<ChatbotConfig>): void
}

// const props =
defineProps<Props>()
const emit = defineEmits<Emits>()
const handleUpdate = <K extends keyof ChatbotConfig>(key: K, value: ChatbotConfig[K]) => {
  emit('update:config', { [key]: value } as Partial<ChatbotConfig>)
}

// defineExpose({
//   updateConfig: handleUpdate
// })

watch(apiDialog, (_val) => {
  stdout.value.length = 0
  stderr.value.length = 0
})

const handleGetApiToken = async (cli: string): Promise<void> => {
  const handleProgress = (_event, progress) => {
    stdout.value.push(progress)
  }

  try {
    isLoading.value = true
    listenStdioProgress(handleProgress)

    const token = await getApiToken(cli)
    handleUpdate('apiKey', token)
    apiDialog.value = false
  } catch (error: any) {
    stderr.value.push(error.toString())
    console.log(error.toString())
  } finally {
    isLoading.value = false
    removeListenStdioProgress(handleProgress)
  }
}

const validateNumberRange = (min: number, max: number) => {
  return (value: string | number | null): boolean | string => {
    if (!value && value !== 0) return true

    const num = Number(value)
    if (isNaN(num)) return t('validation.invalid-number')

    if (num < min || num > max) {
      return t('validation.number-range', { min, max })
    }

    return true
  }
}
</script>

<template>
  <v-card class="mx-auto" :title="$t('setting.title-api')">
    <v-divider></v-divider>
    <v-card-text class="pt-6">
      <v-row class="px-2 mr-2">
        <v-col>
          <v-text-field
            density="compact"
            variant="outlined"
            :model-value="config.name"
            :label="$t('setting.name')"
            @update:model-value="(v) => handleUpdate('name', v)"
            @blur="!config.name && handleUpdate('name', `Chatbot ${uuidv4()}`)"
          ></v-text-field>
        </v-col>
        <v-checkbox
          :model-value="config.mcp"
          :label="$t('setting.mcp')"
          color="primary"
          @update:model-value="(v) => handleUpdate('mcp', Boolean(v))"
        >
        </v-checkbox>
        <v-checkbox
          :model-value="config.stream"
          :label="$t('setting.stream')"
          color="primary"
          @update:model-value="(v) => handleUpdate('stream', Boolean(v))"
        >
        </v-checkbox>
      </v-row>

      <!-- API Key -->
      <v-text-field
        density="compact"
        variant="outlined"
        :append-inner-icon="layoutStore.apiKeyShow ? 'mdi-eye-off' : 'mdi-eye'"
        :type="layoutStore.apiKeyShow ? 'text' : 'password'"
        :model-value="config.apiKey"
        class="px-2 mb-6"
        :label="$t('setting.apikey')"
        prepend-inner-icon="mdi-key"
        clearable
        hide-details
        :loading="isLoading"
        @update:model-value="(v) => handleUpdate('apiKey', v)"
        @click:append-inner="layoutStore.apiKeyShow = !layoutStore.apiKeyShow"
      >
        <template #append>
          <v-icon-btn
            :color="config.apiCli ? 'primary' : undefined"
            icon="mdi-application-edit"
            variant="plain"
            @click="apiDialog = true"
          >
          </v-icon-btn>
        </template>
      </v-text-field>

      <v-dialog v-model="apiDialog" width="auto">
        <v-card
          width="50vw"
          max-width="700"
          prepend-icon="mdi-console"
          :title="$t('setting.dialog')"
        >
          <v-divider></v-divider>
          <v-card-text>
            <v-textarea
              :model-value="config.apiCli"
              rows="1"
              auto-grow
              :loading="isLoading"
              :hide-details="stderr.length == 0"
              :error-messages="stderr.at(-1)"
              variant="solo"
              @update:model-value="(v) => handleUpdate('apiCli', v)"
            >
            </v-textarea>
          </v-card-text>
          <v-divider></v-divider>
          <template #actions>
            <v-btn
              :disabled="!config.apiCli"
              :text="$t('setting.exec')"
              @click="handleGetApiToken(config.apiCli)"
            ></v-btn>
          </template>
        </v-card>
      </v-dialog>

      <v-row class="px-2">
        <v-switch
          class="mt-0 mb-6 ml-4"
          v-tooltip:start="$t('setting.auth-header')"
          :label="config.authorization ? 'Authorization' : 'X-Api-Key'"
          color="info"
          base-color="primary"
          hide-details
          inset
          :model-value="config.authorization"
          @update:model-value="(v) => handleUpdate('authorization', Boolean(v))"
        >
        </v-switch>
        <v-col>
          <v-combobox
            :disabled="!config.authorization"
            density="compact"
            :label="$t('setting.auth-prefix')"
            :items="config.authPrefixList"
            :model-value="config.authPrefix"
            @update:model-value="(v) => handleUpdate('authPrefix', v)"
            variant="outlined"
          >
          </v-combobox>
        </v-col>
      </v-row>

      <!-- URL -->
      <v-combobox
        density="compact"
        class="px-2"
        :label="$t('setting.url')"
        :items="config.urlList"
        :model-value="config.url"
        variant="outlined"
        @update:model-value="(v) => handleUpdate('url', v)"
      ></v-combobox>

      <!-- Path -->
      <v-combobox
        density="compact"
        class="px-2"
        :label="$t('setting.path')"
        :items="config.pathList"
        :model-value="config.path"
        variant="outlined"
        @update:model-value="(v) => handleUpdate('path', v)"
      ></v-combobox>

      <!-- Model -->
      <v-combobox
        density="compact"
        class="px-2"
        :label="$t('setting.model')"
        :items="config.modelList"
        :model-value="config.model"
        variant="outlined"
        @update:model-value="(v) => handleUpdate('model', v)"
      ></v-combobox>
    </v-card-text>
  </v-card>

  <v-card class="mx-auto mt-4" :title="$t('setting.title-model')">
    <v-divider></v-divider>
    <v-card-text class="py-6">
      <v-row class="px-3 my-0">
        <v-combobox
          class="px-2"
          density="compact"
          :label="$t('setting.max-tokens-prefix')"
          :items="config.maxTokensPrefixList"
          :model-value="config.maxTokensPrefix"
          variant="outlined"
          @update:model-value="(v) => handleUpdate('maxTokensPrefix', v)"
        >
        </v-combobox>
        <v-combobox
          class="px-2"
          density="compact"
          label="MaxTokenValue"
          :model-value="config.maxTokensValue"
          type="number"
          single-line
          variant="outlined"
          @update:model-value="(v) => handleUpdate('maxTokensValue', v)"
        >
        </v-combobox>
      </v-row>
      <v-row class="px-3 my-0">
        <v-combobox
          class="px-2"
          density="compact"
          :label="$t('setting.temperature')"
          type="number"
          :model-value="config.temperature"
          variant="outlined"
          :rules="[validateNumberRange(0, 2)]"
          @update:model-value="(v) => handleUpdate('temperature', v)"
        >
        </v-combobox>
        <v-combobox
          class="px-2"
          density="compact"
          :label="$t('setting.topP')"
          :model-value="config.topP"
          type="number"
          variant="outlined"
          :rules="[validateNumberRange(0, 1)]"
          @update:model-value="(v) => handleUpdate('topP', v)"
        >
        </v-combobox>
      </v-row>
      <v-field class="ml-2 d-inline-flex" dirty variant="outlined">
        <template #label>
          <div>{{ $t('setting.reasoning-effort') }}</div>
        </template>
        <v-btn-toggle
          class="mt-0"
          color="info"
          :model-value="config.reasoningEffort"
          variant="plain"
          @update:model-value="(v) => handleUpdate('reasoningEffort', v)"
        >
          <v-btn v-for="level in REASONING_EFFORT">{{ level }}</v-btn>
        </v-btn-toggle>
      </v-field>
    </v-card-text>
  </v-card>
</template>
