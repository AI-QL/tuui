import {
  app,
  BrowserWindow,
  RenderProcessGoneDetails,
  BrowserWindowConstructorOptions
} from 'electron'
import Constants, { TrayOptions } from './utils/Constants'
import IPCs, { registerIpcHandlers } from './IPCs'
import { createTray, hideWindow, showWindow } from './tray'

import { loadConfig } from './mcp/init'

const options = {
  width: Constants.IS_DEV_ENV ? 1500 : 1280,
  height: 960,
  minWidth: 720,
  minHeight: 480,
  tray: {
    // all optional values from DEFAULT_TRAY_OPTIONS can de defined here
    enabled: true,
    menu: true, // true, to use a tray menu ; false to toggle visibility on click on tray icon
    trayWindow: false // true, to use a tray floating window attached to top try icon
  }
}

const exitApp = (mainWindow: BrowserWindow): void => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide()
  }
  mainWindow.destroy()
  app.exit()
}

export const createMainWindow = async (): Promise<BrowserWindow> => {
  let opt: BrowserWindowConstructorOptions = {
    title: Constants.APP_NAME,
    show: false,
    width: options.width,
    height: options.height,
    minWidth: options.minWidth,
    minHeight: options.minHeight,
    useContentSize: true,
    webPreferences: Constants.DEFAULT_WEB_PREFERENCES,
    frame: true
  }
  const trayOptions: TrayOptions = options.tray?.enabled
    ? {
        ...Constants.DEFAULT_TRAY_OPTIONS,
        ...options.tray
      }
    : {
        ...Constants.DEFAULT_TRAY_OPTIONS,
        enabled: false
      }

  // trayWindow requires tray.enabled=true
  if (trayOptions.enabled && trayOptions.trayWindow) {
    opt = {
      ...opt,
      width: options.width,
      height: options.height,
      maxWidth: options.width,
      maxHeight: options.height,
      show: false,
      frame: false,
      fullscreenable: false,
      hiddenInMissionControl: true,
      resizable: false,
      transparent: true,
      alwaysOnTop: true,
      webPreferences: {
        ...Constants.DEFAULT_WEB_PREFERENCES,
        backgroundThrottling: false
      }
    }
  }
  const mainWindow = new BrowserWindow(opt)

  // This will disable dev-tool as well
  mainWindow.setMenu(null)

  mainWindow.on('close', (event: Event): void => {
    event.preventDefault()
    exitApp(mainWindow)
  })

  mainWindow.webContents.on('did-frame-finish-load', (): void => {
    if (Constants.IS_DEV_ENV && Constants.IS_DEVTOOLS) {
      mainWindow.webContents.openDevTools()
    }
  })

  if (trayOptions.enabled) {
    createTray(mainWindow, trayOptions)
  }

  if (trayOptions.enabled && trayOptions.trayWindow) {
    hideWindow(mainWindow)
    if (trayOptions.showAtStartup) {
      showWindow(mainWindow)
    }
  } else {
    mainWindow.once('ready-to-show', (): void => {
      mainWindow.setAlwaysOnTop(true)
      mainWindow.show()
      mainWindow.focus()
      mainWindow.setAlwaysOnTop(false)
    })
  }

  // Initialize IPC Communication
  IPCs.initialize()

  const configs = await loadConfig()

  const features = configs.map((params) => {
    return registerIpcHandlers(params)
  })

  IPCs.initializeMCP(features)

  if (Constants.IS_DEV_ENV) {
    await mainWindow.loadURL(Constants.APP_INDEX_URL_DEV)
  } else {
    await mainWindow.loadFile(Constants.APP_INDEX_URL_PROD)
  }

  return mainWindow
}

export const createErrorWindow = async (
  errorWindow: BrowserWindow,
  mainWindow: BrowserWindow,
  _details?: RenderProcessGoneDetails
): Promise<BrowserWindow> => {
  if (!Constants.IS_DEV_ENV) {
    mainWindow?.hide()
  }

  errorWindow = new BrowserWindow({
    title: Constants.APP_NAME,
    show: false,
    resizable: Constants.IS_DEV_ENV,
    webPreferences: Constants.DEFAULT_WEB_PREFERENCES
  })

  errorWindow.setMenu(null)

  if (Constants.IS_DEV_ENV) {
    await errorWindow.loadURL(`${Constants.APP_INDEX_URL_DEV}#/error`)
  } else {
    await errorWindow.loadFile(Constants.APP_INDEX_URL_PROD, { hash: 'error' })
  }

  errorWindow.on('ready-to-show', (): void => {
    if (!Constants.IS_DEV_ENV && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.destroy()
    }
    errorWindow.show()
    errorWindow.focus()
  })

  errorWindow.webContents.on('did-frame-finish-load', (): void => {
    if (Constants.IS_DEV_ENV) {
      errorWindow.webContents.openDevTools()
    }
  })

  return errorWindow
}
