import { dialog, shell } from 'electron'

import { BrowserWindowConstructorOptions } from 'electron'
import { anyDict } from './utils'
import { Application } from './types'

// export * from './windows/index';
// export * from './windows/main';
// export * from './windows/anywhere';
export * from './commands'
// export * from './windows/settings';
// export * from './windows/readaloud';
// export * from './windows/realtime';
// export * from './windows/transcribe';
// export * from './windows/scratchpad';
// export * from './windows/computer';
// export * from './windows/studio';
// export * from './windows/debug';

export type CreateWindowOpts = BrowserWindowConstructorOptions & {
  showInDock?: boolean
  keepHidden?: boolean
  queryParams?: anyDict
  hash?: string
}

export type ReleaseFocusOpts = {
  sourceApp?: Application
  delay?: number
}

export const showMasLimitsDialog = () => {
  const version =
    process.arch === 'arm64' ? 'Apple Silicon (M1, M2, M3, M4)' : 'Mac Intel architecture'
  const response = dialog.showMessageBoxSync(null, {
    message:
      'This feature (and many others) are not available on the Mac App Store version. You may want to check the version from the website.',
    detail: `You will need to download the "${version}" version.`,
    buttons: ['Close', 'Check website'],
    defaultId: 1
  })
  if (response === 1) {
    shell.openExternal(`https://github.com/AI-QL/tuui/releases`)
  }
}
