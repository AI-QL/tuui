<script setup lang="tsx">
import { useHistoryStore } from '@/renderer/store/history'
const historyStore = useHistoryStore()
</script>
<template>
  <v-container>
    <v-btn-group variant="outlined" divided>
      <v-btn
        v-tooltip:top="$t('chat.delete')"
        icon="mdi-delete-outline"
        @click="historyStore.resetState()"
      ></v-btn>
      <v-btn
        v-tooltip:top="$t('chat.download')"
        icon="mdi-download"
        @click="historyStore.downloadHistory()"
      ></v-btn>
    </v-btn-group>
  </v-container>
</template>
