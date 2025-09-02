import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { ValidationError as ApiValidationError } from '../types/api.types.js';
export declare class AppError extends Error {
    statusCode: number;
    code: string;
    details?: any;
    constructor(message: string, statusCode?: number, code?: string, details?: any);
}
export declare class ValidationError extends AppError {
    validationErrors: ApiValidationError[];
    constructor(message: string, validationErrors?: ApiValidationError[]);
}
export declare class NotFoundError extends AppError {
    constructor(resource?: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
export declare class RateLimitError extends AppError {
    constructor(message?: string);
}
export declare function errorHandler(error: FastifyError | AppError, request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function notFoundHandler(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function asyncHandler<T extends any[], R>(fn: (...args: T) => Promise<R>): (...args: T) => Promise<R>;
export declare function validateRequired(data: any, fields: string[]): void;
export declare function validateEmail(email: string): boolean;
export declare function validateUUID(uuid: string): boolean;
export declare function requestLogger(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare class HealthCheckError extends AppError {
    constructor(service: string, details?: any);
}
export declare function mapDatabaseError(error: any): AppError;
export declare function mapAIError(error: any): AppError;
//# sourceMappingURL=error.d.ts.map