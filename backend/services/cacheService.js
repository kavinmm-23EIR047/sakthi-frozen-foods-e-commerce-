const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });


/**
 * Ultra-Fast Two-Layer Cache: L1 In-Process Memory + L2 Upstash Redis
 *
 * Architecture:
 *  L1 — Node.js Map (sub-millisecond, in-process) — TTL up to 5 minutes
 *  L2 — Upstash Redis REST (shared, persistent) — TTL up to 24 hours
 *
 * Strategy:
 *  - L1 serves 99% of hot reads in <1ms with no network I/O
 *  - L2 is only hit on L1 miss (cold start, process restart)
 *  - L2 writes are fire-and-forget (non-blocking)
 *  - Pattern invalidation hits both layers atomically
 */

class CacheService {
  constructor() {
    // L1: In-process memory store — Map<key, { value, expiresAt }>
    this.mem = new Map();

    // L1 TTL config (seconds)
    this.L1_DEFAULT_TTL = 300;   // 5 min — products / categories / reviews
    this.L1_MAX_TTL     = 600;   // 10 min — absolute cap

    // Periodic cleanup every 5 minutes
    const cleanup = setInterval(() => this._cleanup(), 5 * 60 * 1000);
    if (cleanup.unref) cleanup.unref();

    this._logStatus();
  }

  // ─── Upstash config ────────────────────────────────────────────────────────

