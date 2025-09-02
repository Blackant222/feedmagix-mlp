export interface Pet {
  id: string;
  name: string;
  species: 'cat' | 'dog';
  breed: string;
  age: number;
  weight: number;
  gender: 'male' | 'female';
  healthConditions?: string[];
  allergies?: string[];
  dietaryRestrictions?: string[];
  activityLevel: 'low' | 'moderate' | 'high';
  avatarUrl?: string;
}

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  country: string;
  city: string;
  pin: string;
  locale: 'fa' | 'en';
  avatarUrl?: string;
  createdAt: string;
}

export interface FoodProduct {
  id: string;
  name: string;
  brand: string;
  barcode?: string;
  category: string;
  ingredients: string[];
  nutritionalInfo: {
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
    moisture: number;
  };
  allergens?: string[];
  lifeStage: string[];
  speciesSuitable: ('cat' | 'dog')[];
  priceRange: string;
  imageUrl: string;
}

export interface ScanResult {
  id: string;
  petId: string;
  productId: string;
  scanImageUrl: string;
  compatibilityScore: number;
  recommendations: string[];
  warnings: string[];
  verdict: string;
  goodIngredients: string[];
  badIngredients: string[];
  scannedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  petId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

export type AppScreen = 
  | 'language-select'
  | 'signup'
  | 'login'
  | 'pet-creation'
  | 'tour'
  | 'home'
  | 'scan'
  | 'processing'
  | 'results'
  | 'comparison'
  | 'chat'
  | 'history'
  | 'pets'
  | 'settings'
  | 'alerts';