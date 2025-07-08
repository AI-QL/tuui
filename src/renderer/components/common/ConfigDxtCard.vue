<script setup lang="ts">
import { McpMetadataDxt } from '@/preload/types'
import { getDxtUrl, openDxtFilePath } from '@/renderer/utils'
import { useDxtStore } from '@/renderer/store/dxt'
import type { userConfigValue } from '@/preload/types'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

import { ref, watchEffect, reactive } from 'vue'

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

// const rules = {
//     required: (value: userConfigValue) => !!value || 'Field is required',
//     number: (value: userConfigValue) => (typeof value) === 'number' || 'Must be number'
//   }

const showPassword = reactive({})

function toggleShowPassword(key) {
  showPassword[key] = !showPassword[key]
}

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

const validateNumberRange = (min: number | undefined, max: number | undefined) => {
  return (value: string | number | null): boolean | string => {
    if (!value && value !== 0) return true

    const num = Number(value)
    if (isNaN(num)) return t('dxt.number.invalid')

    if (min !== undefined && num < Number(min)) {
      return t('dxt.number.too-small', { min })
    }

    if (max !== undefined && num > Number(max)) {
      return t('dxt.number.too-big', { max })
    }

    return true
  }
}

function getPlatformColor(platform: string): string {
  switch (platform) {
    case 'darwin':
      return 'grey-darken-2'
    case 'win32':
      return 'blue-darken-2'
    case 'linux':
      return 'orange-darken-4'
    default:
      return 'grey'
  }
}

function getPlatformIcon(platform: string): string {
  switch (platform) {
    case 'darwin':
      return 'mdi-apple'
    case 'win32':
      return 'mdi-microsoft-windows'
    case 'linux':
      return 'mdi-linux'
    default:
      return 'mdi-help-circle'
  }
}
</script>

