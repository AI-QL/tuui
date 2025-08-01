import { app, shell, WebContents, RenderProcessGoneDetails } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import Constants from './utils/Constants'
import { createErrorWindow, createMainWindow } from './MainRunner'

import { IpcSamplingEvents, IpcElicitationEvents } from './mcp/types'

import { responseToRenderer } from './IPCs'

import * as shortcuts from './aid/shortcuts'
import Commander, { notEditablePrompts } from './aid/commander'

let mainWindow
let errorWindow

app.setAppUserModelId('TUUI')

const registerShortcuts = () => {
  shortcuts.registerShortcuts({
    command: () => Commander.initCommand()
    // command: () => console.log("hahahahaha"),
  })
}

app.on('ready', async () => {
  // Disable special menus on macOS by uncommenting the following, if necessary
  /*
  if (Constants.IS_MAC) {
    systemPreferences.setUserDefault('NSDisabledDictationMenuItem', 'boolean', true)
    systemPreferences.setUserDefault('NSDisabledCharacterPaletteMenuItem', 'boolean', true)
  }
  */

  mainWindow = await createMainWindow()
  registerShortcuts()
})

app.on('activate', async () => {
  if (!mainWindow) {
    mainWindow = await createMainWindow()
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
  (event: Event, webContents: WebContents, details: RenderProcessGoneDetails) => {
    errorWindow = createErrorWindow(errorWindow, mainWindow, details)
  }
)

process.on('uncaughtException', () => {
  errorWindow = createErrorWindow(errorWindow, mainWindow)
})

const msgSamplingTransferResultChannel = 'msgSamplingTransferResult'

export function samplingTransferInvoke<T extends keyof IpcSamplingEvents>(
  ...args: Parameters<IpcSamplingEvents[T]>
): Promise<any> {
  return new Promise((resolve) => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      resolve(null)
      return
    }

    const responseChannel = `${msgSamplingTransferResultChannel}-${uuidv4()}`

    responseToRenderer(responseChannel, resolve)

    mainWindow.webContents.send('msgSamplingTransferInvoke', {
      args,
      responseChannel
    })
  })
}

const msgElicitationTransferResultChannel = 'msgElicitationTransferResult'

export function elicitationTransferInvoke<T extends keyof IpcElicitationEvents>(
  ...args: Parameters<IpcElicitationEvents[T]>
): Promise<any> {
  return new Promise((resolve) => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      resolve(null)
      return
    }

    const responseChannel = `${msgElicitationTransferResultChannel}-${uuidv4()}`

    responseToRenderer(responseChannel, resolve)

    mainWindow.webContents.send('msgElicitationTransferInvoke', {
      args,
      responseChannel
    })
  })
}
