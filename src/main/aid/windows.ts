import { Application } from './types'
import { Configuration } from './config'
import { runVbs } from '@el3um4s/run-vbs'
import NutAutomator from './nut'

export default class extends NutAutomator {
  config: Configuration

  constructor() {
    super()
    this.setup()
  }

  async getForemostApp(): Promise<Application | null> {
    console.warn('getForemostApp not implemented (expected)')
    return null
  }

  async selectAll() {
    const script = `
      Set WshShell = WScript.CreateObject("WScript.Shell")
      WshShell.SendKeys "^a"
      WScript.Sleep 200
    `

    // run it
    await runVbs({ vbs: script })
  }

  async moveCaretBelow() {
    const script = `
      Set WshShell = WScript.CreateObject("WScript.Shell")
      WshShell.SendKeys "{DOWN}{ENTER}"
      WScript.Sleep 200
    `

    // run it
    await runVbs({ vbs: script })
  }

  async copySelectedText() {
    try {
      if (!(await this.setup())) throw new Error('nutjs not loaded')
      await this.nut().keyboard.pressKey(this.commandKey(), this.nut().Key.C)
      await this.nut().keyboard.releaseKey(this.commandKey(), this.nut().Key.C)
    } catch {
      // fallback to vbs
      const script = `
        Set WshShell = WScript.CreateObject("WScript.Shell")
        WshShell.SendKeys "^c"
        WScript.Sleep 20
      `

      // run it
      await runVbs({ vbs: script })
    }
  }

  async pasteText() {
    try {
      // nut is faster but not always available
      if (!(await this.setup())) throw new Error('nutjs not loaded')
      await this.nut().keyboard.pressKey(this.commandKey(), this.nut().Key.V)
      await this.nut().keyboard.releaseKey(this.commandKey(), this.nut().Key.V)
    } catch {
      // fallback to vbs
      const script = `
        Set WshShell = WScript.CreateObject("WScript.Shell")
        WshShell.SendKeys "^v"
        WScript.Sleep 20
    `

      // run it
      await runVbs({ vbs: script })
    }
  }

  async deleteSelectedText() {
    const script = `
      Set WshShell = WScript.CreateObject("WScript.Shell")
      WshShell.SendKeys "{DELETE}"
      WScript.Sleep 200
    `

    // run it
    await runVbs({ vbs: script })
  }

  async activateApp(title: string) {
    const script = `
      Set WshShell = WScript.CreateObject("WScript.Shell")
      WshShell.AppActivate "${title}"
      WScript.Sleep 200
    `

    // run it
    await runVbs({ vbs: script })
  }
}
