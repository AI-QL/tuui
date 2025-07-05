import type { MCPAPI } from '@/preload/types'

export default class Utils {
  static getCurrentLocale(): string {
    return navigator?.language?.split('-')[0] || 'en'
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

  static async windowReload(): Promise<void> {
    await window.mainApi.send('msgWindowReload')
  }

  static async initAllMcpServers(configs: MCPAPI | undefined): Promise<any> {
    if (!configs) {
      return
    }
    const filteredConfigs = Object.fromEntries(
      Object.entries(configs).map(([key, value]) => [key, value?.metadata])
    )
    return window.mainApi.invoke('msgInitAllMcpServers', filteredConfigs)
  }

  static async openFile(type: string): Promise<any> {
    return window.mainApi.invoke('msgOpenFile', type)
  }
}

export const {
  getCurrentLocale,
  openExternal,
  openFile,
  getApiToken,
  getDxtUrl,
  initAllMcpServers,
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
