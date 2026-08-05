import assert from 'node:assert/strict'
import test from 'node:test'
import { createBackupFileName, readBackupFile, serializeBackup } from '../src/services/backupService.js'

test('백업 파일명에 Asia/Seoul 기준 날짜를 포함한다', () => {
  const date = new Date('2026-08-04T15:30:00.000Z')
  assert.equal(createBackupFileName(date), 'mirikkok-backup-2026-08-05.json')
})

test('백업을 읽기 쉬운 JSON으로 직렬화한다', () => {
  const serialized = serializeBackup({ appName: '미리꼭', items: [] })
  assert.deepEqual(JSON.parse(serialized), { appName: '미리꼭', items: [] })
  assert.match(serialized, /\n/)
})

test('선택한 파일의 텍스트를 읽는다', async () => {
  const text = await readBackupFile({ text: async () => '{"items":[]}' })
  assert.equal(text, '{"items":[]}')
})
