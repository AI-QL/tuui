<script setup lang="ts">
import { computed } from 'vue'
import { useMcpStore } from '@/renderer/store/mcp'

import ConfigStdioCard from '../common/ConfigStdioCard.vue'
import ConfigDxtCard from '../common/ConfigDxtCard.vue'
const mcpStore = useMcpStore()

const configObject = computed(() => {
  const configString = mcpStore.getSelected.method
  return {
    string: configString,
    json: JSON.parse(configString)
  }
})
</script>

<template>
  <ConfigStdioCard
    v-if="configObject.json.type === 'metadata__stdio_config'"
    :model-value="configObject.string"
  ></ConfigStdioCard>
  <ConfigDxtCard
    v-else-if="configObject.json.type === 'metadata__dxt_manifest'"
    :model-value="configObject.json"
  ></ConfigDxtCard>
  <div v-else>{{ configObject }}</div>
</template>
