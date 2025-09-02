import { FastifyRequest } from 'fastify';
import { Pet, Profile, ScanHistory, ChatSession, ChatMessage, FoodComparison } from './database.types.js';
import { CompleteScanResult, ComparisonAnalysis, ChatResponse } from './ai.types.js';
export interface AuthRequest extends FastifyRequest {
    user?: {
        id: string;
        email: string;
        aud: string;
        role?: string;
    };
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    email: string;
    password: string;
    full_name?: string;
    phone?: string;
}
export interface LoginResponse {
    user: Profile;
    session: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
    };
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
    timestamp: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
export interface CreatePetRequest {
    name: string;
    species: string;
    breed?: string;
    age?: number;
    weight?: number;
    gender?: string;
    health_conditions?: string[];
    dietary_restrictions?: string[];
    activity_level?: string;
    avatar_url?: string;
}
export interface UpdatePetRequest extends Partial<CreatePetRequest> {
}
export interface PetResponse extends ApiResponse<Pet> {
}
export interface PetsResponse extends PaginatedResponse<Pet> {
}
export interface UploadScanRequest {
    image: string;
    pet_id: string;
}
export interface UploadScanResponse extends ApiResponse<{
    scan_id: string;
    processed_image: {
        size_mb: number;
        dimensions: {
            width: number;
            height: number;
        };
    };
}> {
}
export interface IdentifyProductRequest {
    scan_id: string;
}
export interface IdentifyProductResponse extends ApiResponse<{
    identification: {
        brand: string;
        product_name: string;
        size: string;
        food_type: 'kibble' | 'wet' | 'treat';
        species: 'cat' | 'dog';
    };
}> {
}
export interface RetrieveDataRequest {
    scan_id: string;
    identification: {
        brand: string;
        product_name: string;
        size: string;
    };
}
export interface RetrieveDataResponse extends ApiResponse<{
    product_data: {
        ingredients: string[];
        guaranteed_analysis: Record<string, number>;
        user_reviews_summary: string;
        recall_information: string[];
    };
}> {
}
export interface AnalyzeNutritionRequest {
    scan_id: string;
    pet_id: string;
}
export interface AnalyzeNutritionResponse extends ApiResponse<{
    analysis: {
        score: number;
        verdict: 'buy' | 'no-buy';
        reasons: string[];
        goodIngredients: any[];
        badIngredients: any[];
    };
}> {
}
export interface CompleteScanRequest {
    scan_id: string;
}
export interface CompleteScanResponse extends ApiResponse<CompleteScanResult> {
}
export interface ScanHistoryResponse extends PaginatedResponse<ScanHistory> {
}
export interface CreateChatSessionRequest {
    pet_id: string;
    title?: string;
}
export interface ChatSessionResponse extends ApiResponse<ChatSession> {
}
export interface ChatSessionsResponse extends PaginatedResponse<ChatSession> {
}
export interface SendMessageRequest {
    content: string;
    metadata?: Record<string, any>;
}
export interface SendMessageResponse extends ApiResponse<{
    message: ChatMessage;
    ai_response: ChatResponse;
}> {
}
export interface ChatMessagesResponse extends PaginatedResponse<ChatMessage> {
}
export interface CreateComparisonRequest {
    pet_id: string;
    scan_ids: string[];
}
export interface ComparisonResponse extends ApiResponse<FoodComparison> {
}
export interface AnalyzeComparisonRequest {
    comparison_id: string;
}
export interface AnalyzeComparisonResponse extends ApiResponse<ComparisonAnalysis> {
}
export interface ComparisonHistoryResponse extends PaginatedResponse<FoodComparison> {
}
export interface TrackEventRequest {
    event_type: string;
    event_data: Record<string, any>;
    session_id?: string;
}
export interface TrackEventResponse extends ApiResponse<{
    tracked: boolean;
    event_id: string;
}> {
}
export interface UserStatsResponse extends ApiResponse<{
    total_scans: number;
    total_pets: number;
    total_chat_sessions: number;
    average_compatibility_score: number;
    most_scanned_brands: string[];
    recent_activity: Array<{
        type: string;
        timestamp: string;
        details: any;
    }>;
}> {
}
export interface ProductStatsResponse extends ApiResponse<{
    total_products: number;
    most_popular_products: Array<{
        product_id: string;
        name: string;
        brand: string;
        scan_count: number;
        avg_score: number;
    }>;
    category_distribution: Record<string, number>;
    average_scores_by_category: Record<string, number>;
}> {
}
export interface HealthCheckResponse {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    model: string;
    features: string[];
    database: string;
    checks: {
        database: boolean;
        ai_service: boolean;
        environment: boolean;
    };
}
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
export interface ErrorResponse extends ApiResponse<never> {
    error: {
        message: string;
        code: string;
        details?: ValidationError[] | any;
        stack?: string;
    };
}
export interface PaginationQuery {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}
export interface FilterQuery extends PaginationQuery {
    search?: string;
    species?: string;
    category?: string;
    date_from?: string;
    date_to?: string;
    pet_id?: string;
}
export interface FileUpload {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}
export interface UploadResponse extends ApiResponse<{
    filename: string;
    url: string;
    size: number;
    mimetype: string;
}> {
}
//# sourceMappingURL=api.types.d.ts.map