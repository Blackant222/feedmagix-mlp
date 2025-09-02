import { ProductIdentification, ProductDataRetrieval, NutritionAnalysis, DelightOutput, CompleteScanResult, AIPipelineInput, ProcessedImage } from '../../types/ai.types.js';
export declare function processImage(imageData: string, mimeType?: string): Promise<ProcessedImage>;
export declare function identifyProduct(imageData: string): Promise<ProductIdentification>;
export declare function retrieveProductData(identification: ProductIdentification): Promise<ProductDataRetrieval>;
export declare function analyzeNutrition(identification: ProductIdentification, productData: ProductDataRetrieval, petContext: {
    species: string;
    health_conditions?: string[];
    dietary_restrictions?: string[];
    age?: number;
    weight?: number;
}): Promise<NutritionAnalysis>;
export declare function createDelightOutput(nutritionAnalysis: NutritionAnalysis, petName?: string): Promise<DelightOutput>;
export declare function runAIPipeline(input: AIPipelineInput): Promise<CompleteScanResult>;
//# sourceMappingURL=ai-pipeline.d.ts.map