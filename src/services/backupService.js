import { formatYmd } from '../utils/dates.js'

export function createBackupFileName(date = new Date()) {
  return `mirikkok-backup-${formatYmd(date)}.json`
}

export function serializeBackup(data) {
  return JSON.stringify(data, null, 2)
}

export function downloadBackup(data, {
  documentRef = globalThis.document,
  urlApi = globalThis.URL,
} = {}) {
  if (!documentRef || !urlApi?.createObjectURL) return false

  const blob = new Blob([serializeBackup(data)], { type: 'application/json;charset=utf-8' })
  const url = urlApi.createObjectURL(blob)
  const anchor = documentRef.createElement('a')
  anchor.href = url
  anchor.download = createBackupFileName()
  anchor.click()
  urlApi.revokeObjectURL(url)
  return true
}

export async function readBackupFile(file) {
  if (!file || typeof file.text !== 'function') {
    throw new TypeError('JSON 백업 파일을 선택해 주세요.')
  }
  return file.text()
}
