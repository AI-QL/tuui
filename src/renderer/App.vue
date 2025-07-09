<script setup lang="ts">
// import { DefaultLayout } from '@/renderer/components/layouts'
</script>

<template>
  <router-view />
</template>

<style>
/* html {
  overflow-y: auto !important;
  user-select: none;
} */

html,
body {
  width: 100%;
  height: 100%;
}

/* Do not force capitalization of button text */
.v-btn {
  text-transform: unset !important;
}

::-webkit-scrollbar {
  width: 13px;
  height: 13px;
  background: transparent;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 13px;
  border: 5px solid transparent;
  background-clip: content-box;
  transition: background-color 0.3s;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.4);
  border-color: rgba(0, 0, 0, 0.1);
}
</style>
