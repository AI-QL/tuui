export type Shortcut = {
  alt?: boolean
  ctrl?: boolean
  shift?: boolean
  meta?: boolean
  key: string
  [key: string]: boolean | string
}

export const disabledShortcutKey: string = 'none'

export type ShortcutsConfig = {
  command: Shortcut
}

export type Configuration = {
  shortcuts: ShortcutsConfig
}

export const loadSettings = (): Configuration => {
  return {
    shortcuts: {
      command: {
        key: 'p', // ctrl-alt-p
        alt: true,
        ctrl: true
      }
    }
  }
}
