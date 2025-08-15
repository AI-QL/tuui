import { CreateWindowOpts, ReleaseFocusOpts, BrowserWindowCommandOptions } from './window'
import { app, BrowserWindow, Menu, Display, screen, shell } from 'electron'

import { wait } from './utils'
import MacosAutomator from './macos'
import WindowsAutomator from './windows'

import Constants from '../utils/Constants'

const dockedWindows: Set<number> = new Set()

export interface WindowListener {
  onWindowCreated: (_window: BrowserWindow) => void
  onWindowTitleChanged: (_window: BrowserWindow) => void
  onWindowClosed: (_window: BrowserWindow) => void
}
const listeners: WindowListener[] = []
export const addWindowListener = (listener: WindowListener) => {
  listeners.push(listener)
}

export const createWindow = (opts: CreateWindowOpts = {}) => {
  // create the browser window
  const window = new BrowserWindow({
    ...opts,
    show: false,
    webPreferences: {
      preload: Constants.DEFAULT_WEB_PREFERENCES.preload,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      defaultEncoding: 'UTF-8',
      // devTools: true,
      devTools: process.env.DEBUG ? true : false,
      sandbox: true
    }
  })

  // show when ready
  window.once('ready-to-show', () => {
    if (!opts.keepHidden) {
      window.show()
    }
  })

  // notify listeners
  window.on('show', () => {
    // docked window
    if (opts.showInDock) {
      dockedWindows.add(window.id)
      if (process.platform === 'darwin') {
        app.dock.show()
      }
    }

    // notify
    for (const listener of listeners) {
      listener.onWindowCreated(window)
    }
  })

  // notify listeners
  window.webContents.on('page-title-updated', () => {
    for (const listener of listeners) {
      listener.onWindowTitleChanged(window)
    }
  })

  // we keep prompt anywhere all the time so we need our own way
  window.on('closed', () => {
    for (const listener of listeners) {
      listener.onWindowClosed(window)
    }
    undockWindow(window)
  })

  // web console to here
  window.webContents.on('console-message', ({ level, message, lineNumber, sourceId, frame }) => {
    void level
    void frame
    if (
      !message.includes('Electron Security Warning') &&
      !message.includes('Third-party cookie will be blocked')
    ) {
      console.log(`${message} ${sourceId}:${lineNumber}`)
    }
  })

  // open links in default browser
  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // to log network traffic
  // interceptNetwork(window);

  loadWindowUrl(window, opts)

  return window
}

export function loadWindowUrl(window: BrowserWindow, opts: BrowserWindowCommandOptions) {
  let queryParams = ''
  if (opts.queryParams) {
    queryParams =
      '?' +
      Object.keys(opts.queryParams)
        .map((key) => key + '=' + encodeURIComponent(opts.queryParams[key]))
        .join('&')
  }

  let url: string
  if (Constants.IS_DEV_ENV) {
    url = `${Constants.APP_INDEX_URL_DEV}#${opts.hash || ''}${queryParams}`
  } else {
    url = `${Constants.APP_INDEX_URL_PROD}#${opts.hash || ''}${queryParams}`
  }

  // const url = `${MAIN_WINDOW_VITE_DEV_SERVER_URL}${queryParams}#${opts.hash||''}`;
  console.log('Load URL:', url)
  window.loadURL(url)
}

export const undockWindow = (window: BrowserWindow, preventQuit: boolean = false) => {
  // helper function
  const hideDock = () => {
    if (process.platform === 'darwin' && dockedWindows.size === 0) {
      app.dock.hide()
    }
  }

  // only if it was there before
  if (!dockedWindows.has(window.id)) {
    hideDock()
    return
  }

  // remove
  dockedWindows.delete(window.id)
  if (dockedWindows.size) {
    return
  }

  // quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  if (process.platform === 'darwin') {
    // for an unknown reason app.dock.hide
    // might not work immediately...
    hideDock()
    setTimeout(hideDock, 1000)
    setTimeout(hideDock, 2500)
  } else if (!preventQuit) {
    app.quit()
  }
}

// ensure window is on current screen
export const ensureOnCurrentScreen = (window: BrowserWindow) => {
  const cursorScreen = getCurrentScreen()
  const windowScreen = getWindowScreen(window)
  if (cursorScreen.id !== windowScreen.id) {
    // adjust width
    let windowSize = window.getSize()
    if (windowSize[0] > cursorScreen.workAreaSize.width) {
      window.setSize(Math.floor(cursorScreen.workAreaSize.width * 0.8), windowSize[1])
    }

    // move
    windowSize = window.getSize()
    const { x, y } = getCenteredCoordinates(windowSize[0], windowSize[1])
    window.setPosition(x, y)
  }
}

export const getCurrentScreen = () => {
  const cursorPoint = screen.getCursorScreenPoint()
  return screen.getDisplayNearestPoint(cursorPoint)
}

export const getWindowScreen = (window: BrowserWindow): Display => {
  const windowPosition = window.getPosition()
  return screen.getDisplayNearestPoint({ x: windowPosition[0], y: windowPosition[1] })
}

// get coordinates for a centered window slightly above the center
export const getCenteredCoordinates = (w: number, h: number) => {
  const cursorScreen = getCurrentScreen()
  const { width, height } = cursorScreen.workAreaSize
  return {
    x: cursorScreen.bounds.x + Math.round((width - w) / 2),
    y: cursorScreen.bounds.y + Math.round(Math.max(height / 5, (height - h) / 3))
  }
}

export const releaseFocus = async (opts?: ReleaseFocusOpts) => {
  // defaults
  opts = {
    sourceApp: null,
    delay: 500,
    ...opts
  }

  // platform specific
  if (process.platform === 'darwin') {
    let focused = false

    // if we have an app then target it
    if (opts?.sourceApp) {
      try {
        console.log(`Releasing focus to ${opts.sourceApp.id} / ${opts.sourceApp.window}`)
        const macosAutomator = new MacosAutomator()
        focused = await macosAutomator.focusApp(opts.sourceApp)
      } catch (error) {
        console.error('Error while focusing app', error)
      }
    }

    if (!focused) {
      Menu.sendActionToFirstResponder('hide:')
    }
  } else if (process.platform === 'win32') {
    let focused = false

    // if we have an app then target it
    if (opts?.sourceApp?.window) {
      try {
        console.log(`Releasing focus to ${opts.sourceApp.window}`)
        const windowsAutomator = new WindowsAutomator()
        await windowsAutomator.activateApp(opts.sourceApp.window)
        focused = true
      } catch (error) {
        console.error('Error while focusing app', error)
      }
    }

    if (!focused) {
      const dummyTransparentWindow = new BrowserWindow({
        width: 1,
        height: 1,
        x: -100,
        y: -100,
        skipTaskbar: true,
        transparent: true,
        frame: false
      })

      dummyTransparentWindow.close()
    }
  }

  // pause
  if (opts.delay > 0) {
    await wait(opts.delay)
  }
}
