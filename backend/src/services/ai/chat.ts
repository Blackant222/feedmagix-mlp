import { createChatSession, generateStructuredOutput, handleGeminiError } from './gemini.js'
import {
  ChatContext,
  ChatResponse,
  ComparisonAnalysis,
  ComparisonRanking,
  ProductIdentification,
  NutritionAnalysis,
  GeminiStructuredSchema
} from '../../types/ai.types.js'

// AI Chat System for pet nutrition consultation
export class AIChatService {
  private sessions = new Map<string, any>() // Store chat sessions

  // Create system instruction for pet nutrition chat
  private getSystemInstruction(context: ChatContext): string {
    return `
You are a friendly and knowledgeable Persian-speaking pet nutrition expert. Your role is to help pet owners make informed decisions about their pets' nutrition and health.

Pet Context:
- Pet Name: ${context.pet_profile.name}
- Species: ${context.pet_profile.species}
- Health Conditions: ${context.pet_profile.health_conditions?.join(', ') || 'None'}
- Dietary Restrictions: ${context.pet_profile.dietary_restrictions?.join(', ') || 'None'}

Guidelines:
1. Always respond in Persian language
2. Use appropriate pet-related emojis (🐕 🐱 🍖 🥗 ❤️ 😊)
3. Be helpful, friendly, and encouraging
4. Provide evidence-based nutrition advice
5. Ask clarifying questions when needed
6. Reference the pet by name when appropriate
7. Consider the specific health conditions and dietary restrictions
8. Suggest follow-up questions or topics when relevant

Remember: You're not replacing veterinary care, always recommend consulting a vet for serious health concerns.
`
  }

  // Start or get existing chat session
  async startChatSession(sessionId: string, context: ChatContext): Promise<void> {
    if (!this.sessions.has(sessionId)) {
      const systemInstruction = this.getSystemInstruction(context)
      const chatSession = createChatSession(systemInstruction)
      this.sessions.set(sessionId, {
        chat: chatSession,
        context,
        messageCount: 0
      })
    }
  }

  // Send message and get AI response
  async sendMessage(sessionId: string, message: string): Promise<ChatResponse> {
    const sessionData = this.sessions.get(sessionId)
    if (!sessionData) {
      throw new Error('Chat session not found. Please start a new session.')
    }

    try {
      // Send message to Gemini chat
      const result = await sessionData.chat.sendMessage(message)
      const response = await result.response
      const content = response.text()

      sessionData.messageCount++

      // Generate structured response with suggestions
      const analysisPrompt = `
Based on this chat about pet nutrition:
User message: "${message}"
AI response: "${content}"

Pet: ${sessionData.context.pet_profile.name} (${sessionData.context.pet_profile.species})

Generate structured output with:
1. The response content (already generated)
2. 2-3 helpful suggestions for follow-up questions
3. Confidence score (1-100) for the response accuracy
`

      const schema: GeminiStructuredSchema = {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: 'The chat response content'
          },
          suggestions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Follow-up question suggestions in Persian'
          },
          follow_up_questions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Additional questions the user might ask'
          },
          confidence_score: {
            type: 'number',
            description: 'Confidence in response accuracy (1-100)'
          }
        },
        required: ['content', 'suggestions', 'follow_up_questions', 'confidence_score']
      }

      const structuredResponse = await generateStructuredOutput<ChatResponse>(
        analysisPrompt,
        schema,
        { temperature: 0.6 }
      )

      // Use the original response content
      structuredResponse.content = content

      return structuredResponse

    } catch (error) {
      throw handleGeminiError(error)
    }
  }

  // Get session info
  getSessionInfo(sessionId: string): { messageCount: number; context: ChatContext } | null {
    const sessionData = this.sessions.get(sessionId)
    return sessionData ? {
      messageCount: sessionData.messageCount,
      context: sessionData.context
    } : null
  }

  // Clear session
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId)
  }

  // Update session context (e.g., when pet info changes)
  updateSessionContext(sessionId: string, newContext: Partial<ChatContext>): void {
    const sessionData = this.sessions.get(sessionId)
    if (sessionData) {
      sessionData.context = { ...sessionData.context, ...newContext }
    }
  }
}

// AI Comparison Service for multi-product analysis
export async function getComparisonRecommendation(
  products: Array<{
    identification: ProductIdentification
    nutrition_analysis: NutritionAnalysis
  }>,
  petContext: {
    name: string
    species: string
    health_conditions?: string[]
    dietary_restrictions?: string[]
    age?: number
    weight?: number
  }
): Promise<ComparisonAnalysis> {
  const comparisonPrompt = `
Compare these pet food products for ${petContext.name} (${petContext.species}):

Pet Profile:
- Species: ${petContext.species}
- Age: ${petContext.age || 'Unknown'}
- Weight: ${petContext.weight || 'Unknown'}
- Health Conditions: ${petContext.health_conditions?.join(', ') || 'None'}
- Dietary Restrictions: ${petContext.dietary_restrictions?.join(', ') || 'None'}

Products to Compare:
${products.map((product, index) => `
${index + 1}. ${product.identification.brand} ${product.identification.product_name}
   - Score: ${product.nutrition_analysis.score}/100
   - Verdict: ${product.nutrition_analysis.verdict}
   - Type: ${product.identification.food_type}
   - Key Reasons: ${product.nutrition_analysis.reasons.join(', ')}
`).join('\n')}

Provide:
1. Ranked comparison with detailed reasoning in Persian
2. Best choice recommendation with justification
3. Pros and cons for each product in Persian
4. Overall recommendation paragraph in Persian

Consider the pet's specific health needs and dietary requirements.
`

  const schema: GeminiStructuredSchema = {
    type: 'object',
    properties: {
      compared_products: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            brand: { type: 'string' },
            product_name: { type: 'string' },
            size: { type: 'string' },
            food_type: { type: 'string' },
            species: { type: 'string' }
          },
          required: ['brand', 'product_name', 'size', 'food_type', 'species']
        }
      },
      rankings: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            product_id: { type: 'string', description: 'Index or identifier of product' },
            rank: { type: 'number', description: 'Ranking position (1 = best)' },
            score: { type: 'number', description: 'Comparison score (1-100)' },
            pros: {
              type: 'array',
              items: { type: 'string' },
              description: 'Advantages in Persian'
            },
            cons: {
              type: 'array',
              items: { type: 'string' },
              description: 'Disadvantages in Persian'
            }
          },
          required: ['product_id', 'rank', 'score', 'pros', 'cons']
        }
      },
      recommendation: {
        type: 'string',
        description: 'Overall recommendation in Persian'
      },
      best_choice: {
        type: 'string',
        description: 'ID of the best product'
      },
      reasons: {
        type: 'array',
        items: { type: 'string' },
        description: 'Key reasons for recommendation in Persian'
      }
    },
    required: ['compared_products', 'rankings', 'recommendation', 'best_choice', 'reasons']
  }

  try {
    const result = await generateStructuredOutput<ComparisonAnalysis>(
      comparisonPrompt,
      schema,
      { temperature: 0.4 }
    )

    // Map product identifications to the result
    result.compared_products = products.map(p => p.identification)

    return result
  } catch (error) {
    throw handleGeminiError(error)
  }
}

// Export singleton chat service instance
export const aiChatService = new AIChatService()