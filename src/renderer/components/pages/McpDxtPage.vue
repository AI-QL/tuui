<script setup lang="ts">
import { ref, watch } from 'vue'
import { FileTransfer } from '@/renderer/utils'
import { getDxtManifest } from '@/renderer/store/mcp'

const files = ref([] as File[])
const loading = ref(false)

watch(files, (val) => {
  console.log(val)
})

const filterFiles = () => {
  files.value = files.value.filter((file) => {
    return file.name.toLowerCase().endsWith('.dxt')
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
  } finally {
    loading.value = false
    console.log(getDxtManifest())
  }
}
</script>

<template>
  <v-card variant="flat" :loading="loading">
    <v-fab
      :disabled="files.length === 0"
      class="my-3 ml-4"
      icon="mdi-content-save-plus"
      location="top left"
      size="small"
      :color="files.length === 0 ? 'null' : 'success'"
      absolute
      @click="processFiles()"
    ></v-fab>

    <v-fab
      :disabled="files.length === 0"
      class="my-3 mr-4"
      icon="mdi-close-thick"
      location="top right"
      size="small"
      absolute
      :color="files.length === 0 ? 'null' : 'error'"
      @click="files.length = 0"
    ></v-fab>

    <v-file-upload
      :disabled="loading"
      color="light-grey"
      class="mb-2"
      density="compact"
      height="66"
      accept=".dxt"
      clearable
      show-size
      multiple
      v-model="files"
      @change="filterFiles"
    >
      <template #icon>
        <v-icon class="mb-2" size="x-small" icon="mdi-upload"></v-icon>
      </template>
      <template #title>
        <div class="text-grey text-h6"> .DXT {{ $t('mcp.file') }} </div>
      </template>
    </v-file-upload>
    <v-btn @click="getDxtManifest"></v-btn>
  </v-card>
</template>
