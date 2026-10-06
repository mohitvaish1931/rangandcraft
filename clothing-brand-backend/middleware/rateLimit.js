import rateLimit from 'express-rate-limit';

const make = (windowMinutes, limit, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message },
    skip: () => process.env.NODE_ENV === 'test',
  });

export const authLimiter = make(15, 20, 'Too many attempts. Please wait a few minutes and try again.');
export const writeLimiter = make(15, 60, 'Too many requests. Please slow down.');
export const apiLimiter = make(1, 300, 'Too many requests. Please slow down.');
