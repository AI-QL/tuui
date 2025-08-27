import {
  CreateMessageRequestSchema as SamplingRequestSchema,
  ElicitRequestSchema
} from '@modelcontextprotocol/sdk/types.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

import { ServerConfig, McpClientTransport } from './types'
import { connect } from './connection'

import { samplingTransferInvoke, elicitationTransferInvoke } from '../index'
import Constants from '../utils/Constants'

export async function initializeClient(
  name: string,
  serverConfig: ServerConfig,
  idleTimeout: number = 90 // 90 sec by default
): Promise<McpClientTransport> {
  let idleTimer: NodeJS.Timeout
  let rejectFn: (reason?: any) => void

  const resetTimer = () => {
    clearTimeout(idleTimer)
    idleTimer = setTimeout(() => {
      rejectFn(new Error(`Initialization of client for ${name} timed out after ${idleTimeout} seconds of inactivity`))
    }, idleTimeout * 1000)
  }

  const timeoutPromise = new Promise<McpClientTransport>((_, reject) => {
    rejectFn = reject
    resetTimer() // Init timer
  })

  const stdioPromise = initializeStdioClient(name, serverConfig, resetTimer)

  return Promise.race([stdioPromise, timeoutPromise])
}

async function initializeStdioClient(
  name: String,
  config: ServerConfig,
  onData?: () => void
): Promise<McpClientTransport> {
  const transport = new StdioClientTransport({
    ...config,
    stderr: "pipe",
  })
  const clientName = `${name}-client`
  const client = new Client(
    {
      name: clientName,
      version: Constants.APP_VERSION
    },
    {
      capabilities: {
        sampling: {},
        elicitation: {}
      }
    }
  )

  if (transport.stderr) {
    transport.stderr.on('data', (chunk) => {
      console.error(`MCP ${name}:`, chunk.toString())
      if (onData) onData()
    })
  }

  await connect(client, transport)
  console.log(`${clientName} connected.`)

  client.setRequestHandler(SamplingRequestSchema, async (request) => {
    console.log('Sampling request received:\n', request)
    const response = await samplingTransferInvoke(request)
    console.log(response)
    return response
  })

  client.setRequestHandler(ElicitRequestSchema, async (request) => {
    const response = await elicitationTransferInvoke(request)

    console.log('Elicitation request received:\n', JSON.stringify(response, null, 2))

    return response
  })

  return { client, transport }
}

export async function manageRequests(client: Client, method: string, schema: any, params?: any) {
  const requestObject = {
    method,
    ...(params && { params })
  }

  const result = await client.request(requestObject, schema)
  console.log(result)
  return result
}
