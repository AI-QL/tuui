import { useMessageStore } from '@/renderer/store/message'
import { useSnackbarStore } from '@/renderer/store/snackbar'
import { useChatbotStore } from '@/renderer/store/chatbot'
import { useAgentStore } from '@/renderer/store/agent'
import { useMcpStore } from '@/renderer/store/mcp'

import type {
  AssistantMessage,
  ToolCall,
  ChatCompletionRequestMessage,
  ChatCompletionResponseMessage
} from '@/renderer/types/message'

const isObjectEmpty = (obj?: Record<string, unknown>): boolean => {
  return !!obj && Object.keys(obj).length === 0
}

export const isEmptyTools = (tools: any): boolean => {
  if (!tools) {
    return true
  } else if (Array.isArray(tools)) {
    if (tools.length === 0) {
      return true
    } else {
      return isObjectEmpty(tools[0])
    }
  } else {
    return true
  }
}

const promptMessage = (
  conversation: ChatCompletionRequestMessage[],
  systemPrompt: string | null
): ChatCompletionRequestMessage[] => {
  if (systemPrompt) {
    return [{ content: systemPrompt, role: 'system' }, ...conversation]
  } else {
    return [...conversation]
  }
}

export const createCompletion = async (rawconversation, sampling: any = null) => {
  const snackbarStore = useSnackbarStore()

  const messageStore = useMessageStore()

  const mcpStore = useMcpStore()
  const agentStore = useAgentStore()

  const allChatbotStore = useChatbotStore()

  const chatbotStore = allChatbotStore.chatbots[allChatbotStore.selectedChatbotId]

  console.log(chatbotStore)

  const conversation = rawconversation.reduce((newConversation, item) => {
    if (item.role === 'assistant') {
      const { _reasoningContent, ...rest } = item
      newConversation.push(rest)
    }
    // (item.role === "user" && item.content[0].type === "image_url") {
    //     // Image is too large, only latest query could be kept
    //     newConversation = [item];
    // }
    else {
      newConversation.push(item)
    }
    return newConversation
  }, [])
  // const conversation = rawconversation
  try {
    messageStore.generating = true
    // Create a completion (axios is not used here because it does not support streaming)
    // TODO: fix any
    const headers: any = {
      'Content-Type': chatbotStore.contentType
    }

    if (chatbotStore.apiKey)
      headers.Authorization = `${chatbotStore.authPrefix} ${chatbotStore.apiKey}`

    const body: any = {
      model: chatbotStore.model,
      stream: chatbotStore.stream
    }

    let target: ChatCompletionResponseMessage[]

    if (!sampling) {
      target = messageStore.conversation

      body.messages = promptMessage(conversation, agentStore.getPrompt())

      if (chatbotStore.maxTokensValue) {
        body[chatbotStore.maxTokensType] = parseInt(chatbotStore.maxTokensValue)
      }

      if (chatbotStore.temperature) {
        body.temperature = parseFloat(chatbotStore.temperature)
      }

      if (chatbotStore.topP) {
        body.top_p = parseFloat(chatbotStore.topP)
      }

      if (chatbotStore.mcp) {
        const tools = await agentStore.getTools()
        if (tools && tools.length > 0) {
          body.tools = tools
        }
      }
    } else {
      target = sampling.target
      const msg = rawconversation.map((item) => ({
        role: item.role,
        content: [mcpStore.convertItem(item.content)]
      }))
      body.messages = promptMessage(msg, sampling.systemPrompt)
      body.temperature = sampling.temperature
      if (sampling.maxTokens) {
        body[chatbotStore.maxTokensType] = parseInt(sampling.maxTokens)
      }
    }

    const request = {
      headers,
      method: chatbotStore.method,
      body: JSON.stringify(body)
    }

    const completion = await fetch(
      chatbotStore.url + (chatbotStore.path ? chatbotStore.path : ''),
      request
    )

    console.log(completion)

    // Handle errors
    if (!completion.ok) {
      const errorData = await completion.json()
      console.log(errorData.error?.message)
      if (errorData.error?.message)
        snackbarStore.showErrorMessage(`${completion.status}: ${errorData.error.message}`)
      else if (errorData.detail[0]?.msg)
        snackbarStore.showErrorMessage(
          `${completion.status}${' - ' + errorData.detail[0]?.loc + ':' || ':'} ${errorData.detail[0]?.msg}`
        )
      else snackbarStore.showErrorMessage(`${completion.status}: ${completion.statusText}`)
      return
    }

    // Create a reader
    const reader = completion.body?.getReader()
    if (!reader) {
      snackbarStore.showErrorMessage('snackbar.parseStreamFail')
    }

    // Add the bot message
    target.push({
      content: '',
      reasoning_content: '',
      tool_calls: [],
      role: 'assistant'
    })

    const buffer = ''

    // Read the stream
    await read(reader, target.at(-1), buffer, chatbotStore.stream)
  } catch (error: any) {
    snackbarStore.showErrorMessage(error?.message)
  } finally {
    messageStore.generating = false
  }
}

