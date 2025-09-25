<script setup lang="ts">
import { useMcpStore, getAllowedPrimitive, getServers } from '@/renderer/store/mcp'
const mcpStore = useMcpStore()
import { onMounted } from 'vue'

onMounted(() => {
  mcpStore.watchServerUpdate()
})
</script>

<template>
  <v-list
    :key="mcpStore.version"
    v-model:selected="mcpStore.selected"
    nav
    mandatory
    density="compact"
  >
    <v-list-item v-for="(item, key) in getServers()" :key="key" :value="key" :ripple="false">
      <template #title>
        <div class="d-flex align-center">
          <v-checkbox
            v-model="mcpStore.checkList"
            class="pr-1"
            density="compact"
            glow
            hide-details
            color="secondary"
            :value="key"
          ></v-checkbox>
          <v-list-item-title>
            {{ key }}
          </v-list-item-title>
          <v-spacer></v-spacer>
          <v-btn
            size="small"
            color="primary"
            icon="mdi-cog"
            variant="text"
            @click="mcpStore.selectedChips[key] = undefined"
          ></v-btn>
        </div>
      </template>
      <div v-if="getAllowedPrimitive(item).length > 0">
        <v-divider></v-divider>
        <v-chip-group
          v-model="mcpStore.selectedChips[key]"
          :direction="mcpStore.selected?.[0] === key ? 'vertical' : undefined"
          mandatory
        >
          <v-chip
            v-for="name in getAllowedPrimitive(item)"
            :key="`${key}-${name}`"
            class="ma-1"
            label
            color="secondary"
            size="small"
          >
            {{ name }}
          </v-chip>
        </v-chip-group>
      </div>
    </v-list-item>
  </v-list>
</template>

<style></style>