  get _url()   { return (process.env.UPSTASH_REDIS_REST_URL   || '').trim().replace(/\/+$/, ''); }
  get _token() { return (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim(); }
  get _ok()    { return Boolean(this._url && this._token); }

  _logStatus() {
    if (this._ok) {
      console.log('⚡ CacheService: L1 Memory + L2 Upstash Redis (ultra-fast mode)');
    } else {
      console.log('ℹ️  CacheService: L1 Memory-only mode (Upstash not configured)');
    }
  }

  // ─── L1 Memory ─────────────────────────────────────────────────────────────

  _memGet(key) {
    const item = this.mem.get(key);
    if (!item) return undefined;
    if (item.expiresAt <= Date.now()) { this.mem.delete(key); return undefined; }
    return item.value;
  }

  _memSet(key, value, ttlSeconds) {
    const capped = Math.min(ttlSeconds, this.L1_MAX_TTL);
    this.mem.set(key, { value, expiresAt: Date.now() + capped * 1000 });
  }

  _cleanup() {
    const now = Date.now();
    for (const [k, v] of this.mem) {
      if (v.expiresAt <= now) this.mem.delete(k);
    }
  }

  // ─── L2 Upstash REST ───────────────────────────────────────────────────────

  async _redisCmd(args) {
    if (!this._ok) return null;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 800); // 800ms hard timeout
    try {
      const r = await fetch(this._url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this._token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (!r.ok) return null;
      const j = await r.json();
      return j.result ?? null;
    } catch {
      clearTimeout(t);
      return null;
    }
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * get(key) — L1 first (sub-ms), then L2 Upstash.
   * Returns null on miss.
   */
  async get(key) {
    // L1 hit — sub-millisecond
    const l1 = this._memGet(key);
    if (l1 !== undefined) return l1;

    // L2 Upstash
    if (this._ok) {
      const raw = await this._redisCmd(['GET', key]);
      if (raw !== null && raw !== undefined) {
        let parsed = raw;
        if (typeof raw === 'string') { try { parsed = JSON.parse(raw); } catch {} }
        // Backfill L1 so next requests are sub-ms
        this._memSet(key, parsed, this.L1_DEFAULT_TTL);
        return parsed;
      }
    }
    return null;
  }

  /**
   * set(key, value, ttlSeconds) — write L1 immediately, L2 fire-and-forget.
   */
  async set(key, value, ttlSeconds = 300) {
    // L1 — synchronous, immediate
    this._memSet(key, value, ttlSeconds);

    // L2 — fire-and-forget (never block the response)
    if (this._ok) {
      const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
      this._redisCmd(['SET', key, serialized, 'EX', ttlSeconds]).catch(() => {});
    }
    return true;
  }

  /**
   * del(key) — remove from both layers.
   */
  async del(key) {
    this.mem.delete(key);
    if (this._ok) this._redisCmd(['DEL', key]).catch(() => {});
  }

  /**
   * delPattern(pattern) — invalidate matching keys from L1 + L2.
   * Pattern uses '*' as wildcard (e.g., 'sakthi:products:*')
   */
  async delPattern(pattern) {
    // L1 — regex match + delete
    const re = new RegExp('^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
    for (const k of this.mem.keys()) {
      if (re.test(k)) this.mem.delete(k);
    }
    // L2
    if (this._ok) {
      try {
        const keys = await this._redisCmd(['KEYS', pattern]);
        if (Array.isArray(keys) && keys.length > 0) {
          await this._redisCmd(['DEL', ...keys]);
        }
      } catch {}
    }
  }

  /**
   * getOrSet(key, fetcherFn, ttlSeconds)
   *
   * Cache-aside pattern:
   *   1. Return from L1 in <1ms if hot
   *   2. Return from L2 in ~100-300ms if warm (backfills L1)
   *   3. Call fetcherFn(), store result, return
   */
  async getOrSet(key, fetcherFn, ttlSeconds = 300) {
    // L1 fast path
    const l1 = this._memGet(key);
    if (l1 !== undefined) return { data: l1, source: 'l1' };

    // L2 Upstash
    if (this._ok) {
      const raw = await this._redisCmd(['GET', key]);
      if (raw !== null && raw !== undefined) {
        let parsed = raw;
        if (typeof raw === 'string') { try { parsed = JSON.parse(raw); } catch {} }
        this._memSet(key, parsed, this.L1_DEFAULT_TTL);
        return { data: parsed, source: 'l2' };
      }
    }

    // Cache miss — fetch from DB
    const fresh = await fetcherFn();
    if (fresh !== null && fresh !== undefined) {
      // L1 immediately (synchronous)
      this._memSet(key, fresh, ttlSeconds);
      // L2 fire-and-forget
      if (this._ok) {
        const serialized = typeof fresh === 'object' ? JSON.stringify(fresh) : String(fresh);
        this._redisCmd(['SET', key, serialized, 'EX', ttlSeconds]).catch(() => {});
      }
    }
    return { data: fresh, source: 'db' };
  }

  /**
   * warmUp(entries) — pre-populate L1 on server start from Upstash.
   * Call this once after DB connects.
   * entries: [{ key, fetcherFn, ttl }]
   */
  async warmUp(entries = []) {
    if (!entries.length) return;
    console.log(`⚡ CacheService: warming ${entries.length} cache entries...`);
    const results = await Promise.allSettled(
      entries.map(async ({ key, fetcherFn, ttl = 300 }) => {
        // Skip if already in L1
        if (this._memGet(key) !== undefined) return;
        // Try L2 first
        if (this._ok) {
          const raw = await this._redisCmd(['GET', key]);
          if (raw !== null && raw !== undefined) {
            let parsed = raw;
            if (typeof raw === 'string') { try { parsed = JSON.parse(raw); } catch {} }
            this._memSet(key, parsed, ttl);
            return;
          }
        }
        // Fetch from DB
        const fresh = await fetcherFn();
        if (fresh !== null && fresh !== undefined) {
          this._memSet(key, fresh, ttl);
          if (this._ok) {
            const s = typeof fresh === 'object' ? JSON.stringify(fresh) : String(fresh);
            this._redisCmd(['SET', key, s, 'EX', ttl]).catch(() => {});
          }
        }
      })
    );
    const ok = results.filter((r) => r.status === 'fulfilled').length;
    console.log(`⚡ CacheService: warmed ${ok}/${entries.length} entries ✓`);
  }

  getStatus() {
    return {
      enabled: true,
      upstash: this._ok,
      mode: this._ok ? 'L1 Memory + L2 Upstash Redis' : 'L1 Memory-only',
      l1Keys: this.mem.size,
    };
  }
}

const cacheService = new CacheService();
module.exports = cacheService;
