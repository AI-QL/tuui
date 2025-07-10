import fs from 'node:fs'
import path from 'node:path'
import { McpServersConfig } from './types'

export function loadConfigFile(configPath: string): McpServersConfig {
  try {
    const resolvedConfigPath = path.isAbsolute(configPath)
      ? configPath
      : path.resolve(process.cwd(), configPath)
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
    if (err instanceof SyntaxError) {
      throw new Error(`Invalid JSON in config file: ${err.message}`)
    }
    throw err
  }
}

export function loadLlmFile(llmPath: string) {
  try {
    const resolvedConfigPath = path.isAbsolute(llmPath)
      ? llmPath
      : path.resolve(process.cwd(), llmPath)
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
    if (err instanceof SyntaxError) {
      throw new Error(`Invalid JSON in llm file: ${err.message}`)
    }
    throw err
  }
}
