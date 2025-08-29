<script setup lang="ts">
import { ref } from 'vue'
import { McpEvent, openPath } from '@/renderer/utils'
import { useMcpStore, getServers } from '@/renderer/store/mcp'
import { useLayoutStore } from '@/renderer/store/layout'
import { useSnackbarStore } from '@/renderer/store/snackbar'
import McpDxtPage from '@/renderer/components/pages/McpDxtPage.vue'

const snackbarStore = useSnackbarStore()

const layoutStore = useLayoutStore()

const mcpStore = useMcpStore()

const dxtDialog = ref(false)

const isDragActive = ref(false)

async function activeAllMcpServers() {
  layoutStore.mcpLoading = true
  try {
    const configs = getServers()
    const result = await McpEvent.init(configs)
    console.log(result)
    await mcpStore.updateServers()
    if (result.status == 'error') {
      snackbarStore.showErrorMessage(result.error.toString())
    } else {
      snackbarStore.showSuccessMessage('mcp.updated')
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.log(errorMsg)
    snackbarStore.showErrorMessage(errorMsg)
  } finally {
    layoutStore.mcpLoading = false
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
        v-tooltip:top="$t('mcp.init')"
        icon="mdi-power"
        color="success"
        :loading="layoutStore.mcpLoading"
        @click="activeAllMcpServers()"
      >
      </v-btn>
      <v-btn
        v-tooltip:top="$t('mcp.open')"
        color="primary"
        icon="mdi-open-in-new"
        @click="openPath('config')"
      ></v-btn>
      <v-btn
        v-tooltip:top="$t('dxt.title')"
        icon="mdi-package-variant"
        :class="{ 'drag-active': isDragActive }"
        @click="openDialog()"
        @dragenter.prevent="openDialog()"
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
