export interface ProductIdentification {
    brand: string;
    product_name: string;
    size: string;
    food_type: 'kibble' | 'wet' | 'treat';
    species: 'cat' | 'dog';
}
export interface ProductDataRetrieval {
    ingredients: string[];
    guaranteed_analysis: {
        protein: number;
        fat: number;
        fiber: number;
        moisture: number;
        ash?: number;
        phosphorus?: number;
    };
    user_reviews_summary: string;
    recall_information: string[];
}
export interface IngredientDetail {
    name: string;
    persianName: string;
    reason: string;
    severity?: 'low' | 'medium' | 'high';
}
export interface NutritionAnalysis {
    score: number;
    verdict: 'buy' | 'no-buy';
    reasons: string[];
    goodIngredients: IngredientDetail[];
    badIngredients: IngredientDetail[];
}
export interface DelightOutput {
    mascot_mood: 'happy' | 'suspicious' | 'sad';
    badge_color: string;
    verdict_text: string;
    personalized_message: string;
}
export interface CompleteScanResult {
    identification: ProductIdentification;
    product_data: ProductDataRetrieval;
    nutrition_analysis: NutritionAnalysis;
    delight_output: DelightOutput;
    timestamp: string;
    processing_time_ms: number;
}
export interface ComparisonAnalysis {
    compared_products: ProductIdentification[];
    rankings: ComparisonRanking[];
    recommendation: string;
    best_choice: string;
    reasons: string[];
}
export interface ComparisonRanking {
    product_id: string;
    rank: number;
    score: number;
    pros: string[];
    cons: string[];
}
export interface ChatContext {
    pet_profile: {
        name: string;
        species: string;
        health_conditions?: string[];
        dietary_restrictions?: string[];
    };
    pantry_items?: string[];
    previous_scans?: CompleteScanResult[];
}
export interface ChatResponse {
    content: string;
    suggestions?: string[];
    follow_up_questions?: string[];
    confidence_score: number;
}
export interface ImageProcessingInput {
    base64_data: string;
    mime_type: string;
    max_size_mb?: number;
}
export interface ProcessedImage {
    validated: boolean;
    size_mb: number;
    dimensions: {
        width: number;
        height: number;
    };
    base64_data: string;
}
export interface AIPipelineInput {
    image: ProcessedImage;
    pet_context: {
        species: string;
        health_conditions?: string[];
        dietary_restrictions?: string[];
        age?: number;
        weight?: number;
    };
    user_preferences: {
        language: string;
        analysis_depth: 'basic' | 'detailed';
    };
}
export interface AIPipelineStageResult<T = any> {
    stage: 'identification' | 'data_retrieval' | 'nutrition_analysis' | 'delight_output';
    success: boolean;
    result?: T;
    error?: string;
    processing_time_ms: number;
}
export interface AIError {
    stage: string;
    error_type: 'api_error' | 'validation_error' | 'timeout_error' | 'quota_exceeded';
    message: string;
    retryable: boolean;
    details?: Record<string, any>;
}
export interface GeminiConfig {
    model: string;
    temperature?: number;
    max_output_tokens?: number;
    tools?: Array<{
        googleSearch: Record<string, any>;
    }>;
    safety_settings?: Array<{
        category: string;
        threshold: string;
    }>;
}
export interface GeminiStructuredSchema {
    type: 'object';
    properties: Record<string, {
        type: string;
        description?: string;
        enum?: string[];
        items?: any;
    }>;
    required: string[];
}
export interface VisionAnalysisInput {
    image: {
        inlineData: {
            data: string;
            mimeType: string;
        };
    };
    text?: string;
}
export interface SearchToolInput {
    query: string;
    num_results?: number;
    language?: string;
}
export interface ChatSessionContext {
    session_id: string;
    messages: Array<{
        role: 'user' | 'model';
        parts: Array<{
            text: string;
        }>;
    }>;
    system_instruction?: string;
}
//# sourceMappingURL=ai.types.d.ts.map