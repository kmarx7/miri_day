import { CATEGORIES } from '../constants/categories.js'
import { createItemModel, REPEAT_TYPES } from '../models/item.js'

// 화면 미리보기 전용 데이터입니다. storageService는 이 데이터를 자동 저장하지 않습니다.
export const SAMPLE_ITEMS = Object.freeze([
  createItemModel({
    id: 'sample-todo-1',
    category: CATEGORIES.TODO,
    title: '면접 메일 보내기',
    dueDate: '2026-08-05',
    createdAt: '2026-08-01T09:00:00.000Z',
    updatedAt: '2026-08-01T09:00:00.000Z',
  }),
  createItemModel({
    id: 'sample-payment-1',
    category: CATEGORIES.PAYMENT,
    title: '월세',
    amount: 90000,
    dueDate: '2026-08-05',
    notificationOffsets: [0, 3],
    createdAt: '2026-08-01T09:00:00.000Z',
    updatedAt: '2026-08-01T09:00:00.000Z',
  }),
  createItemModel({
    id: 'sample-memory-1',
    category: CATEGORIES.MEMORY,
    title: '엄마 생일',
    isLunar: true,
    lunarYear: 2026,
    lunarMonth: 6,
    lunarDay: 15,
    repeatType: REPEAT_TYPES.YEARLY,
    createdAt: '2026-08-01T09:00:00.000Z',
    updatedAt: '2026-08-01T09:00:00.000Z',
  }),
])
