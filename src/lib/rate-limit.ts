/* ------------------------------------------------------------------ */
/*  In-memory Rate Limiter                                             */
/* ------------------------------------------------------------------ */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Auto-cleanup every 60 seconds to prevent memory leaks
const CLEANUP_INTERVAL = 60_000;

if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

/**
 * Create a rate limiter for a given key prefix.
 *
 * @param prefix  - Prefix for the storage key (e.g. 'api', 'auth')
 * @param options - Configuration
 * @returns An object with a `check` method
 */
export function rateLimit(
  prefix: string,
  options?: {
    windowMs?: number;
    maxRequests?: number;
  }
) {
  const windowMs = options?.windowMs ?? 60_000;
  const maxRequests = options?.maxRequests ?? 100;

  return {
    check(identifier: string): { success: boolean; remaining: number; resetAt: number } {
      const key = `${prefix}:${identifier}`;
      const now = Date.now();
      const resetAt = now + windowMs;

      const entry = store.get(key);

      // No entry or window expired → reset
      if (!entry || now >= entry.resetAt) {
        store.set(key, { count: 1, resetAt });
        return { success: true, remaining: maxRequests - 1, resetAt };
      }

      // Within window
      if (entry.count >= maxRequests) {
        return { success: false, remaining: 0, resetAt: entry.resetAt };
      }

      entry.count += 1;
      return { success: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Pre-configured limiters                                            */
/* ------------------------------------------------------------------ */

export const apiLimiter = rateLimit('api', { windowMs: 60_000, maxRequests: 100 });
export const authLimiter = rateLimit('auth', { windowMs: 60_000, maxRequests: 20 });

/* ------------------------------------------------------------------ */
/*  Next.js Middleware Helper                                          */
/* ------------------------------------------------------------------ */

/**
 * Rate-limit middleware that can be used in Next.js middleware.ts.
 * Checks X-Forwarded-For header, then falls back to the connection remote address.
 */
export function rateLimitMiddleware(request: Request): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
} {
  const url = new URL(request.url);
  const path = url.pathname;

  // Identify client by IP
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown';

  // Auth routes get stricter limits
  const isAuth = path.startsWith('/api/auth');
  const limiter = isAuth ? authLimiter : apiLimiter;
  const limit = isAuth ? 20 : 100;

  const result = limiter.check(ip);

  return {
    allowed: result.success,
    remaining: result.remaining,
    resetAt: result.resetAt,
    limit,
  };
}
