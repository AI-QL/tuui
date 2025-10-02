import { app, shell, WebContents, RenderProcessGoneDetails, BrowserWindow } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import Constants from './utils/Constants'
import { createErrorWindow, createMainWindow } from './MainRunner'

import {
  SamplingRequest,
  SamplingResponse,
  ElicitRequest,
  ElicitResponse,
  CommandRequest
} from './types'

import { McpProgressCallbackObject } from './mcp/types'

import {
  IpcSamplingRequest,
  IpcElicitRequest,
  IpcCommandRequest,
  IpcMcpInitRequest
} from '@/types/ipc'

import { listenOnceForRendererResponse } from './IPCs'

import * as shortcuts from './aid/shortcuts'
import Commander from './aid/commander'

import { showWindow } from './tray'

let mainWindow: BrowserWindow
let errorWindow: BrowserWindow

app.setAppUserModelId(Constants.APP_NAME)

const registerShortcuts = async () => {
  const initState = await Commander.init()
  if (initState) {
    shortcuts.registerShortcuts({
      command: () => Commander.initCommand()
    })
  }
}

async function createWindow() {
  try {
    mainWindow = await createMainWindow()
  } catch {
    app.exit()
  }
}

app.on('ready', async () => {
  // Disable special menus on macOS by uncommenting the following, if necessary
  /*
  if (Constants.IS_MAC) {
    systemPreferences.setUserDefault('NSDisabledDictationMenuItem', 'boolean', true)
    systemPreferences.setUserDefault('NSDisabledCharacterPaletteMenuItem', 'boolean', true)
  }
  */

  createWindow()
  registerShortcuts()
})

app.on('activate', async () => {
  if (!mainWindow) {
    createWindow()
  }
})

app.on('window-all-closed', () => {
  mainWindow = null
  errorWindow = null

  if (!Constants.IS_MAC) {
    app.quit()
  }
})

app.on('web-contents-created', (e, webContents) => {
  webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // This will not affect hash/history navigation since only
  // did-start-navigation and did-navigate-in-page will be
  // triggered
  webContents.on('will-navigate', (event, url) => {
    const currentUrl = webContents.getURL()
    let currentHost, targetHost

    try {
      currentHost = new URL(currentUrl).host
      targetHost = new URL(url).host
    } catch (_error) {
      // Invalid URL should be opened externally
      event.preventDefault()
      shell.openExternal(url)
      return
    }

    // Allow reload on same Host, such as vite index reload
    if (Constants.IS_DEV_ENV && currentHost === targetHost) {
      return
    }

    // Other URL should be opened externally
    event.preventDefault()
    shell.openExternal(url)
  })
})

app.on(
  'render-process-gone',
  async (event: Event, webContents: WebContents, details: RenderProcessGoneDetails) => {
    errorWindow = await createErrorWindow(errorWindow, mainWindow, details)
  }
)

process.on('uncaughtException', async () => {
  errorWindow = await createErrorWindow(errorWindow, mainWindow)
})

const msgSamplingTransferResultChannel = 'msgSamplingTransferResult'

export function samplingTransferInvoke(request: SamplingRequest): Promise<SamplingResponse> {
  return new Promise<SamplingResponse>((resolve) => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      resolve(null)
      return
    }

    const responseChannel = `${msgSamplingTransferResultChannel}-${uuidv4()}`

    listenOnceForRendererResponse(responseChannel, resolve)

    mainWindow.webContents.send('msgSamplingTransferInvoke', {
      request,
      responseChannel
    } as IpcSamplingRequest)
  })
}

const msgElicitationTransferResultChannel = 'msgElicitationTransferResult'

export function elicitationTransferInvoke(request: ElicitRequest): Promise<ElicitResponse> {
  return new Promise((resolve) => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      resolve(null)
      return
    }

    const responseChannel = `${msgElicitationTransferResultChannel}-${uuidv4()}`

    listenOnceForRendererResponse(responseChannel, resolve)

    mainWindow.webContents.send('msgElicitationTransferInvoke', {
      request,
      responseChannel
    } as IpcElicitRequest)
  })
}

export async function commandSelectionInvoke(request: CommandRequest) {
  if (Constants.IS_DEV_ENV) {
    await mainWindow.loadURL(`${Constants.APP_INDEX_URL_DEV}#/chat`)
  } else {
    await mainWindow.loadFile(Constants.APP_INDEX_URL_PROD, { hash: 'chat' })
  }

  showWindow(mainWindow)

  if (!mainWindow || mainWindow.isDestroyed()) {
    return
  }

  console.log(request)

  mainWindow.webContents.send('msgCommandSelectionInvoke', {
    request
  } as IpcCommandRequest)
}

export async function mcpServersProcessCallback(callback: McpProgressCallbackObject) {
  mainWindow.webContents.send('msgMcpServersWatch', {
    callback
  } as IpcMcpInitRequest)
}
