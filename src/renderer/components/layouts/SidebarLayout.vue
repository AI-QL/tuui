<script setup lang="tsx">
// import { useRoute } from 'vue-router'
// import { computed } from 'vue'
import { useLayoutStore } from '@/renderer/store/layout'

const layoutStore = useLayoutStore()

// const router = useRouter()
// const route: any = useRoute()

// const titleKey: string = (route?.meta?.titleKey || 'title.main') as string

// const handleRoute = (path: string): void => {
//   router.push(path)
// }

// const isCurrentRoute = (path: string): boolean => {
//   return path === route.path
// }

// const hasSidebar = computed(() => {
//   return route.matched.some(record => Boolean(record.components?.sidebar))
// })
</script>
<template>
  <v-navigation-drawer width="273" v-model="layoutStore.sidebar" permanent>
    <slot />
    <template #append>
      <slot name="append" />
    </template>
  </v-navigation-drawer>
</template>
