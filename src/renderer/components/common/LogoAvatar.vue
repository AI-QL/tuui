<script setup>
import { secondaryColor } from '@/renderer/utils/color'
defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <v-avatar v-if="item.icon" class="mr-1" rounded="lg" size="x-small">
    <v-img :src="item.icon" :lazy-src="secondaryColor">
      <template #error>
        <v-avatar class="mr-1" rounded="lg" size="x-small" color="secondary">
          <span>{{ item.name[0] }}</span>
        </v-avatar>
      </template>
    </v-img>
  </v-avatar>

  <v-avatar v-else class="mr-1" rounded="lg" size="x-small" color="secondary">
    <span>{{ item.name[0] }}</span>
  </v-avatar>
</template>

<style scoped></style>
