<script setup lang="ts">
import { ref, computed } from 'vue'

type McpRegistryPackage = {
  identifier: string
  registryType: string
  registryBaseUrl?: string
}

const loadingServers = ref(false)

const queryHistory = ref({})
const queryString = ref('')
const lastQueryString = ref('')

const queryLimit = '5'

const lastQuery = computed(() => {
  const last = queryHistory.value[lastQueryString.value]
  if (last) {
    return last
  } else {
    return {
      servers: []
    }
  }
})

async function getServers(search: string) {
  const json = await fetchJson(search)

  if (json) {
    queryHistory.value[search] = json
    lastQueryString.value = search
  }
}

async function getNext() {
  const search = lastQueryString.value

  const nextCursor = lastQuery.value.metadata?.next_cursor

  if (!nextCursor) return

  const json = await fetchJson(search, nextCursor)

  if (json && json.servers.length > 0) {
    queryHistory.value[search].servers.push(...json.servers)
    queryHistory.value[search].metadata = json.metadata
  }
}

async function fetchJson(search: string, cursor?: string) {
  loadingServers.value = true
  try {
    const baseUrl = 'https://registry.modelcontextprotocol.io/v0/servers'
    const url = new URL(baseUrl)
    if (search) url.searchParams.append('search', search)
    url.searchParams.append('limit', queryLimit)

    if (cursor) url.searchParams.append('cursor', cursor)

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)

    return await res.json()
  } finally {
    loadingServers.value = false
  }
}

function getPackageUrl(registry: McpRegistryPackage) {
  switch (registry.registryType) {
    case 'mcpb':
      return registry.identifier
    case 'npm':
      if (!registry.registryBaseUrl || registry.registryBaseUrl.includes('npmjs.org')) {
        return `https://www.npmjs.com/package/${registry.identifier}`
      }
    case 'oci':
      if (!registry.registryBaseUrl || registry.registryBaseUrl.includes('docker.io')) {
        return `https://hub.docker.com/r/${registry.identifier}`
      }
    case 'pypi':
      if (!registry.registryBaseUrl || registry.registryBaseUrl.includes('pypi.org')) {
        return `https://pypi.org/project/${registry.identifier}`
      }
    default:
      return registry.registryBaseUrl ?? undefined
  }
}
</script>

<template>
  <v-card>
    <template #title>
      <v-text-field
        v-model="queryString"
        :loading="loadingServers"
        class="mr-4"
        prepend-inner-icon="mdi-server"
        variant="outlined"
        clearable
        hide-details
        @keyup.enter="getServers(queryString)"
      ></v-text-field>
    </template>
    <template #append>
      <v-btn
        :loading="loadingServers"
        rounded="lg"
        variant="tonal"
        icon="mdi-magnify"
        @click="getServers(queryString)"
      ></v-btn>
    </template>

    <v-divider></v-divider>
    <v-card-text>
      <v-card class="mt-4">
        <v-data-iterator :key="lastQueryString" :items="lastQuery.servers" :items-per-page="-1">
          <template #default="{ items }">
            <v-expansion-panels variant="accordion" :rounded="false">
              <v-expansion-panel v-for="item in items as any" :key="item.raw.name">
                <v-expansion-panel-title>
                  <v-list-item>
                    <v-list-item-title class="d-flex"
                      >{{ item.raw.name }}

                      <v-chip size="small" class="ml-3 mb-2 font-weight-bold" color="primary">
                        {{ item.raw.version }}
                      </v-chip>

                      <v-icon
                        v-if="item.raw.packages"
                        class="ml-2"
                        icon="mdi-desktop-classic"
                        color="brown-lighten-2"
                      ></v-icon>

                      <v-icon
                        v-if="item.raw.remotes"
                        class="ml-2"
                        icon="mdi-web"
                        color="blue-lighten-1"
                      ></v-icon>
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-high-emphasis">{{
                      item.raw.description
                    }}</v-list-item-subtitle>
                  </v-list-item>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-col v-if="item.raw.repository">
                    <v-card
                      color="green-lighten-1"
                      class="mx-auto"
                      :subtitle="item.raw.repository.url"
                      :title="item.raw.repository.source"
                      prepend-icon="mdi-home"
                      append-icon="mdi-open-in-new"
                      :href="item.raw.repository.url"
                      target="_blank"
                    ></v-card>
                  </v-col>
                  <v-col v-if="item.raw.packages">
                    <v-card
                      v-for="regPackage in item.raw.packages"
                      :key="regPackage.registryType"
                      color="brown-lighten-2"
                      class="mx-auto my-1"
                      prepend-icon="mdi-desktop-classic"
                      :subtitle="regPackage.identifier"
                      :title="
                        regPackage.registryType +
                        (regPackage.transport ? ` - ${regPackage.transport.type}` : '')
                      "
                      append-icon="mdi-open-in-new"
                      :href="getPackageUrl(regPackage)"
                      target="_blank"
                    ></v-card>
                  </v-col>
                  <v-col v-if="item.raw.remotes">
                    <v-card
                      v-for="remote in item.raw.remotes"
                      :key="remote.url"
                      color="blue-lighten-1"
                      class="mx-auto my-1"
                      prepend-icon="mdi-web"
                      :subtitle="remote.url"
                      :title="remote.type"
                    ></v-card>
                  </v-col>
                  <!-- <v-textarea :model-value="JSON.stringify(item.raw, null, 2)" variant="plain" auto-grow
                    readonly></v-textarea> -->
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </template>
        </v-data-iterator>
      </v-card>
    </v-card-text>

    <v-divider></v-divider>
    <v-card-actions>
      <v-footer
        class="ml-4 mr-2 justify-space-between text-body-2"
        color="surface-variant"
        rounded="sm"
      >
        {{ $t('mcp.total') }}: {{ lastQuery.servers.length }}
      </v-footer>

      <v-btn
        :disabled="!lastQuery.metadata?.next_cursor"
        :loading="loadingServers"
        rounded="lg"
        icon="mdi-book-open-page-variant"
        color="secondary"
        variant="plain"
        @click="getNext"
      ></v-btn>
      <slot></slot>
    </v-card-actions>
  </v-card>
</template>

<style scoped></style>
