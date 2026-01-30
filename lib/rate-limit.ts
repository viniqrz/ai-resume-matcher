type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Simple in-memory rate limiter.
 * Note: This will reset if the server restarts or on serverless cold starts.
 */
export function isRateLimited(identifier: string, limit: number, windowMs: number): { 
  limited: boolean; 
  remaining: number; 
  reset: number; 
} {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    const newRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitMap.set(identifier, newRecord);
    return { limited: false, remaining: limit - 1, reset: newRecord.resetTime };
  }

  if (record.count >= limit) {
    return { limited: true, remaining: 0, reset: record.resetTime };
  }

  record.count += 1;
  return { limited: false, remaining: limit - record.count, reset: record.resetTime };
}

// Optional: Periodically clean up expired records to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 1000 * 60 * 10); // Clean up every 10 minutes
}
