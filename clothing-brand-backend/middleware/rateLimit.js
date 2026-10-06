import rateLimit from 'express-rate-limit';

// Limits are per client IP. Many Indian mobile users share one IP (carrier
// NAT), so these only aim to stop floods and brute force, not normal shopping.
const make = (windowMinutes, limit, message, extra = {}) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message },
    skip: () => process.env.NODE_ENV === 'test',
    ...extra,
  });

// Only failed sign-in / sign-up attempts count towards this limit.
export const authLimiter = make(15, 30, 'Too many attempts. Please wait a few minutes and try again.', {
  skipSuccessfulRequests: true,
});
export const writeLimiter = make(15, 200, 'Too many requests. Please slow down.');
export const apiLimiter = make(1, 1500, 'Too many requests. Please slow down.');
