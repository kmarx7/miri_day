import {
  MEMORY_KIND_EMOJIS,
  MEMORY_KIND_LABELS,
  MEMORY_KIND_VALUES,
} from '../../constants/memoryKinds.js'
import { NOTIFICATION_OFFSETS, NOTIFICATION_OFFSET_LABELS } from '../../constants/notifications.js'
import { MEMORY_CALENDAR_OPTIONS, MEMORY_REPEAT_CHOICE_OPTIONS } from '../../hooks/useMemoryForm.js'
import { REPEAT_TYPES } from '../../models/item.js'
import { formatKoreanYmd } from '../../utils/dates.js'
import { MEMORY_MONTH_OPTIONS } from '../../utils/memorySchedule.js'

/**
 * 기억할 것 입력 항목. 홈의 + 시트와 기억할 것 화면의 추가 시트가 함께 씁니다.
 * 색은 상위 시트가 넘겨주는 --sheet-accent 변수를 따릅니다.
 */
export default function MemoryFormFields({ form, isPro = false, title, onTitleChange, autoFocusTitle = false }) {
  const {
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
    dayOptions,
    schedule,
    selectCalendar,
    selectMonth,
    selectRepeatChoice,
    toggleNotificationOffset,
  } = form

  return (
    <>
      <input
        autoFocus={autoFocusTitle}
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        aria-label="기억할 내용"
        placeholder="기억할 내용"
        autoComplete="off"
        enterKeyHint="done"
        className="sheet-title-input"
      />

      <fieldset className="sheet-field">
        <legend className="sheet-field-label">종류</legend>
        <div className="sheet-chip-row">
          {MEMORY_KIND_VALUES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMemoryKind(value)}
              aria-pressed={memoryKind === value}
              className={`sheet-chip ${memoryKind === value ? 'sheet-chip-active' : ''}`}
            >
              <span aria-hidden="true">{MEMORY_KIND_EMOJIS[value]}</span> {MEMORY_KIND_LABELS[value]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="sheet-field">
        <legend className="sheet-field-label">달력</legend>
        <div className="sheet-pair-row">
          {MEMORY_CALENDAR_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => selectCalendar(option.value)}
              aria-pressed={isLunar === option.value}
              className={`sheet-toggle ${isLunar === option.value ? 'sheet-toggle-active' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="sheet-field">
        <legend className="sheet-field-label">날짜</legend>
        <div className="sheet-pair-row">
          <label className="sheet-select">
            <span className="sr-only">{isLunar ? '음력 월' : '월'}</span>
            <select value={month} onChange={(event) => selectMonth(Number(event.target.value))}>
              {MEMORY_MONTH_OPTIONS.map((value) => (
                <option key={value} value={value}>{value}월</option>
              ))}
            </select>
          </label>
          <label className="sheet-select">
            <span className="sr-only">{isLunar ? '음력 일' : '일'}</span>
            <select value={day} onChange={(event) => setDay(Number(event.target.value))}>
              {dayOptions.map((value) => (
                <option key={value} value={value}>{value}일</option>
              ))}
            </select>
          </label>
        </div>
        {isLunar && (
          <label className="sheet-leap-check">
            <input
              type="checkbox"
              checked={isLeapMonth}
              onChange={(event) => setIsLeapMonth(event.target.checked)}
            />
            윤달로 입력
          </label>
        )}
      </fieldset>

      <fieldset className="sheet-field">
        <legend className="sheet-field-label">반복</legend>
        <div className="sheet-pair-row">
          {MEMORY_REPEAT_CHOICE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => selectRepeatChoice(option.value)}
              aria-pressed={repeatChoice === option.value}
              className={`sheet-toggle ${repeatChoice === option.value ? 'sheet-toggle-active' : ''}`}
            >
              {option.label}
              {option.repeatType !== REPEAT_TYPES.NONE && !isPro && <span className="sheet-pro-tag">PRO</span>}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="sheet-field">
        <legend className="sheet-field-label">알림</legend>
        <div className="sheet-pair-row">
          {NOTIFICATION_OFFSETS.map((offset) => (
            <button
              key={offset}
              type="button"
              onClick={() => toggleNotificationOffset(offset)}
              aria-pressed={notificationOffsets.includes(offset)}
              aria-label={`${NOTIFICATION_OFFSET_LABELS[offset]} 알림 ${notificationOffsets.includes(offset) ? '해제' : '설정'}`}
              className={`sheet-toggle ${notificationOffsets.includes(offset) ? 'sheet-toggle-active' : ''}`}
            >
              {NOTIFICATION_OFFSET_LABELS[offset]}
              {offset !== 0 && !isPro && <span className="sheet-pro-tag">PRO</span>}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="sheet-memo">
        <button
          type="button"
          onClick={() => setMemoExpanded((value) => !value)}
          aria-expanded={memoExpanded}
          className="sheet-memo-toggle"
        >
          <span>메모 {memo ? '작성됨' : '(선택)'}</span>
          <span aria-hidden="true">{memoExpanded ? '−' : '+'}</span>
        </button>
        {memoExpanded && (
          <textarea
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            aria-label="메모"
            rows="3"
            placeholder="잊지 말아야 할 내용을 적어두세요."
            className="sheet-memo-input"
          />
        )}
      </div>

      {schedule.valid ? (
        <p className="sheet-preview" role="status">
          {isLunar
            ? `음력 ${isLeapMonth ? '윤' : ''}${month}.${day} → ${formatKoreanYmd(schedule.dueDate)}에 알려드려요.`
            : `${formatKoreanYmd(schedule.dueDate)}에 알려드려요.`}
        </p>
      ) : (
        <p className="sheet-error" role="alert">{schedule.error}</p>
      )}

      {notice && <p className="sheet-notice" role="status">{notice}</p>}
    </>
  )
}
