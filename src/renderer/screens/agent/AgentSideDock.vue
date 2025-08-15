<script setup lang="tsx">
import { useAgentStore } from '@/renderer/store/agent'
const agentStore = useAgentStore()
</script>

<template>
  <v-container>
    <v-btn-group variant="outlined" divided>
      <v-btn
        v-tooltip:top="$t('agent.reset')"
        icon="mdi-refresh"
        @click="agentStore.resetState"
      ></v-btn>
      <v-btn v-tooltip:top="$t('agent.add')" icon="mdi-plus" @click="agentStore.addAgent"></v-btn>
    </v-btn-group>
  </v-container>
</template>

<style scoped></style>
