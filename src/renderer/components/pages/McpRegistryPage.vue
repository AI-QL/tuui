<script setup lang="ts">
import { ref, watch } from 'vue'

import RegistryCard from '@/renderer/components/common/RegistryCard.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const internalDialog = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newVal) => {
    internalDialog.value = newVal
  }
)

watch(internalDialog, (newVal) => {
  emit('update:modelValue', newVal)
})

const closeDialog = () => {
  internalDialog.value = false
}
</script>

<template>
  <v-dialog v-model="internalDialog" persistent max-width="80vw" max-height="80vh" scrollable>
    <RegistryCard>
      <v-btn
        variant="plain"
        rounded="lg"
        icon="mdi-close-box"
        color="error"
        @click="closeDialog"
      ></v-btn>
    </RegistryCard>
  </v-dialog>
</template>
<style scoped></style>
