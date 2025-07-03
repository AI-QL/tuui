import type { MCPAPI } from '@/preload/types'

export default class Utils {
  static getCurrentLocale(): string {
    return navigator?.language?.split('-')[0] || 'en'
  }

  static async getApiToken(cli: string): Promise<any> {
    return window.mainApi.invoke('msgGetApiToken', cli)
  }

  static async listenSampling(callback: any): Promise<any> {
    return window.mainApi.on('renderListenSampling', callback)
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

  static async sendResponse(channel: string, response: any): Promise<void> {
    await window.mainApi.send(channel, response)
  }

  static async initAllMcpServers(configs: MCPAPI): Promise<any> {
    const filteredConfigs = Object.fromEntries(
      Object.entries(configs).map(([key, value]) => [key, value?.config])
    )
    return window.mainApi.invoke('msgInitAllMcpServers', filteredConfigs)
  }

  static async openFile(type: string): Promise<any> {
    return window.mainApi.invoke('msgOpenFile', type)
  }

  static async sendFileToMain(file: { name: string; data: ArrayBuffer }): Promise<void> {
    await window.mainApi.send('msgSendFile', file)
  }
}

export const {
  getCurrentLocale,
  openExternal,
  openFile,
  sendFileToMain,
  getApiToken,
  initAllMcpServers,
  listenStdioProgress,
  removeListenStdioProgress,
  listenSampling,
  sendResponse,
  windowReload
} = Utils
