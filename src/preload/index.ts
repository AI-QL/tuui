import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import type { AsyncFunction, MCPAPI, DXTAPI, McpMetadataDxt } from './types'
import type { ChatbotConfig } from './llm'
import { StdioServerParameters } from '@modelcontextprotocol/sdk/client/stdio.js'

type CLIENT = {
  name: string
  tools?: Record<string, string>
  prompts?: Record<string, string>
  resources?: Record<string, string>
  config?: StdioServerParameters
}

// Whitelist of valid channels used for IPC communication (Send message from Renderer to Main)
const mainAvailChannels: string[] = [
  'msgRequestGetVersion',
  'msgRequestGetDxtUrl',
  'msgOpenExternalLink',
  'msgOpenDxtFilePath',
  'msgOpenFile',
  'msgFileTransferRequest',
  'msgGetApiToken',
  'msgInitAllMcpServers',
  'msgWindowReload'
]

const rendererAvailChannels: string[] = [
  'renderListenStdioProgress',
  'msgSamplingTransferInvoke',
  'msgElicitationTransferInvoke',
  'msgFileTransferResponse'
]

const rendererDynamicChannels: string[] = [
  'msgSamplingTransferResult',
  'msgElicitationTransferResult'
]

contextBridge.exposeInMainWorld('mainApi', {
  send: (channel: string, ...data: any[]): void => {
    if (
      mainAvailChannels.includes(channel) ||
      rendererDynamicChannels.some((respChannel) => channel.startsWith(respChannel))
    ) {
      ipcRenderer.send.apply(null, [channel, ...data])
      if (process.env.NODE_ENV === 'development') {
        console.log({ type: 'send', channel, request: data })
      }
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`)
    }
  },
  on: (channel: string, listener: (_event: IpcRendererEvent, ..._args: any[]) => void): void => {
    if (rendererAvailChannels.includes(channel)) {
      ipcRenderer.on(channel, listener)
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`)
    }
  },
  removeListener: (
    channel: string,
    listener: (_event: IpcRendererEvent, ..._args: any[]) => void
  ): void => {
    if (rendererAvailChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, listener)
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`)
    }
  },
  once: (channel: string, listener: (_event: IpcRendererEvent, ..._args: any[]) => void): void => {
    if (rendererAvailChannels.includes(channel)) {
      ipcRenderer.once(channel, listener)
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`)
    }
  },
  off: (channel: string, listener: (_event: IpcRendererEvent, ..._args: any[]) => void): void => {
    if (rendererAvailChannels.includes(channel)) {
      ipcRenderer.off(channel, listener)
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`)
    }
  },
  invoke: async (channel: string, ...data: any[]): Promise<any> => {
    if (mainAvailChannels.includes(channel)) {
      const result = await ipcRenderer.invoke.apply(null, [channel, ...data])
      if (process.env.NODE_ENV === 'development') {
        console.log({ type: 'invoke', channel, request: data, result })
      }
      return result
    }

    throw new Error(`Unknown ipc channel name: ${channel}`)
  }
})

const llm = {
  _currentAPI: [],
  get: () => {
    console.log('Preload currentLLM:', llm._currentAPI)
    return llm._currentAPI
  }
}

async function initLLM() {
  const llms: ChatbotConfig[] = await ipcRenderer.invoke('list-llms')
  llm._currentAPI = llms
}

initLLM()

contextBridge.exposeInMainWorld('llmApis', llm)

async function listClients(): Promise<CLIENT[]> {
  return await ipcRenderer.invoke('list-clients')
}

function createAPIMethods(methods: Record<string, string>) {
  const result: Record<string, AsyncFunction> = {}
  Object.keys(methods).forEach((key) => {
    const methodName = methods[key]
    result[key] = (...args: any[]) => ipcRenderer.invoke(methodName, ...args)
  })
  return result
}

const api = {
  _currentAPI: {},
  get: () => {
    console.log('Preload currentAPI:', api._currentAPI)
    return api._currentAPI
  },
  refresh: async () => {
    await refreshAPI()
    return api._currentAPI
  },
  update: async (name: string) => {
    await updateAPI(name)
    return api._currentAPI
  }
}

function buildClientAPI(client: CLIENT): MCPAPI[string] {
  const { name, tools, prompts, resources, config } = client
  const apiItem: MCPAPI[string] = {}

  if (tools) apiItem.tools = createAPIMethods(tools)
  if (prompts) apiItem.prompts = createAPIMethods(prompts)
  if (resources) apiItem.resources = createAPIMethods(resources)

  const metadata = {
    name: name,
    type: 'metadata__stdio_config' as const,
    config: config
  }

  apiItem.metadata = metadata

  return apiItem
}

async function refreshAPI() {
  const clients = await listClients()
  const newAPI: MCPAPI = {}

  clients.forEach((client) => {
    newAPI[client.name] = buildClientAPI(client)
  })

  const dxtManifests = await traverseManifest()

  Object.keys(dxtManifests).forEach((key) => {
    const manifest = dxtManifests[key]
    const metadata: McpMetadataDxt = {
      name: key,
      type: 'metadata__dxt_manifest',
      config: manifest
    }
    if (newAPI[key]) {
      // If key exists, only update/replace the metadata
      newAPI[key].metadata = metadata
    } else {
      // If key doesn't exist, create new entry
      newAPI[key] = { metadata }
    }
  })

  api._currentAPI = newAPI
}

async function updateAPI(name: string) {
  const clients = await listClients()
  const client = clients.find((c) => c.name === name)
  if (!client) return

  api._currentAPI[name] = buildClientAPI(client)
}

refreshAPI()

contextBridge.exposeInMainWorld('mcpServers', api)

const dxt = {
  _currentAPI: {},
  get: () => {
    console.log('List currentDXT:', dxt._currentAPI)
    return dxt._currentAPI
  },
  refresh: async () => {
    await refreshDXT()
    return dxt._currentAPI
  },
  update: async (name: string) => {
    // await updateAPI(name)
    return dxt._currentAPI
  }
}

async function traverseManifest(): Promise<DXTAPI> {
  const manifests = await ipcRenderer.invoke('list-manifests')
  return manifests.result || {}
}

async function refreshDXT() {
  const manifests = await traverseManifest()
  dxt._currentAPI = manifests
}

refreshDXT()

contextBridge.exposeInMainWorld('dxtManifest', dxt)
