import { Application } from './types'
import applescript from 'applescript'
import NutAutomator from './nut'

export default class extends NutAutomator {
  constructor() {
    super()
    this.setupNut()
  }

  async getForemostApp(): Promise<Application | null> {
    const script = `
      tell application "System Events"
        set appProcess to first application process whose frontmost is true
        set bundleID to bundle identifier of appProcess
        set appName to name of appProcess
        set appPath to POSIX path of (file of appProcess as alias)
        set winTitle to name of first window of appProcess
      end tell
      return bundleID & "<|>" & appName & "<|>" & appPath & "<|>" & winTitle
    `

    // run it
    const app = await this.runScript(script)
    const [id, name, realpath, window] = (app as string).split('<|>')
    const path = realpath
      .replace('/System/Volumes/Preboot/Cryptexes/App/System', '')
      .replace('/Volumes/Preboot/Cryptexes/App/System', '')
    return { id, name, path, window }
  }

  async focusApp(application: Application): Promise<boolean> {
    try {
      // check
      if (!application.id) {
        console.error('Application ID is required')
        return false
      }

      // now focus window
      if (application.window?.length) {
        const script = `
          tell application "System Events"
            set appProcess to first application process whose bundle identifier is "${application.id}"
            tell appProcess
              set frontmost to true
              set focusedWindow to first window whose name is "${application.window.replaceAll('"', '\\"')}"
              perform action "AXRaise" of focusedWindow
              set value of attribute "AXFocused" of focusedWindow to true
            end tell
          end tell
        `

        // run it
        await this.runScript(script)
      } else {
        const script = `
          tell application "System Events"
            set appProcess to first application process whose bundle identifier is "${application.id}"
            tell appProcess
              set frontmost to true
            end tell
          end tell
        `

        // run it
        await this.runScript(script)
      }

      // probably done
      return true
    } catch (error) {
      console.error('Error while focusingApp', application, error)
      return false
    }
  }

  async selectAll(): Promise<void> {
    try {
      await super.selectAll()
    } catch {
      const script = `
        tell application "System Events" to keystroke "a" using command down      
        delay 0.1
      `

      // run it
      await this.runScript(script)
    }
  }

  async moveCaretBelow(): Promise<void> {
    try {
      await super.moveCaretBelow()
    } catch {
      const script = `
      tell application "System Events"
          key code 124
          key code 36
          key code 36
        end tell
      `

      // run it
      await this.runScript(script)
    }
  }

  async copySelectedText(): Promise<void> {
    try {
      // nut (custom)
      //await super.copySelectedText();
      if (!(await this.setup())) throw new Error('nutjs not loaded')
      await this.nut().keyboard.pressKey(this.commandKey(), this.nut().Key.C)
      await this.nut().keyboard.releaseKey(this.commandKey(), this.nut().Key.C)
    } catch {
      // applescript
      const script = `
        repeat 20 times
          try
            tell application "System Events" to keystroke "c" using command down
            delay 0.02
            set clipboardContents to the clipboard
            if length of clipboardContents is not 0 then exit repeat
            delay 0.1
          on error
          end try
        end repeat
      `

      // run it
      await this.runScript(script)
    }
  }

  async pasteText(): Promise<void> {
    try {
      // nut
      await super.pasteText()
    } catch {
      // applescript
      const script = `
        tell application "System Events" to keystroke "v" using command down
        delay 0.1
      `

      // run it
      await this.runScript(script)
    }
  }

  async deleteSelectedText(): Promise<void> {
    try {
      await super.deleteSelectedText()
    } catch {
      const script = `
        tell application "System Events"
            key code 117
          end tell
        `

      // run it
      await this.runScript(script)
    }
  }

  private runScript(script: string) {
    return new Promise((resolve, reject) => {
      applescript.execString(script, (err: Error, rtn: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(rtn)
        }
      })
    })
  }

  protected async setupNut() {
    const rc = await super.setup()
    if (rc) {
      this.nut().keyboard.config.autoDelayMs = 25
    }
    return rc
  }

  protected delay() {
    return 50
  }

  protected commandKey() {
    return this.nut().Key.LeftCmd
  }
}
