/* eslint-disable no-template-curly-in-string */
const dotenv = require('dotenv')
const packageJson = require('../../package.json')

const baseConfig = {
  productName: packageJson.name,
  appId: packageJson.appId,
  asar: true,
  extends: null,
  compression: 'maximum',
  artifactName: '${productName}__${version}_${os}_${arch}.${ext}',
  directories: {
    output: './release/${version}'
  },
  mac: {
    hardenedRuntime: true,
    gatekeeperAssess: false,
    notarize: false,
    icon: 'buildAssets/icons/icon.icns',
    type: 'distribution',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64', 'universal']
      }
    ]
  },
  dmg: {
    contents: [
      {
        x: 410,
        y: 150,
        type: 'link',
        path: '/Applications'
      },
      {
        x: 130,
        y: 150,
        type: 'file'
      }
    ],
    sign: false
  },
  win: {
    icon: 'buildAssets/icons/icon.ico',
    target: [
      {
        target: 'appx',
        arch: 'x64'
      },
      {
        target: 'zip',
        arch: 'x64'
      },
      {
        target: 'portable',
        arch: 'x64'
      },
      {
        target: 'nsis',
        arch: 'x64'
      }
    ]
  },
  portable: {
    artifactName: '${productName}__${version}_${os}_${arch}_Portable.${ext}'
  },
  nsis: {
    oneClick: true
  },
  linux: {
    executableName: packageJson.name.toLowerCase(),
    icon: 'buildAssets/icons',
    category: 'Utility',
    target: [
      {
        target: 'snap',
        arch: 'x64'
      },
      {
        target: 'deb',
        arch: 'x64'
      },
      {
        target: 'rpm',
        arch: 'x64'
      }
    ]
  }
}

dotenv.config()

baseConfig.copyright = `ⓒ ${new Date().getFullYear()} $\{author}`
baseConfig.files = [
  /* A list of files not to be included in the build. */
  /*
    (Required) The files and folders listed below should not be included in the build.
  */
  'dist/**/*',
  '!dist/main/index.dev.js',
  '!docs/**/*',
  '!tests/**/*',
  '!release/**/*'
]

baseConfig.extraResources = [
  {
    from: 'src/main/assets',
    to: 'assets'
  }
]

// TODO: Notarize for macOS
baseConfig.mac.identity = null
/* if (process.env.MAC_NOTARIZE === 'true') {
  baseConfig.afterSign = './buildAssets/builder/notarize.ts'
} else {
  baseConfig.mac.identity = null
} */

module.exports = {
  ...baseConfig
}
