import { Notification } from 'electron'
import Constants from './Constants'

export interface NotificationOptions {
  title?: string
  body: string
  silent?: boolean
  icon?: string
}

export interface NotificationEvents {
  onClick?: () => void
  onShow?: () => void
  onClose?: () => void
}

export function showNotification(
  options: NotificationOptions,
  events?: NotificationEvents
): boolean {
  if (!Notification.isSupported()) {
    return false
  }

  try {
    const notification = new Notification({
      title: options.title ?? Constants.APP_NAME,
      body: options.body,
      silent: options.silent ?? false,
      icon: options.icon ?? Constants.ASSETS_PATH.icon_raw
    })

    if (events?.onClick) {
      notification.on('click', events.onClick)
    }

    if (events?.onShow) {
      notification.on('show', events.onShow)
    }

    if (events?.onClose) {
      notification.on('close', events.onClose)
    }

    notification.show()
    return true
  } catch (error) {
    console.error('Failed to show notification:', error)
    return false
  }
}

export function isNotificationSupported(): boolean {
  return Notification.isSupported()
}
