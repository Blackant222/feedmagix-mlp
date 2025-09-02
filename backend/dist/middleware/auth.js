import { supabaseAnon } from '../config/supabase.js';
// Authentication middleware for protected routes
export async function authMiddleware(request, reply) {
    try {
        // Extract token from Authorization header
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.status(401).send({
                success: false,
                error: {
                    message: 'Authentication required',
                    code: 'AUTH_REQUIRED'
                },
                timestamp: new Date().toISOString()
            });
        }
        const token = authHeader.replace('Bearer ', '');
        // Verify token with Supabase
        const { data: { user }, error } = await supabaseAnon.auth.getUser(token);
        if (error || !user) {
            return reply.status(401).send({
                success: false,
                error: {
                    message: 'Invalid or expired token',
                    code: 'INVALID_TOKEN'
                },
                timestamp: new Date().toISOString()
            });
        }
        // Add user to request object
        ;
        request.user = {
            id: user.id,
            email: user.email || '',
            aud: user.aud,
            role: user.role
        };
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return reply.status(500).send({
            success: false,
            error: {
                message: 'Authentication service error',
                code: 'AUTH_SERVICE_ERROR'
            },
            timestamp: new Date().toISOString()
        });
    }
}
// Optional authentication middleware (doesn't fail if no token)
export async function optionalAuthMiddleware(request, reply) {
    try {
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.replace('Bearer ', '');
            const { data: { user }, error } = await supabaseAnon.auth.getUser(token);
            if (!error && user) {
                ;
                request.user = {
                    id: user.id,
                    email: user.email || '',
                    aud: user.aud,
                    role: user.role
                };
            }
        }
    }
    catch (error) {
        // Silently fail for optional auth
        console.warn('Optional auth failed:', error);
    }
}
// Get user from request (helper function)
export function getAuthUser(request) {
    return request.user || null;
}
// Require specific user ID (for user-specific resources)
export function requireUserAccess(request, userId) {
    const user = getAuthUser(request);
    if (!user || user.id !== userId) {
        throw new Error('Access denied: insufficient permissions');
    }
}
// Admin role check
export function requireAdminRole(request) {
    const user = getAuthUser(request);
    if (!user || user.role !== 'admin') {
        throw new Error('Access denied: admin role required');
    }
}
// Service role authentication for internal operations
export async function serviceRoleMiddleware(request, reply) {
    const serviceKey = request.headers['x-service-key'];
    if (!serviceKey || serviceKey !== process.env.INTERNAL_SERVICE_KEY) {
        return reply.status(403).send({
            success: false,
            error: {
                message: 'Service access denied',
                code: 'SERVICE_ACCESS_DENIED'
            },
            timestamp: new Date().toISOString()
        });
    }
}
// Rate limiting helper (basic implementation)
const rateLimits = new Map();
export function rateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) {
    return async function (request, reply) {
        const identifier = request.ip || 'unknown';
        const now = Date.now();
        const userLimit = rateLimits.get(identifier) || { count: 0, resetTime: now + windowMs };
        // Reset if window expired
        if (now > userLimit.resetTime) {
            userLimit.count = 0;
            userLimit.resetTime = now + windowMs;
        }
        userLimit.count++;
        rateLimits.set(identifier, userLimit);
        if (userLimit.count > maxRequests) {
            return reply.status(429).send({
                success: false,
                error: {
                    message: 'Too many requests',
                    code: 'RATE_LIMIT_EXCEEDED'
                },
                timestamp: new Date().toISOString()
            });
        }
        // Set rate limit headers
        reply.header('X-RateLimit-Limit', maxRequests);
        reply.header('X-RateLimit-Remaining', Math.max(0, maxRequests - userLimit.count));
        reply.header('X-RateLimit-Reset', Math.ceil(userLimit.resetTime / 1000));
    };
}
// API key validation for external integrations
export function validateApiKey(request, reply) {
    const apiKey = request.headers['x-api-key'];
    if (!apiKey) {
        return reply.status(401).send({
            success: false,
            error: {
                message: 'API key required',
                code: 'API_KEY_REQUIRED'
            },
            timestamp: new Date().toISOString()
        });
    }
    // Validate against known API keys (in production, store in database)
    const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
    if (!validApiKeys.includes(apiKey)) {
        return reply.status(401).send({
            success: false,
            error: {
                message: 'Invalid API key',
                code: 'INVALID_API_KEY'
            },
            timestamp: new Date().toISOString()
        });
    }
}
//# sourceMappingURL=auth.js.map