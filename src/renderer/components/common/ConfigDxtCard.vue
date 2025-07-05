<script setup lang="ts">
import { McpMetadataDxt } from '@/preload/types'
import { getDxtUrl } from '@/renderer/utils'

import { ref, watchEffect } from 'vue'

const iconPrefix = ref('')

watchEffect(async () => {
  iconPrefix.value = await getDxtUrl()
})

const props = defineProps({
  modelValue: {
    type: Object as () => McpMetadataDxt,
    required: true
  }
})

const { modelValue: metadata } = props
const { config: manifest } = metadata

const normalizeIconPath = (icon: string) => {
  return icon.replace(/^\.\/?|\//, '')
}

const getIcon = (metadata) => {
  return `${iconPrefix.value}/${metadata.name}/${normalizeIconPath(metadata.config.icon)}`
}
</script>

<template>
  <v-card :title="metadata.name">
    <v-divider></v-divider>
    <v-card-text>
      <div class="d-flex flex-column pa-10">
        <v-avatar size="120" class="mx-auto elevation-12" color="white">
          <v-img :src="getIcon(metadata)"> </v-img>
        </v-avatar>

        <div class="text-center mt-5">
          <h3 class="text-h6 font-weight-bold">
            {{ manifest.name }}
            <v-chip size="small" class="font-weight-bold" color="blue">
              {{ manifest.version }}
            </v-chip>
          </h3>
          <p class="text-body-2">{{ manifest.description }}</p>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>
