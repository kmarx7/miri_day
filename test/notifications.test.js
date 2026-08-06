import assert from 'node:assert/strict'
import test from 'node:test'
import { CATEGORIES } from '../src/constants/categories.js'
import { REPEAT_TYPES } from '../src/models/item.js'
import { getNotificationPermission, synchronizeNotifications } from '../src/services/notificationService.js'
import {
  allocateNotificationId,
  buildItemNotificationPlans,
  buildTestNotificationPlan,
  createNotificationKey,
  createSeoulNotificationDate,
} from '../src/utils/notifications.js'

function item(overrides = {}) {
  return {
    id: 'item-1',
    category: CATEGORIES.TODO,
    title: '준비물 챙기기',
    dueDate: '2026-08-10',
    dueTime: null,
    completed: false,
    isLunar: false,
    lunarMonth: null,
    lunarDay: null,
    isLeapMonth: false,
    repeatType: REPEAT_TYPES.NONE,
    notificationOffsets: [7, 3, 1, 0],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

test('알림 시각은 실행 환경과 무관하게 Asia/Seoul 오전 9시로 계산한다', () => {
  assert.equal(createSeoulNotificationDate('2026-08-10').toISOString(), '2026-08-10T00:00:00.000Z')
})

test('저장된 예정 시간을 Asia/Seoul 기준 알림 시각으로 사용한다', () => {
  assert.equal(createSeoulNotificationDate('2026-08-10', '18:40').toISOString(), '2026-08-10T09:40:00.000Z')

  const [plan] = buildItemNotificationPlans(item({ dueTime: '18:40', notificationOffsets: [0] }), {
    now: new Date('2026-08-01T00:00:00+09:00'),
  })
  assert.equal(plan.schedule.at.toISOString(), '2026-08-10T09:40:00.000Z')
})

test('Free는 당일만, Pro는 D-7·D-3·하루 전·당일 알림을 만든다', () => {
  const now = new Date('2026-08-01T00:00:00+09:00')
  const freePlans = buildItemNotificationPlans(item(), { now, isPro: false })
  const proPlans = buildItemNotificationPlans(item(), { now, isPro: true })

  assert.deepEqual(freePlans.map((plan) => plan.extra.offset), [0])
  assert.deepEqual(proPlans.map((plan) => plan.extra.offset), [7, 3, 1, 0])
})

test('이미 지난 시점과 완료된 아이템은 예약하지 않는다', () => {
  const afterReminder = new Date('2026-08-10T10:00:00+09:00')
  assert.deepEqual(buildItemNotificationPlans(item({ notificationOffsets: [0] }), { now: afterReminder }), [])
  assert.deepEqual(buildItemNotificationPlans(item({ completed: true }), { now: new Date('2026-08-01T00:00:00+09:00'), isPro: true }), [])
})

test('납부·구매 일정 알림을 카테고리별로 구분한다', () => {
  const now = new Date('2026-08-01T00:00:00+09:00')
  const payment = buildItemNotificationPlans(item({ category: CATEGORIES.PAYMENT, notificationOffsets: [0] }), { now })[0]
  const shopping = buildItemNotificationPlans(item({ category: CATEGORIES.SHOPPING, notificationOffsets: [0] }), { now })[0]

  assert.match(payment.title, /납부 일정/)
  assert.match(shopping.title, /구매 일정/)
})

test('예약 ID가 이미 사용 중이면 32비트 범위에서 다음 ID를 할당한다', () => {
  const key = createNotificationKey('item-1', '2026-08-10', 0)
  const firstId = allocateNotificationId(key)
  const reserved = new Map([[firstId, '다른 알림']])
  const nextId = allocateNotificationId(key, reserved)

  assert.notEqual(nextId, firstId)
  assert.ok(nextId > 0 && nextId <= 2_147_483_647)
  assert.equal(reserved.get(nextId), key)
})

test('Pro 반복 일정은 저장 원본과 분리된 미래 발생 일정만 예약한다', () => {
  const plans = buildItemNotificationPlans(item({
    dueDate: '2026-07-31',
    repeatType: REPEAT_TYPES.MONTHLY,
    notificationOffsets: [0],
  }), {
    now: new Date('2026-08-01T00:00:00+09:00'),
    isPro: true,
    scheduleDays: 40,
  })

  assert.deepEqual(plans.map((plan) => plan.extra.occurrenceDate), ['2026-08-31'])
  assert.match(plans[0].title, /반복 일정/)
})

test('Pro 음력 반복 기념일은 다음 양력 발생일에 예약한다', () => {
  const plans = buildItemNotificationPlans(item({
    category: CATEGORIES.MEMORY,
    dueDate: '2025-07-09',
    repeatType: REPEAT_TYPES.YEARLY,
    isLunar: true,
    lunarMonth: 6,
    lunarDay: 15,
    notificationOffsets: [0],
  }), {
    now: new Date('2026-01-01T00:00:00+09:00'),
    isPro: true,
  })

  assert.equal(plans[0].extra.occurrenceDate, '2026-07-28')
  assert.match(plans[0].title, /음력 기념일/)
})

test('5분 후 테스트 알림은 정확히 5분 뒤 시각을 준비한다', () => {
  const now = new Date('2026-08-05T12:00:00+09:00')
  const plan = buildTestNotificationPlan(now)
  assert.equal(plan.schedule.at.getTime() - now.getTime(), 5 * 60 * 1000)
})

test('웹 환경에서는 알림 권한 확인이 오류 없는 대체 결과를 반환한다', async () => {
  assert.deepEqual(await getNotificationPermission(), { supported: false, display: 'granted' })
})

test('동기화는 기존 미리꼭 예약을 취소하고 현재 아이템만 중복 없이 다시 예약한다', async () => {
  const calls = { channels: [], canceled: [], scheduled: [] }
  const plugin = {
    createChannel: async (channel) => calls.channels.push(channel),
    checkPermissions: async () => ({ display: 'granted' }),
    getPending: async () => ({
      notifications: [
        { id: 10, extra: { managedBy: 'mirikkok', itemId: 'old-item' } },
        { id: 20, extra: { managedBy: 'another-app' } },
      ],
    }),
    cancel: async ({ notifications }) => calls.canceled.push(...notifications),
    schedule: async ({ notifications }) => calls.scheduled.push(...notifications),
  }

  const result = await synchronizeNotifications(plugin, [
    item({ notificationOffsets: [0] }),
  ], { now: new Date('2026-08-01T00:00:00+09:00') })

  assert.equal(calls.channels[0].id, 'mirikkok_reminders')
  assert.deepEqual(calls.canceled, [{ id: 10 }])
  assert.equal(calls.scheduled.length, 1)
  assert.notEqual(calls.scheduled[0].id, 20)
  assert.equal(calls.scheduled[0].channelId, 'mirikkok_reminders')
  assert.equal(result.scheduledCount, 1)
})

test('권한이 거부되면 기존 예약을 변경하지 않고 안내 가능한 상태를 반환한다', async () => {
  let pendingChecked = false
  const plugin = {
    createChannel: async () => {},
    checkPermissions: async () => ({ display: 'denied' }),
    getPending: async () => {
      pendingChecked = true
      return { notifications: [] }
    },
  }

  const result = await synchronizeNotifications(plugin, [item()])
  assert.equal(pendingChecked, false)
  assert.deepEqual(result, { supported: true, display: 'denied', scheduledCount: 0 })
})
