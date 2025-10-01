<script setup lang="ts">
import { CommandEvent } from '@/renderer/utils'
import { useRoute } from 'vue-router'
import { shallowRef, onMounted, ref } from 'vue'
import type { PopupPromptsType } from '@/types/popup'

const search = shallowRef('')

const route = useRoute()

const promptData = ref<PopupPromptsType[]>([])

onMounted((): void => {
  promptData.value = window.popupApis?.get().prompts || []
})

const commandNotify = (item: PopupPromptsType) => {
  const command = {
    id: route.query.textId as string,
    prompt: item.prompt
  }
  CommandEvent.notify(command)
  return
}
</script>

<template>
  <v-app>
    <v-layout>
      <v-app-bar class="py-2 px-3 drag gradient-command" block density="compact">
        <v-text-field
          v-model="search"
          class="no-drag"
          density="compact"
          placeholder="Search"
          prepend-inner-icon="mdi-magnify"
          variant="solo"
          clearable
          hide-details
        ></v-text-field>
      </v-app-bar>
      <v-main class="d-flex justify-center" scrollable>
        <v-container class="px-0 pb-0">
          <v-sheet>
            <v-data-iterator :items="promptData" :items-per-page="-1" :search="search">
              <template #default="{ items }">
                <v-list density="compact" nav>
                  <v-list-item
                    v-for="(item, i) in items"
                    :key="i"
                    :value="item"
                    color="primary"
                    slim
                    :title="item.raw.title"
                    @click="commandNotify(item.raw)"
                  >
                    <template #prepend>
                      <v-icon class="mx-0" :icon="item.raw.icon || 'mdi-file-outline'"></v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </template>
            </v-data-iterator>
          </v-sheet>
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>

<style>
.drag {
  app-region: drag;
}
.no-drag {
  app-region: no-drag;
}

.gradient-command {
  background: linear-gradient(to right, #01579b, #344767) !important;
  background-blend-mode: normal;
}
</style>
