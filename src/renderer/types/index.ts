export const CHATBOT_DEFAULTS = {
  name: '',
  apiKey: '',
  apiCli: '',

  url: 'https://api2.aiql.com',
  urlList: ['https://api2.aiql.com'],

  path: '/chat/completions',
  pathList: [
    '/chat/completions',
    '/v1/chat/completions',
    '/v1/openai/chat/completions',
    '/openai/v1/chat/completions'
  ],

  model: 'Qwen/Qwen3-32B',
  modelList: ['Qwen/Qwen3-32B', 'Qwen/Qwen3-Coder-480B-A35B-Instruct-Turbo', 'openai/gpt-oss-120b'],

  authPrefix: 'Bearer',
  authPrefixList: ['Bearer', 'Base', 'Token'],

  maxTokensPrefixList: ['max_tokens', 'max_completion_tokens', 'max_new_tokens'],
  maxTokensPrefix: 'max_tokens',
  maxTokensValue: undefined,

  temperature: undefined,
  topP: undefined,
  method: 'POST',
  contentType: 'application/json',
  stream: true,
  reasoningEffort: undefined,
  authorization: true,
  mcp: true
}

export const REASONING_EFFORT = ['false', 'none', 'low', 'medium', 'high']
