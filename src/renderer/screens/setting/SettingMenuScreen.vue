<script setup lang="tsx">
// import { computed } from 'vue';
import { useChatbotStore } from '@/renderer/store/chatbot'

const chatbotStore = useChatbotStore()

import LogoAvatar from '@/renderer/components/common/LogoAvatar.vue'
</script>

<template>
  <v-list v-model:selected="chatbotStore.currentChatbotId" nav mandatory>
    <v-list-item
      v-for="(item, index) in chatbotStore.chatbots"
      :key="index"
      slim
      :value="index"
      link
      :ripple="false"
      :title="item.name"
    >
      <template #prepend>
        <LogoAvatar :item="item"></LogoAvatar>
      </template>
      <template #append>
        <v-list-item-action>
          <v-icon-btn
            icon="mdi-delete-outline"
            rounded="lg"
            size="small"
            @click="chatbotStore.removeChatbot(index)"
          >
          </v-icon-btn>
        </v-list-item-action>
      </template>
    </v-list-item>
  </v-list>
</template>

<style scoped></style>
