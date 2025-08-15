<script setup lang="ts">
import { useMcpStore, getAllowedPrimitive, getServers } from '@/renderer/store/mcp'
const mcpStore = useMcpStore()
</script>

<template>
  <v-list :key="mcpStore.version" v-model:selected="mcpStore.selected" nav mandatory>
    <v-list-item
      v-for="(item, key) in getServers()"
      :key="key"
      two-line
      :value="key"
      link
      :ripple="false"
    >
      <template #title>
        <div class="d-flex align-center">
          <v-list-item-title class="pt-1">
            {{ key }}
          </v-list-item-title>
          <v-spacer></v-spacer>
          <v-btn
            class="mt-1"
            size="small"
            color="primary"
            icon="mdi-cog"
            variant="text"
            @click="console.log((mcpStore.selectedChips[key] = undefined))"
          ></v-btn>
        </div>
      </template>
      <v-chip-group
        v-model="mcpStore.selectedChips[key]"
        :direction="mcpStore.selected?.[0] === key ? 'vertical' : undefined"
        mandatory
      >
        <v-chip
          v-for="name in getAllowedPrimitive(item)"
          :key="`${key}-${name}`"
          class="mr-1 my-1"
          label
          color="secondary"
          size="small"
        >
          {{ name }}
        </v-chip>
      </v-chip-group>
    </v-list-item>
  </v-list>
</template>

<style></style>
