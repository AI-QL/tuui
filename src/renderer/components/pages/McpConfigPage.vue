<script setup lang="ts">
import { computed } from 'vue'
import { useMcpStore } from '@/renderer/store/mcp'

import ConfigStdioCard from '../common/ConfigStdioCard.vue'
import ConfigDxtCard from '../common/ConfigDxtCard.vue'
const mcpStore = useMcpStore()

const configString = computed(() => mcpStore.getSelected.method)
const configJson = computed(() => JSON.parse(configString.value))

const configObject = computed(() => ({
  string: configString.value,
  json: configJson.value
}))
</script>

<template>
  <ConfigStdioCard
    v-if="configObject.json.type === 'metadata__stdio_config'"
    :model-value="configObject.json"
  ></ConfigStdioCard>
  <ConfigDxtCard
    v-else-if="configObject.json.type === 'metadata__mcpb_manifest'"
    :model-value="configObject.json"
  ></ConfigDxtCard>
  <div v-else>{{ configObject }}</div>
</template>
