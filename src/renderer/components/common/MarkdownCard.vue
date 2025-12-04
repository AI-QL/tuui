<script setup lang="ts">
import { MdPreview, config } from 'md-editor-v3'
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()

import 'md-editor-v3/lib/style.css'

import katex from 'katex'
import 'katex/dist/katex.min.css'

import mermaid from 'mermaid'

import highlight from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

import * as prettier from 'prettier'
import parserMarkdown from 'prettier/plugins/markdown'

config({
  editorExtensions: {
    prettier: {
      prettierInstance: prettier,
      parserMarkdownInstance: parserMarkdown
    },
    highlight: {
      instance: highlight
    },
    katex: {
      instance: katex
    },
    mermaid: {
      instance: mermaid
    }
  }
})

interface Props {
  modelValue: string
  codeFoldable?: boolean
  autoFoldThreshold?: number
}

withDefaults(defineProps<Props>(), {
  codeFoldable: true,
  language: 'en-US',
  autoFoldThreshold: Infinity
})
</script>

<template>
  <md-preview
    :model-value="modelValue"
    :code-foldable="codeFoldable"
    :language="locale === 'zh' ? 'zh-CN' : 'en-US'"
    :auto-fold-threshold="autoFoldThreshold"
    no-echarts
  />
</template>

<style>
.md-editor-preview {
  word-break: keep-all;
  font-family: 'Inter';
}
</style>
