# FeedMagix Backend Setup Design

## Overview

This design outlines the creation of a new Fastify + TypeScript backend for the FeedMagix application in a separate `/backend` folder, maintaining the same AI pipeline architecture, database schema, and API structure as the previous implementation. The backend will provide AI-powered pet food analysis using Google Gemini AI and Supabase database integration. **The existing frontend app will remain completely untouched.**

## Technology Stack & Dependencies

### Core Framework
- **Fastify**: High-performance Node.js web framework
- **TypeScript**: Type-safe development
- **Node.js**: Runtime environment (ES Modules)

### AI & External Services
- **Google Gemini AI**: `@google/genai` v1.16.0 (exact version from old-backend-files)
- **Model**: `gemini-2.5-flash` (exact model from old-backend-files)
- **Tools**: `{ googleSearch: {} }` (Google Search tool integration)
- **Features**: Vision analysis, text generation, structured JSON output, web search integration
- **Configuration**: Base64 image processing, MIME type image/jpeg, structured schema validation

### Database & Authentication
- **Supabase**: Database, authentication, and real-time features
- **@supabase/supabase-js**: Official Supabase client

### Development & Build Tools
- **tsx**: TypeScript execution for development
- **@types/node**: Node.js type definitions
- **dotenv**: Environment variable management

## Architecture

### Project Structure (Separate Backend Folder)
```
feedmagix-mlp/
├── app/ (existing frontend, completely untouched)
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── data/
│   │   └── ... (all existing files preserved)
│   ├── package.json
│   ├── vite.config.ts
│   └── ... (all existing files preserved)
├── backend/ (NEW - separate backend)
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   └── supabase.ts
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── gemini.ts
│   │   │   │   ├── ai-pipeline.ts
│   │   │   │   └── chat.ts
│   │   │   ├── database/
│   │   │   │   ├── base.ts
│   │   │   │   ├── profiles.ts
│   │   │   │   ├── pets.ts
│   │   │   │   ├── food-products.ts
│   │   │   │   ├── scan-history.ts
│   │   │   │   ├── chat.ts
│   │   │   │   ├── comparisons.ts
│   │   │   │   └── index.ts
│   │   │   └── auth.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── pets.ts
│   │   │   ├── scan.ts
│   │   │   ├── chat.ts
│   │   │   ├── comparison.ts
│   │   │   └── analytics.ts
│   │   ├── types/
│   │   │   ├── database.types.ts
│   │   │   ├── ai.types.ts
│   │   │   └── api.types.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── cors.ts
│   │   │   └── error.ts
│   │   ├── utils/
│   │   │   ├── validation.ts
│   │   │   └── helpers.ts
│   │   └── app.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── README.md
└── old-backend-files/ (existing reference)
```

### Fastify Backend Service Architecture

```mermaid
graph TD
    A[Fastify Server :5000] --> B[CORS Middleware]
    B --> C[Authentication Middleware]
    C --> D[Route Handlers]
    D --> E[Service Layer]
    
    E --> F[AI Services]
    E --> G[Database Services]
    E --> H[Auth Service]
    
    F --> I[Gemini Client]
    F --> J[AI Pipeline]
    F --> K[Chat System]
    
    G --> L[Supabase Client]
    G --> M[Profiles Service]
    G --> N[Pets Service]
    G --> O[Scan History Service]
    G --> P[Comparisons Service]
    
    I --> Q[Google Gemini API]
    L --> R[Supabase Database]
    
    S[Frontend App :3000] --> T[API Calls to :5000]
    T --> A
```

## AI Pipeline Implementation

### 5-Stage AI Agent Pipeline (Exact Implementation from old-backend-files)

The backend will implement the EXACT same AI pipeline architecture from old-backend-files:

#### Stage 1: Image Processing Endpoint
```typescript
POST /api/scan/upload
- Input: Base64 encoded image
- Validation: Image format and size
- Output: Processed image data
```

#### Stage 2: Product Identification Agent (Gemini Vision)
```typescript
POST /api/scan/identify
- Function: identifyProduct()
- Model: gemini-2.5-flash with vision capabilities
- Input: Base64 image data
- MIME Type: image/jpeg
- Output Schema:
  {
    brand: string,
    product_name: string,
    size: string,
    food_type: string, // "kibble", "wet", "treat"
    species: string    // "cat", "dog"
  }
- Prompt Strategy: Structured JSON output with schema validation
```

