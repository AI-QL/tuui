<script setup lang="ts">
import { CommandEvent } from '@/renderer/utils'
import { useRoute } from 'vue-router'

const route = useRoute()

const sendCommand = () => {
  const command = {
    id: route.query.textId as string,
    prompt: 'Improve the provided context in English'
  }
  CommandEvent.notify(command)

  return
}
</script>

<template>
  <v-app :key="route.query.textId?.toString()">
    <v-system-bar class="drag">
      <v-icon icon="mdi-wifi-strength-4"></v-icon>
      <v-icon icon="mdi-signal" class="ms-2"></v-icon>
      <v-icon icon="mdi-battery" class="ms-2"></v-icon>

      <span class="ms-2">3:13PM</span>
    </v-system-bar>
    <v-main>
      <v-btn @click="console.log(route.query.textId)">Print ID</v-btn>
      <v-btn @click="sendCommand()">Test</v-btn>
    </v-main>

    <span>Not ready for use</span>
  </v-app>
</template>

<style scoped>
.drag {
  app-region: drag;
}
</style>
