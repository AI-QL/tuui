import { ClientObj, ConfigMcpMetadata, ServerConfig } from './types'
// import { Notification } from 'electron'
import { initializeClient } from './client'
import { loadConfigFile } from './config'
import Constants from '../utils/Constants'
import { getMcpConfigForDxt } from './dxt'
import path from 'node:path'

export async function loadConfig(): Promise<ClientObj[]> {
  const config = loadConfigFile(Constants.ASSETS_PATH.mcp)
  if (config) {
    console.log('Config loaded:', config)
    return Object.entries(config).map(([name, configJson]) => ({ name, configJson }))
  }
  // You should also handle the case when config is falsy
  return []
}

export async function initClients(metadata: ConfigMcpMetadata): Promise<ClientObj[]> {
  if (!metadata) {
    console.log('NO clients initialized.')
    return []
  }

  console.log('Config init:', metadata)

  try {
    const entries = Object.entries(metadata)
    const clientPromises = entries.map(async ([name, object]) => {
      if (object.type === 'metadata__stdio_config') {
        return initSingleClient(name, object.config)
      } else if (object.type === 'metadata__dxt_manifest') {
        const stdioConfig = await getMcpConfigForDxt(
          Constants.getPosixPath(path.join(Constants.ASSETS_PATH.dxt, name)),
          object.config,
          object.user_config
        )
        console.log(stdioConfig)
        return initSingleClient(name, stdioConfig)
      } else {
        return { name }
      }
    })

    const clients = await Promise.all(clientPromises)
    console.log('All clients initialized.')
    return clients
  } catch (error) {
    console.error('Error during client initialization:', error?.message)
    throw new Error(`${error?.message}`)
  }
}

export async function initSingleClient(
  name: string,
  serverConfig: ServerConfig
): Promise<ClientObj> {
  console.log(`Initializing client for ${name} with config:`, serverConfig)
  const connection = await initializeClient(name, serverConfig)
  console.log(`${name} initialized.`)
  const configJson = serverConfig
  return { name, connection, configJson }
}
