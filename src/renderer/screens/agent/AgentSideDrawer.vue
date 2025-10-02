<script setup lang="ts">
import { useAgentStore } from '@/renderer/store/agent'
import { useMcpStore } from '@/renderer/store/mcp'
const mcpStore = useMcpStore()
const agentStore = useAgentStore()

function handleDelete(index: number, event: MouseEvent) {
  event.stopPropagation()
  agentStore.agents.splice(index, 1)
}
</script>

<template>
  <v-list :key="mcpStore.version" v-model:selected="agentStore.revised" nav mandatory>
    <v-list-item
      v-for="(item, index) in agentStore.agents"
      :key="index"
      slim
      :value="index"
      link
      :ripple="false"
      :title="item.name"
      @click="console.log(agentStore.getRevised?.selectedNode)"
    >
      <template #prepend>
        <v-badge
          class="mr-n3"
          :color="agentStore.hasTools ? 'primary' : 'grey'"
          :content="item.selectedNode.length"
          inline
          :max="99"
        ></v-badge>
      </template>
      <template #append>
        <v-list-item-action>
          <v-icon-btn
            icon="mdi-delete-outline"
            rounded="lg"
            size="small"
            @click="handleDelete(index, $event)"
          >
          </v-icon-btn>
        </v-list-item-action>
      </template>
    </v-list-item>
  </v-list>
</template>

<style></style>