#### Stage 3: Product Data Retrieval & Online Search Agent (Gemini Text)
```typescript
POST /api/scan/retrieve-data
- Function: retrieveProductData()
- Model: gemini-2.5-flash with Google Search tool
- Tools: { googleSearch: {} }
- Search Strategy: Targeted web search for product information
- Data Retrieved:
  - Complete ingredients list
  - Guaranteed Analysis (protein, fat, fiber, moisture, ash, phosphorus)
  - User reviews summary (Persian language)
  - Product recall information
- Output Format: Minified JSON with strict schema adherence
```

#### Stage 4: Nutrition Analysis Agent (Gemini Text)
```typescript
POST /api/scan/analyze
- Function: analyzeNutrition()
- Model: gemini-2.5-flash
- Analysis Type: Context-aware nutritional evaluation
- Pet Profile Integration:
  - Pet type (cat/dog)
  - Health conditions
  - Known allergies
- Specialized Diet Recognition:
  - Therapeutic diets (Renal, Urinary, Hypoallergenic)
  - Standard wellness diets
- Output Schema:
  {
    score: number,           // 1-100 compatibility score
    verdict: 'buy' | 'no-buy',
    reasons: string[],       // 3 key reasons in Persian
    goodIngredients: IngredientDetail[],
    badIngredients: IngredientDetail[]
  }
- Ingredient Analysis: Detailed breakdown with Persian translations and pet-specific reasoning
```

#### Stage 5: MLP Output & Delight Layer (Gemini Text)
```typescript
POST /api/scan/delight
- Function: createDelightOutput()
- Purpose: User experience enhancement
- Features:
  - Mascot mood based on score (happy/suspicious/sad)
  - Dynamic badge colors
  - Persian verdict text with emojis
  - Personalized messaging
```

### AI Comparison Agent (From old-backend-files)
```typescript
POST /api/comparison/analyze
- Function: getComparisonRecommendation()
- Purpose: Multi-product comparison and recommendation
- Input: Array of analyzed products + pet profile
- Analysis: Contextual comparison based on pet's specific needs
- Output: Ranked recommendations with Persian justifications
```

### AI Chat System (From old-backend-files)
```typescript
POST /api/chat/sessions
GET /api/chat/sessions/:id/messages
POST /api/chat/sessions/:id/messages
- Implementation: Persistent chat sessions using Gemini Chat API
- Context: Pet profile and pantry items integration
- Language: Persian with pet-related emojis
- Features:
  - Session management
  - Context-aware responses
  - Pet nutrition expertise
```

## Database Integration

### Supabase Configuration
```typescript
// config/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey)
```

### Complete Database Schema (From old-backend-files)

#### Core Tables Structure
- **profiles**: User profile management (extends Supabase auth.users)
  - Fields: id, email, full_name, avatar_url, phone, created_at, updated_at
- **pets**: Pet information and health profiles
  - Fields: id, user_id, name, species, breed, age, weight, gender, health_conditions, dietary_restrictions, activity_level, avatar_url, created_at, updated_at
- **food_products**: Pet food product catalog
  - Fields: id, name, brand, barcode, category, ingredients, nutritional_info, allergens, life_stage, species_suitable, price_range, image_url, created_at, updated_at
- **scan_history**: AI scan results and analysis
  - Fields: id, user_id, pet_id, food_product_id, scan_image_url, scan_result, compatibility_score, recommendations, warnings, scanned_at
- **chat_sessions**: AI chat conversation management
  - Fields: id, user_id, pet_id, title, created_at, updated_at
- **chat_messages**: Individual chat messages
  - Fields: id, session_id, role, content, metadata, created_at
- **food_comparisons**: Multi-product comparison results
  - Fields: id, user_id, pet_id, product_ids, comparison_result, winner_product_id, created_at

#### Analytics Tables
- **user_analytics**: User behavior tracking
- **product_analytics**: Product performance metrics
- **business_metrics**: Business intelligence data

#### Service Layer (Matching old backend)
1. **ProfileService** - User profile management
2. **PetService** - Pet CRUD operations
3. **ScanService** - Scan history and food product management
4. **ChatService** - Chat session and message management
5. **ComparisonService** - Food comparison operations
6. **AnalyticsService** - User and product analytics

