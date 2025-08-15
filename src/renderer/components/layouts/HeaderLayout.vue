<script setup lang="tsx">
import { watchEffect, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLayoutStore, getScreenFromPath } from '@/renderer/store/layout'
// import { useTheme } from 'vuetify'
import { useDisplay } from 'vuetify'
import LocaleBtn from '@/renderer/components/common/LocaleBtn.vue'
import { useRouteFeatures } from '@/renderer/composables/useRouteFeatures'
import { getAppInfo } from '@/renderer/utils'
// import { useMcpStore } from '@/renderer/store/mcp'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const { titleKey, hasComponent } = useRouteFeatures()

const { xs, smAndUp } = useDisplay()

// const { hasComponent } = useRouteFeatures()

// const mcpStore = useMcpStore()

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

const platform = ref('')

watchEffect(() => {
  getAppInfo()
    .then((info) => {
      platform.value = info.platform
    })
    .catch((error) => {
      console.error('Failed to fetch app info:', error)
      platform.value = ''
    })
})

const items = computed(() => {
  return [
    { title: t('title.main'), testid: 'btn-menu-mcp', route: '/', icon: 'mdi-view-dashboard' },
    {
      title: t('title.chat'),
      testid: 'btn-menu-chat',
      route: '/chat',
      icon: 'mdi-comment-text-outline'
    },
    {
      title: t('title.agent'),
      testid: 'btn-menu-agent',
      route: '/agent',
      icon: 'mdi-account-multiple'
    },
    {
      title: t('title.setting'),
      testid: 'btn-menu-setting',
      route: '/setting',
      icon: 'mdi-cog-transfer-outline'
    }
  ]
})
</script>
<template>
  <v-app-bar class="drag" block :order="-1" color="primary" height="36" rounded="be-lg">
    <v-app-bar-nav-icon
      class="ml-2 no-drag"
      density="compact"
      rounded="lg"
      :disabled="!hasComponent('sideDrawer').value"
      @click.stop="layoutStore.sidebar = !layoutStore.sidebar"
    >
    </v-app-bar-nav-icon>
    <LocaleBtn class="no-drag ml-3" data-testid="select-language" />
    <v-app-bar-title class="text-button title">{{ $t(titleKey.toString()) }}</v-app-bar-title>

    <v-btn-toggle
      v-if="smAndUp"
      v-model="layoutStore.screen"
      class="no-drag ml-2"
      data-testid="main-menu"
      mandatory
      variant="text"
      base-color="white"
    >
      <v-btn
        v-for="(item, index) in items"
        :key="index"
        :data-testid="item.testid"
        @click="handleRoute(item.route)"
      >
        <v-icon> {{ item.icon }} </v-icon>
      </v-btn>
    </v-btn-toggle>
    <v-menu v-if="xs">
      <template #activator="{ props }">
        <v-btn color="white" v-bind="props" class="no-drag ml-2" icon="mdi-apps" rounded="lg">
        </v-btn>
      </template>
      <v-list nav>
        <v-list-item
          v-for="(item, index) in items"
          :key="index"
          :value="index"
          @click="handleRoute(item.route)"
        >
          <template #prepend>
            <v-icon :icon="item.icon"></v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-spacer></v-spacer>

    <template #append>
      <v-col v-if="platform === 'win32' || platform === 'linux'" style="flex: 0 0 100px"></v-col>
    </template>
  </v-app-bar>
</template>
<style scoped>
.drag {
  app-region: drag;
}

.no-drag {
  app-region: no-drag;
}

.title {
  display: block;
}

@media (max-width: 600px) {
  .title {
    display: none;
  }
}
</style>
