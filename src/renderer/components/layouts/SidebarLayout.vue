<script setup lang="ts">
import { useLayoutStore } from '@/renderer/store/layout'

import { useDisplay } from 'vuetify'

const mobileBreakpoint = 600
const { mobile } = useDisplay({ mobileBreakpoint: mobileBreakpoint })

const layoutStore = useLayoutStore()

function handleDrawerClick() {
  if (mobile.value) {
    layoutStore.sidebar = false
  }
}
</script>
<template>
  <v-navigation-drawer
    v-model="layoutStore.sidebar"
    :permanent="!mobile"
    :width="mobile ? mobileBreakpoint : 273"
    @click="handleDrawerClick"
  >
    <slot />
    <template #append>
      <slot name="append" />
    </template>
  </v-navigation-drawer>
</template>
