<script setup lang="ts">
import { ref } from 'vue'
import { initAllMcpServers } from '@/renderer/utils'
import { useMcpStore } from '@/renderer/store/mcp'
import { useSnackbarStore } from '@/renderer/store/snackbar'
const snackbarStore = useSnackbarStore()

const mcpStore = useMcpStore()

const isLoading = ref(false)

async function activeAllMcpServers() {
  isLoading.value = true
  try {
    const configs = mcpStore.getServers()
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
</script>

<template>
  <v-container>
    <v-btn block :loading="isLoading" @click="activeAllMcpServers()">
      {{ $t('mcp.init') }}
    </v-btn>
  </v-container>
</template>

<style scoped></style>
