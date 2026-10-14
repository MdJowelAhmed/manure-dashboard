/**
 * Isolated Browser Storage Adapter for Demo Continuity
 *
 * NOTE: This is a frontend prototype adapter to keep interactive CRUD edits intact
 * across browser refreshes during user testing. In production, this entire adapter
 * is swapped with real API endpoints without altering UI page components.
 */

const STORAGE_PREFIX = 'meridian_prototype_'

export function getStoredItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = window.localStorage.getItem(STORAGE_PREFIX + key)
    if (!item) return defaultValue
    return JSON.parse(item) as T
  } catch (e) {
    console.warn(`Failed reading ${key} from storage adapter, using default`, e)
    return defaultValue
  }
}

export function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  } catch (e) {
    console.warn(`Failed writing ${key} to storage adapter`, e)
  }
}

export function clearStoredPrototypeData(): void {
  if (typeof window === 'undefined') return
  try {
    const keys = Object.keys(window.localStorage).filter((k) =>
      k.startsWith(STORAGE_PREFIX)
    )
    keys.forEach((k) => window.localStorage.removeItem(k))
  } catch (e) {
    console.warn('Failed clearing prototype storage', e)
  }
}
