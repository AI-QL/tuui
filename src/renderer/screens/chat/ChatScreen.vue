<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ChatPage from '@/renderer/components/pages/ChatPage.vue'
import { useMessageStore } from '@/renderer/store/message'
import RobotJSON from '@/public/lotties/robot.json'

const messageStore = useMessageStore()

const { locale } = useI18n()
</script>

<template>
  <ChatPage
    v-if="messageStore.conversation.length > 0"
    :messages="messageStore.conversation"
    :language="locale"
    @request-delete="messageStore.deleteMessage"
  >
  </ChatPage>
  <v-container v-else>
    <v-row>
      <Vue3Lottie class="lottie-container" :animation-data="RobotJSON" />
    </v-row>
  </v-container>
</template>

<style scoped>
.lottie-container {
  height: calc(100vh - 218px);
  width: 100vw;
}
</style>
