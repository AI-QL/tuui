import { CreateMessageRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

import { ServerConfig, McpClientTransport } from './types'
import { connect } from './connection'

import { samplingTransferInvoke } from '../index'
import Constants from '../utils/Constants'

export async function initializeClient(
  name: string,
  serverConfig: ServerConfig,
  timer: number = 90 // 90 sec by default
): Promise<McpClientTransport> {
  const timeoutPromise = new Promise<McpClientTransport>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Initialization of client for ${name} timed out after ${timer} seconds`))
    }, timer * 1000)
  })

  return Promise.race([initializeStdioClient(name, serverConfig), timeoutPromise])
}

async function initializeStdioClient(
  name: String,
  config: ServerConfig
): Promise<McpClientTransport> {
  const transport = new StdioClientTransport({
    ...config,
    env: {
      ...process.env,
      ...(config.env || {})
    }
  })
  const clientName = `${name}-client`
  const client = new Client(
    {
      name: clientName,
      version: Constants.APP_VERSION
    },
    {
      capabilities: {
        sampling: {}
      }
    }
  )

  if (transport.stderr) {
    transport.stderr.on('data', (chunk) => {
      console.error('stderr:', chunk.toString())
    })
  }

  await connect(client, transport)
  console.log(`${clientName} connected.`)

  client.setRequestHandler(CreateMessageRequestSchema, async (request) => {
    console.log('Sampling request received:\n', request)
    const response = await samplingTransferInvoke(request)
    console.log(response)
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
