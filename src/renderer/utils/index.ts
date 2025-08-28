import type { MCPAPI } from '@/preload/mcp'
import { useDxtStore } from '@/renderer/store/dxt'

function isValidValue(value: any): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string' && value.trim() === '') return false
  if (Array.isArray(value) && value.length === 0) return false
  return true
}

export default class Utils {
  static getCurrentLocale(): string {
    return navigator?.language?.split('-')[0] || 'en'
  }

  static async getAppInfo(): Promise<any> {
    return window.mainApi.invoke('msgRequestAppInfo')
  }

  static async getApiToken(cli: string): Promise<any> {
    return window.mainApi.invoke('msgGetApiToken', cli)
  }

  static async getDxtUrl(): Promise<any> {
    return window.mainApi.invoke('msgRequestGetDxtUrl')
  }

  static async listenStdioProgress(progress: any): Promise<any> {
    return window.mainApi.once('renderListenStdioProgress', progress)
  }

  static async removeListenStdioProgress(progress: any): Promise<any> {
    return window.mainApi.removeListener('renderListenStdioProgress', progress)
  }

  static async openExternal(url: string): Promise<void> {
    await window.mainApi.send('msgOpenExternalLink', url)
  }

  static async openDxtFilePath(name: string): Promise<void> {
    await window.mainApi.send('msgOpenDxtFilePath', name)
  }

  static async openPath(name: string): Promise<void> {
    await window.mainApi.send('msgOpenPath', name)
  }

  static async windowReload(): Promise<void> {
    await window.mainApi.send('msgWindowReload')
  }

  static async openFile(type: string): Promise<any> {
    return window.mainApi.invoke('msgOpenFile', type)
  }
}

export const {
  getCurrentLocale,
  openExternal,
  getAppInfo,
  openDxtFilePath,
  openPath,
  openFile,
  getApiToken,
  getDxtUrl,
  listenStdioProgress,
  removeListenStdioProgress,
  windowReload
} = Utils

class Sampling {
  static async msgSamplingTransferInvoke(callback: any): Promise<any> {
    return window.mainApi.on('msgSamplingTransferInvoke', callback)
  }

  // Channel format: "msgSamplingTransferResult-uuid4()"
  static async msgSamplingTransferResult(channel: string, response: any): Promise<void> {
    await window.mainApi.send(channel, response)
  }
}

export const SamplingTransfer = {
  request: Sampling.msgSamplingTransferInvoke,
  response: Sampling.msgSamplingTransferResult
}

class Elicitation {
  static async msgElicitationTransferInvoke(callback: any): Promise<any> {
    return window.mainApi.on('msgElicitationTransferInvoke', callback)
  }

  // Channel format: "msgElicitationTransferResult-uuid4()"
  static async msgElicitationTransferResult(channel: string, response: any): Promise<void> {
    await window.mainApi.send(channel, response)
  }
}

export const ElicitationTransfer = {
  request: Elicitation.msgElicitationTransferInvoke,
  response: Elicitation.msgElicitationTransferResult
}

class File {
  static async sendFileToMainRequest(file: { name: string; data: ArrayBuffer }): Promise<void> {
    await window.mainApi.send('msgFileTransferRequest', file)
  }
  static async sendFileToMainResponse(count: number): Promise<void> {
    const results: any = []
    let completedCount = 0
    window.mainApi.on('msgFileTransferResponse', (_event, result) => {
      results.push(result)
      completedCount++
      if (completedCount === count) {
        console.log('All done', results)
      }
    })
    return results
  }
}

export const FileTransfer = {
  request: File.sendFileToMainRequest,
  response: File.sendFileToMainResponse
}

class Command {
  static async msgSendCommandToMainNotify(command: { id: string; prompt: string }): Promise<void> {
    await window.mainApi.send('msgCommandSelectionNotify', command)
  }

  static async msgCommandToChatInvoke(callback: any): Promise<any> {
    return window.mainApi.on('msgCommandSelectionInvoke', callback)
  }
}

export const CommandEvent = {
  notify: Command.msgSendCommandToMainNotify,
  callback: Command.msgCommandToChatInvoke
}

class Mcp {
  static async msgMcpServersInit(configs: MCPAPI | undefined): Promise<any> {
    if (!configs) return
    const dxtStore = useDxtStore()
    const filteredConfigs = Object.fromEntries(
      Object.entries(configs).map(([key, config]) => {
        const mcpMetadata = config?.metadata

        // Only dxt manifest need include user_config
        if (!mcpMetadata || mcpMetadata.type !== 'metadata__dxt_manifest') {
          return [key, mcpMetadata]
        }

        const userConfigObj = mcpMetadata.config.user_config
        if (!userConfigObj) {
          return [key, mcpMetadata]
        }

        const userConfig = dxtStore.getConfig(key)

        const mergedConfig = Object.fromEntries(
          Object.entries(userConfigObj).map(([configKey, configVal]) => {
            const userValue = userConfig[configKey]

            const value = isValidValue(userValue) ? userValue : configVal.default
            return [configKey, value]
          })
        )

        const filteredUserConfig = Object.fromEntries(
          Object.entries(mergedConfig).filter(([, value]) => {
            return isValidValue(value)
          })
        )

        const mergedMetadata = {
          ...mcpMetadata,
          user_config: filteredUserConfig
        }
        return [key, mergedMetadata]
      })
    )

    console.log(filteredConfigs)
    return window.mainApi.invoke('msgMcpServersInit', filteredConfigs)
  }

  static async msgMcpServersWatch(callback: any): Promise<any> {
    console.log(callback)
    return window.mainApi.on('msgMcpServersWatch', callback)
  }
}

export const McpEvent = {
  init: Mcp.msgMcpServersInit,
  watch: Mcp.msgMcpServersWatch
}
