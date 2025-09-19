<script setup lang="ts">
import { ref, watch } from 'vue'
import { FileTransfer } from '@/renderer/utils'
import { useMcpStore } from '@/renderer/store/mcp'
const mcpStore = useMcpStore()

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const internalDialog = ref(props.modelValue)

const files = ref([] as File[])
const loading = ref(false)

watch(files, (val) => {
  console.log(val)
})

const filterFiles = () => {
  files.value = files.value.filter((file) => {
    return file.name.toLowerCase().endsWith('.mcpb')
  })
}

const processFiles = async () => {
  try {
    loading.value = true
    console.log(files)
    const fileList = files.value
    files.value = []

    const promises = fileList.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer()
      return FileTransfer.request({
        name: file.name,
        data: arrayBuffer
      })
    })

    await Promise.all(promises)

    await FileTransfer.response(fileList.length)

    await window.dxtManifest?.refresh()
    await window.mcpServers?.refresh()
    mcpStore.version++
  } finally {
    loading.value = false
    closeDialog()
  }
}

watch(
  () => props.modelValue,
  (newVal) => {
    internalDialog.value = newVal
  }
)

watch(internalDialog, (newVal) => {
  emit('update:modelValue', newVal)
})

const closeDialog = () => {
  files.value = []
  internalDialog.value = false
}
</script>

<template>
  <v-dialog v-model="internalDialog" persistent max-width="80vw" max-height="80vh" scrollable>
    <v-card :title="$t('dxt.title')">
      <template #append>
        <v-btn
          icon="mdi-close-box"
          rounded="lg"
          color="error"
          variant="text"
          @click="closeDialog"
        ></v-btn>
      </template>
      <v-divider></v-divider>
      <v-card-text>
        <slot></slot>
        <v-card variant="flat" :loading="loading">
          <v-file-upload
            v-model="files"
            :disabled="loading"
            color="light-grey"
            class="mb-2"
            density="compact"
            accept=".mcpb"
            clearable
            show-size
            multiple
            scrim="primary"
            @change="filterFiles"
          >
            <template #icon>
              <v-icon class="mb-2" size="x-small" icon="mdi-upload"></v-icon>
            </template>
            <template #title>
              <div class="text-grey text-h6"> .MCPB {{ $t('mcp.file') }} </div>
            </template>
          </v-file-upload>
        </v-card>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn
          variant="plain"
          rounded="lg"
          :disabled="files.length === 0"
          icon="mdi-delete-outline"
          color="error"
          @click="files.length = 0"
        ></v-btn>

        <v-btn
          variant="plain"
          rounded="lg"
          :disabled="files.length === 0"
          icon="mdi-content-save-plus"
          color="success"
          @click="processFiles()"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
