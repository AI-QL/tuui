<script setup>
import { useMcpStore, getServers } from '@/renderer/store/mcp'
import { useAgentStore } from '@/renderer/store/agent'
import { useI18n } from 'vue-i18n'
import { v4 as uuidv4 } from 'uuid'
import { ref, watch, onMounted, computed } from 'vue'
const mcpStore = useMcpStore()
const agentStore = useAgentStore()
const { t } = useI18n()

const selectedTree = computed({
  get() {
    return agentStore.getRevised?.selectedNode
  },
  set(value) {
    console.log('Selected tools', value)
    if (agentStore.getRevised) {
      agentStore.getRevised.selectedNode = value
    }
  }
})

const items = ref([
  {
    id: 1,
    name: computed(() => t('agent.all')),
    children: []
  }
])

watch(
  () => agentStore.allTools,
  (val) => {
    if (!agentStore.hasTools) {
      return
    }
    console.log('Tools Updated', val)
    const flatChildren = []
    const children = val.map((type) => ({
      id: type.server,
      name: type.server,
      children: type.tools
        ? type.tools.map((obj) => {
            const id = agentStore.genId(type.server, obj.name)
            const unit = {
              id: id,
              server: type.server,
              name: obj.name
            }
            flatChildren.push(id)
            return unit
          })
        : []
    }))
    const rootObj = items.value[0]
    rootObj.children = children
    items.value = [rootObj]

    agentStore.agents.forEach((agent) => {
      const newSelectedNode = agent.selectedNode.filter((node) => {
        return flatChildren.includes(node)
      })
      agent.selectedNode = newSelectedNode
    })
  }
)

watch(
  () => mcpStore.version,
  (_val) => {
    load()
  }
)

onMounted(() => {
  load()
})

function load() {
  const mcpServers = getServers()
  const mcpKeys = Object.keys(mcpServers)
  // Create an array of Promises
  const toolPromises = mcpKeys.map((key) => {
    const toolsListFunction = mcpServers[key]?.tools?.list
    if (typeof toolsListFunction === 'function') {
      // Ensure that toolsListFunction() returns a Promise
      return Promise.resolve(toolsListFunction()).then((tools) => ({
        server: key,
        ...tools
      }))
    } else {
      // If toolsListFunction is not a function, return an object with content as null
      return Promise.resolve({
        name: key,
        tools: []
      })
    }
  })

  console.log(toolPromises)

  // Return a Promise that resolves when all toolPromises are resolved

  return Promise.all(toolPromises).then((data) => {
    console.log(data)
    agentStore.allTools = data
  })
}

function onClickClose(selection) {
  selectedTree.value = selectedTree.value.filter((item) => item !== selection)
}

function handleNameUpdate() {
  if (!agentStore.getRevised.name) {
    agentStore.getRevised.name = `Agent ${uuidv4()}`
  }

  if (agentStore.getUnrevised.find((agent) => agent.name === agentStore.getRevised.name)) {
    agentStore.getRevised.name = `Agent ${uuidv4()}`
  }
}
</script>

<template>
  <!-- <v-btn @click="console.log(agentStore.allTools)"></v-btn> -->
  <div v-if="agentStore.getRevised" :key="agentStore.getRevised">
    <v-card :title="$t('agent.config')">
      <v-divider></v-divider>
      <v-text-field
        v-model="agentStore.getRevised.name"
        density="compact"
        variant="outlined"
        class="px-6 pt-5"
        :label="$t('setting.name')"
        @blur="handleNameUpdate"
      ></v-text-field>
    </v-card>

    <v-confirm-edit
      v-model="agentStore.getRevised.prompt"
      :cancel-text="$t('agent.cancel')"
      :ok-text="$t('agent.save')"
    >
      <template #default="{ model: proxyModel, actions, isPristine }">
        <v-card class="mt-4" :title="$t('agent.prompt')">
          <v-divider></v-divider>
          <template #text>
            <v-textarea
              v-model="proxyModel.value"
              class="mx-2 mt-2"
              auto-grow
              variant="solo-filled"
              :error-messages="isPristine ? '' : 'Please save'"
            ></v-textarea>
          </template>
          <template #actions>
            <v-spacer></v-spacer>
            <component :is="actions" color="primary"></component>
          </template>
        </v-card>
      </template>
    </v-confirm-edit>

    <v-alert
      v-if="!agentStore.hasTools"
      border="top"
      type="warning"
      variant="outlined"
      prominent
      class="mt-4"
    >
      {{ $t('agent.no-tools') }}
    </v-alert>
    <v-card v-else class="mt-4" :title="$t('agent.tools')">
      <v-row dense>
        <v-divider></v-divider>
        <v-treeview
          v-model:selected="selectedTree"
          :items="items"
          :load="load"
          class="flex-1-0"
          false-icon="mdi-bookmark-outline"
          indeterminate-icon="mdi-bookmark-minus"
          item-title="name"
          item-value="id"
          select-strategy="classic"
          true-icon="mdi-bookmark"
          selectable
        ></v-treeview>
      </v-row>

      <v-row dense>
        <v-divider></v-divider>
        <v-card-text>
          <div
            v-if="selectedTree.length === 0"
            class="text-h6 font-weight-light text-grey pa-4 text-center"
          >
            {{ $t('agent.selected') }}
          </div>
          <div class="d-flex flex-wrap ga-1">
            <v-scroll-x-transition group hide-on-leave>
              <div v-for="(selection, index) in selectedTree" :key="index">
                <v-chip
                  v-if="selection"
                  :key="selection"
                  :text="agentStore.getId(selection).name"
                  color="grey"
                  size="small"
                  border
                  closable
                  label
                  @click="console.log(selection, index)"
                  @click:close="onClickClose(selection)"
                >
                  <template #prepend>
                    <v-avatar
                      :text="agentStore.getAbbr(agentStore.getId(selection).server)"
                      :color="agentStore.getColor(selection)"
                      start
                      variant="plain"
                    >
                    </v-avatar>
                  </template>
                </v-chip>
              </div>
            </v-scroll-x-transition>
          </div>
        </v-card-text>
      </v-row>
    </v-card>
  </div>
</template>
