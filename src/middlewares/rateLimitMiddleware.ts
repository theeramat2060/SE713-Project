import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// General rate limiter: 100 requests per 15 minutes
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth rate limiter: 5 requests per 15 minutes (for login/register)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
});

// Voting rate limiter: 1 vote per minute per user
export const votingLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 1,
    message: 'Please wait before casting another vote.',
    standardHeaders: true,
    legacyHeaders: false,
});

// API rate limiter: 30 requests per minute
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    message: 'Too many API requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiter: 10 requests per hour (for sensitive operations)
export const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Too many requests to this resource, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
