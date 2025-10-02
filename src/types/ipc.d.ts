import type {
  SamplingRequest,
  SamplingResponse,
  ElicitRequest,
  ElicitResponse,
  CommandRequest,
  CommandResponse
} from '@/main/types'

export type { SamplingRequest, SamplingResponse, ElicitRequest, ElicitResponse, CommandResponse }

export type IpcSamplingRequest = {
  request: SamplingRequest
  responseChannel: string
}

export type IpcSamplingRequestCallback = (_event: Event, _progress: IpcSamplingRequest) => void

export type IpcElicitRequest = {
  request: ElicitRequest
  responseChannel: string
}

export type IpcElicitRequestCallback = (_event: Event, _progress: IpcElicitRequest) => void

export type IpcCommandRequest = {
  request: CommandRequest
}

export type IpcCommandRequestCallback = (_event: Event, _progress: IpcCommandRequest) => void
