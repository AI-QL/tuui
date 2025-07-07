<script setup lang="ts">
import { ref } from 'vue'
import { initAllMcpServers } from '@/renderer/utils'
import { useMcpStore, getServers } from '@/renderer/store/mcp'
import { useSnackbarStore } from '@/renderer/store/snackbar'

import McpDxtPage from '@/renderer/components/pages/McpDxtPage.vue'

const snackbarStore = useSnackbarStore()

const mcpStore = useMcpStore()

const isLoading = ref(false)

const dxtDialog = ref(false)

const isDragActive = ref(false)

async function activeAllMcpServers() {
  isLoading.value = true
  try {
    const configs = getServers()
    const result = await initAllMcpServers(configs)
    console.log(result)
    await mcpStore.updateServers()
    if (result.status == 'error') {
      snackbarStore.showErrorMessage(result.error.toString())
    } else {
      snackbarStore.showSuccessMessage('mcp.updated')
    }
  } finally {
    isLoading.value = false
    mcpStore.version++
  }
}

const openDialog = () => {
  dxtDialog.value = true
  isDragActive.value = false
}

document.addEventListener('dragenter', (_e) => {
  if (!dxtDialog.value) {
    isDragActive.value = true
    setTimeout(() => {
      isDragActive.value = false
    }, 5000)
  }
})
</script>

<template>
  <v-container>
    <v-btn-group variant="outlined" divided>
      <v-btn
        icon="mdi-power"
        color="success"
        :loading="isLoading"
        @click="activeAllMcpServers()"
        v-tooltip:top="$t('mcp.init')"
      >
      </v-btn>
      <v-btn
        icon="mdi-package-variant"
        @click="openDialog()"
        @dragenter.prevent="openDialog()"
        v-tooltip:top="$t('dxt.title')"
        :class="{ 'drag-active': isDragActive }"
      ></v-btn>
    </v-btn-group>
    <McpDxtPage v-model="dxtDialog"></McpDxtPage>
  </v-container>
</template>

<style scoped>
.drag-active {
  animation: colorPulse 1.5s infinite ease-in-out;
}
@keyframes colorPulse {
  0% {
    background-color: rgba(33, 150, 243, 0.2);
  }
  50% {
    background-color: #ffffff;
  }
  100% {
    background-color: rgba(33, 150, 243, 0.2);
  }
}
</style>
