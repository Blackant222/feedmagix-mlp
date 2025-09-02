// AI Pipeline type definitions based on old-backend-files specifications

// Stage 2: Product Identification Agent (Gemini Vision)
export interface ProductIdentification {
  brand: string
  product_name: string
  size: string
  food_type: 'kibble' | 'wet' | 'treat'
  species: 'cat' | 'dog'
}

// Stage 3: Product Data Retrieval & Online Search Agent
export interface ProductDataRetrieval {
  ingredients: string[]
  guaranteed_analysis: {
    protein: number
    fat: number
    fiber: number
    moisture: number
    ash?: number
    phosphorus?: number
  }
  user_reviews_summary: string // Persian language
  recall_information: string[]
}

// Stage 4: Nutrition Analysis Agent
export interface IngredientDetail {
  name: string
  persianName: string
  reason: string
  severity?: 'low' | 'medium' | 'high'
}

export interface NutritionAnalysis {
  score: number // 1-100 compatibility score
  verdict: 'buy' | 'no-buy'
  reasons: string[] // 3 key reasons in Persian
  goodIngredients: IngredientDetail[]
  badIngredients: IngredientDetail[]
}

// Stage 5: MLP Output & Delight Layer
export interface DelightOutput {
  mascot_mood: 'happy' | 'suspicious' | 'sad'
  badge_color: string
  verdict_text: string // Persian with emojis
  personalized_message: string
}

// Complete AI Scan Result
export interface CompleteScanResult {
  identification: ProductIdentification
  product_data: ProductDataRetrieval
  nutrition_analysis: NutritionAnalysis
  delight_output: DelightOutput
  timestamp: string
  processing_time_ms: number
}

// AI Comparison Analysis
export interface ComparisonAnalysis {
  compared_products: ProductIdentification[]
  rankings: ComparisonRanking[]
  recommendation: string // Persian justification
  best_choice: string // Product ID
  reasons: string[] // Persian explanations
}

export interface ComparisonRanking {
  product_id: string
  rank: number
  score: number
  pros: string[] // Persian
  cons: string[] // Persian
}

// AI Chat System Types
export interface ChatContext {
  pet_profile: {
    name: string
    species: string
    health_conditions?: string[]
    dietary_restrictions?: string[]
  }
  pantry_items?: string[]
  previous_scans?: CompleteScanResult[]
}

export interface ChatResponse {
  content: string // Persian with pet-related emojis
  suggestions?: string[]
  follow_up_questions?: string[]
  confidence_score: number
}

// Image Processing Types
export interface ImageProcessingInput {
  base64_data: string
  mime_type: string // image/jpeg
  max_size_mb?: number
}

export interface ProcessedImage {
  validated: boolean
  size_mb: number
  dimensions: {
    width: number
    height: number
  }
  base64_data: string
}

// AI Pipeline Input/Output Types
export interface AIPipelineInput {
  image: ProcessedImage
  pet_context: {
    species: string
    health_conditions?: string[]
    dietary_restrictions?: string[]
    age?: number
    weight?: number
  }
  user_preferences: {
    language: string // 'persian' | 'english'
    analysis_depth: 'basic' | 'detailed'
  }
}

export interface AIPipelineStageResult<T = any> {
  stage: 'identification' | 'data_retrieval' | 'nutrition_analysis' | 'delight_output'
  success: boolean
  result?: T
  error?: string
  processing_time_ms: number
}

// Error Types for AI Pipeline
export interface AIError {
  stage: string
  error_type: 'api_error' | 'validation_error' | 'timeout_error' | 'quota_exceeded'
  message: string
  retryable: boolean
  details?: Record<string, any>
}

// Gemini API Configuration
export interface GeminiConfig {
  model: string // 'gemini-2.5-flash'
  temperature?: number
  max_output_tokens?: number
  tools?: Array<{ googleSearch: Record<string, any> }>
  safety_settings?: Array<{
    category: string
    threshold: string
  }>
}

// Structured Output Schema for Gemini
export interface GeminiStructuredSchema {
  type: 'object'
  properties: Record<string, {
    type: string
    description?: string
    enum?: string[]
    items?: any
  }>
  required: string[]
}

// Vision Analysis Input
export interface VisionAnalysisInput {
  image: {
    inlineData: {
      data: string // base64
      mimeType: string // image/jpeg
    }
  }
  text?: string
}

// Search Tool Input
export interface SearchToolInput {
  query: string
  num_results?: number
  language?: string
}

// Chat Session Context
export interface ChatSessionContext {
  session_id: string
  messages: Array<{
    role: 'user' | 'model'
    parts: Array<{ text: string }>
  }>
  system_instruction?: string
}