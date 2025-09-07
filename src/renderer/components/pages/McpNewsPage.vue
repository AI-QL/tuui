<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { StartupNewsType } from '@/preload/startup'

const mcpNews = ref<StartupNewsType[]>([])

onMounted((): void => {
  mcpNews.value = window.startupApis?.get().news || []
})

const placeholderColor = computed(() => {
  return (index: number) => {
    const hue = (index * 137.508) % 360 // Evenly distribute hues using golden angle approximation
    const saturation = 30 + Math.sin(index * 0.5) * 20 // 30%~50% saturation (soft pastel tones)
    const lightness = 50 + Math.cos(index * 0.3) * 10 // 40%~60% lightness (avoids extreme brightness)
    return `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Crect width='10' height='6' fill='hsl(${hue}, ${saturation}%, ${lightness}%)'/%3E%3C/svg%3E`
  }
})
</script>

<template>
  <v-data-iterator :items="mcpNews" :items-per-page="-1">
    <template #default="{ items }">
      <v-container class="pa-0" fluid>
        <v-row dense>
          <v-col v-for="(item, index) in items" :key="item.raw.title" cols="auto" md="4">
            <v-card class="pb-3" border flat>
              <v-img
                class="ma-2"
                rounded="lg"
                cover
                :src="item.raw.img"
                :height="140"
                :lazy-src="placeholderColor(index)"
              >
                <template #placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
                  </div>
                </template>
                <template #error>
                  <v-img></v-img>
                </template>
              </v-img>
              <v-divider></v-divider>

              <v-list-item lines="two">
                <template #title>
                  <strong class="text-h6 mb-1">{{ item.raw.title }}</strong>
                </template>
                <template #subtitle>
                  <div class="subtitle-text">{{ item.raw.subtitle }}</div>
                </template>
              </v-list-item>

              <div class="d-flex justify-space-between px-4">
                <div class="d-flex align-center text-caption text-medium-emphasis me-1">
                  <v-icon icon="mdi-clock" start></v-icon>

                  <div class="text-truncate">{{ `${item.raw.duration} ` + $t('mcp.minutes') }}</div>
                </div>

                <v-btn
                  class="text-none"
                  size="small"
                  :text="$t('mcp.read')"
                  variant="flat"
                  border
                  :href="item.raw.link"
                  target="_blank"
                >
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </v-data-iterator>
</template>

<style scoped>
.subtitle-text {
  padding-bottom: 2px;
}
</style>
