<script setup lang="ts">
import ChatPage from '@/renderer/components/pages/ChatPage.vue'
import CommandCard from '@/renderer/components/common/CommandCard.vue'
import { useMessageStore } from '@/renderer/store/message'
import RobotJSON from '@/public/lotties/robot.json'

const messageStore = useMessageStore()
</script>

<template>
  <CommandCard></CommandCard>
  <ChatPage
    v-if="messageStore.conversation.messages.length > 0"
    :messages="messageStore.conversation.messages"
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
