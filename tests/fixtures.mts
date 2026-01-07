import * as base from '@playwright/test'
import { _electron as electron, Page, ElectronApplication } from 'playwright'
import { join } from 'path'
import { main } from '../package.json'
import TestUtil from './testUtil.mjs'

interface CustomFixtures {
  util: TestUtil
}

let appElectron: ElectronApplication
let page: Page

const __cwd = process.cwd()
const __isCiProcess = process.env.CI === 'true'
const __testPath = join(__cwd, 'tests')
const __testResultPath = join(__testPath, 'results')
const __testScreenshotPath = join(__testResultPath, 'screenshots')

export const beforeAll = async () => {
  // Open Electron app from build directory
  appElectron = await electron.launch({
    args: [
      main,
      ...(__isCiProcess ? ['--no-sandbox'] : []),
      '--enable-logging',
      '--ignore-certificate-errors',
      '--ignore-ssl-errors',
      '--ignore-blocklist',
      '--ignore-gpu-blocklist'
    ],
    locale: 'en-US',
    colorScheme: 'light',
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  })
  const splashWindow = await appElectron.firstWindow()

  const secondWindow = await appElectron.waitForEvent('window', {
    predicate: (window) => window !== splashWindow,
    timeout: 10000
  })

  page = secondWindow

  await page.waitForEvent('load')

  page.on('console', console.log)
  page.on('pageerror', console.log)

  const evaluateResult = await appElectron.evaluate(async ({ app, BrowserWindow }) => {
    const currentWindow = BrowserWindow.getFocusedWindow()

    // Fix window position for testing
    currentWindow.setPosition(50, 50)
    currentWindow.setSize(1080, 560)

    return {
      packaged: app.isPackaged,
      dataPath: app.getPath('userData')
    }
  })

  base.expect(evaluateResult.packaged, 'app is not packaged').toBe(false)
}

export const afterAll = async () => {
  await appElectron.close()
}

export const test = base.test.extend<CustomFixtures>({
  page: async ({}, use) => {
    await use(page)
  },
  util: async ({ page }, use, testInfo) => {
    await use(new TestUtil(page, testInfo, __testScreenshotPath))
  }
})

export const expect = base.expect

export default {
  test,
  expect,
  beforeAll,
  afterAll
}
