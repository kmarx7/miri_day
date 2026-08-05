import assert from 'node:assert/strict'
import test from 'node:test'
import { PRO_PRICING } from '../src/constants/pricing.js'
import { createPurchaseService, purchaseService, restorePurchases } from '../src/services/purchaseService.js'

test('구매 서비스는 구매와 복원 인터페이스를 요구한다', () => {
  assert.throws(() => createPurchaseService({ purchase() {} }), /restorePurchases/)
})

test('실결제 미연결 서비스는 안전한 준비 상태를 반환한다', async () => {
  const purchase = await purchaseService.purchase(PRO_PRICING.productId)
  const restore = await restorePurchases()

  assert.equal(purchase.success, false)
  assert.equal(restore.success, false)
})
