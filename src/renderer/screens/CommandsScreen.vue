<script setup lang="ts">
import { CommandEvent } from '@/renderer/utils'
import { useRoute } from 'vue-router'
import { shallowRef } from 'vue'

const search = shallowRef('')

const route = useRoute()

type promptType = {
  icon: string
  title: string
  prompt: string
}

const promptData = [
  {
    icon: 'mdi-alphabet-latin',
    title: 'To English',
    prompt:
      'You are an English translator, and you need to translate the text I provide into English, retaining the original format as much as possible. The translation should be directly ready for external presentation, without adding greetings, farewells, or any extra comments or explanations. For proper nouns, you may keep the original term in parentheses right after the English translation. \n---'
  },
  {
    icon: 'mdi-ideogram-cjk-variant',
    title: '翻译成中文',
    prompt:
      '你是一名中文翻译,你需要尽量以原有格式将我提供的文本翻译成中文。翻译内容应当能够被直接用于对外呈现，不能添加问候语、告别语，不要额外的评论或解释。对于专有名词可以在对应的中文翻译旁的括号内保留外文原词。 \n---'
  },
  {
    icon: 'mdi-ab-testing',
    title: 'Imporve English',
    prompt:
      "You are a technical expert and are preparing an English speech. You need to refine the various text snippets provided below into formal English expressions. When translating, consider the audience's level of understanding, and try to avoid using obscure English words. The translation should be directly suitable for external presentation, without adding greetings, farewells, or any extra comments or explanations. \n---"
  },
  {
    icon: 'mdi-language-typescript',
    title: '解决TypeScript问题',
    prompt:
      '你是一个ts代码助手，帮助解决typescript以及前端项目中遇到的问题。你的回答需要尽量使用最新的解决方案和风格，比如对于vue，请使用vue3 script setup。 \n---'
  },
  {
    icon: 'mdi-language-python',
    title: '解决Python问题',
    prompt: '你是一个py代码助手，帮助解决python以及AI项目中遇到的问题。 \n---'
  }
]

const commandNotify = (item: promptType) => {
  const command = {
    id: route.query.textId as string,
    prompt: item.prompt
  }
  CommandEvent.notify(command)
  return
}
</script>

<template>
  <v-app>
    <v-data-iterator :items="promptData" :items-per-page="-1" :search="search">
      <template #header>
        <v-toolbar class="py-2 px-3 drag" density="compact">
          <v-text-field
            v-model="search"
            class="no-drag"
            density="compact"
            placeholder="Search"
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            clearable
            hide-details
          ></v-text-field>
        </v-toolbar>
      </template>

      <template #default="{ items }">
        <v-list density="compact" nav>
          <v-list-item
            v-for="(item, i) in items"
            :key="i"
            :value="item"
            color="primary"
            :title="item.raw.title"
            @click="commandNotify(item.raw)"
          >
            <template #prepend>
              <v-icon class="mx-0" :icon="item.raw.icon || 'mdi-file-outline'"></v-icon>
            </template>
          </v-list-item>
        </v-list>
      </template>
    </v-data-iterator>
  </v-app>
</template>

<style>
.drag {
  app-region: drag;
}
.no-drag {
  app-region: no-drag;
}

::-webkit-scrollbar {
  display: none;
}
</style>
