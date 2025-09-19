import { join, dirname, normalize, sep } from 'path'
import { name, version, debug, homepage, schemaVersion } from '../../../package.json'
import { fileURLToPath } from 'url'
import { app } from 'electron'

const __dirname = dirname(fileURLToPath(import.meta.url))

export interface TrayOptions {
  enabled: boolean
  trayWindow: boolean
  menu: boolean
  tooltip: string
  margin: { x: number; y: number }
  showAtStartup: boolean
}

export interface AssetsPaths {
  config: string
  icon: string
  icon_raw: string
  mcp: string
  mcpb: string
  llm: string
  popup: string
  startup: string
}

export default class Constants {
  static IS_DEV_ENV = process.env.NODE_ENV === 'development'

  // Display app name (uppercase first letter)
  // static APP_NAME = name.charAt(0).toUpperCase() + name.slice(1)

  // Display app name (uppercase all letters)
  static APP_NAME = `${name.toUpperCase()}${Constants.IS_DEV_ENV ? ' ' + process.env.NODE_ENV : ''}`

  static APP_VERSION = version

  static APP_HOME_PAGE = homepage

  static PARTITION_NAME = `persist:${name}-${process.env.NODE_ENV}-${schemaVersion}`

  // To show devtools at startup. It requires IS_DEV_ENV=true.
  // Note: For debugging purpose, window won't be closed if click elsewhere, if devtools is open.
  static IS_DEVTOOLS = true

  static IS_MAC = process.platform === 'darwin'

  static DEFAULT_WEB_PREFERENCES = {
    nodeIntegration: false,
    contextIsolation: true,
    enableRemoteModule: false,
    webSecurity: false,
    partition: Constants.PARTITION_NAME,
    preload: join(__dirname, '../preload/index.js')
  }

  static DEFAULT_TRAY_OPTIONS: TrayOptions = {
    enabled: false,
    trayWindow: false,
    menu: false,
    tooltip: Constants.APP_NAME,
    margin: { x: 0, y: 0 },
    showAtStartup: false
  }

  static APP_URL = __dirname

  static APP_INDEX_URL_DEV = `${debug.env.VITE_DEV_SERVER_URL}/index.html`
  static APP_INDEX_URL_PROD = join(__dirname, '../index.html')

  private static _buildAssetsPath(...paths: string[]) {
    const basePath = app.isPackaged ? process.resourcesPath : 'src/main'
    return join(basePath, 'assets', ...paths)
  }

  static ASSETS_PATH: AssetsPaths = {
    config: Constants._buildAssetsPath('config'),
    icon: Constants._buildAssetsPath('icon', 'icon.png'),
    icon_raw: Constants._buildAssetsPath('icon', 'icon_raw.png'),

    mcpb: Constants._buildAssetsPath('mcpb'),

    mcp: Constants._buildAssetsPath('config', 'mcp.json'),
    llm: Constants._buildAssetsPath('config', 'llm.json'),
    popup: Constants._buildAssetsPath('config', 'popup.json'),
    startup: Constants._buildAssetsPath('config', 'startup.json')
  }

  static getPosixPath(inputPath) {
    return normalize(inputPath).split(sep).join('/')
  }

  static getDxtSource(
    filename: string,
    requiredExtension: string = '.mcpb'
  ): {
    mcpbPath: string
    outputDir: string
  } {
    if (!filename.endsWith(requiredExtension)) {
      throw new Error(`File extension name must be: ${requiredExtension}`)
    }
    const dirName = filename.slice(0, -requiredExtension.length)
    const dirPath = join(this.ASSETS_PATH.mcpb, dirName, '/')
    return {
      mcpbPath: join(dirPath, filename),
      outputDir: dirPath
    }
  }
}
