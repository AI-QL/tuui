import { ipcMain, shell, IpcMainEvent, dialog, BrowserWindow } from 'electron'
import { StdioServerParameters } from '@modelcontextprotocol/sdk/client/stdio.js'
import Constants from './utils/Constants'
import { capabilitySchemas, ClientObj, ConfigObj, ConfigMcpMetadataStdio } from './mcp/types'

import { manageRequests } from './mcp/client'

import { spawn } from 'child_process'
import { existsSync, mkdirSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

import { initClients } from './mcp/init'
import { disconnect } from './mcp/connection'
import { loadConfig } from './mcp/init'
import { unpackDxt, getManifest } from './mcp/dxt'

const handlerRegistry = new Map<string, Function>()

/*
 * IPC Communications
 * */
export default class IPCs {
  static clients: ClientObj[] = []
  static currentFeatures: any[] = []

  static initialize(): void {
    // Get application version
    ipcMain.handle('msgRequestGetVersion', () => {
      return Constants.APP_VERSION
    })

    ipcMain.handle(
      'msgInitAllMcpServers',
      async (event: IpcMainEvent, metadata: ConfigMcpMetadataStdio) => {
        this.clients.forEach((client: ClientObj) => {
          if (client.connection?.transport) {
            disconnect(client.connection.transport)
          }
        })

        IPCs.removeAllHandlers()

        try {
          const newClients = await initClients(metadata)
          const features = newClients.map((params) => {
            return registerIpcHandlers(params)
          })

          IPCs.updateMCP(features)
          this.clients = newClients
          return features
        } catch (error) {
          const configs = await loadConfig()

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
        const filePath = saveOption.dxtPath
        const dirPath = saveOption.outputDir
        if (!existsSync(dirPath)) {
          mkdirSync(dirPath, { recursive: true })
        }
        console.log('DXT to be saved in: ', filePath)

        writeFileSync(filePath, buffer, { encoding: null })

        console.log(saveOption)
        await unpackDxt(saveOption)
        // console.log(getManifest(dirPath))

        event.reply('msgFileTransferResponse', { name, success: true, path: saveOption.outputDir })
      } catch (err) {
        event.reply('msgFileTransferResponse', { name, success: false, reason: err.message })
      }
    })

    ipcMain.handle('list-manifests', async (event: IpcMainEvent) => {
      const dxtPath = Constants.ASSETS_PATH.dxt

      try {
        const entries = readdirSync(dxtPath, { withFileTypes: true })
        console.log(entries)
        const folderNames = entries
          .filter((dirent) => dirent.isDirectory())
          .map((dirent) => {
            return {
              name: dirent.name,
              manifest: getManifest(join(dxtPath, dirent.name))
            }
          })

        return {
          status: 'success',
          result: folderNames
        }
      } catch (err) {
        return {
          status: 'error',
          error: err.message
        }
      }
    })
  }

  static updateMCP(newFeatures): void {
    this.currentFeatures = newFeatures
  }

  static removeAllHandlers() {
    for (const [eventName] of handlerRegistry) {
      ipcMain.removeHandler(eventName)
    }
    console.log(`handlerRegistry clear: ${handlerRegistry.size}`)
    handlerRegistry.clear()
  }

  static initializeMCP(initialFeatures): void {
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

export function registerIpcHandlers({ name, connection, configJson = {} }: ClientObj) {
  const feature: { [key: string]: any } = {
    name,
    config: configJson
  }

  if (!connection) {
    return feature
  }

  const registerHandler = (method: string, schema: any) => {
    const eventName = `${name}-${method}`
    console.log(`IPC Main ${eventName}`)
    const handler = async (_event: Electron.IpcMainInvokeEvent, params: any) => {
      return await manageRequests(connection.client, `${method}`, schema, params)
    }
    ipcMain.handle(eventName, handler)
    handlerRegistry.set(eventName, handler)
    return eventName
  }

  for (const [type, actions] of Object.entries(capabilitySchemas)) {
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
