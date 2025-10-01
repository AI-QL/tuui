import { ipcMain, shell, IpcMainEvent, dialog, BrowserWindow } from 'electron'
import Constants from './utils/Constants'
import {
  McpServerCapabilitySchemas,
  McpClientObject,
  McpFeatureObject,
  McpMetadataConfig,
  McpProgressCallback
} from './mcp/types'

import { manageRequests } from './mcp/client'

import { spawn } from 'child_process'
import { existsSync, mkdirSync, writeFileSync, readdirSync } from 'fs'
import { join, resolve, normalize } from 'path'
import { pathToFileURL } from 'url'

import { initClients } from './mcp/init'
import { disconnect } from './mcp/connection'
import { loadConfig } from './mcp/init'
import { loadLlmFile } from './mcp/config'
import { unpackDxt, getManifest } from './mcp/dxt'
import { McpbManifest } from '@anthropic-ai/mcpb'

import { closeCommandPicker } from './aid/commands'

import { commandSelectionInvoke, mcpServersCallback } from './index'
import { getCachedText } from './aid/utils'

const handlerRegistry = new Map<string, Function>()

interface ManifestResponse {
  status: 'success' | 'error'
  result?: Record<string, McpbManifest> // Object with string keys and DXT values
  error?: string
}

/*
 * IPC Communications
 * */
export default class IPCs {
  static clients: McpClientObject[] = []
  static currentFeatures: McpFeatureObject[] = []

