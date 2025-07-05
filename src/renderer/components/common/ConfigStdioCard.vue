<script setup lang="ts">
defineProps({
  modelValue: {
    type: String,
    required: true
  }
})
</script>

<template>
  <v-textarea variant="solo" auto-grow readonly :model-value="modelValue"></v-textarea>
</template>
