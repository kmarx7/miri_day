import { CATEGORIES } from '../constants/categories.js'
import { createItemModel, REPEAT_TYPES } from '../models/item.js'
import { addDays, formatYmd } from '../utils/dates.js'

// 화면 미리보기 전용 데이터입니다. storageService는 이 데이터를 자동 저장하지 않습니다.
const today = new Date()
const sampleDate = (offset) => formatYmd(addDays(today, offset))
const timestamps = {
  createdAt: '2026-08-01T09:00:00.000Z',
  updatedAt: '2026-08-01T09:00:00.000Z',
}

export const SAMPLE_ITEMS = Object.freeze([
  createItemModel({
    id: 'sample-todo-1',
    category: CATEGORIES.TODO,
    title: '면접 메일 보내기',
    dueDate: sampleDate(0),
    ...timestamps,
  }),
  createItemModel({
    id: 'sample-todo-2',
    category: CATEGORIES.TODO,
    title: '도서관 책 반납',
    dueDate: sampleDate(0),
    ...timestamps,
  }),
  createItemModel({
    id: 'sample-payment-1',
    category: CATEGORIES.PAYMENT,
    title: '월세',
    amount: 90000,
    dueDate: sampleDate(0),
    notificationOffsets: [0, 3],
    ...timestamps,
  }),
  createItemModel({
    id: 'sample-shopping-1',
    category: CATEGORIES.SHOPPING,
    title: '우산 사기',
    amount: 12000,
    dueDate: sampleDate(0),
    ...timestamps,
  }),
  createItemModel({
    id: 'sample-thought-1',
    category: CATEGORIES.THOUGHT,
    title: '주말 여행지 찾아보기',
    dueDate: sampleDate(1),
    ...timestamps,
  }),
  createItemModel({
    id: 'sample-memory-1',
    category: CATEGORIES.MEMORY,
    title: '엄마 생일',
    dueDate: sampleDate(3),
    isLunar: true,
    lunarYear: 2026,
    lunarMonth: 6,
    lunarDay: 15,
    repeatType: REPEAT_TYPES.YEARLY,
    ...timestamps,
  }),
  createItemModel({
    id: 'sample-memory-2',
    category: CATEGORIES.MEMORY,
    title: '아빠 생일',
    dueDate: sampleDate(7),
    repeatType: REPEAT_TYPES.YEARLY,
    ...timestamps,
  }),
  createItemModel({
    id: 'sample-memory-3',
    category: CATEGORIES.MEMORY,
    title: '1000일 기념일',
    dueDate: sampleDate(12),
    repeatType: REPEAT_TYPES.YEARLY,
    ...timestamps,
  }),
  createItemModel({
    id: 'sample-memory-4',
    category: CATEGORIES.MEMORY,
    title: '할머니 제사',
    dueDate: sampleDate(18),
    isLunar: true,
    lunarYear: 2026,
    lunarMonth: 6,
    lunarDay: 24,
    repeatType: REPEAT_TYPES.YEARLY,
    ...timestamps,
  }),
  createItemModel({
    id: 'sample-memory-5',
    category: CATEGORIES.MEMORY,
    title: '결혼기념일',
    dueDate: sampleDate(25),
    repeatType: REPEAT_TYPES.YEARLY,
    ...timestamps,
  }),
])
