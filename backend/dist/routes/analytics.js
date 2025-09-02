import { profileService, petService, scanHistoryService, chatService, comparisonService, foodProductService } from '../services/database/index.js';
import { supabase } from '../config/supabase.js';
import { authMiddleware, getAuthUser, optionalAuthMiddleware } from '../middleware/auth.js';
import { AppError, ValidationError, asyncHandler, validateRequired } from '../middleware/error.js';
export async function analyticsRoutes(fastify) {
    // Track user events for analytics
    fastify.post('/track', { preHandler: optionalAuthMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        const { event_type, event_data, session_id } = request.body;
        validateRequired(request.body, ['event_type', 'event_data']);
        if (!event_type || event_type.trim().length === 0) {
            throw new ValidationError('Event type cannot be empty');
        }
        try {
            // Create analytics entry
            const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const analyticsData = {
                id: eventId,
                user_id: user?.id || null,
                event_type: event_type.trim(),
                event_data,
                session_id: session_id || null,
                ip_address: request.ip,
                user_agent: request.headers['user-agent'] || null,
                created_at: new Date().toISOString()
            };
            // In a real implementation, this would be saved to user_analytics table
            // For now, we'll just log it
            console.log('📊 Analytics Event:', analyticsData);
            const response = {
                success: true,
                data: {
                    tracked: true,
                    event_id: eventId
                },
                timestamp: new Date().toISOString()
            };
            reply.send(response);
        }
        catch (error) {
            throw new AppError('Failed to track event', 500, 'ANALYTICS_TRACK_ERROR');
        }
    }));
    // Get comprehensive user statistics
    fastify.get('/user-stats', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        try {
            // Get basic profile stats
            const profileStats = await profileService.getUserStats(user.id);
            // Get scan statistics
            const scanStats = await scanHistoryService.getUserScanStats(user.id);
            // Get chat statistics
            const chatStats = await chatService.getUserChatStats(user.id);
            // Get comparison statistics
            const comparisonStats = await comparisonService.getUserComparisonStats(user.id);
            // Get recent activity (last 10 scans, chats, comparisons)
            const { data: recentScans } = await scanHistoryService.getUserScans(user.id, { limit: 5 });
            const { data: recentSessions } = await chatService.getUserSessions(user.id, { limit: 3 });
            const { data: recentComparisons } = await comparisonService.getUserComparisons(user.id, { limit: 3 });
            const recentActivity = [
                ...recentScans.map(scan => ({
                    type: 'scan',
                    timestamp: scan.scanned_at,
                    details: {
                        pet_name: scan.pet?.name,
                        product_name: scan.food_product?.name,
                        score: scan.compatibility_score
                    }
                })),
                ...recentSessions.map(session => ({
                    type: 'chat',
                    timestamp: session.updated_at,
                    details: {
                        title: session.title,
                        message_count: session.message_count
                    }
                })),
                ...recentComparisons.map(comparison => ({
                    type: 'comparison',
                    timestamp: comparison.created_at,
                    details: {
                        pet_name: comparison.pet?.name,
                        product_count: comparison.product_count
                    }
                }))
            ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
            const userStatsData = {
                total_scans: scanStats.total_scans,
                total_pets: profileStats.stats.total_pets,
                total_chat_sessions: chatStats.total_sessions,
                average_compatibility_score: scanStats.avg_compatibility_score,
                most_scanned_brands: scanStats.most_scanned_brand ? [scanStats.most_scanned_brand] : [],
                recent_activity: recentActivity,
                // Additional detailed stats
                detailed_stats: {
                    scans: {
                        good_foods: scanStats.good_foods,
                        bad_foods: scanStats.bad_foods,
                        recent_scan_date: scanStats.recent_scan_date
                    },
                    chats: {
                        total_messages: chatStats.total_messages,
                        avg_messages_per_session: chatStats.avg_messages_per_session,
                        most_active_pet: chatStats.most_active_pet,
                        recent_session_date: chatStats.recent_session_date
                    },
                    comparisons: {
                        total_comparisons: comparisonStats.total_comparisons,
                        avg_products_per_comparison: comparisonStats.avg_products_per_comparison,
                        favorite_winner_brand: comparisonStats.favorite_winner_brand,
                        most_compared_brands: comparisonStats.most_compared_brands
                    }
                }
            };
            const response = {
                success: true,
                data: userStatsData,
                timestamp: new Date().toISOString()
            };
            reply.send(response);
        }
        catch (error) {
            throw new AppError('Failed to fetch user statistics', 500, 'USER_STATS_ERROR');
        }
    }));
    // Get product analytics and trends (public endpoint)
    fastify.get('/product-stats', asyncHandler(async (request, reply) => {
        try {
            // Get popular products
            const popularProducts = await foodProductService.getPopularProducts(10);
            // Get top rated products
            const topRatedProducts = await foodProductService.getTopRatedProducts(undefined, 10);
            // Get category distribution from database
            const { data: categoryData } = await supabase
                .from('food_products')
                .select('category');
            const categoryDistribution = (categoryData || []).reduce((acc, product) => {
                const category = product.category || 'uncategorized';
                acc[category] = (acc[category] || 0) + 1;
                return acc;
            }, {});
            // Calculate average scores by category
            const { data: scoreData } = await supabase
                .from('product_analytics')
                .select(`
            avg_compatibility_score,
            food_products (category)
          `);
            const categoryScores = (scoreData || []).reduce((acc, item) => {
                const category = item.food_products?.category || 'uncategorized';
                if (!acc[category])
                    acc[category] = { total: 0, count: 0 };
                acc[category].total += item.avg_compatibility_score || 0;
                acc[category].count += 1;
                return acc;
            }, {});
            const averageScoresByCategory = Object.fromEntries(Object.entries(categoryScores).map(([category, data]) => [
                category,
                Math.round((data.total / data.count) * 100) / 100
            ]));
            const productStatsData = {
                total_products: (categoryData || []).length,
                most_popular_products: popularProducts.map(product => ({
                    product_id: product.id,
                    name: product.name,
                    brand: product.brand || 'Unknown',
                    scan_count: product.scan_count,
                    avg_score: 0 // Would be calculated from analytics
                })),
                category_distribution: categoryDistribution,
                average_scores_by_category: averageScoresByCategory,
                // Additional insights
                top_rated_products: topRatedProducts.map(product => ({
                    product_id: product.id,
                    name: product.name,
                    brand: product.brand || 'Unknown',
                    avg_score: product.avg_score
                })),
                total_scans_analyzed: 0, // Would be calculated from scan_history
                total_comparisons: 0 // Would be calculated from comparisons
            };
            const response = {
                success: true,
                data: productStatsData,
                timestamp: new Date().toISOString()
            };
            reply.send(response);
        }
        catch (error) {
            throw new AppError('Failed to fetch product statistics', 500, 'PRODUCT_STATS_ERROR');
        }
    }));
    // Get business metrics (admin only)
    fastify.get('/business-metrics', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        // In a real implementation, this would check for admin role
        // For now, we'll return basic metrics for any authenticated user
        try {
            // Get total counts
            const { count: totalUsers } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });
            const { count: totalPets } = await supabase
                .from('pets')
                .select('*', { count: 'exact', head: true });
            const { count: totalScans } = await supabase
                .from('scan_history')
                .select('*', { count: 'exact', head: true });
            const { count: totalChats } = await supabase
                .from('chat_sessions')
                .select('*', { count: 'exact', head: true });
            const { count: totalComparisons } = await supabase
                .from('food_comparisons')
                .select('*', { count: 'exact', head: true });
            // Get growth metrics (last 30 days)
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const { count: newUsers } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', thirtyDaysAgo);
            const { count: newScans } = await supabase
                .from('scan_history')
                .select('*', { count: 'exact', head: true })
                .gte('scanned_at', thirtyDaysAgo);
            const businessMetrics = {
                totals: {
                    users: totalUsers || 0,
                    pets: totalPets || 0,
                    scans: totalScans || 0,
                    chat_sessions: totalChats || 0,
                    comparisons: totalComparisons || 0
                },
                growth_30_days: {
                    new_users: newUsers || 0,
                    new_scans: newScans || 0
                },
                engagement: {
                    avg_scans_per_user: totalUsers ? Math.round((totalScans || 0) / totalUsers * 100) / 100 : 0,
                    avg_pets_per_user: totalUsers ? Math.round((totalPets || 0) / totalUsers * 100) / 100 : 0
                }
            };
            reply.send({
                success: true,
                data: businessMetrics,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            throw new AppError('Failed to fetch business metrics', 500, 'BUSINESS_METRICS_ERROR');
        }
    }));
    // Get AI usage statistics
    fastify.get('/ai-stats', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        try {
            // Get user's AI-related statistics
            const { data: scans } = await supabase
                .from('scan_history')
                .select('scan_result, scanned_at')
                .eq('user_id', user.id);
            const aiStats = {
                total_ai_analyses: scans?.length || 0,
                avg_processing_time: 0, // Would calculate from scan_result.processing_time_ms
                success_rate: 100, // Would calculate based on successful vs failed analyses
                most_analyzed_species: 'dog', // Would calculate from scan results
                feature_usage: {
                    product_identification: scans?.length || 0,
                    nutrition_analysis: scans?.length || 0,
                    chat_consultations: 0, // Would get from chat stats
                    comparisons: 0 // Would get from comparison stats
                }
            };
            reply.send({
                success: true,
                data: aiStats,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            throw new AppError('Failed to fetch AI statistics', 500, 'AI_STATS_ERROR');
        }
    }));
    // Export user data (GDPR compliance)
    fastify.get('/export', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        try {
            // Get all user data
            const profile = await profileService.findById(user.id);
            const { data: pets } = await petService.getUserPets(user.id, { limit: 100 });
            const { data: scans } = await scanHistoryService.getUserScans(user.id, { limit: 1000 });
            const { data: sessions } = await chatService.getUserSessions(user.id, { limit: 100 });
            const { data: comparisons } = await comparisonService.getUserComparisons(user.id, { limit: 100 });
            const exportData = {
                export_info: {
                    user_id: user.id,
                    exported_at: new Date().toISOString(),
                    export_type: 'complete_user_data'
                },
                profile,
                pets: pets || [],
                scan_history: scans || [],
                chat_sessions: sessions || [],
                comparisons: comparisons || []
            };
            reply
                .header('Content-Type', 'application/json')
                .header('Content-Disposition', `attachment; filename="feedmagix-data-${user.id}.json"`)
                .send(exportData);
        }
        catch (error) {
            throw new AppError('Failed to export user data', 500, 'DATA_EXPORT_ERROR');
        }
    }));
    // Health check endpoint with system statistics
    fastify.get('/health', asyncHandler(async (request, reply) => {
        try {
            // Check database connectivity
            const { data: dbCheck } = await supabase
                .from('profiles')
                .select('count')
                .limit(1);
            // Basic system health checks
            const healthData = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                services: {
                    database: !!dbCheck,
                    ai_service: true, // Would test Gemini API
                    auth_service: true // Would test Supabase Auth
                },
                system: {
                    uptime: process.uptime(),
                    memory_usage: process.memoryUsage(),
                    node_version: process.version
                }
            };
            reply.send({
                success: true,
                data: healthData,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            reply.status(503).send({
                success: false,
                error: {
                    message: 'System health check failed',
                    code: 'HEALTH_CHECK_FAILED'
                },
                timestamp: new Date().toISOString()
            });
        }
    }));
}
//# sourceMappingURL=analytics.js.map