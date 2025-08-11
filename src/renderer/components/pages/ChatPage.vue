<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useDisplay } from 'vuetify'
import ImgDialog from '../common/ImgDialog.vue'
import ChatCard from '../common/ChatCard.vue'
import SamplingCard from '../common/SamplingCard.vue'
import ElicitationCard from '../common/ElicitationCard.vue'

import { isEmptyTools } from '@/renderer/composables/chatCompletions'
import { MdPreview, config } from 'md-editor-v3'
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

interface Message {
  role: 'user' | 'assistant' | 'tool'
  content: any
  tool_calls?: any[]
  tool_call_id?: string
  reasoning_content?: string
}

interface Group {
  index: number
  group: 'user' | 'assistant' | 'tool'
  message?: Message
  tab?: string
  messages?: Message[]
  length?: number
}

const { smAndUp } = useDisplay()

const props = defineProps<{
  messages: Message[]
  language: string
}>()

const emit = defineEmits<{
  (_e: 'request-delete', _payload: { index: number; range: number }): void
}>()

const handleDeleteMessages = ({ index, range }: { index: number; range: number }) => {
  emit('request-delete', {
    index,
    range
  })
}

const dialogs = reactive<{ [key: string]: number }>({})
const groupMessages = computed<Group[]>(() => {
  const groups: Group[] = []
  props.messages.forEach((message, index) => {
    if (message.role === 'user') {
      groups.push({
        index,
        group: 'user',
        message
      })
    } else if (message.role === 'assistant' && isEmptyTools(message.tool_calls)) {
      groups.push({
        index,
        group: 'assistant',
        message
      })
    } else {
      const lastGroup = groups[groups.length - 1]
      if (lastGroup?.group === 'tool') {
        lastGroup.messages?.push(message)
        dialogs[lastGroup.tab!] = lastGroup.length!
        lastGroup.length! += 1
      } else {
        const id = message.tool_call_id || message.tool_calls?.[0]?.id
        groups.push({
          index,
          group: 'tool',
          tab: id,
          messages: [message],
          length: 1
        })
        dialogs[id!] = 0
      }
    }
  })
  console.log(groups)
  return groups
})
</script>

