// import { Application } from './types'
import { clipboard } from 'electron'
import Automator from './automator'
// import * as window from '../main/window'
import { wait } from './utils'

const kWriteTextTimeout = 1000

// export enum AutomationAction {
//   INSERT_BELOW,
//   REPLACE
// }

export default class Automation {
  static grabSelectedText = async (
    automator: Automator,
    timeout: number = 500
  ): Promise<string> => {
    // wait for focus
    await wait(10)

    // get started
    const start = new Date().getTime()

    // grab text repeatedly
    let text = null
    const grabStart = new Date().getTime()
    while (true) {
      text = await automator.getSelectedText()
      if (text != null && text.trim() !== '') {
        break
      }
      if (new Date().getTime() - grabStart > timeout) {
        console.log(`Grab text timeout after ${timeout}ms`)
        break
      }
      await wait(50)
    }

    // log
    if (text?.length) {
      console.debug(
        `Text grabbed: ${text.trimEnd().slice(0, 50)}… [${new Date().getTime() - start}ms]`
      )
    }

    // done
    return text
  }

  // static automate = async (text: string, sourceApp: Application|null, action: AutomationAction): Promise<boolean> => {

  //   try {

  //     const result = text;

  //     // copy to clipboard
  //     const clipboardText = clipboard.readText();
  //     const copied = await Automation.writeTextToClipboard(result);
  //     if (!copied) {
  //       return false;
  //     }

  //     // close prompt anywhere
  //     await window.closePromptAnywhere(sourceApp);

  //     // now paste
  //     console.debug(`Processing LLM output: "${result.slice(0, 50)}"…`);

  //     // we need an automator
  //     const automator = new Automator();
  //     if (action === AutomationAction.INSERT_BELOW) {
  //       await automator.moveCaretBelow()
  //       await automator.pasteClipboard()
  //     } else if (action === AutomationAction.REPLACE) {
  //       await automator.deleteSelectedText()
  //       await automator.pasteClipboard()
  //     }

  //     // restore clipboard
  //     await Automation.writeTextToClipboard(clipboardText);

  //     // done
  //     return true;

  //   } catch (error) {
  //     console.error('Error while testing', error);
  //   }

  //   // too bad
  //   return false;

  // }

  static writeTextToClipboard = async (text: string): Promise<boolean> => {
    // we try several times in case something goes wrong (rare but...)
    const start = new Date().getTime()
    while (true) {
      try {
        clipboard.writeText(text)
        if (clipboard.readText() === text) {
          return true
        }
      } catch {
        /* empty */
      }

      const now = new Date().getTime()
      if (now - start > kWriteTextTimeout) {
        return false
      }

      // wait
      await wait(100)
    }
  }
}
