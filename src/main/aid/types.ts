export interface ShortcutCallbacks {
  prompt: () => void
  chat: () => void
  command: () => void
  readaloud: () => void
  transcribe: () => void
  scratchpad: () => void
  realtime: () => void
  studio: () => void
}

export type Application = {
  id: string
  name: string
  path: string
  window: string
}

export interface Automator {
  getForemostApp(): Promise<Application | null>
  selectAll(): Promise<void>
  moveCaretBelow(): Promise<void>
  copySelectedText(): Promise<void>
  deleteSelectedText(): Promise<void>
  pasteText(): Promise<void>
}

export type CommandAction = 'default' | 'copy' | 'insert' | 'replace'

export type Command = {
  id: string
  type: 'system' | 'user'
  icon: string
  label?: string
  action: 'chat_window' | 'paste_below' | 'paste_in_place' | 'clipboard_copy'
  template?: string
  shortcut: string
  state: 'enabled' | 'disabled' | 'deleted'
  engine: string
  model: string
}

export type RunCommandParams = {
  textId: string
  sourceApp: Application | null
  command: Command
  action: CommandAction
}
