# FeedMagix Backend

A high-performance Fastify + TypeScript backend for FeedMagix AI-powered pet food analysis platform.

## Features

- **AI-Powered Analysis**: 5-stage AI pipeline using Google Gemini 2.5 Flash
- **Pet Nutrition Expertise**: Context-aware food compatibility scoring
- **Multi-Language Support**: Persian language support with emojis
- **Real-time Chat**: AI-powered pet nutrition consultation
- **Supabase Integration**: Full database and authentication support

## Technology Stack

- **Framework**: Fastify 4.x with TypeScript
- **AI Engine**: Google Gemini 2.5 Flash (`@google/genai` v1.16.0)
- **Database**: Supabase with Row Level Security
- **Authentication**: Supabase Auth with JWT
- **Development**: tsx, Jest, ESModules

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

## API Endpoints

- **Authentication**: `/api/auth/*`
- **Pet Management**: `/api/pets/*`
- **Food Analysis**: `/api/scan/*`
- **AI Chat**: `/api/chat/*`
- **Comparisons**: `/api/comparison/*`
- **Analytics**: `/api/analytics/*`

## Development

The backend runs on port 5000 by default and serves the frontend running on port 3000.

## Architecture

```
backend/
├── src/
│   ├── config/         # Environment and configuration
│   ├── services/       # Business logic and external integrations
│   │   ├── ai/         # Google Gemini AI pipeline
│   │   └── database/   # Supabase database services
│   ├── routes/         # API endpoint handlers
│   ├── middleware/     # Authentication, CORS, error handling
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Helper functions
└── dist/               # Compiled JavaScript output
```