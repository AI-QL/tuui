import { Application, Automator } from './types'
import { wait } from './utils'

let nut: any = undefined

export default class NutAutomator implements Automator {
  nut() {
    return nut
  }

  protected async setup() {
    if (nut) {
      return true
    }
    if (nut === null) {
      return false
    }
    try {
      const nutPackage = '@nut-tree-fork/nut-js'
      nut = await import(nutPackage)
      return true
    } catch {
      console.log('Error loading nutjs. Automation not available.')
      nut = null
      return false
    }
  }

  async getForemostApp(): Promise<Application | null> {
    console.warn('getForemostApp not implemented (expected)')
    return null
  }

  async selectAll() {
    if (!(await this.setup())) throw new Error('nutjs not loaded')
    await nut.keyboard.type(this.commandKey(), nut.Key.A)
    await wait(this.delay())
  }

  async moveCaretBelow() {
    if (!(await this.setup())) throw new Error('nutjs not loaded')
    await nut.keyboard.type(nut.Key.Down)
    await nut.keyboard.type(nut.Key.Enter)
    await nut.keyboard.type(nut.Key.Enter)
    await wait(this.delay())
  }

  async copySelectedText() {
    if (!(await this.setup())) throw new Error('nutjs not loaded')
    await nut.keyboard.type(this.commandKey(), nut.Key.C)
    await wait(this.delay())
  }

  async deleteSelectedText() {
    if (!(await this.setup())) throw new Error('nutjs not loaded')
    await nut.keyboard.type(nut.Key.Delete)
    await wait(this.delay())
  }

  async pasteText() {
    if (!(await this.setup())) throw new Error('nutjs not loaded')
    await nut.keyboard.type(this.commandKey(), nut.Key.V)
    await wait(this.delay())
  }

  protected delay() {
    return 150
  }

  protected commandKey() {
    return nut.Key.LeftControl
  }
}
