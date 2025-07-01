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
  display: block;
  block-size: 5px;
  inline-size: 5px;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: lightgrey;
}

::-webkit-scrollbar-thumb:hover {
  background-color: grey;
}
</style>
