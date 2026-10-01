// High-performance client-side cache and Stale-While-Revalidate (SWR) manager
// Ensures instant 0ms rendering across all admin and customer pages with background revalidation

const MEMORY_CACHE = new Map<string, { data: any; timestamp: number }>();
const DEFAULT_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes fresh cache

export function getCachedData<T = any>(key: string, maxAgeMs = DEFAULT_CACHE_TTL_MS): T | null {
  if (typeof window === 'undefined') return null;

  // 1. Check in-memory cache first (0ms latency)
  const mem = MEMORY_CACHE.get(key);
  if (mem) {
    if (Date.now() - mem.timestamp < maxAgeMs) {
      return mem.data as T;
    }
  }

  // 2. Check localStorage / sessionStorage for persistent cache across refreshes
  try {
    const raw = localStorage.getItem(`sakthi_cache_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.timestamp === 'number') {
        // Save to memory for subsequent fast lookups
        MEMORY_CACHE.set(key, parsed);
        if (Date.now() - parsed.timestamp < maxAgeMs * 2) {
          return parsed.data as T;
        }
      }
    }
  } catch (e) {
    // Ignore storage quota or JSON parse issues
  }

  return null;
}

export function setCachedData<T = any>(key: string, data: T): void {
  if (typeof window === 'undefined' || data === undefined) return;
  const entry = { data, timestamp: Date.now() };
  MEMORY_CACHE.set(key, entry);

  try {
    localStorage.setItem(`sakthi_cache_${key}`, JSON.stringify(entry));
  } catch (e) {
    // If quota exceeded, silently clear older sakthi cache items
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('sakthi_cache_') && k !== `sakthi_cache_${key}`) {
          localStorage.removeItem(k);
        }
      }
      localStorage.setItem(`sakthi_cache_${key}`, JSON.stringify(entry));
    } catch {
      // Storage unavailable fallback
    }
  }
}

export function invalidateCache(keyPrefix?: string): void {
  if (typeof window === 'undefined') return;

  if (!keyPrefix) {
    MEMORY_CACHE.clear();
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('sakthi_cache_')) keysToRemove.push(k);
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}
    return;
  }

  // Prefix invalidation
  for (const k of Array.from(MEMORY_CACHE.keys())) {
    if (k.startsWith(keyPrefix)) {
      MEMORY_CACHE.delete(k);
    }
  }

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(`sakthi_cache_${keyPrefix}`)) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}
}
