<script setup lang="tsx">
import HeaderLayout from '@/renderer/components/layouts/HeaderLayout.vue'
import SidebarLayout from '@/renderer/components/layouts/SidebarLayout.vue'
import FooterLayout from '@/renderer/components/layouts/FooterLayout.vue'
import { useRouteFeatures } from '@/renderer/composables/useRouteFeatures'
import { useSnackbarStore } from '@/renderer/store/snackbar'
const snackbarStore = useSnackbarStore()
const { hasComponent } = useRouteFeatures()
</script>

<template>
  <v-app>
    <v-layout>
      <v-snackbar
        v-model="snackbarStore.isShow"
        timeout="4000"
        :color="snackbarStore.type"
        location="top"
      >
        <div class="d-flex align-center">
          <v-icon class="mr-2">{{ snackbarStore.getIcon() }}</v-icon>
          <span>{{ $t(snackbarStore.message) }}</span>
        </div>

        <template #actions>
          <v-btn icon variant="text" @click="snackbarStore.isShow = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-snackbar>
      <SidebarLayout v-if="hasComponent('sideDrawer').value" class="position-fixed">
        <router-view name="sideDrawer" />
        <template #append>
          <router-view v-if="hasComponent('sideDock').value" name="sideDock" />
        </template>
      </SidebarLayout>
      <HeaderLayout class="position-fixed" />
      <v-main class="d-flex justify-center">
        <v-container>
          <router-view name="centralStage" />
          <router-view />
        </v-container>
      </v-main>
      <FooterLayout v-if="hasComponent('bottomConsole').value" class="position-fixed">
        <router-view name="bottomConsole" />
      </FooterLayout>
    </v-layout>
  </v-app>
</template>

<style scoped>
.position-fixed {
  position: fixed;
}
</style>