  static initialize(): void {
    // Get application version
    ipcMain.handle('msgRequestAppInfo', () => {
      return {
        version: Constants.APP_VERSION,
        homepage: Constants.APP_HOME_PAGE,
        platform: process.platform
      }
    })

    ipcMain.handle('msgRequestGetDxtUrl', () => {
      return pathToFileURL(normalize(resolve(Constants.ASSETS_PATH.mcpb))).toString()
    })

    ipcMain.handle('msgMcpServersStop', async () => {
      IPCs.stopAllServers()

      const configs = await loadConfig()

      const features = configs.map((params) => {
        return registerIpcHandlers(params)
      })

      this.currentFeatures = features

      return true
    })

    ipcMain.handle(
      'msgMcpServersInit',
      async (event: IpcMainEvent, metadata: McpMetadataConfig) => {
        IPCs.stopAllServers()

        const progressCallback: McpProgressCallback = (name, message, status) => {
          mcpServersCallback({ name, message, status })
        }

        const configs = await loadConfig()

        try {
          const newClients = await initClients(metadata, progressCallback)
          const activeClientNames = newClients.map((client) => client.name)
          const inactiveConfigs = configs.filter(
            (config) => !activeClientNames.includes(config.name)
          )

          const features = [
            ...newClients.map((params) => registerIpcHandlers(params)),
            ...inactiveConfigs.map((params) => registerIpcHandlers(params))
          ]
          IPCs.updateMCP(features)
          this.clients = newClients
          return features
        } catch (error) {
          const features = configs.map((params) => {
            return registerIpcHandlers(params)
          })

          IPCs.updateMCP(features)

          return {
            status: 'error',
            error: error
          }
        }
      }
    )

    // Open url via web browser
    ipcMain.on('msgOpenExternalLink', async (event: IpcMainEvent, url: string) => {
      await shell.openExternal(url)
    })

    ipcMain.on('msgOpenDxtFilePath', async (event: IpcMainEvent, name: string) => {
      shell.openPath(resolve(join(Constants.ASSETS_PATH.mcpb, name)))
    })

    ipcMain.on('msgOpenPath', async (event: IpcMainEvent, name: string) => {
      shell.openPath(resolve(join(Constants.ASSETS_PATH[name])))
    })

    ipcMain.on('msgWindowReload', async (event: IpcMainEvent) => {
      BrowserWindow.fromWebContents(event.sender).reload()
    })

    ipcMain.handle('msgGetApiToken', async (event, cli) => {
      return new Promise((resolve, reject) => {
        const child = spawn(cli, { shell: true })
        const cleanup = () => {
          child.stdout?.destroy()
          child.stderr?.destroy()
          if (!child.killed) {
            child.kill('SIGKILL')
          }
        }
        try {
          let stdoutData = ''

          child.stdout?.on('data', (data) => {
            const output = data.toString()
            stdoutData += output
            event.sender.send('renderListenStdioProgress', output.trim()) // send real-time output
          })

          child.stderr?.on('data', (data) => {
            console.error('Error output:', data.toString())
            reject(data.toString())
          })

          child.on('close', (code) => {
            if (code === 0) {
              resolve(stdoutData.trim().split('\n').at(-1))
            } else {
              reject(new Error(`Process exited with code ${code}`))
            }
          })

          setTimeout(() => {
            cleanup()
            reject(new Error('Process timeout'))
          }, 30000)
        } catch (error) {
          console.error('Error fetching token:', error.message)
          cleanup()
          reject(error)
        }
      })
    })

    // Open file
    ipcMain.handle('msgOpenFile', async (event: IpcMainEvent, filter: string) => {
      const filters = []
      if (filter === 'text') {
        filters.push({ name: 'Text', extensions: ['txt', 'json'] })
      } else if (filter === 'zip') {
        filters.push({ name: 'Zip', extensions: ['zip'] })
      }
      const dialogResult = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters
      })
      return dialogResult
    })

    ipcMain.on('msgFileTransferRequest', async (event: IpcMainEvent, { name, data }) => {
      try {
        const buffer = Buffer.from(data)
        const saveOption = Constants.getDxtSource(name)
        const filePath = saveOption.mcpbPath
        const dirPath = saveOption.outputDir
        if (!existsSync(dirPath)) {
          mkdirSync(dirPath, { recursive: true })
        }
        console.log('MCP bundle to be saved in: ', filePath)

        writeFileSync(filePath, buffer, { encoding: null })

        console.log(saveOption)
        await unpackDxt(saveOption)
        // console.log(getManifest(dirPath))

        event.reply('msgFileTransferResponse', { name, success: true, path: saveOption.outputDir })
      } catch (err) {
        event.reply('msgFileTransferResponse', { name, success: false, reason: err.message })
      }
    })

    ipcMain.on('msgCommandSelectionNotify', async (event: IpcMainEvent, { id, prompt }) => {
      closeCommandPicker()
      const args = { id, prompt, input: getCachedText(id) }
      commandSelectionInvoke(args)
    })

    ipcMain.handle('list-manifests', async (_event: IpcMainEvent): Promise<ManifestResponse> => {
      const mcpbPath = Constants.ASSETS_PATH.mcpb

      try {
        const entries = readdirSync(mcpbPath, { withFileTypes: true })
        console.log(entries)

        // Transform the array into an object
        const manifestsObject = entries
          .filter((dirent) => dirent.isDirectory())
          .reduce(
            (acc, dirent) => {
              acc[dirent.name] = getManifest(join(mcpbPath, dirent.name))
              return acc
            },
            {} as Record<string, any>
          ) // You can replace 'any' with your manifest type

        return {
          status: 'success',
          result: manifestsObject
        }
      } catch (err) {
        return {
          status: 'error',
          error: err.message
        }
      }
    })

    ipcMain.handle('list-llms', () => {
      return loadLlmFile(Constants.ASSETS_PATH.llm)
    })

    ipcMain.handle('list-popups', () => {
      return loadLlmFile(Constants.ASSETS_PATH.popup)
    })

    ipcMain.handle('list-startups', () => {
      return loadLlmFile(Constants.ASSETS_PATH.startup)
    })
  }

  static updateMCP(newFeatures: McpFeatureObject[]): void {
    this.currentFeatures = newFeatures
  }

  static stopAllServers() {
    this.clients.forEach((client: McpClientObject) => {
      if (client.connection?.transport) {
        disconnect(client.connection.transport)
        delete client.connection.transport
      }
    })

    IPCs.removeAllHandlers()
  }

  static removeAllHandlers() {
    for (const [eventName] of handlerRegistry) {
      ipcMain.removeHandler(eventName)
    }
    console.log(`handlerRegistry clear: ${handlerRegistry.size}`)
    handlerRegistry.clear()
  }

  static initializeMCP(initialFeatures: McpFeatureObject[]): void {
    this.currentFeatures = initialFeatures
    ipcMain.handle('list-clients', () => {
      return this.currentFeatures
    })
  }
}

export function responseToRenderer(responseChannel, resolve) {
  ipcMain.once(responseChannel, (event, response) => {
    resolve(response)
  })
}

export function registerIpcHandlers({
  name,
  connection,
  configJson
}: McpClientObject): McpFeatureObject {
  const feature: McpFeatureObject = {
    name,
    config: configJson
  }

  if (!connection) {
    return feature
  }

  const registerHandler = (method: string, schema: any) => {
    const eventName = `${name}-${method}`
    console.log(`IPC Main ${eventName}`)
    const handler = async (
      _event: Electron.IpcMainInvokeEvent,
      request: { method: string; params: any }
    ) => {
      if (request?.method !== method) {
        console.log(
          `Request method not registered: ${request?.method}, fallback to use ${method}, please double check the invoker in Renderer.`
        )
      }
      return await manageRequests(connection.client, `${method}`, schema, request?.params)
    }
    ipcMain.handle(eventName, handler)
    handlerRegistry.set(eventName, handler)
    return eventName
  }

  for (const [type, actions] of Object.entries(McpServerCapabilitySchemas)) {
    const capabilities = connection.client.getServerCapabilities()
    if (capabilities?.[type]) {
      feature[type] = {}
      for (const [action, schema] of Object.entries(actions)) {
        feature[type][action] = registerHandler(`${type}/${action}`, schema)
      }
    }
  }

  return feature
}
