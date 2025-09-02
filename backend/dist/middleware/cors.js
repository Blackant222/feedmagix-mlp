import { config } from '../config/env.js';
// CORS configuration for Fastify
export const corsOptions = {
    // Allow requests from the frontend client
    origin: (origin, cb) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin)
            return cb(null, true);
        // List of allowed origins
        const allowedOrigins = [
            config.clientUrl, // Frontend app URL
            'http://localhost:3000', // Development frontend
            'http://localhost:3001', // Alternative dev port
            'http://127.0.0.1:3000', // Local development
            'https://feedmagix-mlp.vercel.app', // Production frontend (example)
        ];
        // Check if origin is allowed
        if (allowedOrigins.includes(origin)) {
            cb(null, true);
        }
        else {
            cb(new Error('Not allowed by CORS'), false);
        }
    },
    // Allow credentials (cookies, authorization headers, etc.)
    credentials: true,
    // Allowed HTTP methods
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    // Allowed headers
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'X-API-Key',
        'X-Service-Key'
    ],
    // Headers exposed to the client
    exposedHeaders: [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset'
    ],
    // Preflight cache duration (24 hours)
    maxAge: 86400,
    // Handle preflight requests
    preflightContinue: false,
    optionsSuccessStatus: 200
};
// Development CORS (more permissive)
export const devCorsOptions = {
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['*'],
    exposedHeaders: ['*']
};
// Get CORS options based on environment
export function getCorsOptions() {
    return config.nodeEnv === 'development' ? devCorsOptions : corsOptions;
}
// CORS preflight handler for manual implementation
export function handlePreflightRequest(request, reply) {
    const origin = request.headers.origin;
    const method = request.headers['access-control-request-method'];
    const headers = request.headers['access-control-request-headers'];
    // Set CORS headers
    reply.header('Access-Control-Allow-Origin', origin || config.clientUrl);
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    reply.header('Access-Control-Allow-Headers', headers || 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    reply.header('Access-Control-Max-Age', '86400');
    // Send OK response for preflight
    reply.status(200).send();
}
// Security headers middleware
export function securityHeaders(request, reply) {
    // Prevent clickjacking
    reply.header('X-Frame-Options', 'DENY');
    // Prevent MIME type sniffing
    reply.header('X-Content-Type-Options', 'nosniff');
    // Enable XSS protection
    reply.header('X-XSS-Protection', '1; mode=block');
    // Referrer policy
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Content Security Policy (basic)
    reply.header('Content-Security-Policy', "default-src 'self'");
    // Strict Transport Security (HTTPS only)
    if (request.headers['x-forwarded-proto'] === 'https' || request.protocol === 'https') {
        reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
}
//# sourceMappingURL=cors.js.map