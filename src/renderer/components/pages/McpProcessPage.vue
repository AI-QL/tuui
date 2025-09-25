<script setup lang="ts">
import { McpEvent } from '@/renderer/utils'
import { useMcpStore } from '@/renderer/store/mcp'
import { useLayoutStore } from '@/renderer/store/layout'
import { ref, watch, computed } from 'vue'

const layoutStore = useLayoutStore()
const mcpStore = useMcpStore()

interface ProgressItem {
  messages: string[]
  status: 'pending' | 'error' | 'success'
}

const progressMap = ref<Record<string, ProgressItem>>({})

const mcpDialog = ref(false)

const handleProgress = (_event, progress) => {
  const name = progress.args[0].name
  const message = progress.args[0].message
  const status = progress.args[0].status

  console.log(progressMap.value[name], progress.args[0])

  if (!progressMap.value[name]) {
    progressMap.value[name] = {
      messages: [],
      status: 'pending'
    }
  }
  if (message) {
    progressMap.value[name].messages.push(message)
  }
  if (status !== 'pending') {
    progressMap.value[name].status = status
  }
}

McpEvent.watch(handleProgress)

const isLoading = computed(() => layoutStore.mcpLoading)

const allSuccess = computed(() => {
  return Object.entries(progressMap.value).every(
    ([key, item]) => item.status === 'success' || !mcpStore.checkList.includes(key)
  )
})

watch(isLoading, (newVal, oldVal) => {
  if (newVal) {
    progressMap.value = {}
    mcpDialog.value = true
  } else {
    setTimeout(() => {
      console.log(progressMap.value)
      if (allSuccess.value || oldVal === 'stop') {
        // If all server are started successful, or all servers are forced to stop
        // no need to stick the dialog for process visualization
        mcpDialog.value = false
      }
    }, 500)
  }
})
</script>

<template>
  <v-dialog v-model="mcpDialog" persistent max-width="80vw" max-height="80vh" scrollable>
    <v-card>
      <v-card-text>
        <v-timeline align="start" density="compact">
          <v-timeline-item
            v-for="(value, name, key) in progressMap"
            :key="key"
            :dot-color="value.status"
            size="x-small"
          >
            <div class="mb-4">
              <div class="font-weight-normal">
                <strong>{{ name }}</strong>
              </div>

              <div v-for="message in value.messages" :key="message">{{ message }}</div>
            </div>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-icon-btn
          icon="mdi-close-box"
          color="error"
          variant="plain"
          rounded="lg"
          @click="mcpDialog = false"
        ></v-icon-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
