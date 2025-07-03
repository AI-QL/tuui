<script setup lang="ts">
import { ref, watch } from 'vue'
import { sendFileToMain } from '@/renderer/utils'

const files = ref([] as File[])

watch(files, (val) => {
  console.log(val)
})

const processFiles = async () => {
  console.log(files)
  const file = files.value[0]

  const arrayBuffer = await file.arrayBuffer()

  sendFileToMain({
    name: file.name,
    data: arrayBuffer
  })

  files.value = []
}
</script>

<template>
  <v-card variant="flat">
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
      class="mb-2"
      density="compact"
      height="66"
      accept=".dxt"
      clearable
      show-size
      multiple
      v-model="files"
    >
      <template #icon>
        <v-icon class="mb-2" size="x-small" icon="mdi-upload"></v-icon>
      </template>
      <template #title>
        <div class="text-grey text-h6"> .DXT {{ $t('mcp.file') }} </div>
      </template>
    </v-file-upload>
  </v-card>
</template>