### Database Service Layer Pattern
```typescript
// services/database/base.ts
export abstract class BaseService {
  protected supabase = supabase
  protected abstract tableName: string
  
  async findById(id: string) { /* implementation */ }
  async create(data: any) { /* implementation */ }
  async update(id: string, data: any) { /* implementation */ }
  async delete(id: string) { /* implementation */ }
}

// services/database/pets.ts
export class PetService extends BaseService {
  protected tableName = 'pets'
  
  async findByUserId(userId: string) { /* implementation */ }
  async createPet(petData: CreatePetData) { /* implementation */ }
}
```

## API Endpoints Reference

### Authentication Endpoints
```typescript
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/profile
PUT /api/auth/profile
```

### Pet Management Endpoints
```typescript
GET /api/pets
POST /api/pets
GET /api/pets/:id
PUT /api/pets/:id
DELETE /api/pets/:id
```

### Scan & Analysis Endpoints
```typescript
POST /api/scan/upload
POST /api/scan/identify
POST /api/scan/retrieve-data
POST /api/scan/analyze
POST /api/scan/complete
GET /api/scan/history
GET /api/scan/history/:id
```

### Chat System Endpoints
```typescript
GET /api/chat/sessions
POST /api/chat/sessions
GET /api/chat/sessions/:id
GET /api/chat/sessions/:id/messages
POST /api/chat/sessions/:id/messages
DELETE /api/chat/sessions/:id
```

### Comparison Endpoints
```typescript
POST /api/comparison/create
GET /api/comparison/history
GET /api/comparison/:id
POST /api/comparison/analyze
```

### Analytics Endpoints
```typescript
POST /api/analytics/track
GET /api/analytics/user-stats
GET /api/analytics/product-stats
```

## Authentication & Security (Supabase Integration)

### Supabase Auth Integration (From old-backend-files)
- **Provider**: Supabase Authentication
- **Methods**: Email/Password, Phone (via dummy email)
- **Session Management**: Automatic token refresh, persistent sessions
- **Security**: Row Level Security (RLS) policies
- **Real-time**: Enabled with 10 events per second
- **Legacy Support**: LocalStorage fallback for offline mode

### Hybrid Storage Strategy (From old architecture)
1. **Supabase (Primary)**: Production data, user accounts, analytics
2. **LocalStorage (Fallback)**: Offline mode, development, legacy support

### JWT-Based Authentication
```typescript
// middleware/auth.ts
import { FastifyRequest, FastifyReply } from 'fastify'
import { supabase } from '../config/supabase.js'

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return reply.status(401).send({ error: 'Authentication required' })
  }
  
  const { data: user } = await supabase.auth.getUser(token)
  if (!user) {
    return reply.status(401).send({ error: 'Invalid token' })
  }
  
  request.user = user
}
```

### CORS Configuration
```typescript
// middleware/cors.ts
export const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}
```

### Row Level Security (RLS)
- All database operations respect Supabase RLS policies
- User can only access their own data
- Service role key for admin operations

## Environment Configuration

### Required Environment Variables (Updated from old-backend-files)
```bash
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Supabase Configuration (from old-backend-files)
SUPABASE_URL=https://uompewhjkjpbnacqrwzy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvbXBld2hqa2pwYm5hY3Fyd3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzE4NjAsImV4cCI6MjA3MjIwNzg2MH0.LPudocTXS2ohZoZQHX3EkvkfHgnOA02HPjnYa2I7Pdc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvbXBld2hqa2pwYm5hY3Fyd3p5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjYzMTg2MCwiZXhwIjoyMDcyMjA3ODYwfQ.OJyFJFQr6pBgvLRkXekYZX_5fG-LuvPKK2q5e5PtTZE

# Google Gemini AI (exact key from old-backend-files/.env.local)
GEMINI_API_KEY=AIzaSyDSiB3_dMricBFXdZ8e1poQTT-MAwt67d0

# Note: Frontend will continue using VITE_ prefixed versions
# VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GEMINI_API_KEY
```

### Development Scripts (Backend package.json)
```json
{
  "name": "feedmagix-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "test": "jest",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "fastify": "^4.24.3",
    "@fastify/cors": "^8.4.0",
    "@fastify/jwt": "^7.2.4",
    "@supabase/supabase-js": "^2.38.0",
    "@google/genai": "1.16.0",
    "dotenv": "^16.3.1",
    "@fastify/multipart": "^8.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "@types/multer": "^1.4.11",
    "typescript": "^5.2.2",
    "tsx": "^3.14.0",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
```

