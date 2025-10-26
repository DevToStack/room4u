// lib/rate-limit.js
import LRUCache from 'lru-cache';

export function rateLimit(options) {
    const tokenCache = new LRUCache({
        max: options.uniqueTokenPerInterval || 500,
        ttl: options.interval || 60000,
    });

    return {
        check: (key) => {
            const tokenCount = tokenCache.get(key) || 0;
            if (tokenCount >= (options.limit || 10)) {
                return false;
            }
            tokenCache.set(key, tokenCount + 1);
            return true;
        },
    };
}
  
