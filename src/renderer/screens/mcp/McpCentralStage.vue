<script setup lang="ts">
import { useMcpStore } from '@/renderer/store/mcp'
import McpResourcePage from '@/renderer/components/pages/McpResourcePage.vue'
import McpPromptPage from '@/renderer/components/pages/McpPromptPage.vue'
import McpNewsPage from '@/renderer/components/pages/McpNewsPage.vue'
import McpConfigPage from '@/renderer/components/pages/McpConfigPage.vue'
const mcpStore = useMcpStore()
</script>

<template>
  <div v-if="mcpStore.getSelected" :key="mcpStore.version">
    <div v-if="mcpStore.getSelected.primitive === 'tools'">
      <v-data-table
        hover
        :key="mcpStore.getSelected"
        hide-default-footer
        hide-default-header
        hide-no-data
        disable-sort
        :items-per-page="-1"
        :items="mcpStore.serverTools"
        :loading="mcpStore.loading"
        @update:options="mcpStore.loadServerTools"
      ></v-data-table>
    </div>
    <div v-else-if="mcpStore.getSelected.primitive === 'resources'">
      <McpResourcePage :key="mcpStore.getSelected"></McpResourcePage>
    </div>

    <div v-else-if="mcpStore.getSelected.primitive === 'prompts'">
      <McpPromptPage :key="mcpStore.getSelected"></McpPromptPage>
    </div>
    <div v-else-if="mcpStore.getSelected.primitive === 'metadata'">
      <McpConfigPage :key="mcpStore.getSelected"></McpConfigPage>
    </div>
  </div>
  <div v-else>
    <McpNewsPage></McpNewsPage>
  </div>
</template>
