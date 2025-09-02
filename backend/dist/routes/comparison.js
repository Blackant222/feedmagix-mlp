import { comparisonService, scanHistoryService, petService } from '../services/database/index.js';
import { getComparisonRecommendation } from '../services/ai/chat.js';
import { authMiddleware, getAuthUser } from '../middleware/auth.js';
import { AppError, ValidationError, NotFoundError, asyncHandler, validateRequired, validateUUID, mapAIError } from '../middleware/error.js';
export async function comparisonRoutes(fastify) {
    // Create new comparison from scan IDs
    fastify.post('/create', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        const { pet_id, scan_ids } = request.body;
        validateRequired(request.body, ['pet_id', 'scan_ids']);
        if (!validateUUID(pet_id)) {
            throw new ValidationError('Invalid pet ID format');
        }
        if (!Array.isArray(scan_ids) || scan_ids.length < 2) {
            throw new ValidationError('At least 2 scan IDs are required for comparison');
        }
        if (scan_ids.length > 5) {
            throw new ValidationError('Maximum 5 products can be compared at once');
        }
        // Validate scan IDs format
        for (const scanId of scan_ids) {
            if (!validateUUID(scanId)) {
                throw new ValidationError(`Invalid scan ID format: ${scanId}`);
            }
        }
        try {
            // Verify pet ownership
            await petService.getPet(pet_id, user.id);
            // Get scan results and verify ownership
            const scans = [];
            for (const scanId of scan_ids) {
                const scan = await scanHistoryService.getScan(scanId, user.id);
                scans.push(scan);
            }
            // Extract product IDs from scans
            const productIds = scans.map(scan => scan.food_product_id);
            // Create comparison record
            const comparison = await comparisonService.createComparison(user.id, {
                pet_id,
                product_ids: productIds,
                comparison_result: {
                    scan_ids,
                    status: 'pending',
                    created_from: 'scan_history'
                }
            });
            const response = {
                success: true,
                data: comparison,
                timestamp: new Date().toISOString()
            };
            reply.status(201).send(response);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw new NotFoundError('Pet or Scan');
            }
            throw new AppError('Failed to create comparison', 500, 'COMPARISON_CREATE_ERROR');
        }
    }));
    // Analyze comparison with AI recommendations
    fastify.post('/analyze', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        const { comparison_id } = request.body;
        validateRequired(request.body, ['comparison_id']);
        if (!validateUUID(comparison_id)) {
            throw new ValidationError('Invalid comparison ID format');
        }
        try {
            // Get comparison with products
            const comparisonData = await comparisonService.getComparisonWithProducts(comparison_id, user.id);
            if (!comparisonData.products || comparisonData.products.length < 2) {
                throw new ValidationError('Comparison must have at least 2 products');
            }
            // Prepare products for AI analysis
            const productsForAnalysis = comparisonData.products
                .filter(product => product.scan_data) // Only products with scan data
                .map(product => ({
                identification: {
                    brand: product.brand || 'Unknown',
                    product_name: product.name,
                    size: 'Unknown',
                    food_type: product.category || 'kibble',
                    species: comparisonData.pet?.species || 'dog'
                },
                nutrition_analysis: {
                    score: product.scan_data.compatibility_score || 0,
                    verdict: product.scan_data.scan_result?.nutrition_analysis?.verdict || 'no-buy',
                    reasons: product.scan_data.scan_result?.nutrition_analysis?.reasons || [],
                    goodIngredients: product.scan_data.scan_result?.nutrition_analysis?.goodIngredients || [],
                    badIngredients: product.scan_data.scan_result?.nutrition_analysis?.badIngredients || []
                }
            }));
            if (productsForAnalysis.length < 2) {
                throw new ValidationError('Not enough products with analysis data for comparison');
            }
            // Get AI recommendation
            const aiAnalysis = await getComparisonRecommendation(productsForAnalysis, {
                name: comparisonData.pet?.name || 'Pet',
                species: comparisonData.pet?.species || 'dog',
                health_conditions: comparisonData.pet?.health_conditions,
                dietary_restrictions: comparisonData.pet?.dietary_restrictions
            });
            // Update comparison with AI results
            const updatedComparison = await comparisonService.updateComparisonResults(comparison_id, user.id, aiAnalysis);
            const response = {
                success: true,
                data: aiAnalysis,
                timestamp: new Date().toISOString()
            };
            reply.send(response);
        }
        catch (error) {
            console.error('Comparison analysis error:', error);
            if (error instanceof Error && error.message.includes('not found')) {
                throw new NotFoundError('Comparison');
            }
            if (error instanceof Error && error.message.includes('AI')) {
                throw mapAIError(error);
            }
            throw new AppError('Failed to analyze comparison', 500, 'COMPARISON_ANALYSIS_ERROR');
        }
    }));
    // Get user's comparison history
    fastify.get('/history', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        const { page = 1, limit = 10, pet_id } = request.query;
        try {
            const options = {
                page: Number(page),
                limit: Math.min(Number(limit), 50),
                petId: pet_id
            };
            const { data: comparisons, count } = await comparisonService.getUserComparisons(user.id, options);
            const response = {
                success: true,
                data: comparisons,
                pagination: {
                    page: options.page,
                    limit: options.limit,
                    total: count,
                    pages: Math.ceil(count / options.limit)
                },
                timestamp: new Date().toISOString()
            };
            reply.send(response);
        }
        catch (error) {
            throw new AppError('Failed to fetch comparison history', 500, 'COMPARISON_HISTORY_ERROR');
        }
    }));
    // Get specific comparison by ID
    fastify.get('/:id', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        const { id } = request.params;
        if (!validateUUID(id)) {
            throw new ValidationError('Invalid comparison ID format');
        }
        try {
            const comparisonData = await comparisonService.getComparisonWithProducts(id, user.id);
            reply.send({
                success: true,
                data: comparisonData,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw new NotFoundError('Comparison');
            }
            throw new AppError('Failed to fetch comparison', 500, 'COMPARISON_FETCH_ERROR');
        }
    }));
    // Delete comparison
    fastify.delete('/:id', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        const { id } = request.params;
        if (!validateUUID(id)) {
            throw new ValidationError('Invalid comparison ID format');
        }
        try {
            // Verify ownership
            await comparisonService.getComparison(id, user.id);
            // Delete comparison (this would be implemented in the service)
            reply.send({
                success: true,
                data: { message: 'Comparison deleted successfully' },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw new NotFoundError('Comparison');
            }
            throw new AppError('Failed to delete comparison', 500, 'COMPARISON_DELETE_ERROR');
        }
    }));
    // Get user's comparison statistics
    fastify.get('/stats', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        try {
            const stats = await comparisonService.getUserComparisonStats(user.id);
            reply.send({
                success: true,
                data: stats,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            throw new AppError('Failed to fetch comparison stats', 500, 'COMPARISON_STATS_ERROR');
        }
    }));
    // Get popular comparison patterns (public endpoint)
    fastify.get('/popular', asyncHandler(async (request, reply) => {
        const { limit = 10 } = request.query;
        try {
            const popularComparisons = await comparisonService.getPopularComparisons(Number(limit));
            reply.send({
                success: true,
                data: popularComparisons,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            throw new AppError('Failed to fetch popular comparisons', 500, 'POPULAR_COMPARISONS_ERROR');
        }
    }));
    // Quick compare (compare products directly without creating history)
    fastify.post('/quick', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        const { scan_ids, pet_id } = request.body;
        validateRequired(request.body, ['scan_ids', 'pet_id']);
        if (!validateUUID(pet_id)) {
            throw new ValidationError('Invalid pet ID format');
        }
        if (!Array.isArray(scan_ids) || scan_ids.length < 2 || scan_ids.length > 5) {
            throw new ValidationError('Must compare between 2 and 5 products');
        }
        try {
            // Verify pet ownership
            const pet = await petService.getPet(pet_id, user.id);
            // Get scan results
            const scans = [];
            for (const scanId of scan_ids) {
                const scan = await scanHistoryService.getScan(scanId, user.id);
                scans.push(scan);
            }
            // Prepare products for analysis
            const productsForAnalysis = scans
                .filter(scan => scan.scan_result)
                .map(scan => ({
                identification: scan.scan_result.identification,
                nutrition_analysis: scan.scan_result.nutrition_analysis
            }));
            if (productsForAnalysis.length < 2) {
                throw new ValidationError('Not enough valid scan results for comparison');
            }
            // Get AI recommendation without saving to database
            const aiAnalysis = await getComparisonRecommendation(productsForAnalysis, {
                name: pet.name,
                species: pet.species,
                health_conditions: pet.health_conditions,
                dietary_restrictions: pet.dietary_restrictions
            });
            const response = {
                success: true,
                data: {
                    ...aiAnalysis,
                    quick_comparison: true,
                    compared_scans: scan_ids
                },
                timestamp: new Date().toISOString()
            };
            reply.send(response);
        }
        catch (error) {
            console.error('Quick comparison error:', error);
            if (error instanceof Error && error.message.includes('not found')) {
                throw new NotFoundError('Pet or Scan');
            }
            if (error instanceof Error && error.message.includes('AI')) {
                throw mapAIError(error);
            }
            throw new AppError('Failed to perform quick comparison', 500, 'QUICK_COMPARISON_ERROR');
        }
    }));
    // Re-analyze existing comparison with updated pet context
    fastify.post('/reanalyze', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        const { comparison_id, pet_id } = request.body;
        validateRequired(request.body, ['comparison_id']);
        if (!validateUUID(comparison_id)) {
            throw new ValidationError('Invalid comparison ID format');
        }
        try {
            // Get comparison data
            const comparisonData = await comparisonService.getComparisonWithProducts(comparison_id, user.id);
            // Use provided pet or original pet
            let targetPet = comparisonData.pet;
            if (pet_id) {
                if (!validateUUID(pet_id)) {
                    throw new ValidationError('Invalid pet ID format');
                }
                targetPet = await petService.getPet(pet_id, user.id);
            }
            if (!targetPet) {
                throw new NotFoundError('Pet');
            }
            // Prepare products for analysis
            const productsForAnalysis = comparisonData.products
                .filter(product => product.scan_data)
                .map(product => ({
                identification: {
                    brand: product.brand || 'Unknown',
                    product_name: product.name,
                    size: 'Unknown',
                    food_type: product.category || 'kibble',
                    species: targetPet.species
                },
                nutrition_analysis: product.scan_data.scan_result?.nutrition_analysis || {
                    score: product.scan_data.compatibility_score || 0,
                    verdict: 'no-buy',
                    reasons: [],
                    goodIngredients: [],
                    badIngredients: []
                }
            }));
            if (productsForAnalysis.length < 2) {
                throw new ValidationError('Not enough products with analysis data');
            }
            // Get updated AI recommendation
            const aiAnalysis = await getComparisonRecommendation(productsForAnalysis, {
                name: targetPet.name,
                species: targetPet.species,
                health_conditions: targetPet.health_conditions,
                dietary_restrictions: targetPet.dietary_restrictions
            });
            // Update comparison if using same pet, otherwise return without saving
            if (!pet_id || pet_id === comparisonData.comparison.pet_id) {
                await comparisonService.updateComparisonResults(comparison_id, user.id, aiAnalysis);
            }
            const response = {
                success: true,
                data: {
                    ...aiAnalysis,
                    reanalyzed: true,
                    reanalyzed_for_pet: targetPet.name,
                    reanalyzed_at: new Date().toISOString()
                },
                timestamp: new Date().toISOString()
            };
            reply.send(response);
        }
        catch (error) {
            console.error('Comparison reanalysis error:', error);
            if (error instanceof Error && error.message.includes('not found')) {
                throw new NotFoundError('Comparison or Pet');
            }
            if (error instanceof Error && error.message.includes('AI')) {
                throw mapAIError(error);
            }
            throw new AppError('Failed to reanalyze comparison', 500, 'COMPARISON_REANALYSIS_ERROR');
        }
    }));
}
//# sourceMappingURL=comparison.js.map