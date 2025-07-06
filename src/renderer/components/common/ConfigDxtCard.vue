<script setup lang="ts">
import { McpMetadataDxt } from '@/preload/types'
import { getDxtUrl, openDxtFilePath } from '@/renderer/utils'
import { useDxtStore } from '@/renderer/store/dxt'
import type { userConfigValue } from '@/preload/types'

import { ref, watchEffect } from 'vue'

const dxtStore = useDxtStore()

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

const getIcon = (metadata: McpMetadataDxt) => {
  const icon = metadata.config.icon
  if (!icon) {
    return undefined
  } else {
    return `${iconPrefix.value}/${metadata.name}/${normalizeIconPath(icon)}`
  }
}

const dynamicModel = (name: string, key: string) => ({
  get: () => dxtStore.getConfigAttribute(name, key),
  set: (val: userConfigValue) => dxtStore.updateConfigAttribute(name, key, val)
})
</script>

<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <div> {{ metadata.name }} </div>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        variant="text"
        size="small"
        icon="mdi-open-in-new"
        @click="openDxtFilePath(metadata.name)"
      ></v-btn>
    </v-card-title>
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
  <v-card>
    <v-card-text>
      <v-row v-for="(para, key) in manifest.user_config" :key="key">
        <v-text-field
          :model-value="dynamicModel(metadata.name, key).get()"
          @update:model-value="dynamicModel(metadata.name, key).set($event)"
          density="compact"
          :label="para.title"
          variant="solo"
          clearable
        ></v-text-field>
      </v-row>
    </v-card-text>
  </v-card>
</template>