<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <div> {{ $t('dxt.title') + ' - ' + metadata.name }} </div>
      <v-chip size="small" class="ml-2 mt-1 font-weight-bold" color="blue-darken-4">
        {{ manifest.dxt_version }}
      </v-chip>
      <v-chip size="small" class="ml-2 mt-1 font-weight-bold" color="blue">
        {{ manifest.version }}
      </v-chip>
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
    <v-card class="ma-3" variant="text">
      <div class="d-flex flex-no-wrap justify-space-between" style="align-items: center">
        <div style="flex-shrink: 1; max-width: calc(100% - 140px)">
          <v-card-title class="text-subtitle-1 meta-card-title">
            {{ manifest.display_name }}
          </v-card-title>
          <v-card-subtitle class="meta-card-title">
            {{ manifest.description }}
          </v-card-subtitle>

          <v-card-actions>
            <div class="ma-2 text-medium-emphasis">
              {{ manifest.long_description }}
            </div>
          </v-card-actions>
        </div>

        <v-avatar class="ma-3" rounded="lg" size="125">
          <v-img :src="getIcon(metadata)"></v-img>
        </v-avatar>
      </div>
    </v-card>
  </v-card>
  <v-card :title="$t('dxt.user-config')" class="mt-4">
    <v-divider></v-divider>
    <v-card-text>
      <v-row class="mx-3 mt-4 mb-0" v-for="(para, key) in manifest.user_config" :key="key">
        <v-text-field
          v-if="para.sensitive === true"
          prepend-icon="mdi-key-variant"
          :type="showPassword[key] ? 'text' : 'password'"
          :label="para.title"
          density="compact"
          variant="outlined"
          :placeholder="para.default?.toString()"
          @click:append-inner="toggleShowPassword(key)"
          :append-inner-icon="showPassword[key] ? 'mdi-eye-off' : 'mdi-eye'"
          :model-value="dynamicModel(metadata.name, key).get()"
          @update:model-value="dynamicModel(metadata.name, key).set($event)"
          clearable
          :error="para.required && !dynamicModel(metadata.name, key).get()"
          :error-messages="
            para.required && !dynamicModel(metadata.name, key).get() ? [$t('dxt.required')] : []
          "
        >
        </v-text-field>
        <v-text-field
          v-else-if="para.type === 'number'"
          prepend-icon="mdi-numeric"
          type="number"
          :model-value="dynamicModel(metadata.name, key).get()"
          @update:model-value="dynamicModel(metadata.name, key).set($event)"
          :label="para.title"
          density="compact"
          variant="outlined"
          :placeholder="para.default?.toString()"
          :rules="[validateNumberRange(para.min, para.max)]"
          clearable
          :error="para.required && !dynamicModel(metadata.name, key).get()"
          :error-messages="
            para.required && !dynamicModel(metadata.name, key).get() ? [$t('dxt.required')] : []
          "
        ></v-text-field>
        <v-combobox
          v-else-if="para.type === 'directory' || para.type === 'file'"
          chips
          clearable
          :prepend-icon="para.type === 'directory' ? 'mdi-folder-open-outline' : 'mdi-file-outline'"
          :multiple="para.multiple"
          variant="outlined"
          density="compact"
          :label="para.title"
          :placeholder="para.default?.toString()"
          :model-value="dynamicModel(metadata.name, key).get()"
          @update:model-value="dynamicModel(metadata.name, key).set($event)"
        ></v-combobox>

        <v-text-field
          v-else
          prepend-icon="mdi-alphabetical"
          :model-value="dynamicModel(metadata.name, key).get()"
          @update:model-value="dynamicModel(metadata.name, key).set($event)"
          :label="para.title"
          density="compact"
          variant="outlined"
          :placeholder="para.default?.toString()"
          clearable
          :error="para.required && !dynamicModel(metadata.name, key).get()"
          :error-messages="
            para.required && !dynamicModel(metadata.name, key).get() ? [$t('dxt.required')] : []
          "
        ></v-text-field>
      </v-row>
    </v-card-text>
  </v-card>

  <v-card :title="$t('dxt.description')" class="mt-4">
    <v-divider></v-divider>
    <v-card-text>
      <v-row class="mx-2 mt-2 mb-4" v-if="manifest.compatibility?.platforms">
        <div class="d-flex align-center ga-4">
          <v-label style="width: 80px">{{ $t('dxt.platform') }}</v-label>
          <div v-for="platform in manifest.compatibility.platforms" :key="platform">
            <v-chip :color="getPlatformColor(platform)" label size="small">
              <v-icon :icon="getPlatformIcon(platform)" start></v-icon>
              {{ platform }}
            </v-chip>
          </div>
        </div>
      </v-row>
      <v-row class="mx-2 mt-2 mb-4" v-if="manifest.keywords">
        <div class="d-flex align-center ga-4">
          <v-label style="width: 80px">{{ $t('dxt.keywords') }}</v-label>
          <v-chip color="light-green-darken-4" size="small" v-for="keyword in manifest.keywords">
            {{ keyword }}
          </v-chip>
        </div>
      </v-row>

      <v-row class="mx-1 mt-2 mb-2" dense>
        <v-col v-if="manifest.author" cols="auto" md="6">
          <v-card
            color="blue-lighten-1"
            append-icon="mdi-open-in-new"
            class="mx-auto"
            :href="manifest.author.url"
            prepend-icon="mdi-account"
            :subtitle="manifest.author.email"
            target="_blank"
            :title="manifest.author.name"
          ></v-card>
        </v-col>
        <v-col v-if="manifest.repository" cols="auto" md="6">
          <v-card
            color="indigo-lighten-2"
            append-icon="mdi-open-in-new"
            class="mx-auto"
            :href="manifest.repository.url"
            prepend-icon="mdi-github"
            :subtitle="manifest.repository.url"
            target="_blank"
            :title="$t('dxt.repository') + ' - ' + manifest.repository.type"
          ></v-card>
        </v-col>
        <v-col v-if="manifest.homepage" cols="auto" md="6">
          <v-card
            color="green-lighten-1"
            append-icon="mdi-open-in-new"
            class="mx-auto"
            :href="manifest.homepage"
            prepend-icon="mdi-home"
            :subtitle="manifest.homepage"
            target="_blank"
            :title="$t('dxt.homepage')"
          ></v-card>
        </v-col>
        <v-col v-if="manifest.documentation" cols="auto" md="6">
          <v-card
            color="brown-lighten-2"
            append-icon="mdi-open-in-new"
            class="mx-auto"
            :href="manifest.documentation"
            prepend-icon="mdi-file-document"
            :subtitle="manifest.documentation"
            target="_blank"
            :title="$t('dxt.documentation')"
          ></v-card>
        </v-col>
        <v-col v-if="manifest.support" cols="auto" md="6">
          <v-card
            color="red-lighten-2"
            append-icon="mdi-open-in-new"
            class="mx-auto"
            :href="manifest.support"
            prepend-icon="mdi-alert-circle-outline"
            :subtitle="manifest.support"
            target="_blank"
            :title="$t('dxt.support')"
          ></v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-card v-if="manifest.tools" :title="$t('dxt.tools')" class="mt-4">
    <v-divider></v-divider>
    <v-card-text>
      <v-data-table
        hover
        hide-default-footer
        hide-default-header
        hide-no-data
        disable-sort
        :items-per-page="-1"
        :items="manifest.tools"
      ></v-data-table>
    </v-card-text>
  </v-card>
</template>
<style scoped>
.meta-card-title {
  style {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
