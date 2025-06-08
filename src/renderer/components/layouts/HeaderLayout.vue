<script setup lang="tsx">
import { watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLayoutStore, getScreenFromPath } from '@/renderer/store/layout'
// import { useTheme } from 'vuetify'
import LocaleBtn from '@/renderer/components/common/LocaleBtn.vue'
import { useRouteFeatures } from '@/renderer/composables/useRouteFeatures'
import { useMcpStore } from '@/renderer/store/mcp'

const { titleKey, hasComponent } = useRouteFeatures()

// const { hasComponent } = useRouteFeatures()

const mcpStore = useMcpStore()

const layoutStore = useLayoutStore()

const router = useRouter()
const route = useRoute()
// const theme = useTheme()

const handleRoute = (path: string): void => {
  router.push(path)
}

watchEffect(() => {
  layoutStore.screen = getScreenFromPath(route.path)
})

// const handleChangeTheme = (): void => {
//   theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
// }
</script>
<template>
  <v-app-bar block :order="-1" color="primary" height="36" rounded="be-lg">
    <v-app-bar-nav-icon
      class="ml-2"
      density="compact"
      rounded="lg"
      :disabled="!hasComponent('sideDrawer').value"
      @click.stop="layoutStore.sidebar = !layoutStore.sidebar"
    >
    </v-app-bar-nav-icon>
    <v-app-bar-title class="text-button">{{ $t(titleKey.toString()) }}</v-app-bar-title>

    <v-btn-toggle
      v-model="layoutStore.screen"
      data-testid="main-menu"
      mandatory
      variant="text"
      base-color="white"
    >
      <v-btn :key="0" data-testid="btn-menu-mcp" @click="handleRoute('/')">
        <v-icon>mdi-view-dashboard</v-icon>
      </v-btn>

      <v-btn :key="1" data-testid="btn-menu-chat" @click="handleRoute('/chat')">
        <v-icon>mdi-comment-text-outline</v-icon>
      </v-btn>

      <v-btn :key="2" data-testid="btn-menu-agent" @click="handleRoute('/agent')">
        <v-icon>mdi-account-multiple</v-icon>
      </v-btn>

      <v-btn :key="3" data-testid="btn-menu-setting" @click="handleRoute('/setting')">
        <v-icon>mdi-cog-transfer-outline</v-icon>
      </v-btn>
    </v-btn-toggle>

    <v-spacer></v-spacer>

    <template #append>
      <LocaleBtn data-testid="select-language" />

      <!-- <v-btn icon @click="handleChangeTheme">
        <v-icon icon="mdi-brightness-6" />
        <v-tooltip activator="parent" location="bottom">
          {{ $t('menu.change-theme') }}
        </v-tooltip>
      </v-btn> -->
      <!-- @click="mcpStore.listTools().then((tools) => console.log(tools))" -->
      <v-btn
        class="ma-1"
        density="compact"
        rounded="lg"
        icon="mdi-clipboard-text"
        @click="console.log(mcpStore.getServers())"
      >
      </v-btn>
    </template>
  </v-app-bar>
</template>
<style scoped></style>
