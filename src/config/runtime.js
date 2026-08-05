export function isIphoneTestProEnabled(value = import.meta.env?.VITE_IPHONE_TEST_PRO) {
  return value === 'true'
}

export function resolveProStatus(storedStatus, testProValue = import.meta.env?.VITE_IPHONE_TEST_PRO) {
  return storedStatus === true || isIphoneTestProEnabled(testProValue)
}
