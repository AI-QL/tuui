import { defineStore } from 'pinia'

type SnackbarType = 'error' | 'success' | 'info' | 'warning' | 'unknown'

interface SnackbarState {
  isShow: boolean
  message: string
  type: SnackbarType
}

export const useSnackbarStore = defineStore('snackbarStore', {
  state: () =>
    ({
      isShow: false,
      message: '',
      type: 'unknown'
    }) as SnackbarState,

  actions: {
    showMessage(message: string, type: SnackbarType = 'unknown') {
      console.log(message)
      this.isShow = true
      this.message = message
      this.type = type
    },

    showErrorMessage(message: string) {
      this.showMessage(message, 'error')
    },
    showSuccessMessage(message: string) {
      this.showMessage(message, 'success')
    },
    showInfoMessage(message: string) {
      this.showMessage(message, 'info')
    },
    showWarningMessage(message: string) {
      this.showMessage(message, 'warning')
    },
    getIcon() {
      const icon = {
        info: 'mdi-information',
        success: 'mdi-check-circle',
        error: 'mdi-alert-circle',
        warning: 'mdi-alert',
        unknown: 'mdi-help-circle-outline'
      }

      return icon[this.type]
    }
  }
})
