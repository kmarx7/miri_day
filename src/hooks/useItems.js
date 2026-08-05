import { useCallback, useEffect, useState } from 'react'
import {
  completeItem as completeStoredItem,
  createItem as createStoredItem,
  deleteItem as deleteStoredItem,
  getItems,
  restoreDeletedItem,
  restoreItem as restoreStoredItem,
  updateItem as updateStoredItem,
} from '../services/storageService.js'

export const DELETE_UNDO_DURATION_MS = 3000

/**
 * Keeps persisted user items separate from optional, read-only sample items.
 *
 * @param {{ sampleItems?: import('../models/item.js').MirikkokItem[] }} [options]
 */
export function useItems({ sampleItems = [] } = {}) {
  const [items, setItems] = useState(() => getItems())
  const [pendingDeletion, setPendingDeletion] = useState(null)

  const refresh = useCallback(() => {
    const storedItems = getItems()
    setItems(storedItems)
    return storedItems
  }, [])

  const createItem = useCallback((input) => {
    const created = createStoredItem(input)
    refresh()
    return created
  }, [refresh])

  const updateItem = useCallback((id, updates) => {
    const updated = updateStoredItem(id, updates)
    refresh()
    return updated
  }, [refresh])

  const deleteItem = useCallback((id) => {
    const snapshot = deleteStoredItem(id)
    if (snapshot) {
      setPendingDeletion({
        ...snapshot,
        expiresAt: Date.now() + DELETE_UNDO_DURATION_MS,
      })
      refresh()
    }
    return snapshot
  }, [refresh])

  const completeItem = useCallback((id) => {
    const completed = completeStoredItem(id)
    refresh()
    return completed
  }, [refresh])

  const restoreItem = useCallback((id) => {
    const restored = restoreStoredItem(id)
    refresh()
    return restored
  }, [refresh])

  const undoDelete = useCallback(() => {
    if (!pendingDeletion || pendingDeletion.expiresAt < Date.now()) {
      setPendingDeletion(null)
      return null
    }

    const restored = restoreDeletedItem(pendingDeletion)
    setPendingDeletion(null)
    refresh()
    return restored
  }, [pendingDeletion, refresh])

  useEffect(() => {
    if (!pendingDeletion) return undefined

    const remaining = Math.max(0, pendingDeletion.expiresAt - Date.now())
    const timer = globalThis.setTimeout(() => setPendingDeletion(null), remaining)
    return () => globalThis.clearTimeout(timer)
  }, [pendingDeletion])

  return {
    items,
    sampleItems,
    pendingDeletion,
    createItem,
    updateItem,
    deleteItem,
    completeItem,
    restoreItem,
    undoDelete,
    refresh,
  }
}
