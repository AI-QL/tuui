<script setup lang="ts">
import { useMcpStore } from '@/renderer/store/mcp'
import McpResourcePage from '@/renderer/components/pages/McpResourcePage.vue'
import McpPromptPage from '@/renderer/components/pages/McpPromptPage.vue'
const mcpStore = useMcpStore()

const mcpNews = [
  {
    title: 'MCP Introduction',
    description: 'Get started with the Model Context Protocol (MCP)',
    link: 'https://modelcontextprotocol.io'
  },
  {
    title: 'MCP Servers',
    description:
      'A collection of reference and third-party servers for the Model Context Protocol (MCP)',
    link: 'https://github.com/modelcontextprotocol/servers'
  },
  {
    title: 'MCP Specification',
    description: 'MCP specification details',
    link: 'https://spec.modelcontextprotocol.io'
  }
]
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
    <v-card
      v-for="news in mcpNews"
      :key="news.title"
      class="ma-1 mb-5"
      :title="news.title"
      :subtitle="news.description"
      :href="news.link"
    >
    </v-card>
  </div>
</template>
