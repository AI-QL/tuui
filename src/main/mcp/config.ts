import { showNotification } from '../utils//notification'
import fs from 'node:fs'
import path from 'node:path'
import { McpServersConfig } from './types'
const { shell } = require('electron')

export function loadConfigFile(configPath: string): McpServersConfig {
  const resolvedConfigPath = path.isAbsolute(configPath)
    ? configPath
    : path.resolve(process.cwd(), configPath)
  try {
    if (!fs.existsSync(resolvedConfigPath)) {
      throw new Error(`Config file not found: ${resolvedConfigPath}`)
    }
    const configContent = fs.readFileSync(resolvedConfigPath, 'utf8')
    const parsedConfig = JSON.parse(configContent)
    if (!parsedConfig.mcpServers) {
      return {}
    } else {
      return parsedConfig.mcpServers
    }
  } catch (err) {
    showNotification(
      {
        body: 'MCP Config JSON parse failure'
      },
      {
        onClick: () => {
          shell.showItemInFolder(resolvedConfigPath)
        }
      }
    )
    if (err instanceof SyntaxError) {
      throw new Error(`Invalid JSON in config file: ${err.message}`)
    }
    throw err
  }
}

export function loadLlmFile(llmPath: string) {
  const resolvedConfigPath = path.isAbsolute(llmPath)
    ? llmPath
    : path.resolve(process.cwd(), llmPath)
  try {
    if (!fs.existsSync(resolvedConfigPath)) {
      throw new Error(`Config file not found: ${resolvedConfigPath}`)
    }
    const configContent = fs.readFileSync(resolvedConfigPath, 'utf8')
    const parsedConfig = JSON.parse(configContent)
    if (!parsedConfig) {
      return {}
    } else {
      return parsedConfig
    }
  } catch (err) {
    showNotification(
      {
        body: 'LLM Config JSON parse failure'
      },

      {
        onClick: () => {
          shell.showItemInFolder(resolvedConfigPath)
        }
      }
    )
    if (err instanceof SyntaxError) {
      throw new Error(`Invalid JSON in llm file: ${err.message}`)
    }
    throw err
  }
}
