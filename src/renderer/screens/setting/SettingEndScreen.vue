<script setup lang="tsx">
import { ref, watch } from 'vue'
import { useChatbotStore, ChatbotStoreState } from '@/renderer/store/chatbot'

const chatbotStore = useChatbotStore()

const configFile = ref(undefined)

watch(configFile, (newValue, _oldValue) => {
  console.log(newValue)
  if (newValue) {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target!.result as string) as {
          chatbotStore: ChatbotStoreState
        }
        console.log(json)
        chatbotStore.updateStoreFromJSON(json.chatbotStore)
      } catch {
        console.log('parse——error')
        // snackbarStore.showErrorMessage('snackbar.parseConfigFail')
      } finally {
        configFile.value = undefined
      }
    }
    reader.readAsText(newValue)
  }
})
</script>

<template>
  <v-container>
    <v-btn-group variant="outlined" divided>
      <v-btn
        icon
        @click="($refs.fileInput as HTMLInputElement).click()"
        v-tooltip:top="$t('setting.configFile')"
      >
        <v-icon>mdi-upload</v-icon>
        <v-file-input
          ref="fileInput"
          v-model="configFile"
          style="display: none"
          accept="application/json"
          :label="$t('setting.configFile')"
          single-line
        ></v-file-input>
      </v-btn>

      <v-btn
        icon="mdi-refresh"
        @click="chatbotStore.resetState"
        v-tooltip:top="$t('setting.reset')"
      ></v-btn>
      <v-btn
        icon="mdi-plus"
        @click="chatbotStore.addChatbot"
        v-tooltip:top="$t('setting.add')"
      ></v-btn>
    </v-btn-group>
  </v-container>
</template>

<style scoped></style>
