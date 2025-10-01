import { z, ZodTypeAny } from 'zod'

import {
  TextContentSchema as TextContentPartSchema,
  PromptMessage,
  SamplingMessage
} from '@modelcontextprotocol/sdk/types'

type Primitive = string | number | boolean | bigint | null | undefined
type Flatten<T> = T extends Primitive
  ? T
  : T extends Array<infer U>
    ? Array<Flatten<U>>
    : T extends Set<infer U>
      ? Set<Flatten<U>>
      : T extends Map<infer K, infer V>
        ? Map<Flatten<K>, Flatten<V>>
        : T extends object
          ? {
              [K in keyof T]: Flatten<T[K]>
            }
          : T
type Infer<Schema extends ZodTypeAny> = Flatten<z.infer<Schema>>

const TextContent = z.string()

// Either a URL of the image or the base64 encoded image data.
const ImageURL = z.string()

const RefusalContentPartSchema = z
  .object({
    type: z.literal('refusal'),
    text: z.string()
  })
  .passthrough()

const ImageLevel = z.union([z.literal('auto'), z.literal('low'), z.literal('high')])

const ImageContentPartSchema = z.object({
  type: z.literal('image_url'),
  image_url: z.object({
    url: ImageURL,
    detail: ImageLevel.optional()
  })
})

const ToolCallSchema = z.object({
  id: z.string(),
  type: z.literal('function'),
  function: z.object({
    name: z.string(),
    arguments: z.string()
  })
})

const SystemMessageSchema = z.object({
  content: z.union([TextContent, z.array(TextContentPartSchema)]),
  role: z.literal('system'),
  name: z.string().optional()
})

const UserMessageSchema = z.object({
  content: z.union([
    TextContent,
    z.array(z.union([TextContentPartSchema, ImageContentPartSchema]))
  ]),
  role: z.literal('user'),
  name: z.string().optional()
})

const AssistantMessageSchema = z.object({
  content: z.union([
    TextContent,
    z.array(z.union([TextContentPartSchema, RefusalContentPartSchema]))
  ]),
  reasoning_content: z.string().optional(),
  tool_calls: z.array(ToolCallSchema).optional(),
  role: z.literal('assistant'),
  name: z.string().optional()
})

const ToolMessageSchema = z.object({
  content: z.union([TextContent, z.array(TextContentPartSchema)]),
  role: z.literal('tool'),
  tool_call_id: z.string()
})

const ChatCompletionRequestMessageSchema = z.union([
  UserMessageSchema,
  AssistantMessageSchema,
  ToolMessageSchema
])

const ChatCompletionMessageSchema = z.union([
  SystemMessageSchema,
  UserMessageSchema,
  AssistantMessageSchema,
  ToolMessageSchema
])

const ChatCompletionResponseMessageSchema = z.object({
  content: z.string(),
  refusal: z.string().optional(),
  reasoning_content: z.string().optional(),

  tool_calls: z.array(ToolCallSchema).optional(),
  role: z.literal('assistant')
})

export type ToolCall = Infer<typeof ToolCallSchema>
// type SystemMessage = Infer<typeof SystemMessageSchema>
export type UserMessage = Infer<typeof UserMessageSchema>
export type AssistantMessage = Infer<typeof AssistantMessageSchema>
export type ToolMessage = Infer<typeof ToolMessageSchema>

type TextContentPart = Infer<typeof TextContentPartSchema>
// type RefusalContentPart = Infer<typeof RefusalContentPartSchema>
type ImageContentPart = Infer<typeof ImageContentPartSchema>

// ============================================================================
// ## MCP SDK compatible type
// ============================================================================

// ## Needs to be converted to an OpenAI API compatible type
export type McpSamplingResponseMessage = SamplingMessage

// ============================================================================
// ## OpenAI API compatible type
// ============================================================================

// ## Supports text and images only
export type ChatCompletionRequestContent = TextContentPart | ImageContentPart

export type ChatCompletionRequestMessage = Infer<typeof ChatCompletionRequestMessageSchema>

export type ChatCompletionPromptMessage = PromptMessage

export type ChatCompletionResponseMessage = Infer<typeof ChatCompletionResponseMessageSchema>

export type ChatCompletionMessage = Infer<typeof ChatCompletionMessageSchema>

export type ChatConversationMessage = ChatCompletionRequestMessage | ChatCompletionResponseMessage
