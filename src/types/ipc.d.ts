import type { SamplingRequest, SamplingResponse, ElicitRequest, ElicitResponse } from '@/main/types'

export type { SamplingRequest, SamplingResponse, ElicitRequest, ElicitResponse }

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
