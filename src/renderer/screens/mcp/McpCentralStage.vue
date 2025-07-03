<script setup lang="ts">
import { useMcpStore } from '@/renderer/store/mcp'
import McpResourcePage from '@/renderer/components/pages/McpResourcePage.vue'
import McpPromptPage from '@/renderer/components/pages/McpPromptPage.vue'
import McpDxtPage from '@/renderer/components/pages/McpDxtPage.vue'
import McpNewsPage from '@/renderer/components/pages/McpNewsPage.vue'
const mcpStore = useMcpStore()
</script>

<template>
  <div v-if="mcpStore.getSelected">
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
    <div v-else-if="mcpStore.getSelected.primitive === 'config'">
      <v-textarea
        variant="solo"
        auto-grow
        readonly
        :model-value="mcpStore.getSelected.method"
      ></v-textarea>
    </div>
  </div>
  <div v-else>
    <McpDxtPage v-show="false"></McpDxtPage>
    <McpNewsPage></McpNewsPage>
  </div>
</template>
