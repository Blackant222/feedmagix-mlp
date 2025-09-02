// Database type definitions based on Supabase schema from old-backend-files

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Pet {
  id: string
  user_id: string
  name: string
  species: string // dog, cat, bird, etc.
  breed?: string
  age?: number
  weight?: number // Decimal(5,2)
  gender?: string // male, female, unknown
  health_conditions?: string[]
  dietary_restrictions?: string[]
  activity_level?: string // low, moderate, high
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface FoodProduct {
  id: string
  name: string
  brand?: string
  barcode?: string
  category?: string // dry food, wet food, treats
  ingredients?: string[]
  nutritional_info?: Record<string, any>
  allergens?: string[]
  life_stage?: string[] // puppy, adult, senior
  species_suitable?: string[] // dog, cat, etc.
  price_range?: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface ScanHistory {
  id: string
  user_id: string
  pet_id: string
  food_product_id: string
  scan_image_url: string
  scan_result: Record<string, any> // Complete AI analysis result
  compatibility_score: number
  recommendations: string
  warnings?: string[]
  scanned_at: string
}

export interface ChatSession {
  id: string
  user_id: string
  pet_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  role: string // user, assistant
  content: string
  metadata?: Record<string, any>
  created_at: string
}

export interface FoodComparison {
  id: string
  user_id: string
  pet_id: string
  product_ids: string[] // Array of compared product IDs
  comparison_result: Record<string, any>
  winner_product_id?: string
  created_at: string
}

export interface UserAnalytics {
  id: string
  user_id: string
  event_type: string
  event_data: Record<string, any>
  session_id?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface ProductAnalytics {
  id: string
  product_id: string
  scan_count: number
  positive_ratings: number
  negative_ratings: number
  avg_compatibility_score: number
  last_scanned?: string
  created_at: string
  updated_at: string
}

export interface BusinessMetrics {
  id: string
  metric_name: string
  metric_value: number
  metric_type: string
  date_recorded: string
  metadata?: Record<string, any>
  created_at: string
}

// Input/Output types for database operations
export interface CreatePetData {
  name: string
  species: string
  breed?: string
  age?: number
  weight?: number
  gender?: string
  health_conditions?: string[]
  dietary_restrictions?: string[]
  activity_level?: string
  avatar_url?: string
}

export interface UpdatePetData extends Partial<CreatePetData> {}

export interface CreateProfileData {
  email: string
  full_name?: string
  avatar_url?: string
  phone?: string
}

export interface UpdateProfileData extends Partial<CreateProfileData> {}

export interface CreateScanData {
  pet_id: string
  food_product_id: string
  scan_image_url: string
  scan_result: Record<string, any>
  compatibility_score: number
  recommendations: string
  warnings?: string[]
}

export interface CreateChatSessionData {
  pet_id: string
  title: string
}

export interface CreateChatMessageData {
  session_id: string
  role: 'user' | 'assistant'
  content: string
  metadata?: Record<string, any>
}

export interface CreateComparisonData {
  pet_id: string
  product_ids: string[]
  comparison_result: Record<string, any>
  winner_product_id?: string
}