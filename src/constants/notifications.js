export const NOTIFICATION_CHANNEL = Object.freeze({
  id: 'mirikkok_reminders',
  name: '미리꼭 일정 알림',
  description: '할 일, 납부, 구매, 반복 일정과 기념일을 미리 알려드려요.',
  importance: 3,
})

export const NOTIFICATION_OFFSETS = Object.freeze([7, 3, 1, 0])
export const FREE_NOTIFICATION_OFFSETS = Object.freeze([0])
export const NOTIFICATION_HOUR_KST = 9
export const NOTIFICATION_SCHEDULE_DAYS = 400
export const NOTIFICATION_OWNER = 'mirikkok'

export const NOTIFICATION_OFFSET_LABELS = Object.freeze({
  7: 'D-7',
  3: 'D-3',
  1: '하루 전',
  0: '당일',
})

export function getAllowedNotificationOffsets(isPro) {
  return isPro ? NOTIFICATION_OFFSETS : FREE_NOTIFICATION_OFFSETS
}
