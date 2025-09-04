<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStdioStore, CustomStdioServerParameters, StdioServerKey } from '@/renderer/store/stdio'

import ConfigJsonCard from '@/renderer/components/common/ConfigJsonCard.vue'
import { pickBy } from 'lodash'
import { useSnackbarStore } from '@/renderer/store/snackbar'
const snackbarStore = useSnackbarStore()

const stdioStore = useStdioStore()

const props = defineProps({
  modelValue: {
    type: Boolean,
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

function findConfig(jsonConfig): Record<string, CustomStdioServerParameters> {
  if (!jsonConfig) return {}

  const mcpConfig = jsonConfig.mcpServers ? jsonConfig.mcpServers : jsonConfig

  const filtered = pickBy(
    mcpConfig,
    (value) => value && typeof value === 'object' && 'command' in value
  )

  return filtered
}

const addConfig = () => {
  const jsonConfigs = findConfig(jsonParams.value)

  if (Object.keys(jsonConfigs).length === 0) {
    snackbarStore.showErrorMessage('snackbar.no-mcp-config')
    return
  }

  for (const [serverName, serverConfig] of Object.entries(jsonConfigs)) {
    ;(['command', 'args', 'env'] as StdioServerKey[]).forEach((key) => {
      const value = serverConfig[key]
      if (value) {
        stdioStore.updateConfigAttribute(serverName, key, value)
      }
    })
  }

  closeDialog()
}

const jsonError = ref<string | null>(null)

function handleError(errorMessage: string | null) {
  jsonError.value = errorMessage
}

const jsonParams = ref({})

const exampleData = [
  {
    'sequential-thinking': {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-sequential-thinking']
    }
  },
  {
    'Time Server': {
      command: 'uvx',
      args: ['mcp-server-time']
    },
    memory: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-memory']
    }
  },
  {
    mcpServers: {
      filesystem: {
        command: 'npx',
        args: [
          '-y',
          '@modelcontextprotocol/server-filesystem',
          '/Users/username/Desktop',
          '/path/to/other/allowed/dir'
        ]
      }
    }
  }
] as const
</script>

<template>
  <v-dialog v-model="internalDialog" persistent max-width="80vw" max-height="80vh" scrollable>
    <v-card>
      <v-card-title>
        {{ $t('mcp.config') }}
      </v-card-title>

      <v-card-text class="mt-2">
        <ConfigJsonCard v-model="jsonParams" class="mt-2" @on-error="handleError"></ConfigJsonCard>
        <div class="mx-4">
          <v-expansion-panels static color="grey-200">
            <v-expansion-panel
              v-for="(value, index) in exampleData"
              :key="index"
              :title="`${$t('general.example')} ${index + 1}`"
            >
              <v-expansion-panel-text>
                <v-textarea
                  :model-value="JSON.stringify(value, null, 2)"
                  variant="plain"
                  auto-grow
                  hide-details
                ></v-textarea>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </v-card-text>

      <v-divider></v-divider>
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
          :disabled="Boolean(jsonError ?? '')"
          icon="mdi-content-save-plus"
          color="success"
          @click="addConfig()"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<style scoped>
.v-expansion-panel-parent {
  overflow-y: auto;
}
</style>
