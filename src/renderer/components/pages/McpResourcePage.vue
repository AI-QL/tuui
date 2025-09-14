<script setup lang="ts">
import { computed } from 'vue'
import { useMcpStore } from '@/renderer/store/mcp'
import { useResourceStore, emptyItem } from '@/renderer/store/resource'
const mcpStore = useMcpStore()
const resourceStore = useResourceStore()

const currentServerName = computed(() => {
  return mcpStore.selected?.[0]
})

const currentResource = computed(() => {
  return resourceStore.data[currentServerName.value]?.resource ?? emptyItem
})

const currentTemplate = computed(() => {
  return resourceStore.data[currentServerName.value]?.template ?? emptyItem
})
</script>

<template>
  <v-data-iterator
    :items="currentTemplate.list"
    :items-per-page="-1"
    :loading="resourceStore.loadingTemplates"
    @update:options="resourceStore.loadTemplates(currentServerName)"
  >
    <template #default="{ items }">
      <v-row dense>
        <v-col
          v-for="item in items as any"
          :key="item.raw.uriTemplate + ':' + item.raw.name"
          cols="auto"
          class="flex-fill"
        >
          <v-card border flat>
            <v-card-item :subtitle="item.raw.uriTemplate" class="mb-2" :title="item.raw.name">
            </v-card-item>
            <v-card-text>{{ item.raw.description }}</v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-data-iterator>
  <v-card class="mt-4">
    <v-data-iterator
      :key="mcpStore.getSelected"
      :items="currentResource.list"
      :items-per-page="currentResource.perPage"
      :loading="resourceStore.loadingResources"
      @update:options="resourceStore.loadResources(currentServerName)"
    >
      <template #header="{ page, pageCount, prevPage, nextPage }">
        <v-toolbar color="white">
          <v-toolbar-title :text="$t('resource.list')" class="text-h6"></v-toolbar-title>

          <v-btn
            :disabled="page === 1"
            class="me-2"
            rounded="lg"
            icon="mdi-arrow-left"
            size="small"
            variant="tonal"
            @click="prevPage"
          ></v-btn>
          <v-btn
            class="me-3"
            rounded="lg"
            icon="mdi-arrow-right"
            size="small"
            variant="tonal"
            :disabled="page === pageCount && !currentResource.cursor"
            @click="
              page === pageCount
                ? resourceStore.getNextpage(currentServerName).then(() => {
                    nextPage()
                  })
                : nextPage()
            "
          ></v-btn>
        </v-toolbar>

        <!-- <span class="d-flex justify-space-between mb-2 align-center">
        <div class="text-truncate">
          Most popular mice
        </div>

        <div class="d-flex align-center">
          <div class="d-inline-flex">
            <v-btn
              :disabled="page === 1"
              class="me-2"
              rounded="lg"
              icon="mdi-arrow-left"
              size="small"
              variant="tonal"
              @click="prevPage"
            ></v-btn>
            <v-btn
            rounded="lg"
              icon="mdi-arrow-right"
              size="small"
              variant="tonal"
              :disabled="page === pageCount && !resourceStore.resourceCursor"
              @click="page === pageCount ? resourceStore.getNextpage().then(() => {nextPage()}) : nextPage()"
            ></v-btn>
          </div>
        </div>
      </span> -->
        <v-divider></v-divider>
      </template>

      <template #default="{ items }">
        <v-expansion-panels variant="accordion" :rounded="false">
          <v-expansion-panel
            v-for="item in items as any"
            :key="item.raw.uri + ':' + item.raw.name"
            :title="item.raw.name + ' - ' + item.raw.uri"
          >
            <v-expansion-panel-text>
              <v-textarea
                :model-value="JSON.stringify(item.raw, null, 2)"
                variant="plain"
                auto-grow
                readonly
              ></v-textarea>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>
      <template #footer="{ page, pageCount }">
        <v-footer class="justify-space-between text-body-2" color="surface-variant">
          {{ $t('resource.total') }}: {{ currentResource.list.length }}

          <div> {{ page }} / {{ pageCount }} </div>
        </v-footer>
      </template>
    </v-data-iterator>
  </v-card>
</template>
