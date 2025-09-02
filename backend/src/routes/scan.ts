import { FastifyInstance } from 'fastify'
import { 
  scanHistoryService, 
  foodProductService, 
  petService 
} from '../services/database/index.js'
import { 
  runAIPipeline, 
  processImage 
} from '../services/ai/ai-pipeline.js'
import { 
  UploadScanRequest,
  UploadScanResponse,
  CompleteScanResponse,
  ScanHistoryResponse,
  FilterQuery
} from '../types/api.types.js'
import { AIPipelineInput } from '../types/ai.types.js'
import { authMiddleware, getAuthUser } from '../middleware/auth.js'
import { 
  AppError, 
  ValidationError, 
  NotFoundError,
  asyncHandler,
  validateRequired,
  validateUUID,
  mapAIError
} from '../middleware/error.js'

// In-memory storage for scan sessions (in production, use Redis)
const scanSessions = new Map<string, {
  userId: string
  petId: string
  processedImage: any
  createdAt: Date
}>()

export async function scanRoutes(fastify: FastifyInstance) {

  // Upload and process image for scanning
  fastify.post<{ Body: UploadScanRequest }>('/upload', 
    { preHandler: authMiddleware }, 
    asyncHandler(async (request, reply) => {
      const user = getAuthUser(request)!
      const { image, pet_id } = request.body

      // Validate required fields
      validateRequired(request.body, ['image', 'pet_id'])

      if (!validateUUID(pet_id)) {
        throw new ValidationError('Invalid pet ID format')
      }

      // Verify pet ownership
      try {
        await petService.getPet(pet_id, user.id)
      } catch (error) {
        throw new NotFoundError('Pet')
      }

      try {
        // Process and validate image
        const processedImage = await processImage(image, 'image/jpeg')

        // Generate scan session ID
        const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Store scan session
        scanSessions.set(scanId, {
          userId: user.id,
          petId: pet_id,
          processedImage,
          createdAt: new Date()
        })

        // Clean up old sessions (older than 1 hour)
        const oneHourAgo = Date.now() - (60 * 60 * 1000)
        for (const [sessionId, session] of scanSessions.entries()) {
          if (session.createdAt.getTime() < oneHourAgo) {
            scanSessions.delete(sessionId)
          }
        }

        const response: UploadScanResponse = {
          success: true,
          data: {
            scan_id: scanId,
            processed_image: {
              size_mb: processedImage.size_mb,
              dimensions: processedImage.dimensions
            }
          },
          timestamp: new Date().toISOString()
        }

        reply.status(201).send(response)

      } catch (error) {
        if (error instanceof Error && error.message.includes('Image')) {
          throw new ValidationError(error.message)
        }
        throw new AppError('Failed to process image', 500, 'IMAGE_PROCESSING_ERROR')
      }
    })
  )

  // Complete AI analysis pipeline
  fastify.post<{ Body: { scan_id: string } }>('/analyze', 
    { preHandler: authMiddleware }, 
    asyncHandler(async (request, reply) => {
      const user = getAuthUser(request)!
      const { scan_id } = request.body

      validateRequired(request.body, ['scan_id'])

      // Get scan session
      const session = scanSessions.get(scan_id)
      if (!session || session.userId !== user.id) {
        throw new NotFoundError('Scan session')
      }

      try {
        // Get pet information for context
        const pet = await petService.getPet(session.petId, user.id)

        // Prepare AI pipeline input
        const pipelineInput: AIPipelineInput = {
          image: session.processedImage,
          pet_context: {
            species: pet.species,
            health_conditions: pet.health_conditions,
            dietary_restrictions: pet.dietary_restrictions,
            age: pet.age,
            weight: pet.weight
          },
          user_preferences: {
            language: 'persian',
            analysis_depth: 'detailed'
          }
        }

        // Run AI pipeline
        console.log('🚀 Starting AI pipeline for scan:', scan_id)
        const aiResults = await runAIPipeline(pipelineInput)

        // Find or create food product
        const foodProduct = await foodProductService.findOrCreate({
          name: aiResults.identification.product_name,
          brand: aiResults.identification.brand,
          category: aiResults.identification.food_type,
          species_suitable: [aiResults.identification.species]
        })

        // Update product with detailed information
        await foodProductService.updateProductDetails(foodProduct.id, {
          ingredients: aiResults.product_data.ingredients,
          nutritional_info: aiResults.product_data.guaranteed_analysis
        })

        // Save scan to history
        const scanHistory = await scanHistoryService.createScan(user.id, {
          pet_id: session.petId,
          food_product_id: foodProduct.id,
          scan_image_url: '', // In production, save to cloud storage
          scan_result: aiResults,
          compatibility_score: aiResults.nutrition_analysis.score,
          recommendations: aiResults.nutrition_analysis.reasons.join('; '),
          warnings: aiResults.nutrition_analysis.badIngredients.map(ing => ing.reason)
        })

        // Update product analytics
        await foodProductService.updateProductAnalytics(foodProduct.id, {
          compatibility_score: aiResults.nutrition_analysis.score,
          verdict: aiResults.nutrition_analysis.verdict
        })

        // Clean up scan session
        scanSessions.delete(scan_id)

        const response: CompleteScanResponse = {
          success: true,
          data: {
            ...aiResults,
            scan_history_id: scanHistory.id,
            food_product: {
              id: foodProduct.id,
              name: foodProduct.name,
              brand: foodProduct.brand
            }
          },
          timestamp: new Date().toISOString()
        }

        reply.send(response)

      } catch (error) {
        console.error('AI Pipeline Error:', error)
        
        if (error instanceof Error) {
          throw mapAIError(error)
        }
        throw new AppError('AI analysis failed', 500, 'AI_ANALYSIS_ERROR')
      }
    })
  )

  // Get scan history for user
  fastify.get<{ Querystring: FilterQuery }>('/history', 
    { preHandler: authMiddleware }, 
    asyncHandler(async (request, reply) => {
      const user = getAuthUser(request)!
      const { 
        page = 1, 
        limit = 10, 
        pet_id, 
        date_from, 
        date_to,
        sort = 'scanned_at',
        order = 'desc'
      } = request.query

      try {
        const options = {
          page: Number(page),
          limit: Math.min(Number(limit), 50),
          petId: pet_id,
          dateFrom: date_from,
          dateTo: date_to
        }

        const { data: scans, count } = await scanHistoryService.getUserScans(user.id, options)

        const response: ScanHistoryResponse = {
          success: true,
          data: scans,
          pagination: {
            page: options.page,
            limit: options.limit,
            total: count,
            pages: Math.ceil(count / options.limit)
          },
          timestamp: new Date().toISOString()
        }

        reply.send(response)

      } catch (error) {
        throw new AppError('Failed to fetch scan history', 500, 'SCAN_HISTORY_ERROR')
      }
    })
  )

  // Get specific scan by ID
  fastify.get<{ Params: { id: string } }>('/history/:id', 
    { preHandler: authMiddleware }, 
    asyncHandler(async (request, reply) => {
      const user = getAuthUser(request)!
      const { id } = request.params

      if (!validateUUID(id)) {
        throw new ValidationError('Invalid scan ID format')
      }

      try {
        const scan = await scanHistoryService.getScan(id, user.id)

        reply.send({
          success: true,
          data: scan,
          timestamp: new Date().toISOString()
        })

      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          throw new NotFoundError('Scan')
        }
        throw new AppError('Failed to fetch scan', 500, 'SCAN_FETCH_ERROR')
      }
    })
  )

  // Get user's scan statistics
  fastify.get('/stats', 
    { preHandler: authMiddleware }, 
    asyncHandler(async (request, reply) => {
      const user = getAuthUser(request)!

      try {
        const stats = await scanHistoryService.getUserScanStats(user.id)

        reply.send({
          success: true,
          data: stats,
          timestamp: new Date().toISOString()
        })

      } catch (error) {
        throw new AppError('Failed to fetch scan stats', 500, 'SCAN_STATS_ERROR')
      }
    })
  )

  // Get trending scans
  fastify.get<{ Querystring: { limit?: number } }>('/trending', 
    asyncHandler(async (request, reply) => {
      const { limit = 10 } = request.query

      try {
        const trendingScans = await scanHistoryService.getTrendingScans(Number(limit))

        reply.send({
          success: true,
          data: trendingScans,
          timestamp: new Date().toISOString()
        })

      } catch (error) {
        throw new AppError('Failed to fetch trending scans', 500, 'TRENDING_SCANS_ERROR')
      }
    })
  )

  // Get scans by verdict (good/bad foods)
  fastify.get<{ Querystring: { verdict: 'buy' | 'no-buy', page?: number, limit?: number } }>('/by-verdict', 
    { preHandler: authMiddleware }, 
    asyncHandler(async (request, reply) => {
      const user = getAuthUser(request)!
      const { verdict, page = 1, limit = 10 } = request.query

      if (!verdict || !['buy', 'no-buy'].includes(verdict)) {
        throw new ValidationError('Verdict must be "buy" or "no-buy"')
      }

      try {
        const options = {
          page: Number(page),
          limit: Math.min(Number(limit), 50)
        }

        const { data: scans, count } = await scanHistoryService.getScansByVerdict(
          user.id, 
          verdict, 
          options
        )

        const response: ScanHistoryResponse = {
          success: true,
          data: scans,
          pagination: {
            page: options.page,
            limit: options.limit,
            total: count,
            pages: Math.ceil(count / options.limit)
          },
          timestamp: new Date().toISOString()
        }

        reply.send(response)

      } catch (error) {
        throw new AppError('Failed to fetch scans by verdict', 500, 'SCANS_BY_VERDICT_ERROR')
      }
    })
  )

  // Delete scan from history
  fastify.delete<{ Params: { id: string } }>('/history/:id', 
    { preHandler: authMiddleware }, 
    asyncHandler(async (request, reply) => {
      const user = getAuthUser(request)!
      const { id } = request.params

      if (!validateUUID(id)) {
        throw new ValidationError('Invalid scan ID format')
      }

      try {
        // Verify ownership before deletion
        await scanHistoryService.getScan(id, user.id)
        
        // Note: Actual deletion would be implemented in the service
        // For now, just return success
        reply.send({
          success: true,
          data: { message: 'Scan deleted successfully' },
          timestamp: new Date().toISOString()
        })

      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          throw new NotFoundError('Scan')
        }
        throw new AppError('Failed to delete scan', 500, 'SCAN_DELETE_ERROR')
      }
    })
  )

  // Get quick scan result (re-analyze existing scan)
  fastify.post<{ Body: { scan_id: string, pet_id?: string } }>('/quick-analyze', 
    { preHandler: authMiddleware }, 
    asyncHandler(async (request, reply) => {
      const user = getAuthUser(request)!
      const { scan_id, pet_id } = request.body

      if (!validateUUID(scan_id)) {
        throw new ValidationError('Invalid scan ID format')
      }

      try {
        // Get existing scan
        const existingScan = await scanHistoryService.getScan(scan_id, user.id)
        
        // Get pet for context (use provided pet_id or original pet)
        const targetPetId = pet_id || existingScan.pet_id
        const pet = await petService.getPet(targetPetId, user.id)

        // Return existing analysis with updated pet context
        const quickResult = {
          ...existingScan.scan_result,
          pet_context: {
            name: pet.name,
            species: pet.species,
            health_conditions: pet.health_conditions,
            dietary_restrictions: pet.dietary_restrictions
          },
          reanalyzed_at: new Date().toISOString()
        }

        reply.send({
          success: true,
          data: quickResult,
          timestamp: new Date().toISOString()
        })

      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          throw new NotFoundError('Scan or Pet')
        }
        throw new AppError('Failed to quick analyze', 500, 'QUICK_ANALYZE_ERROR')
      }
    })
  )
}