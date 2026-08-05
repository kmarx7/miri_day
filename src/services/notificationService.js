import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'
import { NOTIFICATION_CHANNEL, NOTIFICATION_OWNER } from '../constants/notifications.js'
import { buildNotificationPlans, buildTestNotificationPlan } from '../utils/notifications.js'

let syncQueue = Promise.resolve()

export function isAndroidNotificationSupported() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

export async function getNotificationPermission() {
  if (!isAndroidNotificationSupported()) return { supported: false, display: 'granted' }
  const permission = await LocalNotifications.checkPermissions()
  return { supported: true, display: permission.display }
}

export async function requestNotificationPermission() {
  const current = await getNotificationPermission()
  if (!current.supported || current.display === 'granted') return current

  const permission = await LocalNotifications.requestPermissions()
  return { supported: true, display: permission.display }
}

export async function initializeNotifications() {
  if (!isAndroidNotificationSupported()) return { supported: false }
  await LocalNotifications.createChannel(NOTIFICATION_CHANNEL)
  return { supported: true }
}

function isManagedNotification(notification) {
  return notification?.extra?.managedBy === NOTIFICATION_OWNER
}

export async function synchronizeNotifications(plugin, items, { isPro = false, now = new Date() } = {}) {
  await plugin.createChannel(NOTIFICATION_CHANNEL)
  const permission = await plugin.checkPermissions()
  if (permission.display !== 'granted') {
    return { supported: true, display: permission.display, scheduledCount: 0 }
  }

  const pending = await plugin.getPending()
  const managed = pending.notifications.filter(isManagedNotification)
  const unmanaged = pending.notifications.filter((notification) => !isManagedNotification(notification))
  if (managed.length > 0) {
    await plugin.cancel({
      notifications: managed.map(({ id }) => ({ id })),
    })
  }

  const reservedIds = new Map(unmanaged.map(({ id }) => [id, `external:${id}`]))
  const plans = buildNotificationPlans(items, { isPro, now, reservedIds })
  if (plans.length > 0) {
    await plugin.schedule({
      notifications: plans.map((plan) => ({
        ...plan,
        channelId: NOTIFICATION_CHANNEL.id,
        autoCancel: true,
      })),
    })
  }

  return { supported: true, display: 'granted', scheduledCount: plans.length }
}

async function performSync(items, options) {
  if (!isAndroidNotificationSupported()) return { supported: false, scheduledCount: 0 }
  return synchronizeNotifications(LocalNotifications, items, options)
}

export function syncAllItemNotifications(items, options = {}) {
  syncQueue = syncQueue.catch(() => {}).then(() => performSync(items, options))
  return syncQueue
}

export async function scheduleFiveMinuteTestNotification(now = new Date()) {
  if (!isAndroidNotificationSupported()) return { supported: false, scheduled: false }
  await initializeNotifications()
  const permission = await requestNotificationPermission()
  if (permission.display !== 'granted') return { ...permission, scheduled: false }

  const plan = buildTestNotificationPlan(now)
  await LocalNotifications.schedule({
    notifications: [{
      ...plan,
      channelId: NOTIFICATION_CHANNEL.id,
      autoCancel: true,
    }],
  })
  return { supported: true, display: 'granted', scheduled: true, at: plan.schedule.at }
}
