<script setup lang="tsx">
import { useMessageStore } from '@/renderer/store/message'
import { useChatbotStore } from '@/renderer/store/chatbot'
import { useAgentStore } from '@/renderer/store/agent'
const messageStore = useMessageStore()
const chatbotStore = useChatbotStore()
const agentStore = useAgentStore()
</script>

<template>
  <v-row>
    <!-- counter -->
    <v-textarea
      v-model="messageStore.userMessage"
      dirty
      color="primary"
      type="text"
      variant="solo"
      clearable
      hide-details
      auto-grow
      rows="1"
      max-rows="10"
      @keydown="messageStore.handleKeydown"
    ></v-textarea>
  </v-row>
  <v-row>
    <v-col cols="4" class="pt-4 pb-1 pl-0">
      <v-select
        v-model="chatbotStore.selectedChatbotId"
        :label="$t('chat.select-model')"
        hide-details
        density="compact"
        variant="outlined"
        :items="chatbotStore.chatbots.map((chatbot, index) => ({ ...chatbot, index }))"
        item-title="name"
        item-value="index"
      ></v-select>
    </v-col>
    <v-col cols="4" class="pt-4 pb-1 pl-0">
      <v-select
        v-model="agentStore.selected"
        :label="$t('chat.select-agent')"
        hide-details
        density="compact"
        variant="outlined"
        :items="agentStore.agents.map((agent, index) => ({ ...agent, index }))"
        item-title="name"
        item-value="index"
        clearable
      >
        <template #item="{ props: itemProps, item }">
          <v-list-item v-bind="itemProps" :subtitle="`${item.raw.prompt}`">
            <template #prepend>
              <v-badge
                class="ml-n1 mr-n4"
                color="primary"
                :content="item.raw.selectedNode.length"
                inline
                :max="99"
              ></v-badge>
            </template>
          </v-list-item>
        </template>
      </v-select>
    </v-col>
    <v-col cols="4" class="pt-4 pb-0 pr-0">
      <!-- Adds a horizontal flex container (row direction) to override parent column layout, ensuring right alignment within v-col -->
      <span class="d-flex justify-end">
        <v-spacer></v-spacer>

        <span v-if="messageStore.conversation.id in messageStore.generating">
          <v-icon-btn
            v-tooltip:start="$t('chat.wipe')"
            color="error"
            variant="tonal"
            icon="mdi-delete-outline"
            rounded="lg"
            @click="messageStore.init()"
          ></v-icon-btn>
          <v-divider class="mx-1" vertical></v-divider>
          <v-icon-btn
            color="primary"
            variant="tonal"
            icon="mdi-stop"
            rounded="lg"
            @click="messageStore.stop"
          ></v-icon-btn>
        </span>

        <v-icon-btn
          v-else-if="messageStore.userMessage"
          color="primary"
          variant="tonal"
          icon="mdi-arrow-up"
          rounded="lg"
          @click="messageStore.sendMessage"
        ></v-icon-btn>

        <span v-else-if="messageStore.conversation.messages.length > 0">
          <v-icon-btn
            v-tooltip:start="$t('chat.wipe')"
            color="error"
            variant="tonal"
            icon="mdi-delete-outline"
            rounded="lg"
            @click="messageStore.init()"
          ></v-icon-btn>

          <v-divider class="mx-1" vertical></v-divider>

          <span v-if="messageStore.conversation.messages.at(-1)?.role === 'assistant'">
            <v-icon-btn
              v-tooltip:top="$t('chat.reg')"
              color="teal"
              variant="tonal"
              icon="mdi-autorenew"
              rounded="lg"
              @click="messageStore.resendMessage"
            ></v-icon-btn>
          </span>
          <span v-else>
            <v-icon-btn
              v-tooltip:top="$t('chat.continue')"
              color="primary"
              variant="tonal"
              icon="mdi-step-forward"
              rounded="lg"
              @click="messageStore.startInference"
            ></v-icon-btn>
          </span>
        </span>
        <v-icon-btn
          v-else
          color="grey"
          variant="tonal"
          icon="mdi-account-edit"
          rounded="lg"
        ></v-icon-btn>
      </span>
    </v-col>
  </v-row>
</template>
