export interface ChatbotConfig {
  name: string

  apiKey: string
  apiCli: string

  url: string
  urlList: string[]

  path: string
  pathList: string[]

  model: string
  modelList: string[]

  authPrefix: string
  authPrefixList: string[]

  maxTokensValue?: string
  maxTokensPrefix: string
  maxTokensPrefixList: string[]

  temperature?: string
  topP?: string
  method: string
  contentType: string
  stream: boolean
  reasoningEffort?: number
  authorization: boolean
  mcp: boolean
}
