<script setup lang="ts">
import { ref } from 'vue'
import { McpEvent, openPath } from '@/renderer/utils'
import { useMcpStore, getServers } from '@/renderer/store/mcp'
import { useLayoutStore } from '@/renderer/store/layout'
import { useSnackbarStore } from '@/renderer/store/snackbar'
import McpDxtPage from '@/renderer/components/pages/McpDxtPage.vue'
import McpAddPage from '@/renderer/components/pages/McpAddPage.vue'
import { pick } from 'lodash'

const snackbarStore = useSnackbarStore()

const layoutStore = useLayoutStore()

const mcpStore = useMcpStore()

const dxtDialog = ref(false)

const addDialog = ref(false)

const isDragActive = ref(false)

async function stopAllMcpServers() {
  layoutStore.mcpLoading = 'stop'
  try {
    await McpEvent.stop()
    await mcpStore.updateServers()
  } finally {
    layoutStore.mcpLoading = false
    mcpStore.selectedChips = {}
    mcpStore.version++
  }
}

async function activeAllMcpServers() {
  layoutStore.mcpLoading = 'start'
  try {
    const configs = getServers() ?? {}

    const filteredConfigs = pick(configs, mcpStore.checkList)

    const result = await McpEvent.init(filteredConfigs)
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

const addConfig = () => {
  addDialog.value = true
}

document.addEventListener('dragenter', (_e) => {
  if (!dxtDialog.value) {
    isDragActive.value = true
    setTimeout(() => {
      isDragActive.value = false
    }, 5000)
  }
})

const items = [
  { title: 'dxt.title', exec: openDialog },
  { title: 'mcp.config', exec: addConfig }
]
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
        v-tooltip:top="$t('mcp.stop')"
        icon="mdi-power-off"
        color="error"
        :loading="layoutStore.mcpLoading"
        @click="stopAllMcpServers()"
      >
      </v-btn>
      <v-btn
        v-tooltip:top="$t('mcp.open')"
        color="primary"
        icon="mdi-open-in-new"
        @click="openPath('config')"
      ></v-btn>
      <v-menu>
        <template #activator="{ props }">
          <v-btn
            v-tooltip:top="$t('mcp.new')"
            v-bind="props"
            icon="mdi-upload"
            :class="{ 'drag-active': isDragActive }"
            @dragenter.prevent="openDialog()"
          >
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in items"
            :key="index"
            :value="index"
            @click="item.exec()"
          >
            <v-list-item-title>{{ $t(item.title) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-btn-group>
    <McpDxtPage v-model="dxtDialog"></McpDxtPage>

    <McpAddPage v-model="addDialog"></McpAddPage>
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
