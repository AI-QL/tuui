import { ClientObj, ConfigMcpMetadataStdio, ServerConfig } from './types'
// import { Notification } from 'electron'
import { initializeClient } from './client'
import { loadConfigFile } from './config'
import Constants from '../utils/Constants'

export async function loadConfig(): Promise<ClientObj[]> {
  const config = loadConfigFile(Constants.ASSETS_PATH.config)
  if (config) {
    console.log('Config loaded:', config)
    return Object.entries(config).map(([name, configJson]) => ({ name, configJson }))
  }
  // You should also handle the case when config is falsy
  return []
}

export async function initClients(metadata: ConfigMcpMetadataStdio): Promise<ClientObj[]> {
  if (metadata) {
    console.log('Config init:', metadata)
    try {
      const clients = await Promise.all(
        Object.entries(metadata).map(([name, object]) => {
          if (object.type === 'metadata__stdio_config') {
            return initSingleClient(name, object.config)
            // TODO support other type
          } else {
            return { name }
          }
        })
      )
      console.log('All clients initialized.')
      return clients
    } catch (error) {
      console.error('Error during client initialization:', error?.message)
      throw new Error(`${error?.message}`)
      // new Notification({
      //   title: 'Client initialization failed',
      //   body: 'Cannot start with current config file: ' + error?.message
      // }).show()
      // process.exit(1)
    }
  } else {
    console.log('NO clients initialized.')
    return []
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
