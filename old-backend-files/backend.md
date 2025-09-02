# FeedMagix Backend Documentation

## Overview
FeedMagix is application that uses a hybrid backend architecture combining Supabase for database operations and Google Gemini AI for intelligent pet food analysis. The backend is designed as a serverless architecture with AI-powered agents for comprehensive pet food evaluation.

## AI Services & Models

### Google Gemini AI Integration

**Model Used:** `gemini-2.5-flash`

**Library:** `@google/genai` v1.16.0

**Configuration:**
- API Key: `GEMINI_API_KEY` or `NEXT_PUBLIC_GEMINI_API_KEY`
- Model: `gemini-2.5-flash` (latest multimodal model)
- Features: Vision analysis, text generation, structured JSON output, web search integration

### AI Agent Pipeline Architecture

The application implements a **5-stage AI agent pipeline** for comprehensive pet food analysis:

#### Stage 1: Image Processing
- **Input:** Base64 encoded pet food package image
- **Process:** Image preprocessing and validation

#### Stage 2: Product Identification Agent (Gemini Vision)
- **Function:** `identifyProduct()`
- **Model:** `gemini-2.5-flash` with vision capabilities
- **Input:** Base64 image data
- **Output Schema:**
  ```typescript
  {
    brand: string,
    product_name: string,
    size: string,
    food_type: string, // "kibble", "wet", "treat"
    species: string    // "cat", "dog"
  }
  ```
- **Prompt Strategy:** Structured JSON output with schema validation
- **MIME Type:** `image/jpeg`

#### Stage 3: Product Data Retrieval & Online Search Agent (Gemini Text)
- **Function:** `retrieveProductData()`
- **Model:** `gemini-2.5-flash` with Google Search tool
- **Tools:** `{ googleSearch: {} }`
- **Search Strategy:** Targeted web search for product information
- **Data Retrieved:**
  - Complete ingredients list
  - Guaranteed Analysis (protein, fat, fiber, moisture, ash, phosphorus)
  - User reviews summary (Persian language)
  - Product recall information
- **Output Format:** Minified JSON with strict schema adherence

#### Stage 4: Nutrition Analysis Agent (Gemini Text)
- **Function:** `analyzeNutrition()`
- **Model:** `gemini-2.5-flash`
- **Analysis Type:** Context-aware nutritional evaluation
- **Pet Profile Integration:**
  - Pet type (cat/dog)
  - Health conditions
  - Known allergies
- **Specialized Diet Recognition:**
  - Therapeutic diets (Renal, Urinary, Hypoallergenic)
  - Standard wellness diets
- **Output Schema:**
  ```typescript
  {
    score: number,           // 1-100 compatibility score
    verdict: 'buy' | 'no-buy',
    reasons: string[],       // 3 key reasons in Persian
    goodIngredients: IngredientDetail[],
    badIngredients: IngredientDetail[]
  }
  ```
- **Ingredient Analysis:** Detailed breakdown with Persian translations and pet-specific reasoning

#### Stage 5: MLP Output & Delight Layer (Gemini Text)
- **Function:** `createDelightOutput()`
- **Purpose:** User experience enhancement
- **Features:**
  - Mascot mood based on score (happy/suspicious/sad)
  - Dynamic badge colors
  - Persian verdict text with emojis
  - Personalized messaging

### AI Comparison Agent
- **Function:** `getComparisonRecommendation()`
- **Purpose:** Multi-product comparison and recommendation
- **Input:** Array of analyzed products + pet profile
- **Analysis:** Contextual comparison based on pet's specific needs
- **Output:** Ranked recommendations with Persian justifications

### AI Chat System
- **Implementation:** Persistent chat sessions using Gemini Chat API
- **Context:** Pet profile and pantry items integration
- **Language:** Persian with pet-related emojis
- **Features:**
  - Session management
  - Context-aware responses
  - Pet nutrition expertise

## Database Architecture

### Database Provider: Supabase

**Configuration:**
- URL: `NEXT_PUBLIC_SUPABASE_URL`
- Anonymous Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Service Role Key: `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`
- Real-time: Enabled with 10 events per second
- Authentication: Built-in Supabase Auth

### Database Schema

#### Core Tables

**1. profiles**
- **Purpose:** User profile management (extends Supabase auth.users)
- **Fields:**
  - `id` (UUID, Primary Key, references auth.users)
  - `email` (TEXT)
  - `full_name` (TEXT)
  - `avatar_url` (TEXT)
  - `phone` (TEXT)
  - `created_at`, `updated_at` (TIMESTAMP)

**2. pets**
- **Purpose:** Pet information and health profiles
- **Fields:**
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key → profiles)
  - `name` (TEXT, NOT NULL)
  - `species` (TEXT, NOT NULL) // dog, cat, bird, etc.
  - `breed` (TEXT)
  - `age` (INTEGER)
  - `weight` (DECIMAL(5,2))
  - `gender` (TEXT) // male, female, unknown
  - `health_conditions` (TEXT[])
  - `dietary_restrictions` (TEXT[])
  - `activity_level` (TEXT) // low, moderate, high
  - `avatar_url` (TEXT)
  - `created_at`, `updated_at` (TIMESTAMP)

**3. food_products**
- **Purpose:** Pet food product catalog
- **Fields:**
  - `id` (UUID, Primary Key)
  - `name` (TEXT, NOT NULL)
  - `brand` (TEXT)
  - `barcode` (TEXT, UNIQUE)
  - `category` (TEXT) // dry food, wet food, treats
  - `ingredients` (TEXT[])
  - `nutritional_info` (JSONB)
  - `allergens` (TEXT[])
  - `life_stage` (TEXT[]) // puppy, adult, senior
  - `species_suitable` (TEXT[]) // dog, cat, etc.
  - `price_range` (TEXT)
  - `image_url` (TEXT)
  - `created_at`, `updated_at` (TIMESTAMP)

