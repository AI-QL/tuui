import { Application, Automator as AutomatorImpl } from './types'
import { clipboard } from 'electron'
import MacosAutomator from './macos'
import WindowsAutomator from './windows'
import NutAutomator from './nut'
import Automation from './automation'

export default class Automator {
  automator: AutomatorImpl

  constructor() {
    if (process.platform === 'darwin') {
      this.automator = new MacosAutomator()
    } else if (process.platform === 'win32') {
      this.automator = new WindowsAutomator()
    } else {
      this.automator = new NutAutomator()
    }
  }

  async getForemostApp(): Promise<Application | null> {
    try {
      return await this.automator.getForemostApp()
    } catch (error) {
      console.warn(error)
      return null
    }
  }

  async selectAll(): Promise<void> {
    try {
      await this.automator.selectAll()
    } catch (error) {
      console.error(error)
    }
  }

  async moveCaretBelow(): Promise<void> {
    try {
      await this.automator.moveCaretBelow()
    } catch (error) {
      console.error(error)
    }
  }

  async getSelectedText(): Promise<string> {
    try {
      // save and set
      const clipboardText = clipboard.readText()
      clipboard.writeText('')

      // get it
      await this.automator.copySelectedText()
      const selectedText = clipboard.readText()

      // restore and done
      clipboard.writeText(clipboardText)
      return selectedText
    } catch (error) {
      console.error(error)
      return null
    }
  }

  async deleteSelectedText(): Promise<void> {
    try {
      await this.automator.deleteSelectedText()
    } catch (error) {
      console.error(error)
    }
  }

  async pasteClipboard(): Promise<void> {
    try {
      await this.automator.pasteText()
    } catch (error) {
      console.error(error)
    }
  }

  async pasteText(textToPaste: string): Promise<boolean> {
    try {
      // save and set
      const clipboardText = clipboard.readText()

      // try to write text to clipboard
      const copied = await Automation.writeTextToClipboard(textToPaste)
      if (!copied) {
        return false
      }

      // paste it
      this.pasteClipboard()

      // restore
      await Automation.writeTextToClipboard(clipboardText)
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }
}