<template>
  <SamplingCard></SamplingCard>
  <ElicitationCard></ElicitationCard>
  <div v-for="group in groupMessages" :key="group.index">
    <!-- User Messages -->
    <div v-if="group.group === 'user'">
      <div class="px-2 py-5 chat-message">
        <div class="message">
          <v-avatar
            class="mt-2 mr-3 mr-lg-6"
            :size="smAndUp ? 'default' : 'x-small'"
            color="primary"
            icon="mdi-account-circle"
          />
          <chat-card
            :index="group.index"
            :messages="messages"
            :show-modify="true"
            @delete-messages="handleDeleteMessages"
          >
            <template #default="{ showmodify }">
              <v-card-text v-if="Array.isArray(group.message!.content)" class="md-preview pt-1">
                <div v-for="(item, index) in group.message!.content" :key="index">
                  <img-dialog v-if="item.type === 'image_url'" :src="item.image_url.url" />
                  <v-textarea
                    v-model="item.text"
                    class="conversation-area"
                    variant="plain"
                    density="compact"
                    auto-grow
                    :counter="showmodify || undefined"
                    :hide-details="!showmodify"
                    rows="1"
                    :readonly="!showmodify"
                  />
                </div>
              </v-card-text>
              <v-card-text v-else class="md-preview pt-1">
                <v-textarea
                  v-model="group.message!.content"
                  class="conversation-area"
                  variant="plain"
                  density="compact"
                  auto-grow
                  rows="1"
                  :readonly="!showmodify"
                  :counter="showmodify || undefined"
                  :hide-details="!showmodify"
                />
              </v-card-text>
            </template>
          </chat-card>
        </div>
      </div>
    </div>

    <!-- Assistant Messages -->
    <div v-if="group.group === 'assistant'">
      <div class="px-2 py-5 chat-message">
        <div class="message">
          <v-avatar
            class="mt-2 mr-3 mr-lg-6"
            :size="smAndUp ? 'default' : 'x-small'"
            color="teal"
            icon="mdi-lightning-bolt-circle"
          />
          <chat-card
            :index="group.index"
            :messages="messages"
            :show-content="true"
            @delete-messages="handleDeleteMessages"
          >
            <template #default="{ showcontent }">
              <v-card-text v-if="group.message!.reasoning_content" class="md-preview pt-1">
                <v-textarea
                  v-model="group.message!.reasoning_content"
                  class="conversation-area text-disabled font-italic"
                  variant="plain"
                  density="compact"
                  auto-grow
                  hide-details
                  rows="1"
                  readonly
                />
              </v-card-text>
              <v-card-text v-if="showcontent" class="md-preview pt-1">
                <v-textarea
                  v-model="group.message!.content"
                  class="conversation-area"
                  variant="plain"
                  density="compact"
                  auto-grow
                  hide-details
                  rows="1"
                  readonly
                />
              </v-card-text>
              <v-card-text v-else class="md-preview pt-3">
                <!--  -->
                <md-preview
                  :model-value="group.message!.content"
                  :code-foldable="true"
                  :language="language === 'zh' ? 'zh-CN' : 'en-US'"
                  :auto-fold-threshold="Infinity"
                />
              </v-card-text>
            </template>
          </chat-card>
        </div>
      </div>
    </div>

    <!-- Tool Messages -->
    <div v-if="group.group === 'tool'">
      <div class="px-2 py-5 chat-message">
        <div class="message">
          <v-avatar
            class="mt-2 mr-3 mr-lg-6"
            :size="smAndUp ? 'default' : 'x-small'"
            color="brown"
            icon="mdi-swap-vertical-circle"
          />
          <chat-card
            :messages="messages"
            :show-copy="false"
            :index="group.index"
            :range="group.messages!.length"
            @delete-messages="handleDeleteMessages"
          >
            <v-tabs v-model="dialogs[group.tab!]" :items="group.messages" show-arrows>
              <template #tab="{ item }">
                <v-tab :text="item.role" :value="item">
                  <v-icon
                    v-if="item.role === 'tool'"
                    icon="mdi-arrow-left-bold-circle"
                    color="primary"
                  />
                  <v-icon
                    v-if="item.role === 'assistant'"
                    icon="mdi-arrow-right-bold-circle"
                    color="teal"
                  />
                </v-tab>
              </template>
              <template #item="{ item }">
                <v-tabs-window-item :value="item">
                  <v-card v-if="item.role === 'tool'" class="mt-1" variant="flat">
                    <v-card-item prepend-icon="mdi-chevron-left">
                      <v-card-subtitle>
                        {{ item.tool_call_id }}
                      </v-card-subtitle>
                    </v-card-item>
                    <template v-if="Array.isArray(item.content)">
                      <v-card-text v-for="content in item.content" :key="content.id">
                        <v-textarea
                          :rows="1"
                          auto-grow
                          max-rows="15"
                          variant="plain"
                          :model-value="content.text"
                          hide-details
                        ></v-textarea>
                      </v-card-text>
                    </template>
                    <v-card-text v-else>
                      <v-textarea
                        :rows="1"
                        auto-grow
                        max-rows="15"
                        variant="plain"
                        :model-value="item.content"
                        hide-details
                      >
                      </v-textarea>
                    </v-card-text>
                  </v-card>
                  <v-card v-if="item.role === 'assistant'" class="mt-1" variant="flat">
                    <v-card-text v-if="item.reasoning_content" class="font-weight-bold">
                      {{ item.reasoning_content }}
                    </v-card-text>
                    <v-card-text v-if="item.content" class="font-weight-bold">
                      {{ item.content }}
                    </v-card-text>
                    <div v-for="content in item.tool_calls" :key="content.id">
                      <v-card-item prepend-icon="mdi-chevron-right">
                        <v-card-subtitle>
                          {{ content.id }}
                        </v-card-subtitle>
                      </v-card-item>
                      <v-card-text>
                        {{ content.function.name }}({{ content.function.arguments }})
                      </v-card-text>
                    </div>
                  </v-card>
                </v-tabs-window-item>
              </template>
            </v-tabs>
          </chat-card>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.chat-message {
  border-bottom: 1px solid #e5e7eb;
}

.message {
  margin: 0 auto;
  display: flex;
}

.md-preview {
  width: 100vw;
  max-width: 100%;
}

.md-editor-preview {
  word-break: keep-all;
}

.conversation-area {
  margin: 0;
  /* 6px 4px 4px 4px; */
  /* top left bot right*/
}
</style>
