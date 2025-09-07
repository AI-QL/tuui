import { Application } from './types'
import { app, BrowserWindow, screen } from 'electron'
import { createWindow, ensureOnCurrentScreen, releaseFocus, loadWindowUrl } from './index'
//import MacosAutomator from '../../automations/macos';
//import WindowsAutomator from '../../automations/windows';
//import Computer from '../../automations/computer_nut';
import { wait, anyDict } from './utils'
import Constants from '../utils/Constants'

export let commandPicker: BrowserWindow = null

const width = 300
const height = 320

const POPUP_NAME = 'popup'
const POPUP_HASH = `/${POPUP_NAME}`

let commanderStartTime: number | undefined
let sourceApp: Application | undefined
let cursorAtOpen: { x: number; y: number } | undefined

export const prepareCommandPicker = (queryParams?: anyDict): void => {
  const macOS = process.platform === 'darwin'

  // open a new one
  commandPicker = createWindow({
    hash: POPUP_HASH,
    title: `${Constants.APP_NAME} - ${POPUP_NAME}`,
    x: 0,
    y: 0,
    width: width,
    height: height,
    frame: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    transparent: macOS,
    resizable: process.env.DEBUG ? true : false,
    hiddenInMissionControl: true,
    queryParams: queryParams,
    keepHidden: true,
    hasShadow: macOS
  })

  // focus tricks
  commandPicker.on('show', () => {
    // macos can use app.focus which is more elegant
    // windows will use activateCommandPicker

    if (macOS) {
      app.focus({ steal: true })
    }

    // focus
    commandPicker.moveTop()
    commandPicker.focusOnWebView()

    // try to activate (make foremost)
    activateCommandPicker()

    // log
    if (commanderStartTime) {
      console.log(`Command picker total time: ${Date.now() - commanderStartTime}ms`)
    }
  })

  // prevent close with keyboard shortcut
  commandPicker.on('close', (event) => {
    closeCommandPicker(sourceApp)
    event.preventDefault()
  })
}

export const openCommandPicker = (params: anyDict): void => {
  // save
  sourceApp = params.sourceApp
  commanderStartTime = params.startTime

  // if we don't have a window, create one
  if (!commandPicker || commandPicker.isDestroyed()) {
    prepareCommandPicker(params)
  } else {
    loadWindowUrl(commandPicker, { queryParams: params, hash: POPUP_HASH })
    // commandPicker.webContents.send('show', params)
  }

  // check prompt is on the right screen
  ensureOnCurrentScreen(commandPicker)

  // and at right location
  cursorAtOpen = screen.getCursorScreenPoint()

  const screenBounds = screen.getDisplayNearestPoint(cursorAtOpen).bounds
  const adjustedX = Math.max(0, Math.min(cursorAtOpen.x - width / 2, screenBounds.width - width))
  const adjustedY = Math.max(
    0,
    Math.min(cursorAtOpen.y - (params.sourceApp ? 64 : 24), screenBounds.height - height)
  )

  commandPicker.setBounds({
    x: adjustedX,
    y: adjustedY,
    width: width,
    height: height
  })

  // done
  commandPicker.show()
}

export const closeCommandPicker = async (sourceApp?: Application): Promise<void> => {
  // check
  if (commandPicker === null || commandPicker.isDestroyed()) {
    return
  }

  try {
    // remove blur handler
    //console.log('Removing blur handler from command picker');
    commandPicker.removeAllListeners('blur')
    commandPicker.setOpacity(0)

    // now release focus
    await releaseFocus({ sourceApp })

    // now hide
    commandPicker.hide()
    commandPicker.setOpacity(1)
  } catch (error) {
    console.error('Error while hiding command picker', error)
    commandPicker = null
  }
}

const activateCommandPicker = async () => {
  const isThere = () =>
    commandPicker &&
    !commandPicker.isDestroyed() &&
    commandPicker.isVisible() &&
    commandPicker.getOpacity() > 0

  // wait for command picker to be visible
  const start = Date.now()
  const totalWait = 1000
  while (!isThere() && Date.now() - start < totalWait) {
    await wait(50)
  }

  if (!isThere()) {
    console.log('Command picker is not visible after 1 second, not activating')
    return
  }

  commandPicker.removeAllListeners('blur')

  if (isThere()) {
    //console.log('Adding blur handler to command picker');
    commandPicker.removeAllListeners('blur')
    commandPicker.on('blur', () => {
      closeCommandPicker(sourceApp)
    })
  }
}
