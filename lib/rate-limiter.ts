/**
 * Rate Limiter for Login Attempts
 * Prevents brute force attacks by limiting login attempts per IP
 */

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

const loginAttempts = new Map<string, RateLimitEntry>();

// Clean up old entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;
  
  for (const [ip, entry] of loginAttempts.entries()) {
    if (now - entry.lastAttempt > fifteenMinutes) {
      loginAttempts.delete(ip);
    }
  }
}, 30 * 60 * 1000);

/**
 * Check if an IP address has exceeded the rate limit
 * @param ip - IP address to check
 * @param maxAttempts - Maximum attempts allowed (default: 5)
 * @param windowMs - Time window in milliseconds (default: 15 minutes)
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  ip: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry) {
    // First attempt from this IP
    loginAttempts.set(ip, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    });
    return true;
  }

  // Check if window has expired
  if (now - entry.firstAttempt > windowMs) {
    // Reset the counter
    loginAttempts.set(ip, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    });
    return true;
  }

  // Check if limit exceeded
  if (entry.count >= maxAttempts) {
    entry.lastAttempt = now;
    return false;
  }

  // Increment counter
  entry.count++;
  entry.lastAttempt = now;
  return true;
}

/**
 * Get remaining attempts for an IP
 * @param ip - IP address to check
 * @param maxAttempts - Maximum attempts allowed
 * @returns number of attempts remaining
 */
export function getRemainingAttempts(ip: string, maxAttempts: number = 5): number {
  const entry = loginAttempts.get(ip);
  if (!entry) return maxAttempts;
  
  const remaining = maxAttempts - entry.count;
  return Math.max(0, remaining);
}

/**
 * Get time until rate limit reset for an IP
 * @param ip - IP address to check
 * @param windowMs - Time window in milliseconds
 * @returns milliseconds until reset, or 0 if not rate limited
 */
export function getResetTime(ip: string, windowMs: number = 15 * 60 * 1000): number {
  const entry = loginAttempts.get(ip);
  if (!entry) return 0;
  
  const now = Date.now();
  const elapsed = now - entry.firstAttempt;
  const remaining = windowMs - elapsed;
  
  return Math.max(0, remaining);
}

/**
 * Clear rate limit for an IP (call after successful login)
 * @param ip - IP address to clear
 */
export function clearRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}