**4. scan_history**
- **Purpose:** AI scan results and analysis history
- **Fields:**
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key → profiles)
  - `pet_id` (UUID, Foreign Key → pets)
  - `food_product_id` (UUID, Foreign Key → food_products)
  - `scan_image_url` (TEXT)
  - `scan_result` (JSONB) // Complete AI analysis result
  - `compatibility_score` (NUMBER)
  - `recommendations` (TEXT)
  - `warnings` (TEXT[])
  - `scanned_at` (TIMESTAMP)

**5. chat_sessions**
- **Purpose:** AI chat conversation management
- **Fields:**
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key → profiles)
  - `pet_id` (UUID, Foreign Key → pets)
  - `title` (TEXT)
  - `created_at`, `updated_at` (TIMESTAMP)

**6. chat_messages**
- **Purpose:** Individual chat messages storage
- **Fields:**
  - `id` (UUID, Primary Key)
  - `session_id` (UUID, Foreign Key → chat_sessions)
  - `role` (TEXT) // user, assistant
  - `content` (TEXT)
  - `metadata` (JSONB)
  - `created_at` (TIMESTAMP)

**7. food_comparisons**
- **Purpose:** Multi-product comparison results
- **Fields:**
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key → profiles)
  - `pet_id` (UUID, Foreign Key → pets)
  - `product_ids` (TEXT[]) // Array of compared product IDs
  - `comparison_result` (JSONB)
  - `winner_product_id` (UUID, Foreign Key → food_products)
  - `created_at` (TIMESTAMP)

#### Analytics Tables

**8. user_analytics**
- **Purpose:** User behavior tracking
- **Fields:**
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key → profiles)
  - `event_type` (TEXT)
  - `event_data` (JSONB)
  - `session_id` (TEXT)
  - `ip_address` (TEXT)
  - `user_agent` (TEXT)
  - `created_at` (TIMESTAMP)

**9. product_analytics**
- **Purpose:** Product performance metrics
- **Fields:**
  - `id` (UUID, Primary Key)
  - `product_id` (UUID, Foreign Key → food_products)
  - `scan_count` (NUMBER)
  - `positive_ratings` (NUMBER)
  - `negative_ratings` (NUMBER)
  - `avg_compatibility_score` (NUMBER)
  - `last_scanned` (TIMESTAMP)
  - `created_at`, `updated_at` (TIMESTAMP)

**10. business_metrics**
- **Purpose:** Business intelligence data
- **Fields:**
  - `id` (UUID, Primary Key)
  - `metric_name` (TEXT)
  - `metric_value` (NUMBER)
  - `metric_type` (TEXT)
  - `date_recorded` (TIMESTAMP)
  - `metadata` (JSONB)
  - `created_at` (TIMESTAMP)

### Database Services

#### Service Layer Architecture
The application uses a service layer pattern with dedicated services for each domain:

1. **ProfileService** - User profile management
2. **PetService** - Pet CRUD operations
3. **ScanService** - Scan history and food product management
4. **ChatService** - Chat session and message management
5. **ComparisonService** - Food comparison operations
6. **AnalyticsService** - User and product analytics

#### Real-time Features
- **Enabled Tables:** chat_messages, scan_history, pets
- **Configuration:** 10 events per second limit
- **Use Cases:** Live chat updates, real-time scan notifications

## Authentication System

### Supabase Auth Integration
- **Provider:** Supabase Authentication
- **Methods:** Email/Password, Phone (via dummy email)
- **Session Management:** Automatic token refresh, persistent sessions
- **Security:** Row Level Security (RLS) policies

### Authentication Service Features
- **Registration:** Email or phone-based signup
- **Login:** Credential-based authentication
- **Session Management:** Automatic session handling
- **Profile Integration:** Seamless profile creation
- **Legacy Support:** LocalStorage fallback for offline mode

## API Architecture

### Hybrid Storage Strategy
1. **Supabase (Primary):** Production data, user accounts, analytics
2. **LocalStorage (Fallback):** Offline mode, development, legacy support

### Service Integration
- **Gemini AI:** Image analysis, text generation, web search
- **Supabase:** Database operations, authentication, real-time
- **Next.js:** Server-side rendering, API routes, environment management

## Environment Configuration

### Required Environment Variables
```bash
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Development Tools
- **Testing:** Jest integration tests for all services
- **Database Seeding:** SQL scripts for sample data
- **Connection Testing:** Automated health checks
- **Type Safety:** Full TypeScript integration with generated types

## Performance & Scalability

### AI Optimization
- **Model Selection:** Gemini 2.5 Flash for optimal speed/quality balance
- **Structured Output:** JSON schema validation for consistent responses
- **Error Handling:** Graceful fallbacks and user-friendly error messages
- **Caching Strategy:** Local storage for offline capabilities

### Database Optimization
- **Indexing:** Optimized queries with proper indexes
- **Real-time:** Selective real-time subscriptions
- **Type Safety:** Generated TypeScript types for all tables
- **Connection Pooling:** Supabase managed connections

## Security Considerations

### Data Protection
- **API Keys:** Environment variable management
- **Authentication:** Supabase Auth with RLS policies
- **Data Validation:** Schema validation at all levels
- **Error Handling:** No sensitive data in error messages

### Privacy
- **Image Processing:** Base64 encoding for secure transmission
- **User Data:** GDPR-compliant data handling
- **Analytics:** Anonymized user behavior tracking
- **Chat History:** Secure message storage with encryption

This backend architecture provides a robust, scalable foundation for FeedMagix's AI-powered pet food analysis platform, combining cutting-edge AI capabilities with reliable database infrastructure.