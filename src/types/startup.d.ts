export interface StartupConfig {
  news: StartupNewsType[]
}

export interface StartupNewsType {
  img: string
  title: string
  subtitle: string
  duration: string
  link: string
  cover?: boolean
}
