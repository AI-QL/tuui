export interface LlmConfig {
  default: ChatbotConfig
  custom: ChatbotConfig[]
}

export interface ChatbotConfig {
  name: string

  apiKey: string
  apiCli: string

  icon: string

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
  enableThinking?: number
  enableExtraBody: boolean
  extraBody: object
  authorization: boolean
  mcp: boolean
}
