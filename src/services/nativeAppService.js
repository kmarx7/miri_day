import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

export async function registerAndroidBackButton(onBackButton) {
  if (Capacitor.getPlatform() !== 'android') return () => {}

  const listener = await CapacitorApp.addListener('backButton', () => {
    onBackButton({ exitApp: () => CapacitorApp.exitApp() })
  })

  return () => listener.remove()
}
