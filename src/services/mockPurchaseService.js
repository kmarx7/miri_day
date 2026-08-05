import { PRO_PRICING } from '../constants/pricing.js'
import { getProStatus, setProStatus } from './storageService.js'
import { createPurchaseService, PURCHASE_RESULT_CODES } from './purchaseService.js'

export function createMockPurchaseService({
  getEntitlement = getProStatus,
  setEntitlement = setProStatus,
} = {}) {
  const service = createPurchaseService({
    async purchase(productId) {
      if (productId !== PRO_PRICING.productId) {
        return { success: false, code: PURCHASE_RESULT_CODES.NOT_FOUND }
      }
      setEntitlement(true)
      return { success: true, code: PURCHASE_RESULT_CODES.PURCHASED, productId }
    },
    async restorePurchases() {
      const restored = getEntitlement() === true
      return {
        success: restored,
        code: restored ? PURCHASE_RESULT_CODES.RESTORED : PURCHASE_RESULT_CODES.NOT_FOUND,
        productId: restored ? PRO_PRICING.productId : null,
      }
    },
  })

  return Object.freeze({
    ...service,
    activateForDevelopment() {
      setEntitlement(true)
      return true
    },
    resetForDevelopment() {
      setEntitlement(false)
      return false
    },
  })
}

export const mockPurchaseService = createMockPurchaseService()
