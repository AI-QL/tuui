import { useI18n } from 'vue-i18n'

export function useRules() {
  const { t } = useI18n()
  return {
    required: (v: string | undefined) => !!v || t('dxt.required')
  }
}
