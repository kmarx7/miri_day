import { useEffect, useMemo, useState } from 'react'
import { REPEAT_TYPES } from '../models/item.js'
import { FEATURES } from '../services/entitlementService.js'
import {
  createMemoryItemValues,
  getMemoryDayOptions,
  resolveMemorySchedule,
  toMemoryFormValues,
} from '../utils/memorySchedule.js'

export const MEMORY_CALENDAR_OPTIONS = Object.freeze([
  { value: false, label: '양력' },
  { value: true, label: '음력' },
])

// 「반복 없음」과 「1번」은 같은 값을 저장하지만 버튼은 따로 보여줍니다.
export const MEMORY_REPEAT_CHOICES = Object.freeze({
  NONE: 'none',
  ONCE: 'once',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
})

export const MEMORY_REPEAT_CHOICE_OPTIONS = Object.freeze([
  { value: MEMORY_REPEAT_CHOICES.NONE, label: '반복 없음', repeatType: REPEAT_TYPES.NONE },
  { value: MEMORY_REPEAT_CHOICES.ONCE, label: '1번', repeatType: REPEAT_TYPES.NONE },
  { value: MEMORY_REPEAT_CHOICES.MONTHLY, label: '매월', repeatType: REPEAT_TYPES.MONTHLY },
  { value: MEMORY_REPEAT_CHOICES.YEARLY, label: '매년', repeatType: REPEAT_TYPES.YEARLY },
])

export function getMemoryRepeatType(choice) {
  return MEMORY_REPEAT_CHOICE_OPTIONS.find((option) => option.value === choice)?.repeatType
    ?? REPEAT_TYPES.NONE
}

function getRepeatChoice(repeatType) {
  if (repeatType === REPEAT_TYPES.MONTHLY) return MEMORY_REPEAT_CHOICES.MONTHLY
  if (repeatType === REPEAT_TYPES.YEARLY) return MEMORY_REPEAT_CHOICES.YEARLY
  return MEMORY_REPEAT_CHOICES.NONE
}

/**
 * 기억할 것 입력 폼의 상태와 규칙을 담습니다. 홈의 + 시트와 기억할 것 화면의
 * 추가 시트가 같은 화면을 쓰도록 두 곳에서 이 훅을 공유합니다.
 *
 * 제목은 카테고리를 바꿔도 유지되어야 해서 호출하는 쪽이 들고 있습니다.
 */
export function useMemoryForm({ active, item = null, isPro = false, onRequirePro } = {}) {
  const [memoryKind, setMemoryKind] = useState(() => toMemoryFormValues(null).memoryKind)
  const [month, setMonth] = useState(1)
  const [day, setDay] = useState(1)
  const [isLunar, setIsLunar] = useState(false)
  const [isLeapMonth, setIsLeapMonth] = useState(false)
  const [repeatChoice, setRepeatChoice] = useState(MEMORY_REPEAT_CHOICES.NONE)
  const [notificationOffsets, setNotificationOffsets] = useState([0])
  const [memo, setMemo] = useState('')
  const [memoExpanded, setMemoExpanded] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!active) return

    const values = toMemoryFormValues(item)
    setMemoryKind(values.memoryKind)
    setMonth(values.month)
    setDay(values.day)
    setIsLunar(values.isLunar)
    setIsLeapMonth(values.isLeapMonth)
    setRepeatChoice(item
      ? getRepeatChoice(item.repeatType)
      : (isPro ? MEMORY_REPEAT_CHOICES.YEARLY : MEMORY_REPEAT_CHOICES.NONE))
    setNotificationOffsets(item ? (item.notificationOffsets ?? []) : [0])
    setMemo(values.memo)
    setMemoExpanded(Boolean(values.memo))
    setNotice('')
  }, [active, isPro, item])

  const dayOptions = useMemo(() => getMemoryDayOptions(month, isLunar), [isLunar, month])
  const schedule = useMemo(
    () => resolveMemorySchedule({ month, day, isLunar, isLeapMonth }),
    [day, isLeapMonth, isLunar, month],
  )

  const selectCalendar = (nextIsLunar) => {
    if (nextIsLunar === isLunar) return
    setIsLunar(nextIsLunar)
    setIsLeapMonth(false)
    const maxDay = getMemoryDayOptions(month, nextIsLunar).length
    if (day > maxDay) setDay(maxDay)
    if (nextIsLunar && repeatChoice === MEMORY_REPEAT_CHOICES.MONTHLY) {
      setRepeatChoice(MEMORY_REPEAT_CHOICES.NONE)
      setNotice('음력 일정은 현재 매년 반복만 지원해요.')
      return
    }
    setNotice('')
  }

  const selectMonth = (nextMonth) => {
    setMonth(nextMonth)
    const maxDay = getMemoryDayOptions(nextMonth, isLunar).length
    if (day > maxDay) setDay(maxDay)
  }

  const selectRepeatChoice = (choice) => {
    const nextRepeatType = getMemoryRepeatType(choice)
    if (nextRepeatType === REPEAT_TYPES.MONTHLY && isLunar) {
      setNotice('음력 일정은 현재 매년 반복만 지원해요.')
      return
    }
    if (nextRepeatType !== REPEAT_TYPES.NONE && !isPro && nextRepeatType !== item?.repeatType) {
      setNotice('반복 일정은 Pro에서 사용할 수 있어요.')
      onRequirePro?.(FEATURES.RECURRING_SCHEDULES)
      return
    }
    setRepeatChoice(choice)
    setNotice('')
  }

  const toggleNotificationOffset = (offset) => {
    if (offset !== 0 && !isPro && !notificationOffsets.includes(offset)) {
      setNotice('D-7·D-3·하루 전 사전 알림은 Pro에서 사용할 수 있어요.')
      onRequirePro?.(FEATURES.ADVANCE_NOTIFICATIONS)
      return
    }

    setNotificationOffsets((current) => (
      current.includes(offset)
        ? current.filter((value) => value !== offset)
        : [...current, offset]
    ))
    setNotice('')
  }

  const buildValues = (title) => {
    const repeatType = getMemoryRepeatType(repeatChoice)
    return createMemoryItemValues({
      title,
      memoryKind,
      month,
      day,
      isLunar,
      isLeapMonth,
      repeatType: isPro || repeatType === item?.repeatType ? repeatType : REPEAT_TYPES.NONE,
      notificationOffsets,
      memo,
    })
  }

  return {
    memoryKind,
    setMemoryKind,
    month,
    day,
    setDay,
    isLunar,
    isLeapMonth,
    setIsLeapMonth,
    repeatChoice,
    notificationOffsets,
    memo,
    setMemo,
    memoExpanded,
    setMemoExpanded,
    notice,
    setNotice,
    dayOptions,
    schedule,
    selectCalendar,
    selectMonth,
    selectRepeatChoice,
    toggleNotificationOffset,
    buildValues,
  }
}
