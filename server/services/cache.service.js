/**
 * Cache Service (server/services/cache.service.js)
 * High-Performance In-Memory TTL Cache
 * Eliminates 100% token cost for repeated requests within TTL window (3-5 minutes).
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    // Auto purge expired items every 60 seconds
    setInterval(() => this.purgeExpired(), 60000);
  }

  set(key, value, ttlMs = 180000) { // Default 3 minutes
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
    return value;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  purgeExpired() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

module.exports = new CacheService();
