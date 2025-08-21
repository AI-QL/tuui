<script setup lang="ts">
import { McpMetadataStdio } from '@/preload/mcp'
import { reactive } from 'vue'

const showPassword = reactive({})

const props = defineProps({
  modelValue: {
    type: Object as () => McpMetadataStdio,
    required: true
  }
})

const { modelValue: metadata } = props

function formattedValue(value: string[], sep: string) {
  if (Array.isArray(value)) {
    return value.join(sep)
  } else {
    return value
  }
}
</script>

<template>
  <v-card title="Stdio Config">
    <v-divider></v-divider>
    <v-card-text>
      <div v-for="(value, key) in metadata.config" :key="key" class="ma-2">
        <div v-if="key === 'command'">
          <v-text-field
            prepend-icon="mdi-application-outline"
            :model-value="value"
            density="compact"
            variant="outlined"
            readonly
            hide-details
          ></v-text-field>
        </div>
        <div v-else-if="key === 'args'">
          <v-divider class="mt-4"></v-divider>
          <v-textarea
            class="mt-4"
            prepend-icon="mdi-application-brackets-outline"
            :model-value="formattedValue(value as string[], ' \n')"
            density="compact"
            variant="outlined"
            readonly
            rows="1"
            auto-grow
          ></v-textarea>
          <v-text-field
            prepend-icon="mdi-application-export"
            :model-value="metadata.config['command'] + ' ' + formattedValue(value as string[], ' ')"
            density="compact"
            variant="outlined"
            readonly
            hide-details
          ></v-text-field>
        </div>
        <div v-else-if="key === 'env'">
          <v-divider class="mt-4"></v-divider>

          <v-text-field
            v-for="(envValue, envKey) in value as Record<string, string>"
            :key="envKey"
            class="mt-4"
            prepend-icon="mdi-application-braces-outline"
            :type="showPassword[envKey] ? 'text' : 'password'"
            density="compact"
            variant="outlined"
            :append-inner-icon="showPassword[envKey] ? 'mdi-eye-off' : 'mdi-eye'"
            :model-value="envValue"
            readonly
            hide-details
            @click:append-inner="showPassword[envKey] = !showPassword[envKey]"
          >
          </v-text-field>
        </div>
        <div v-else>
          <v-divider class="mt-4"></v-divider>
          <v-text-field
            class="mt-4"
            prepend-icon="mdi-cog-outline"
            :model-value="value"
            density="compact"
            variant="outlined"
            readonly
            hide-details
          ></v-text-field>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>
