import { defineConfig, globalIgnores } from 'eslint/config'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
import parser from 'vue-eslint-parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default defineConfig([
  globalIgnores([
    '**/node_modules/',
    'buildAssets/icons/',
    '**/dist/',
    '**/release/',
    '**/mcpb/',
    '**/.idea/',
    '**/.vscode/',
    '**/.github/'
  ]),
  {
    extends: compat.extends('plugin:vue/recommended', 'prettier'),

    plugins: {
      vue
    },

    languageOptions: {
      globals: {
        ...globals.node,
        __static: true
      },

      parser: parser,
      ecmaVersion: 2022,
      sourceType: 'module',

      parserOptions: {
        parser: '@typescript-eslint/parser',

        ecmaFeatures: {
          jsx: true
        }
      }
    },

    rules: {
      'arrow-parens': 0,
      'generator-star-spacing': 0,
      'no-case-declarations': 0,
      'array-callback-return': 0,
      'no-trailing-spaces': 1,
      'no-control-regex': 0,
      'no-useless-constructor': 0,
      'no-useless-assignment': 0,
      'no-useless-escape': 1,
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      'node/no-deprecated-api': 0
    }
  }
])