## Data Models & Types

### Core Type Definitions
```typescript
// types/database.types.ts
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
  species: string
  breed?: string
  age?: number
  weight?: number
  gender?: string
  health_conditions?: string[]
  dietary_restrictions?: string[]
  activity_level?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface ScanResult {
  id: string
  user_id: string
  pet_id: string
  food_product_id: string
  scan_image_url: string
  scan_result: any
  compatibility_score: number
  recommendations: string
  warnings?: string[]
  scanned_at: string
}
```

### AI Pipeline Types
```typescript
// types/ai.types.ts
export interface ProductIdentification {
  brand: string
  product_name: string
  size: string
  food_type: 'kibble' | 'wet' | 'treat'
  species: 'cat' | 'dog'
}

export interface NutritionAnalysis {
  score: number
  verdict: 'buy' | 'no-buy'
  reasons: string[]
  goodIngredients: IngredientDetail[]
  badIngredients: IngredientDetail[]
}

export interface IngredientDetail {
  name: string
  persianName: string
  reason: string
  severity?: 'low' | 'medium' | 'high'
}
```

## Error Handling & Logging

### Global Error Handler
```typescript
// middleware/error.ts
import { FastifyRequest, FastifyReply } from 'fastify'

export async function errorHandler(error: Error, request: FastifyRequest, reply: FastifyReply) {
  const statusCode = (error as any).statusCode || 500
  const message = error.message || 'Internal Server Error'
  
  reply.status(statusCode).send({
    error: true,
    message,
    timestamp: new Date().toISOString()
  })
}
```

### Structured Logging
```typescript
// utils/logger.ts
export const logger = {
  info: (message: string, meta?: any) => console.log({ level: 'info', message, ...meta }),
  error: (message: string, error?: Error) => console.error({ level: 'error', message, error }),
  warn: (message: string, meta?: any) => console.warn({ level: 'warn', message, ...meta })
}
```

## Testing Strategy

### Unit Testing Framework
- **Jest**: Testing framework
- **Supertest**: HTTP assertion testing
- **Mock Services**: AI and database mocking

### Test Structure
```typescript
// tests/services/ai-pipeline.test.ts
describe('AI Pipeline Service', () => {
  test('should identify product from image', async () => {
    const result = await identifyProduct(mockImageData)
    expect(result).toHaveProperty('brand')
    expect(result).toHaveProperty('product_name')
  })
})

// tests/routes/pets.test.ts
describe('Pets API', () => {
  test('should create new pet', async () => {
    const response = await request(app)
      .post('/api/pets')
      .send(mockPetData)
      .expect(201)
    
    expect(response.body).toHaveProperty('id')
  })
})
```

## Performance Optimization

### Caching Strategy
```typescript
// utils/cache.ts
const cache = new Map()

export function cached<T>(key: string, ttl: number) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    descriptor.value = async function(...args: any[]) {
      const cacheKey = `${key}:${JSON.stringify(args)}`
      
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey)
      }
      
      const result = await method.apply(this, args)
      cache.set(cacheKey, result)
      setTimeout(() => cache.delete(cacheKey), ttl)
      
      return result
    }
  }
}
```

### Database Connection Optimization
- Use Supabase connection pooling
- Implement query optimization with proper indexing
- Real-time subscriptions for chat and notifications only

## Deployment Considerations

### Docker Configuration
```
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/app.js"]
```

### Health Check Endpoint
```
GET /health
- Database connectivity check
- AI service availability
- Environment validation
```

### Monitoring & Observability
```typescript
// middleware/metrics.ts
import { FastifyRequest, FastifyReply } from 'fastify'
import { logger } from '../utils/logger.js'

export async function metricsMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const start = Date.now()
  
  reply.addHook('onSend', () => {
    const duration = Date.now() - start
    logger.info('Request completed', {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration
    })
  })
}
```

## Fastify Server Implementation

