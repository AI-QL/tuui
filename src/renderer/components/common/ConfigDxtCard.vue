<script setup lang="ts">
import { ref, watchEffect, reactive } from 'vue'
import { McpbUserConfigurationOption } from '@anthropic-ai/mcpb'
import { getDxtUrl, openDxtFilePath } from '@/renderer/utils'
import { useDxtStore, validateNumberRange } from '@/renderer/store/dxt'
import type { McpMetadataDxt, userConfigValue, McpbManifest, McpDxtErrors } from '@/types/mcp'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const dxtStore = useDxtStore()

const iconPrefix = ref('')

watchEffect(() => {
  getDxtUrl()
    .then((url) => {
      iconPrefix.value = url
    })
    .catch((error) => {
      console.error('Failed to fetch icon prefix:', error)
      iconPrefix.value = ''
    })
})

const props = defineProps({
  modelValue: {
    type: Object as () => McpMetadataDxt,
    required: true
  }
})

const { modelValue: metadata } = props
const { config: manifest } = metadata

const showPassword = reactive<Record<string, boolean>>({})

function toggleShowPassword(key: string) {
  showPassword[key] = !showPassword[key]
}

const normalizeIconPath = (icon: string) => {
  return icon.replace(/^\.\/?|\//, '')
}

const getIcon = (metadata: McpMetadataDxt) => {
  if (!metadata.config || hasErrors(metadata.config)) {
    return
  } else {
    const icon = metadata.config.icon
    if (!icon) {
      return
    } else {
      return `${iconPrefix.value}/${metadata.name}/${normalizeIconPath(icon)}`
    }
  }
}

const dynamicModel = (name: string, key: string) => ({
  get: () => dxtStore.getConfigAttribute(name, key),
  set: (val: userConfigValue) => dxtStore.updateConfigAttribute(name, key, val)
})

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

const getErrorState = (para: McpbUserConfigurationOption, value: any) => {
  const isRequired = para.required
  const isEmptyArray = Array.isArray(value) && value.length === 0
  return isRequired && (!value || isEmptyArray)
}

const getErrorMessages = (para: McpbUserConfigurationOption, key: string) => {
  const value = dynamicModel(metadata.name, key).get()
  return getErrorState(para, value) ? [t('dxt.required')] : []
}

function hasErrors(config: McpbManifest | McpDxtErrors): config is McpDxtErrors {
  return 'errors' in config && Array.isArray(config.errors)
}
</script>

<template>
  <div v-if="hasErrors(manifest)">
    <v-card v-for="error in manifest.errors" :key="error.field" :subtitle = "error.field" :text="error.message" color="error">

    </v-card>
  </div>
  <div v-else>
    <v-card>
      <template #title>
        <div class="d-flex">
          {{ $t('dxt.title') + ' - ' + metadata.name }}
          <v-chip size="small" class="ml-2 mt-1 font-weight-bold" color="primary">
            {{ manifest.version }}
          </v-chip>
        </div>
      </template>
      <template #append>
        <v-btn
          color="primary"
          variant="text"
          rounded="lg"
          icon="mdi-folder-open"
          @click="openDxtFilePath(metadata.name)"
        ></v-btn>
      </template>
      <v-divider></v-divider>
      <v-card
        class="mx-auto"
        variant="text"
        :subtitle="manifest.description"
        :title="manifest.display_name"
      >
        <template #prepend>
          <v-avatar class="mr-2" rounded="lg" size="48">
            <v-img :src="getIcon(metadata)"></v-img>
          </v-avatar>
        </template>
        <v-card-text class="wrap-text">
          {{ manifest.long_description }}
        </v-card-text>
      </v-card>
    </v-card>
    <v-card :title="$t('dxt.user-config')" class="mt-4">
      <v-divider></v-divider>
      <v-card-text>
        <v-row v-for="(para, key) in manifest.user_config" :key="key" class="mx-3 mt-4 mb-0">
          <v-text-field
            v-if="para.sensitive === true"
            prepend-icon="mdi-key-variant"
            :type="showPassword[key] ? 'text' : 'password'"
            :label="para.title"
            density="compact"
            variant="outlined"
            :placeholder="para.default?.toString()"
            persistent-placeholder
            :append-inner-icon="showPassword[key] ? 'mdi-eye-off' : 'mdi-eye'"
            :model-value="dynamicModel(metadata.name, key).get()"
            clearable
            :error="getErrorState(para, key)"
            :error-messages="getErrorMessages(para, key)"
            @click:append-inner="toggleShowPassword(key)"
            @update:model-value="dynamicModel(metadata.name, key).set($event)"
          >
          </v-text-field>
          <v-number-input
            v-else-if="para.type === 'number'"
            prepend-icon="mdi-numeric"
            :model-value="dynamicModel(metadata.name, key).get() as number"
            :label="para.title"
            density="compact"
            variant="outlined"
            :placeholder="para.default?.toString()"
            persistent-placeholder
            :max="para.max"
            :min="para.min"
            :hint="validateNumberRange(para.min, para.max)"
            clearable
            control-variant="stacked"
            inset
            :error="getErrorState(para, key)"
            :error-messages="getErrorMessages(para, key)"
            @update:model-value="dynamicModel(metadata.name, key).set($event)"
          ></v-number-input>
          <v-combobox
            v-else-if="para.type === 'directory' || para.type === 'file'"
            chips
            clearable
            :prepend-icon="
              para.type === 'directory' ? 'mdi-folder-open-outline' : 'mdi-file-outline'
            "
            :multiple="para.multiple"
            variant="outlined"
            density="compact"
            :label="para.title"
            :placeholder="para.default?.toString()"
            persistent-placeholder
            :model-value="dynamicModel(metadata.name, key).get()"
            :error="getErrorState(para, key)"
            :error-messages="getErrorMessages(para, key)"
            @update:model-value="dynamicModel(metadata.name, key).set($event)"
          ></v-combobox>

          <v-text-field
            v-else
            prepend-icon="mdi-alphabetical"
            :model-value="dynamicModel(metadata.name, key).get()"
            :label="para.title"
            density="compact"
            variant="outlined"
            :placeholder="para.default?.toString()"
            persistent-placeholder
            clearable
            :error="getErrorState(para, key)"
            :error-messages="getErrorMessages(para, key)"
            @update:model-value="dynamicModel(metadata.name, key).set($event)"
          ></v-text-field>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card :title="$t('dxt.description')" class="mt-4">
      <v-divider></v-divider>
      <v-card-text>
        <v-row v-if="manifest.compatibility?.platforms" class="mx-2 mt-2 mb-4">
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
        <v-row v-if="manifest.keywords" class="mx-2 mt-2 mb-4">
          <div class="d-flex align-center ga-4">
            <v-label style="width: 80px">{{ $t('dxt.keywords') }}</v-label>
            <v-chip
              v-for="keyword in manifest.keywords"
              :key="keyword"
              color="light-green-darken-4"
              size="small"
            >
              {{ keyword }}
            </v-chip>
          </div>
        </v-row>

        <v-row class="mx-1 mt-2 mb-2" dense>
          <v-col v-if="manifest.author" cols="12" md="6">
            <v-card
              color="indigo-lighten-2"
              append-icon="mdi-open-in-new"
              class="mx-auto"
              :href="manifest.author.url"
              prepend-icon="mdi-account"
              :subtitle="manifest.author.url || manifest.author.email"
              target="_blank"
              :title="manifest.author.name"
            ></v-card>
          </v-col>
          <v-col v-if="manifest.repository" cols="12" md="6">
            <v-card
              color="green-lighten-1"
              append-icon="mdi-open-in-new"
              class="mx-auto"
              :href="manifest.repository.url"
              prepend-icon="mdi-github"
              :subtitle="manifest.repository.url"
              target="_blank"
              :title="$t('dxt.repository') + ' - ' + manifest.repository.type"
            ></v-card>
          </v-col>
          <v-col v-if="manifest.homepage" cols="12" md="6">
            <v-card
              color="blue-lighten-1"
              append-icon="mdi-open-in-new"
              class="mx-auto"
              :href="manifest.homepage"
              prepend-icon="mdi-home"
              :subtitle="manifest.homepage"
              target="_blank"
              :title="$t('dxt.homepage')"
            ></v-card>
          </v-col>
          <v-col v-if="manifest.documentation" cols="12" md="6">
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
          <v-col v-if="manifest.support" cols="12" md="6">
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
  </div>
</template>
<style scoped>
.wrap-text {
  white-space: pre-line;
  overflow-wrap: break-word;
}
</style>
