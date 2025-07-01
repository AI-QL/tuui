import { globalShortcut } from 'electron'
import { loadSettings, Shortcut, disabledShortcutKey } from './config'

export interface ShortcutCallbacks {
  command: () => void
}

export const unregisterShortcuts = () => {
  console.info('Unregistering shortcuts')
  globalShortcut.unregisterAll()
}

export const registerShortcuts = (callbacks: ShortcutCallbacks): void => {
  // unregister
  unregisterShortcuts()

  // load the config
  const config = loadSettings()

  // now register
  console.info('Registering shortcuts')
  registerShortcut('command', config.shortcuts.command, callbacks.command)
}

const keyToAccelerator = (key: string): string => {
  if (key === '+') return 'Plus'
  if (key === '↑') return 'Up'
  if (key === '↓') return 'Down'
  if (key === '←') return 'Left'
  if (key === '→') return 'Right'
  if (key === 'NumpadAdd') return 'numadd'
  if (key === 'NumpadSubtract') return 'numsub'
  if (key === 'NumpadMultiply') return 'nummult'
  if (key === 'NumpadDivide') return 'numdiv'
  if (key === 'NumpadDecimal') return 'numdec'
  if (key.startsWith('Numpad')) return `num${key.substring(6).toLowerCase()}`
  return key
}

export const shortcutAccelerator = (shortcut?: Shortcut | null): string => {
  // null check
  if (!shortcut || shortcut.key === disabledShortcutKey) {
    return null
  }

  // build accelerator
  let accelerator = ''
  if (shortcut.alt) accelerator += 'Alt+'
  if (shortcut.ctrl) accelerator += 'Control+'
  if (shortcut.shift) accelerator += 'Shift+'
  if (shortcut.meta) accelerator += 'Command+'

  // key
  accelerator += keyToAccelerator(shortcut.key)

  // done
  return accelerator
}

const registerShortcut = (name: string, shortcut: Shortcut, callback: () => void): void => {
  // check
  if (!shortcut || !callback) {
    return
  }

  // build accelerator
  const accelerator = shortcutAccelerator(shortcut)
  if (accelerator === null) {
    return
  }

  // debug
  console.debug('Registering shortcut', shortcut, accelerator)

  // do it
  try {
    globalShortcut.register(accelerator, callback)
  } catch (error) {
    console.error(`Failed to register shortcut for ${name}:`, error)
  }
}
