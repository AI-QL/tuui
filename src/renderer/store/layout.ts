import { defineStore } from 'pinia'

export type RoutePath = '/' | '/chat' | '/agent' | '/setting'

const PATH_TO_SCREEN = {
  '/': 0,
  '/chat': 1,
  '/agent': 2,
  '/setting': 3
} as Record<RoutePath, number>

type ScreenKey = keyof typeof PATH_TO_SCREEN
type ScreenValue = (typeof PATH_TO_SCREEN)[ScreenKey]

type LoadingStatus = 'start' | 'stop' | false

export const getScreenFromPath = (path: string): ScreenValue => {
  return PATH_TO_SCREEN[path as ScreenKey] ?? 0
}

export const useLayoutStore = defineStore('layoutStore', {
  state: () => ({
    sidebar: true,
    apiKeyShow: false,
    mcpLoading: false as LoadingStatus,
    screen: 0 // The selected screen is a list: 0,1,2,...
  })
})