const read = async (reader, target, buffer, stream) => {
  // TextDecoder is a built-in object that allows you to convert a stream of bytes into a string
  const decoder = new TextDecoder()
  // Destructure the value returned by reader.read()
  const { done, value } = await reader.read()
  const messageStore = useMessageStore()

  // If the stream is done reading, release the lock on the reader
  if (done || !messageStore.generating) {
    messageStore.generating = false
    return reader.releaseLock()
  }
  // Convert the stream of bytes into a string
  const chunks = decoder.decode(value)

  if (stream) {
    // Split stream
    const parts = chunks.split('\n')

    if (parts.length === 1) {
      buffer += parts[0]
      return read(reader, target, buffer, stream)
    }

    if (buffer.length > 0) {
      parts[0] = buffer + parts[0]
      buffer = ''
    }

    const last = parts[parts.length - 1]
    if (last && last.length > 0) {
      buffer = parts.pop()
    }

    parts
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .forEach((line) => {
        const pos = line.indexOf(':')
        const name = line.substring(0, pos)
        if (name !== 'data') {
          return
        }
        const content = line.substring(pos + 1).trim()
        if (content.length === 0) {
          return
        } else if (content === '[DONE]') {
          return
        }
        parseJson(content, target)
      })
  } else {
    parseJson(chunks, target)
  }

  // Repeat the process
  return read(reader, target, buffer, stream)
}

const parseJson = (content, target) => {
  try {
    const parsed = JSON.parse(content)
    // const choice =
    parseChoices(parsed, target)
    // parseChoice(choice, target)
  } catch (e) {
    console.log(e, content)
    parseChoice(content, target)
  }
}

const parseChoices = (parsed, target) => {
  if ('choices' in parsed) {
    return parsed.choices.map((choice) => {
      const content = choice.delta || choice.message
      return parseChoice(content, target)
    })
  } else if ('response' in parsed) {
    return parseChoice(parsed.response, target)
  } else {
    return parseChoice(parsed, target)
  }
}

const parseChoice = (choice: AssistantMessage, target: AssistantMessage) => {
  if (choice) {
    if (target.role === 'assistant') {
      if (typeof choice === 'string') {
        target.content += choice
      } else if (typeof choice.content === 'string') {
        target.content += choice.content
      } else if (typeof choice.reasoning_content === 'string') {
        target.reasoning_content += choice.reasoning_content
      }
      parseTool(choice.tool_calls, target)
    }
  }
}

const parseTool = (tools: ToolCall[] | undefined, target: AssistantMessage) => {
  // Early return if no tools to process
  if (!tools) return

  // Initialize tool_calls array if it doesn't exist
  if (!target.tool_calls) {
    target.tool_calls = []
  }

  tools.forEach((tool) => {
    const toolCalls = target.tool_calls!
    const lastTool = toolCalls[toolCalls.length - 1]
    const sourceFunc = tool.function

    // Case 1: Merge with last tool call when:
    // - There is a previous tool call AND
    // - (Current tool has no ID OR IDs match)
    if (lastTool && (!tool.id || lastTool.id === tool.id)) {
      const targetFunc = lastTool.function

      // Merge each property from source function
      Object.keys(sourceFunc).forEach((key) => {
        const value = sourceFunc[key]

        // Skip null values (don't overwrite existing values with null)
        if (value === null) return

        // Merge strategy:
        // - If target has existing non-empty value: concatenate
        // - Otherwise: overwrite
        if (targetFunc[key] && targetFunc[key] !== '{}') {
          targetFunc[key] += value
        } else {
          targetFunc[key] = value
        }
      })
    }
    // Case 2: Add as new tool call
    else {
      // Ensure arguments has a default empty object if not provided
      if (sourceFunc.arguments == null) {
        sourceFunc.arguments = '{}'
      }
      toolCalls.push(tool)
    }
  })
}
