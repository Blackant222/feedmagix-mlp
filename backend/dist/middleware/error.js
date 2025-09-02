import { config } from '../config/env.js';
// Custom error types
export class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = 'AppError';
    }
}
export class ValidationError extends AppError {
    validationErrors;
    constructor(message, validationErrors = []) {
        super(message, 400, 'VALIDATION_ERROR', validationErrors);
        this.validationErrors = validationErrors;
        this.name = 'ValidationError';
    }
}
export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}
export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, 401, 'UNAUTHORIZED');
        this.name = 'UnauthorizedError';
    }
}
export class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden') {
        super(message, 403, 'FORBIDDEN');
        this.name = 'ForbiddenError';
    }
}
export class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409, 'CONFLICT');
        this.name = 'ConflictError';
    }
}
export class RateLimitError extends AppError {
    constructor(message = 'Rate limit exceeded') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
        this.name = 'RateLimitError';
    }
}
// Global error handler for Fastify
export async function errorHandler(error, request, reply) {
    const timestamp = new Date().toISOString();
    // Log error details
    console.error('Error occurred:', {
        timestamp,
        method: request.method,
        url: request.url,
        error: {
            name: error.name,
            message: error.message,
            stack: config.nodeEnv === 'development' ? error.stack : undefined
        },
        user: request.user?.id || 'anonymous'
    });
    // Handle different error types
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';
    let errorMessage = 'Internal server error';
    let details = undefined;
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        errorCode = error.code;
        errorMessage = error.message;
        details = error.details;
    }
    else if (error.statusCode) {
        // Fastify errors
        statusCode = error.statusCode;
        errorMessage = error.message;
        // Map common Fastify error codes
        switch (error.code) {
            case 'FST_ERR_VALIDATION':
                statusCode = 400;
                errorCode = 'VALIDATION_ERROR';
                break;
            case 'FST_ERR_CTP_INVALID_MEDIA_TYPE':
                statusCode = 415;
                errorCode = 'INVALID_MEDIA_TYPE';
                break;
            case 'FST_ERR_CTP_EMPTY_JSON_BODY':
                statusCode = 400;
                errorCode = 'EMPTY_BODY';
                break;
            default:
                errorCode = error.code || 'FASTIFY_ERROR';
        }
    }
    else if (error.name === 'ValidationError') {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
    }
    else if (error.message?.includes('JWT')) {
        statusCode = 401;
        errorCode = 'INVALID_TOKEN';
        errorMessage = 'Invalid or expired authentication token';
    }
    else if (error.message?.includes('Permission denied')) {
        statusCode = 403;
        errorCode = 'PERMISSION_DENIED';
    }
    // Build error response
    const errorResponse = {
        success: false,
        error: {
            message: errorMessage,
            code: errorCode,
            details: details,
            ...(config.nodeEnv === 'development' && { stack: error.stack })
        },
        timestamp
    };
    // Send error response
    reply.status(statusCode).send(errorResponse);
}
// Not found handler (404)
export async function notFoundHandler(request, reply) {
    const timestamp = new Date().toISOString();
    const errorResponse = {
        success: false,
        error: {
            message: `Route ${request.method} ${request.url} not found`,
            code: 'ROUTE_NOT_FOUND'
        },
        timestamp
    };
    reply.status(404).send(errorResponse);
}
// Async error wrapper for route handlers
export function asyncHandler(fn) {
    return async (...args) => {
        try {
            return await fn(...args);
        }
        catch (error) {
            throw error;
        }
    };
}
// Validation helper
export function validateRequired(data, fields) {
    const missingFields = fields.filter(field => {
        const value = data[field];
        return value === undefined || value === null || value === '';
    });
    if (missingFields.length > 0) {
        throw new ValidationError('Missing required fields', missingFields.map(field => ({
            field,
            message: `${field} is required`,
            value: data[field]
        })));
    }
}
// Email validation
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
// UUID validation
export function validateUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
// Request logging middleware
export async function requestLogger(request, reply) {
    const start = Date.now();
    // Log request
    console.log('📥 Request:', {
        timestamp: new Date().toISOString(),
        method: request.method,
        url: request.url,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        user: request.user?.id || 'anonymous'
    });
    // Log response when finished
    reply.addHook('onSend', async () => {
        const duration = Date.now() - start;
        console.log('📤 Response:', {
            timestamp: new Date().toISOString(),
            method: request.method,
            url: request.url,
            statusCode: reply.statusCode,
            duration: `${duration}ms`,
            user: request.user?.id || 'anonymous'
        });
    });
}
// Health check error
export class HealthCheckError extends AppError {
    constructor(service, details) {
        super(`Health check failed for ${service}`, 503, 'HEALTH_CHECK_FAILED', details);
        this.name = 'HealthCheckError';
    }
}
// Database error mapping
export function mapDatabaseError(error) {
    const message = error.message || 'Database operation failed';
    if (message.includes('duplicate key')) {
        return new ConflictError('Resource already exists');
    }
    if (message.includes('foreign key')) {
        return new ValidationError('Invalid reference to related resource');
    }
    if (message.includes('not found')) {
        return new NotFoundError();
    }
    if (message.includes('permission')) {
        return new ForbiddenError('Database permission denied');
    }
    return new AppError(message, 500, 'DATABASE_ERROR');
}
// AI service error mapping
export function mapAIError(error) {
    const message = error.message || 'AI service error';
    if (message.includes('quota') || message.includes('limit')) {
        return new AppError('AI service quota exceeded', 429, 'AI_QUOTA_EXCEEDED');
    }
    if (message.includes('invalid') || message.includes('malformed')) {
        return new ValidationError('Invalid input for AI processing');
    }
    if (message.includes('timeout')) {
        return new AppError('AI service timeout', 504, 'AI_TIMEOUT');
    }
    return new AppError(message, 503, 'AI_SERVICE_ERROR');
}
//# sourceMappingURL=error.js.map