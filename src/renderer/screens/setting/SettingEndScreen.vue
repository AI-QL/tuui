<script setup lang="tsx">
import { ref, watch } from 'vue'
import { useChatbotStore } from '@/renderer/store/chatbot'
import { useSnackbarStore } from '@/renderer/store/snackbar'
import type { ChatbotConfig } from '@/types/llm'

const chatbotStore = useChatbotStore()
const snackbarStore = useSnackbarStore()

const configFile = ref(undefined)

watch(configFile, (newValue, _oldValue) => {
  console.log(newValue)
  if (newValue) {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const chatbotConfigJson = JSON.parse(event.target!.result as string) as
          | ChatbotConfig
          | ChatbotConfig[]
        chatbotStore.updateStoreFromJSON(chatbotConfigJson)
      } catch (err) {
        console.log(err)
        snackbarStore.showErrorMessage('snackbar.parse-config-fail')
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
        v-tooltip:top="$t('setting.config-file')"
        icon
        @click="($refs.fileInput as HTMLInputElement).click()"
      >
        <v-icon>mdi-upload</v-icon>
        <v-file-input
          ref="fileInput"
          v-model="configFile"
          style="display: none"
          accept="application/json"
          :label="$t('setting.config-file')"
          single-line
        ></v-file-input>
      </v-btn>

      <v-btn
        v-tooltip:top="$t('setting.reset')"
        icon="mdi-refresh"
        color="error"
        @click="chatbotStore.resetState"
      ></v-btn>
      <v-btn
        v-tooltip:top="$t('setting.add')"
        icon="mdi-plus"
        @click="chatbotStore.addChatbot"
      ></v-btn>
    </v-btn-group>
  </v-container>
</template>

<style scoped></style>
