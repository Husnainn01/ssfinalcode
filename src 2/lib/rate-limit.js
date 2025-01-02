import { LRUCache } from 'lru-cache'

export function rateLimit(options) {
    const tokenCache = new LRUCache({
        max: options.uniqueTokenPerInterval || 500,
        ttl: options.interval || 60000
    })

    return {
        check: (request, limit, token) => new Promise((resolve, reject) => {
            const tokenCount = tokenCache.get(token) || [0]
            if (tokenCount[0] === 0) {
                tokenCache.set(token, [1])
            } else {
                tokenCount[0] += 1
                tokenCache.set(token, tokenCount)
            }
            
            if (tokenCount[0] > limit) {
                reject()
            } else {
                resolve()
            }
        }),
    }
} 