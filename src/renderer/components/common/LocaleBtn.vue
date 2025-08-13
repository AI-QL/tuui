<script setup lang="tsx">
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@/renderer/store/locale'
import { onMounted } from 'vue'
import 'iconify-icon'

const { locale } = useI18n()
const localeStore = useLocaleStore()

onMounted((): void => {
  if (localeStore.selected) {
    locale.value = localeStore.selected
  }
})

const handleChangeLanguage = (val): void => {
  locale.value = val
  localeStore.selected = val
}
</script>
<template>
  <v-badge location="top right" :offset-y="7" :offset-x="5" class="click-through-badge">
    <template #badge>
      <iconify-icon :icon="localeStore.getIcon2()"></iconify-icon>
    </template>
    <v-menu transition="fade-transition" :offset="14">
      <template #activator="{ props }">
        <v-btn
          class="ma-1"
          density="compact"
          rounded="lg"
          v-tooltip:start="$t('locale.title')"
          icon="mdi-earth"
          v-bind="props"
        >
        </v-btn>
      </template>
      <v-list class="mb-2">
        <v-list-item
          v-for="n in localeStore.list"
          :key="n.value"
          density="compact"
          @click="handleChangeLanguage(n.value)"
        >
          <template #prepend>
            <iconify-icon class="mr-3" :icon="localeStore.getIcon(n.name)"></iconify-icon>
          </template>
          <v-list-item-title>{{ n.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-badge>
</template>

<style>
.click-through-badge .v-badge__badge {
  background: transparent !important;
  pointer-events: none;
}
</style>
