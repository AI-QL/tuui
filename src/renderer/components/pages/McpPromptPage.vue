<script setup lang="ts">
import { useMessageStore } from '@/renderer/store/message'
import { useLayoutStore } from '@/renderer/store/layout'
import { usePromptStore } from '@/renderer/store/prompt'
import { useRouter } from 'vue-router'

const messageStore = useMessageStore()
const promptStore = usePromptStore()
const layoutStore = useLayoutStore()
const router = useRouter()

const navigateTo = (route: string, screenValue: number) => {
  layoutStore.screen = screenValue
  router.push(route)
}

const handleApplyPrompt = async () => {
  const conversations = await promptStore.fetchSelect()
  messageStore.applyPrompt(conversations)
  navigateTo('/chat', 1)
}
</script>

<template>
  <v-data-iterator
    :items="promptStore.promptList"
    :search="promptStore.search"
    items-per-page="-1"
    :loading="promptStore.loading"
    @update:options="promptStore.loadPrompts"
  >
    <template #header>
      <v-toolbar class="px-2" rounded="lg">
        <v-text-field
          v-model="promptStore.search"
          density="comfortable"
          placeholder="Search"
          prepend-inner-icon="mdi-magnify"
          variant="solo"
          clearable
          hide-details
        ></v-text-field>
      </v-toolbar>
    </template>
    <template #default="{ items }">
      <v-container class="pa-2" fluid>
        <v-row dense>
          <v-col
            v-for="item in items"
            :key="item.raw.title + ':' + item.raw.name"
            cols="auto"
            class="flex-fill"
          >
            <v-card border flat>
              <v-card-item :subtitle="item.raw.name" class="mb-2" :title="item.raw.title">
                <template #append>
                  <v-btn
                    icon="mdi-lead-pencil"
                    size="small"
                    text="Read"
                    border
                    flat
                    @click="promptStore.select(item.raw)"
                  >
                  </v-btn>
                </template>
              </v-card-item>
              <v-card-text>{{ item.raw.description }}</v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </v-data-iterator>

  <v-dialog v-model="promptStore.promptSheet" max-width="80vw" max-height="80vh" scrollable>
    <v-card
      prepend-icon="mdi-account-cog-outline"
      :title="$t('prompt.title') + ' - ' + promptStore.promptSelect.title"
      :subtitle="promptStore.promptSelect.name"
    >
      <v-divider></v-divider>
      <v-card-text>
        <div>{{ promptStore.promptSelect.description }}</div>
        <div v-if="promptStore.promptSelect.arguments">
          <br />
          <v-textarea
            v-for="argument in promptStore.promptSelect.arguments"
            :key="argument.name"
            v-model="argument.content"
            class="mx-2"
            color="primary"
            type="text"
            variant="outlined"
            :label="argument.name"
            rows="1"
            auto-grow
          >
          </v-textarea>
        </div>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="pt-0" variant="flat" color="primary" @click="handleApplyPrompt">
            {{ $t('prompt.get') }}</v-btn
          >
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
