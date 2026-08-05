export const PURCHASE_RESULT_CODES = Object.freeze({
  PURCHASED: 'purchased',
  RESTORED: 'restored',
  NOT_FOUND: 'notFound',
  NOT_CONFIGURED: 'notConfigured',
})

/**
 * Defines the boundary that a future Google Play Billing adapter must satisfy.
 */
export function createPurchaseService({ purchase, restorePurchases }) {
  if (typeof purchase !== 'function' || typeof restorePurchases !== 'function') {
    throw new TypeError('purchase와 restorePurchases 함수가 필요합니다.')
  }
  return Object.freeze({ purchase, restorePurchases })
}

export const purchaseService = createPurchaseService({
  async purchase() {
    return {
      success: false,
      code: PURCHASE_RESULT_CODES.NOT_CONFIGURED,
      message: 'Google Play 결제는 Android 연결 단계에서 제공될 예정이에요.',
    }
  },
  async restorePurchases() {
    return {
      success: false,
      code: PURCHASE_RESULT_CODES.NOT_CONFIGURED,
      message: 'Google Play 구매 복원은 Android 연결 단계에서 제공될 예정이에요.',
    }
  },
})

export function restorePurchases(service = purchaseService) {
  return service.restorePurchases()
}
