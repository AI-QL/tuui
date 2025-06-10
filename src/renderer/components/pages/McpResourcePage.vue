<script setup lang="ts">
import { useMcpStore } from '@/renderer/store/mcp'
import { useResourceStore } from '@/renderer/store/resource'
const mcpStore = useMcpStore()
const resourceStore = useResourceStore()
</script>

<template>
  <v-data-iterator
    :items="resourceStore.resourceTemplatesList"
    items-per-page="-1"
    :loading="resourceStore.loadingTemplates"
    @update:options="resourceStore.loadTemplates()"
  >
    <template #default="{ items }">
      <v-container>
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
      </v-container>
    </template>
  </v-data-iterator>
  <v-data-iterator
    :key="mcpStore.getSelected"
    :items="resourceStore.resourceList"
    items-per-page="-1"
    :loading="resourceStore.loadingResources"
    @update:options="resourceStore.loadResources()"
  >
    <template #default="{ items }">
      <v-container>
        <v-expansion-panels>
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
      </v-container>
    </template>
  </v-data-iterator>
</template>
