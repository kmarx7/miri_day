import assert from 'node:assert/strict'
import test from 'node:test'
import { PRO_PRICING } from '../src/constants/pricing.js'
import { createMockPurchaseService } from '../src/services/mockPurchaseService.js'
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

test('개발용 목업은 명시적으로 Pro를 활성화하고 복원한다', async () => {
  let entitled = false
  const service = createMockPurchaseService({
    getEntitlement: () => entitled,
    setEntitlement: (value) => { entitled = value },
  })

  const purchase = await service.purchase(PRO_PRICING.productId)
  const restore = await service.restorePurchases()

  assert.equal(purchase.success, true)
  assert.equal(entitled, true)
  assert.equal(restore.success, true)
  assert.equal(service.resetForDevelopment(), false)
  assert.equal(entitled, false)
})
