<script setup lang="ts">
// import { DefaultLayout } from '@/renderer/components/layouts'
import '@fontsource/inter/100.css'
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/900.css'
/* optional italic styles */
import '@fontsource/inter/100-italic.css'
import '@fontsource/inter/300-italic.css'
import '@fontsource/inter/400-italic.css'
import '@fontsource/inter/500-italic.css'
import '@fontsource/inter/700-italic.css'
import '@fontsource/inter/900-italic.css'
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
  font-family: 'Inter';
  width: 100%;
  height: 100%;
}

body::-webkit-scrollbar {
  display: none;
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
