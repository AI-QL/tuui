import { app, shell, WebContents, RenderProcessGoneDetails } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import Constants from './utils/Constants'
import { createErrorWindow, createMainWindow } from './MainRunner'

import { IpcSamplingEvents } from './mcp/types'

import { responseToRenderer } from './IPCs'

let mainWindow
let errorWindow

app.setAppUserModelId('TUUI')

app.on('ready', async () => {
  // Disable special menus on macOS by uncommenting the following, if necessary
  /*
  if (Constants.IS_MAC) {
    systemPreferences.setUserDefault('NSDisabledDictationMenuItem', 'boolean', true)
    systemPreferences.setUserDefault('NSDisabledCharacterPaletteMenuItem', 'boolean', true)
  }
  */

  mainWindow = await createMainWindow()
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

// export function sendToRenderer<T extends keyof IpcSamplingEvents>(
//   channel: T,
//   ...args: Parameters<IpcSamplingEvents[T]>
// ) {
//   if (mainWindow && !mainWindow.isDestroyed()) {
//     mainWindow.webContents.send(channel, ...args);

//   }
// }

const rendererResponseChannel = 'renderResponse'

export function sendToRenderer<T extends keyof IpcSamplingEvents>(
  channel: T,
  ...args: Parameters<IpcSamplingEvents[T]>
): Promise<any> {
  return new Promise((resolve) => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      resolve(null)
      return
    }

    const responseChannel = `${rendererResponseChannel}-${uuidv4()}`

    responseToRenderer(responseChannel, resolve)

    mainWindow.webContents.send(channel, {
      args,
      responseChannel
    })
  })
}
