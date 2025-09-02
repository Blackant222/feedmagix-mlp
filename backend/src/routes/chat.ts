import { FastifyInstance } from 'fastify'
import { chatService, petService } from '../services/database/index.js'
import { aiChatService } from '../services/ai/chat.js'
import { 
  CreateChatSessionRequest,
  SendMessageRequest,
  ChatSessionResponse,
  ChatSessionsResponse,
  SendMessageResponse,
  ChatMessagesResponse,
  FilterQuery
} from '../types/api.types.js'
import { ChatContext } from '../types/ai.types.js'
import { authMiddleware, getAuthUser } from '../middleware/auth.js'
import { 
  AppError, 
  ValidationError, 
  NotFoundError,
  asyncHandler,
  validateRequired,
  validateUUID
} from '../middleware/error.js'

export async function chatRoutes(fastify: FastifyInstance) {

  // Get all chat sessions for user
  fastify.get<{ Querystring: { page?: number, limit?: number } }>('/sessions', 
    { preHandler: authMiddleware }, 
    asyncHandler(async (request, reply) => {
      const user = getAuthUser(request)!
      const { page = 1, limit = 20 } = request.query

      try {
        const options = {
          page: Number(page),
          limit: Math.min(Number(limit), 50)
        }

        const { data: sessions, count } = await chatService.getUserSessions(user.id, options)

        const response: ChatSessionsResponse = {
          success: true,
          data: sessions,
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
        throw new AppError('Failed to fetch chat sessions', 500, 'CHAT_SESSIONS_ERROR')
      }
    })
  )

  // Create new chat session
  fastify.post<{ Body: CreateChatSessionRequest }>('/sessions', 
    { preHandler: authMiddleware }, 
    asyncHandler(async (request, reply) => {
      const user = getAuthUser(request)!
      const { pet_id, title } = request.body

      validateRequired(request.body, ['pet_id'])

      if (!validateUUID(pet_id)) {
        throw new ValidationError('Invalid pet ID format')
      }

      try {
        // Verify pet ownership
        const pet = await petService.getPet(pet_id, user.id)

        // Create chat session in database
        const session = await chatService.createSession(user.id, {
          pet_id,
          title: title || `Chat with ${pet.name}`
        })

        // Initialize AI chat session
        const chatContext: ChatContext = {
          pet_profile: {
            name: pet.name,
            species: pet.species,
            health_conditions: pet.health_conditions,
            dietary_restrictions: pet.dietary_restrictions
          }
        }

        await aiChatService.startChatSession(session.id, chatContext)

        const response: ChatSessionResponse = {
          success: true,
          data: session,
          timestamp: new Date().toISOString()
        }

        reply.status(201).send(response)

      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          throw new NotFoundError('Pet')
        }
        throw new AppError('Failed to create chat session', 500, 'CHAT_CREATE_ERROR')
      }
    })
  )

  // Get specific chat session
  fastify.get<{ Params: { id: string } }>('/sessions/:id', 
    { preHandler: authMiddleware }, 
    asyncHandler(async (request, reply) => {
      const user = getAuthUser(request)!
      const { id } = request.params

      if (!validateUUID(id)) {
        throw new ValidationError('Invalid session ID format')
      }

      try {
        const sessionWithContext = await chatService.getSessionWithContext(id, user.id)

        reply.send({
          success: true,
          data: sessionWithContext,
          timestamp: new Date().toISOString()
        })

      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          throw new NotFoundError('Chat session')
        }
        throw new AppError('Failed to fetch chat session', 500, 'CHAT_FETCH_ERROR')
      }
    })
  )

  // Update chat session
  fastify.put<{ Params: { id: string }, Body: { title?: string } }>('/sessions/:id', 
    { preHandler: authMiddleware }, 
    asyncHandler(async (request, reply) => {
      const user = getAuthUser(request)!
      const { id } = request.params
      const { title } = request.body

      if (!validateUUID(id)) {
        throw new ValidationError('Invalid session ID format')
      }

      if (!title || title.trim().length === 0) {
        throw new ValidationError('Title is required and cannot be empty')
      }

      try {
        const updatedSession = await chatService.updateSession(id, user.id, { title: title.trim() })

        const response: ChatSessionResponse = {
          success: true,
          data: updatedSession,
          timestamp: new Date().toISOString()
        }

        reply.send(response)

      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          throw new NotFoundError('Chat session')
        }
        throw new AppError('Failed to update chat session', 500, 'CHAT_UPDATE_ERROR')
      }
    })
  )

  // Delete chat session
  fastify.delete<{ Params: { id: string } }>('/sessions/:id', 
    { preHandler: authMiddleware }, 
    asyncHandler(async (request, reply) => {
      const user = getAuthUser(request)!
      const { id } = request.params

      if (!validateUUID(id)) {
        throw new ValidationError('Invalid session ID format')
      }

      try {
        await chatService.deleteSession(id, user.id)
        
        // Clear AI chat session
        aiChatService.clearSession(id)

        reply.send({
          success: true,
          data: { message: 'Chat session deleted successfully' },
          timestamp: new Date().toISOString()
        })

      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          throw new NotFoundError('Chat session')
        }
        throw new AppError('Failed to delete chat session', 500, 'CHAT_DELETE_ERROR')
      }
    })
  )

  // Get messages for a chat session
  fastify.get<{ 
    Params: { id: string }, 
    Querystring: { page?: number, limit?: number, since?: string } 
  }>('/sessions/:id/messages', 
    { preHandler: authMiddleware }, 
    asyncHandler(async (request, reply) => {
      const user = getAuthUser(request)!
      const { id } = request.params
      const { page = 1, limit = 50, since } = request.query

      if (!validateUUID(id)) {
        throw new ValidationError('Invalid session ID format')
      }

      try {
        const options = {
          page: Number(page),
          limit: Math.min(Number(limit), 100),
          since
        }

        const { data: messages, count } = await chatService.getSessionMessages(id, user.id, options)

        const response: ChatMessagesResponse = {
          success: true,
          data: messages,
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
        if (error instanceof Error && error.message.includes('not found')) {
          throw new NotFoundError('Chat session')
        }
        throw new AppError('Failed to fetch chat messages', 500, 'CHAT_MESSAGES_ERROR')
      }
    })
  )

  // Send message to chat session
  fastify.post<{ Params: { id: string }, Body: SendMessageRequest }>('/sessions/:id/messages', 
    { preHandler: authMiddleware }, 
    asyncHandler(async (request, reply) => {
      const user = getAuthUser(request)!
      const { id } = request.params
      const { content, metadata } = request.body

      if (!validateUUID(id)) {
        throw new ValidationError('Invalid session ID format')
      }

      validateRequired(request.body, ['content'])

      if (content.trim().length === 0) {
        throw new ValidationError('Message content cannot be empty')
      }

      if (content.length > 2000) {
        throw new ValidationError('Message content cannot exceed 2000 characters')
      }

      try {
        // Add user message to database
        const userMessage = await chatService.addMessage(user.id, {
          session_id: id,
          role: 'user',
          content: content.trim(),
          metadata
        })

        // Get session context for AI
        const sessionWithContext = await chatService.getSessionWithContext(id, user.id)
        
        // Initialize AI session if needed
        if (!aiChatService.getSessionInfo(id)) {
          const chatContext: ChatContext = {
            pet_profile: {
              name: sessionWithContext.pet?.name || 'your pet',
              species: sessionWithContext.pet?.species || 'unknown',
              health_conditions: sessionWithContext.pet?.health_conditions,
              dietary_restrictions: sessionWithContext.pet?.dietary_restrictions
            }
          }
          await aiChatService.startChatSession(id, chatContext)
        }

        // Get AI response
        const aiResponse = await aiChatService.sendMessage(id, content.trim())

        // Add AI message to database
        const aiMessage = await chatService.addMessage(user.id, {
          session_id: id,
          role: 'assistant',
          content: aiResponse.content,
          metadata: {
            suggestions: aiResponse.suggestions,
            follow_up_questions: aiResponse.follow_up_questions,
            confidence_score: aiResponse.confidence_score
          }
        })

        const response: SendMessageResponse = {
          success: true,
          data: {
            message: userMessage,
            ai_response: {
              ...aiResponse,
              message_id: aiMessage.id
            }
          },
          timestamp: new Date().toISOString()
        }

        reply.status(201).send(response)

      } catch (error) {
        console.error('Chat message error:', error)
        
        if (error instanceof Error && error.message.includes('not found')) {
          throw new NotFoundError('Chat session')
        }
        if (error instanceof Error && error.message.includes('AI')) {
          throw new AppError('AI chat service unavailable', 503, 'AI_CHAT_ERROR')
        }
        throw new AppError('Failed to send message', 500, 'CHAT_MESSAGE_ERROR')
      }
    })
  )

  // Search messages across user's chat sessions
  fastify.get<{ Querystring: { q: string, page?: number, limit?: number } }>('/search', 
    { preHandler: authMiddleware }, 
    asyncHandler(async (request, reply) => {
      const user = getAuthUser(request)!
      const { q, page = 1, limit = 20 } = request.query

      if (!q || q.trim().length < 2) {
        throw new ValidationError('Search query must be at least 2 characters long')
      }

      try {
        const options = {
          page: Number(page),
          limit: Math.min(Number(limit), 50)
        }

        const { data: messages, count } = await chatService.searchMessages(
          user.id, 
          q.trim(), 
          options
        )

        const response: ChatMessagesResponse = {
          success: true,
          data: messages,
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
        throw new AppError('Failed to search messages', 500, 'CHAT_SEARCH_ERROR')
      }
    })
  )

  // Get user's chat statistics
  fastify.get('/stats', 
    { preHandler: authMiddleware }, 
    asyncHandler(async (request, reply) => {
      const user = getAuthUser(request)!

      try {
        const stats = await chatService.getUserChatStats(user.id)

        reply.send({
          success: true,
          data: stats,
          timestamp: new Date().toISOString()
        })

      } catch (error) {
        throw new AppError('Failed to fetch chat stats', 500, 'CHAT_STATS_ERROR')
      }
    })
  )

  // Clear AI chat session memory (restart conversation context)
  fastify.post<{ Params: { id: string } }>('/sessions/:id/reset', 
    { preHandler: authMiddleware }, 
    asyncHandler(async (request, reply) => {
      const user = getAuthUser(request)!
      const { id } = request.params

      if (!validateUUID(id)) {
        throw new ValidationError('Invalid session ID format')
      }

      try {
        // Verify session ownership
        await chatService.getSession(id, user.id)
        
        // Clear AI session
        aiChatService.clearSession(id)

        reply.send({
          success: true,
          data: { message: 'Chat session reset successfully' },
          timestamp: new Date().toISOString()
        })

      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          throw new NotFoundError('Chat session')
        }
        throw new AppError('Failed to reset chat session', 500, 'CHAT_RESET_ERROR')
      }
    })
  )

  // Export chat session (download messages)
  fastify.get<{ Params: { id: string } }>('/sessions/:id/export', 
    { preHandler: authMiddleware }, 
    asyncHandler(async (request, reply) => {
      const user = getAuthUser(request)!
      const { id } = request.params

      if (!validateUUID(id)) {
        throw new ValidationError('Invalid session ID format')
      }

      try {
        const sessionWithContext = await chatService.getSessionWithContext(id, user.id)
        const { data: messages } = await chatService.getSessionMessages(id, user.id, { limit: 1000 })

        const exportData = {
          session: sessionWithContext.session,
          pet: sessionWithContext.pet,
          messages: messages.data || [],
          exported_at: new Date().toISOString(),
          total_messages: sessionWithContext.message_count
        }

        reply
          .header('Content-Type', 'application/json')
          .header('Content-Disposition', `attachment; filename="chat-${id}.json"`)
          .send(exportData)

      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          throw new NotFoundError('Chat session')
        }
        throw new AppError('Failed to export chat session', 500, 'CHAT_EXPORT_ERROR')
      }
    })
  )
}