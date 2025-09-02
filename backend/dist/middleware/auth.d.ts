import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthRequest } from '../types/api.types.js';
export declare function authMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
export declare function optionalAuthMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function getAuthUser(request: FastifyRequest): AuthRequest['user'] | null;
export declare function requireUserAccess(request: FastifyRequest, userId: string): void;
export declare function requireAdminRole(request: FastifyRequest): void;
export declare function serviceRoleMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
export declare function rateLimit(maxRequests?: number, windowMs?: number): (request: FastifyRequest, reply: FastifyReply) => Promise<undefined>;
export declare function validateApiKey(request: FastifyRequest, reply: FastifyReply): FastifyReply<import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, import("fastify").RouteGenericInterface, unknown, import("fastify").FastifySchema, import("fastify").FastifyTypeProviderDefault, unknown> | undefined;
//# sourceMappingURL=auth.d.ts.map