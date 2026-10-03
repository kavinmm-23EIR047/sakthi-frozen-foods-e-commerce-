require('dotenv').config();

/**
 * Upstash Redis Client with Native Fetch & Resilient L1 In-Memory Cache
 * 
 * Free Tier Protection Strategy:
 * 1. L1 Micro-cache (15-30s in-memory): Eliminates redundant Upstash REST calls during high traffic.
 * 2. L2 Upstash Redis: Shared distributed cache with automatic TTL (300-600s).
 * 3. Graceful Fallback: Seamlessly falls back to in-memory cache if Upstash credentials are not set or offline.
 * 4. Zero external npm dependencies (uses native Node.js fetch).
 */

class UpstashRedisClient {
  constructor() {
    // L1 In-Memory Cache Store: Map<key, { value: any, expiresAt: number }>
    this.memoryCache = new Map();
    this.l1TtlMs = 15 * 1000; // 15 seconds micro-cache for high-traffic deduplication
    this.loggedStatus = false;

    // Periodic cleanup of expired in-memory items every 2 minutes
    this.cleanupTimer = setInterval(() => this.cleanupMemoryCache(), 2 * 60 * 1000);
    if (this.cleanupTimer.unref) this.cleanupTimer.unref();

    this.checkAndLogStatus();
  }

  get url() {
    return (process.env.UPSTASH_REDIS_REST_URL || '').trim().replace(/\/+$/, '');
  }

  get token() {
    return (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim();
  }

  get isConfigured() {
    return Boolean(this.url && this.token);
  }

  checkAndLogStatus() {
    if (this.loggedStatus) return;
    if (this.isConfigured) {
      console.log('⚡ Upstash Redis Cache configured and connected.');
      this.loggedStatus = true;
    } else {
      console.log('ℹ️ Upstash Redis credentials not detected in .env - running in Resilient In-Memory Cache mode.');
      this.loggedStatus = true;
    }
  }

  /**
   * Cleans expired entries from the L1 in-memory store
   */
  cleanupMemoryCache() {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expiresAt && item.expiresAt <= now) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Execute raw Upstash Redis command via REST API
   * @param {Array<string|number>} commandArgs e.g. ['GET', 'mykey'] or ['SET', 'mykey', 'val', 'EX', 300]
   */
  async executeCommand(commandArgs) {
    if (!this.isConfigured) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200); // 1.2s timeout to prevent request blocking

    try {
      const response = await fetch(`${this.url}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commandArgs),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.warn(`Upstash Redis warning (${response.status}): ${await response.text()}`);
        return null;
      }

      const json = await response.json();
      return json.result;
    } catch (err) {
      clearTimeout(timeout);
      if (err.name !== 'AbortError') {
        console.warn('Upstash Redis request failed, using memory fallback:', err.message);
      }
      return null;
    }
  }

  /**
   * Get cached item (Checks L1 memory -> L2 Upstash Redis)
   * @param {string} key 
   */
  async get(key) {
    const now = Date.now();
    
    // 1. Check L1 In-Memory Cache
    const memItem = this.memoryCache.get(key);
    if (memItem) {
      if (memItem.expiresAt > now) {
        return memItem.value;
      }
      this.memoryCache.delete(key);
    }

    // 2. Check L2 Upstash Redis
    if (this.isConfigured) {
      try {
        const rawResult = await this.executeCommand(['GET', key]);
        if (rawResult !== null && rawResult !== undefined) {
          let parsed = rawResult;
          if (typeof rawResult === 'string') {
            try {
              parsed = JSON.parse(rawResult);
            } catch {
              parsed = rawResult;
            }
          }
          // Populate L1 microcache to save Upstash commands
          this.memoryCache.set(key, {
            value: parsed,
            expiresAt: now + this.l1TtlMs,
          });
          return parsed;
        }
      } catch (e) {
        // Safe fallback
      }
    }

    return null;
  }

  /**
   * Set cached item with TTL (in seconds)
   * @param {string} key 
   * @param {any} value 
   * @param {number} ttlSeconds Default: 300 (5 minutes)
   */
  async set(key, value, ttlSeconds = 300) {
    const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const now = Date.now();

    // Store in L1 Memory Cache
    this.memoryCache.set(key, {
      value,
      expiresAt: now + Math.min(ttlSeconds * 1000, this.l1TtlMs),
    });

    // Store in L2 Upstash Redis with EX (TTL)
    if (this.isConfigured) {
      try {
        await this.executeCommand(['SET', key, serialized, 'EX', ttlSeconds]);
      } catch (e) {
        // Non-blocking
      }
    }
    return true;
  }

  /**
   * Delete specific key from L1 and L2
   * @param {string} key 
   */
  async del(key) {
    this.memoryCache.delete(key);
    if (this.isConfigured) {
      try {
        await this.executeCommand(['DEL', key]);
      } catch (e) {
        // Non-blocking
      }
    }
  }

  /**
   * Invalidate all keys matching a prefix pattern (e.g., 'sakthi:products:*')
   * @param {string} pattern 
   */
  async delPattern(pattern) {
    // 1. Evict from L1 memory
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const k of this.memoryCache.keys()) {
      if (regexPattern.test(k)) {
        this.memoryCache.delete(k);
      }
    }

    // 2. Evict from Upstash Redis using KEYS + DEL
    if (this.isConfigured) {
      try {
        const keys = await this.executeCommand(['KEYS', pattern]);
        if (Array.isArray(keys) && keys.length > 0) {
          // Batch delete
          await this.executeCommand(['DEL', ...keys]);
        }
      } catch (e) {
        console.warn('Failed to invalidate Redis pattern:', e.message);
      }
    }
  }

  /**
   * Cache wrapper pattern: get or compute and store
   * @param {string} key 
   * @param {Function} fetcherFn Async function that produces data if cache miss
   * @param {number} ttlSeconds Cache expiration in seconds
   */
  async getOrSet(key, fetcherFn, ttlSeconds = 300) {
    const cached = await this.get(key);
    if (cached !== null && cached !== undefined) {
      return { data: cached, source: 'cache' };
    }

    const freshData = await fetcherFn();
    if (freshData !== null && freshData !== undefined) {
      this.set(key, freshData, ttlSeconds).catch(() => {});
    }
    return { data: freshData, source: 'db' };
  }

  /**
   * Health and metrics status
   */
  getStatus() {
    return {
      enabled: this.isConfigured,
      mode: this.isConfigured ? 'Upstash Redis (L2) + Memory Micro-cache (L1)' : 'Resilient In-Memory',
      memoryKeysCount: this.memoryCache.size,
    };
  }
}

const cacheService = new UpstashRedisClient();

module.exports = cacheService;
