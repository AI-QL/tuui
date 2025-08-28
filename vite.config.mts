import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from 'vite'
import ElectronPlugin, { ElectronOptions } from 'vite-plugin-electron'
import RendererPlugin from 'vite-plugin-electron-renderer'
import VuetifyPlugin from 'vite-plugin-vuetify'
import VueJsx from '@vitejs/plugin-vue-jsx'
import Vue from '@vitejs/plugin-vue'
import { rmSync } from 'fs'
import { resolve, dirname } from 'path'
import { builtinModules } from 'module'

const isDevEnv = process.env.NODE_ENV === 'development'

export default defineConfig(({ mode }) => {
  process.env = {
    ...(isDevEnv
      ? {
          ELECTRON_ENABLE_LOGGING: 'true'
        }
      : {}),
    ...process.env,
    ...loadEnv(mode, process.cwd())
  }

  rmSync('dist', { recursive: true, force: true })

  const electronPluginConfigs: ElectronOptions[] = [
    {
      entry: 'src/main/index.ts',
      onstart({ startup }) {
        startup()
      },
      vite: {
        root: resolve('.'),
        build: {
          assetsDir: '.',
          outDir: 'dist/main',
          rollupOptions: {
            external: ['electron', ...builtinModules]
          }
        }
      }
    },
    {
      entry: 'src/preload/index.ts',
      onstart({ reload }) {
        reload()
      },
      vite: {
        root: resolve('.'),
        build: {
          outDir: 'dist/preload'
        }
      }
    }
  ]

  return {
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
      __INTLIFY_PROD_DEVTOOLS__: false
    },
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.vue', '.json', '.scss'],
      alias: {
        '@': resolve(dirname(fileURLToPath(import.meta.url)), 'src')
      }
    },
    base: './',
    root: resolve('./src/renderer'),
    publicDir: resolve('./src/renderer/public'),
    clearScreen: false,
    build: {
      sourcemap: isDevEnv,
      minify: !isDevEnv,
      outDir: resolve('./dist')
    },
    plugins: [
      Vue(),
      VueJsx(),
      // Docs: https://github.com/vuetifyjs/vuetify-loader
      VuetifyPlugin({
        autoImport: true
      }),
      // Docs: https://github.com/electron-vite/vite-plugin-electron
      ElectronPlugin(electronPluginConfigs),
      RendererPlugin()
    ]
  }
})