### Main Server File (Updated for @google/genai)
```typescript
// src/app.ts
import Fastify from 'fastify'
import cors from '@fastify/cors'
import './config/env.js' // Load environment variables first
import { corsOptions } from './middleware/cors.js'
import { errorHandler } from './middleware/error.js'
import { authRoutes } from './routes/auth.js'
import { petRoutes } from './routes/pets.js'
import { scanRoutes } from './routes/scan.js'
import { chatRoutes } from './routes/chat.js'
import { comparisonRoutes } from './routes/comparison.js'
import { analyticsRoutes } from './routes/analytics.js'

const fastify = Fastify({
  logger: true
})

// Register CORS
fastify.register(cors, corsOptions)

// Register error handler
fastify.setErrorHandler(errorHandler)

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' })
fastify.register(petRoutes, { prefix: '/api/pets' })
fastify.register(scanRoutes, { prefix: '/api/scan' })
fastify.register(chatRoutes, { prefix: '/api/chat' })
fastify.register(comparisonRoutes, { prefix: '/api/comparison' })
fastify.register(analyticsRoutes, { prefix: '/api/analytics' })

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    model: 'gemini-2.5-flash',
    features: ['vision', 'text', 'search'],
    database: 'supabase'
  }
})

// Start server
const start = async () => {
  try {
    const PORT = process.env.PORT || 5000
    await fastify.listen({ port: Number(PORT), host: '0.0.0.0' })
    console.log(`🚀 FeedMagix Backend running on port ${PORT}`)
    console.log(`📊 Using Gemini 2.5 Flash with Google Search`)
    console.log(`🗄️  Connected to Supabase Database`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
```

### Environment Configuration (Exact match from old-backend-files)
```typescript
// src/config/env.ts
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Validate required environment variables (from old-backend-files)
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY', 
  'GEMINI_API_KEY'
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

// Log configuration status (without sensitive values)
console.log('🔑 Environment configured:')
console.log(`- Supabase URL: ${process.env.SUPABASE_URL?.substring(0, 30)}...`)
console.log(`- Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Missing'}`)
console.log(`- Node Environment: ${process.env.NODE_ENV || 'development'}`)
```

## Development Setup Instructions

### 1. Create Backend Directory
```bash
cd /Users/ashtehrani/Desktop/feedmagix-mlp
mkdir backend
cd backend
```

### 2. Initialize Backend Project (Exact dependencies from old-backend-files)
```bash
npm init -y
npm install fastify @fastify/cors @fastify/jwt @supabase/supabase-js @google/genai@1.16.0 dotenv @fastify/multipart
npm install -D @types/node typescript tsx jest supertest
```

### 3. Setup TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. Setup Environment Variables (From old-backend-files configuration)
```bash
# Create .env file in backend/ with values from old-backend-files:
cat > .env << EOF
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Supabase Configuration (from old-backend-files)
SUPABASE_URL=https://uompewhjkjpbnacqrwzy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvbXBld2hqa2pwYm5hY3Fyd3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzE4NjAsImV4cCI6MjA3MjIwNzg2MH0.LPudocTXS2ohZoZQHX3EkvkfHgnOA02HPjnYa2I7Pdc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvbXBld2hqa2pwYm5hY3Fyd3p5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjYzMTg2MCwiZXhwIjoyMDcyMjA3ODYwfQ.OJyFJFQr6pBgvLRkXekYZX_5fG-LuvPKK2q5e5PtTZE

# Google Gemini AI (exact key from old-backend-files)
GEMINI_API_KEY=AIzaSyDSiB3_dMricBFXdZ8e1poQTT-MAwt67d0
EOF
```

### 5. Start Development
```bash
npm run dev
```

## Frontend Integration Notes

### Existing Frontend Architecture (app/)
Your frontend app already has these service files that will need to connect to the new backend:
- `app/src/contexts/AppContext.tsx` - Main app state management
- `app/src/data/mockData.ts` - Mock data (to be replaced with API calls)
- `app/src/services/` - Service layer for API communication

### Backend API Compatibility
The new Fastify backend is designed to provide the exact same API structure that your frontend expects:
- Same endpoint URLs (`/api/auth/*`, `/api/pets/*`, etc.)
- Same response formats and data structures
- Same authentication flow using Supabase tokens
- Same AI pipeline stages and results format

### Future Integration Phase
Once the backend is running, your frontend can be updated to:
1. Replace mock data imports with API calls to `http://localhost:5000`
2. Update base API URL in service files
3. Remove mock data dependencies
4. Test with real Supabase database and Gemini AI

This design creates a completely separate Fastify backend that matches your old backend architecture and serves APIs compatible with your existing frontend app. The backend runs independently on port 5000 while your frontend continues to run on port 3000.