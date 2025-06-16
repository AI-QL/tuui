<script setup lang="tsx">
import { useAgentStore } from '@/renderer/store/agent'
const agentStore = useAgentStore()
</script>

<template>
  <v-container>
    <v-btn-group variant="outlined" divided>
      <v-btn
        icon="mdi-refresh"
        @click="agentStore.resetState"
        v-tooltip:top="$t('agent.reset')"
      ></v-btn>
      <v-btn icon="mdi-plus" @click="agentStore.addAgent" v-tooltip:top="$t('agent.add')"></v-btn>
    </v-btn-group>
  </v-container>
</template>

<style scoped></style>
