import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
// Import configuration
import './config/env.js';
import { config } from './config/env.js';
import { testDatabaseConnection } from './config/supabase.js';
import { testGeminiConnection } from './services/ai/gemini.js';
// Import middleware
import { getCorsOptions } from './middleware/cors.js';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/error.js';
// Import routes
import { authRoutes } from './routes/auth.js';
import { petRoutes } from './routes/pets.js';
import { scanRoutes } from './routes/scan.js';
import { chatRoutes } from './routes/chat.js';
import { comparisonRoutes } from './routes/comparison.js';
import { analyticsRoutes } from './routes/analytics.js';
// Create Fastify instance
const fastify = Fastify({
    logger: {
        level: config.nodeEnv === 'development' ? 'info' : 'warn',
        transport: config.nodeEnv === 'development' ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
            }
        } : undefined
    },
    requestIdLogLabel: 'reqId',
    requestIdHeader: 'x-request-id'
});
// Global error handler
fastify.setErrorHandler(errorHandler);
// 404 handler
fastify.setNotFoundHandler(notFoundHandler);
// Request logging middleware
fastify.addHook('onRequest', requestLogger);
// Register CORS plugin
await fastify.register(cors, getCorsOptions());
// Register multipart for file uploads
await fastify.register(multipart, {
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1
    }
});
// Health check endpoint (before other routes)
fastify.get('/health', async (request, reply) => {
    try {
        // Check database connection
        const dbConnected = await testDatabaseConnection();
        // Check AI service connection
        const aiConnected = await testGeminiConnection();
        const healthStatus = {
            status: dbConnected && aiConnected ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            environment: config.nodeEnv,
            services: {
                database: dbConnected ? 'connected' : 'disconnected',
                ai_service: aiConnected ? 'connected' : 'disconnected',
                gemini_model: config.gemini.model
            },
            system: {
                uptime: process.uptime(),
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
                },
                node_version: process.version,
                platform: process.platform
            }
        };
        const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
        reply.status(statusCode).send(healthStatus);
    }
    catch (error) {
        console.error('Health check failed:', error);
        reply.status(503).send({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Health check failed'
        });
    }
});
// API routes
await fastify.register(authRoutes, { prefix: '/api/auth' });
await fastify.register(petRoutes, { prefix: '/api/pets' });
await fastify.register(scanRoutes, { prefix: '/api/scan' });
await fastify.register(chatRoutes, { prefix: '/api/chat' });
await fastify.register(comparisonRoutes, { prefix: '/api/comparison' });
await fastify.register(analyticsRoutes, { prefix: '/api/analytics' });
// Root endpoint
fastify.get('/', async (request, reply) => {
    return {
        name: 'FeedMagix Backend API',
        version: '1.0.0',
        description: 'AI-powered pet food analysis platform',
        environment: config.nodeEnv,
        documentation: '/api/docs',
        health: '/health',
        timestamp: new Date().toISOString(),
        features: [
            'AI-powered food analysis using Gemini 2.5 Flash',
            'Pet nutrition consultation chat',
            'Multi-product comparison',
            'Comprehensive scan history',
            'Persian language support'
        ]
    };
});
// API documentation endpoint (placeholder)
fastify.get('/api/docs', async (request, reply) => {
    return {
        title: 'FeedMagix API Documentation',
        version: '1.0.0',
        base_url: `http://localhost:${config.port}`,
        endpoints: {
            authentication: {
                base: '/api/auth',
                endpoints: [
                    'POST /register - Register new user',
                    'POST /login - User login',
                    'POST /logout - User logout',
                    'GET /profile - Get user profile',
                    'PUT /profile - Update user profile',
                    'POST /refresh - Refresh token',
                    'GET /stats - User statistics',
                    'POST /change-password - Change password'
                ]
            },
            pets: {
                base: '/api/pets',
                endpoints: [
                    'GET / - Get all pets',
                    'POST / - Create new pet',
                    'GET /:id - Get pet by ID',
                    'PUT /:id - Update pet',
                    'DELETE /:id - Delete pet',
                    'GET /:id/scans - Get pet with scan history',
                    'GET /:id/health - Get pet health summary',
                    'GET /search?q=name - Search pets by name',
                    'GET /by-species?species=dog - Get pets by species',
                    'GET /attention - Get pets needing attention'
                ]
            },
            scan: {
                base: '/api/scan',
                endpoints: [
                    'POST /upload - Upload image for scanning',
                    'POST /analyze - Complete AI analysis',
                    'GET /history - Get scan history',
                    'GET /history/:id - Get specific scan',
                    'GET /stats - Scan statistics',
                    'GET /trending - Trending scans',
                    'GET /by-verdict?verdict=buy - Get scans by verdict',
                    'DELETE /history/:id - Delete scan',
                    'POST /quick-analyze - Quick re-analysis'
                ]
            },
            chat: {
                base: '/api/chat',
                endpoints: [
                    'GET /sessions - Get chat sessions',
                    'POST /sessions - Create chat session',
                    'GET /sessions/:id - Get session details',
                    'PUT /sessions/:id - Update session',
                    'DELETE /sessions/:id - Delete session',
                    'GET /sessions/:id/messages - Get session messages',
                    'POST /sessions/:id/messages - Send message',
                    'GET /search?q=query - Search messages',
                    'GET /stats - Chat statistics',
                    'POST /sessions/:id/reset - Reset session',
                    'GET /sessions/:id/export - Export session'
                ]
            },
            comparison: {
                base: '/api/comparison',
                endpoints: [
                    'POST /create - Create comparison',
                    'POST /analyze - Analyze comparison',
                    'GET /history - Comparison history',
                    'GET /:id - Get comparison details',
                    'DELETE /:id - Delete comparison',
                    'GET /stats - Comparison statistics',
                    'GET /popular - Popular comparisons',
                    'POST /quick - Quick compare',
                    'POST /reanalyze - Re-analyze comparison'
                ]
            },
            analytics: {
                base: '/api/analytics',
                endpoints: [
                    'POST /track - Track user events',
                    'GET /user-stats - User statistics',
                    'GET /product-stats - Product statistics',
                    'GET /business-metrics - Business metrics',
                    'GET /ai-stats - AI usage statistics',
                    'GET /export - Export user data',
                    'GET /health - System health'
                ]
            }
        }
    };
});
// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
    console.log(`\n📤 Received ${signal}, shutting down gracefully...`);
    try {
        await fastify.close();
        console.log('✅ Server closed successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
};
// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 Unhandled Promise Rejection:', {
        reason,
        promise,
        stack: reason instanceof Error ? reason.stack : undefined
    });
});
// Uncaught exception handler
process.on('uncaughtException', (error) => {
    console.error('🔥 Uncaught Exception:', {
        name: error.name,
        message: error.message,
        stack: error.stack
    });
    // Gracefully shutdown
    process.exit(1);
});
// Start server
const start = async () => {
    try {
        console.log('🚀 Starting FeedMagix Backend Server...');
        console.log('📋 Configuration:');
        console.log(`   - Environment: ${config.nodeEnv}`);
        console.log(`   - Port: ${config.port}`);
        console.log(`   - Client URL: ${config.clientUrl}`);
        console.log(`   - Gemini Model: ${config.gemini.model}`);
        // Test connections before starting
        console.log('\n🔌 Testing connections...');
        const dbConnected = await testDatabaseConnection();
        if (!dbConnected) {
            throw new Error('Database connection failed');
        }
        const aiConnected = await testGeminiConnection();
        if (!aiConnected) {
            console.warn('⚠️  Gemini AI connection failed - AI features may not work');
        }
        // Start the server
        await fastify.listen({
            port: config.port,
            host: '0.0.0.0'
        });
        console.log('\n✅ FeedMagix Backend Server started successfully!');
        console.log(`🌐 Server running on: http://localhost:${config.port}`);
        console.log(`📖 API Documentation: http://localhost:${config.port}/api/docs`);
        console.log(`❤️  Health Check: http://localhost:${config.port}/health`);
        console.log('\n🎯 AI Pipeline Features:');
        console.log('   - Product Identification (Gemini Vision)');
        console.log('   - Web Search & Data Retrieval');
        console.log('   - Nutrition Analysis');
        console.log('   - Persian Chat Consultation');
        console.log('   - Multi-Product Comparison');
        console.log('\n📡 Ready to serve requests...');
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
// Export fastify instance for testing
export { fastify };
// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    start();
}
//# sourceMappingURL=app.js.map