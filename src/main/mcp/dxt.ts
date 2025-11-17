import {
  unpackExtension,
  getMcpConfigForManifest,
  v0_3 as McpbVersion,
  McpbManifestAny,
  McpbUserConfigValues,
  Logger
} from '@anthropic-ai/mcpb'

import type { McpDxtErrors } from '@/types/mcp'

import { existsSync, readFileSync, statSync } from 'fs'
import { join, resolve, sep } from 'path'

export type McpServerConfig = McpbManifestAny['server']['mcp_config']

const mockSystemDirs = {
  home: '/home/user',
  data: '/data'
}

export async function getMcpConfigForDxt(
  basePath: string,
  baseManifest: McpbManifestAny,
  userConfig: McpbUserConfigValues
): Promise<McpServerConfig> {
  const logMessages: string[] = []
  const logger: Logger = {
    log: (...args: unknown[]) => logMessages.push(args.join(' ')),
    warn: (...args: unknown[]) => logMessages.push(args.join(' ')),
    error: (...args: unknown[]) => logMessages.push(args.join(' '))
  }

  const mcpConfig = await getMcpConfigForManifest({
    manifest: baseManifest,
    extensionPath: basePath,
    systemDirs: mockSystemDirs,
    userConfig: userConfig,
    pathSeparator: sep,
    logger
  })

  if (mcpConfig === undefined) {
    throw new Error(logMessages.join('\n'))
  } else {
    return mcpConfig
  }
}
export async function unpackDxt(dxtUnpackOption: {
  mcpbPath: string
  outputDir: string
}): Promise<boolean> {
  return unpackExtension(dxtUnpackOption)
}

export function getManifest(inputPath: string): McpDxtErrors | McpbManifestAny {
  try {
    const resolvedPath = resolve(inputPath)
    let manifestPath = resolvedPath

    // If input is a directory, look for manifest.json inside it
    if (existsSync(resolvedPath) && statSync(resolvedPath).isDirectory()) {
      manifestPath = join(resolvedPath, 'manifest.json')
    }

    const manifestContent = readFileSync(manifestPath, 'utf-8')
    const manifestData = JSON.parse(manifestContent)

    const result = McpbVersion.McpbManifestSchema.safeParse(manifestData)

    if (result.success) {
      console.log('Manifest is valid!')
      return result.data
    } else {
      console.log('ERROR: Manifest validation failed:\n')
      const errors = result.error.issues.map((issue) => {
        const path = issue.path.join('.')
        console.log(`  - ${path ? `${path}: ` : ''}${issue.message}`)
        return {
          field: path,
          message: issue.message
        }
      })
      return { errors: errors }
    }
  } catch (error) {
    const dxtError = {
      field: 'manifest',
      message: error instanceof Error ? error.message : String(error)
    }

    console.error(dxtError.message)
    return { errors: [dxtError] }
  }
}
