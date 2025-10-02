import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'

type LocaleObjectType = {
  title: string
  value: string
  name: string
  src: string
}

interface LocaleStoreState {
  selected: string | undefined
  list: LocaleObjectType[]
  fallback: LocaleObjectType
}

export const useLocaleStore = defineStore('localeStore', {
  state: () =>
    ({
      selected: undefined,
      // Sourced from the 'flag-icons' npm package
      list: [
        { title: 'English', value: 'en', name: 'united-states', src: 'flags/us.svg' },
        { title: '简体中文', value: 'zh', name: 'china', src: 'flags/cn.svg' }
      ],
      fallback: { title: 'English', value: 'en', name: 'united-states', src: 'flags/us.svg' }
    }) as LocaleStoreState,
  getters: {},
  persist: {
    include: ['selected']
  },
  actions: {
    getLocale() {
      const { locale } = useI18n()
      return locale.value
    },
    change(lang: string) {
      const { locale } = useI18n()
      locale.value = lang
    },
    getIcon() {
      const value = this.getLocale()
      const item = this.list.find((lang) => lang.value === value) || this.fallback
      return item.src
    }
  }
})
