<template>
  <v-app>
    <v-system-bar class="drag">
      <v-icon icon="mdi-wifi-strength-4"></v-icon>
      <v-icon icon="mdi-signal" class="ms-2"></v-icon>
      <v-icon icon="mdi-battery" class="ms-2"></v-icon>

      <span class="ms-2">3:13PM</span>
    </v-system-bar>
    <v-btn @click="console.log(textId)">Ha</v-btn>
    <span>Not ready for use</span>
  </v-app>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const textId = route.query.textId
</script>

<style scoped>
.drag {
  app-region: drag;
}
</style>
