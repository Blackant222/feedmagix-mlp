import { GeminiConfig, GeminiStructuredSchema } from '../../types/ai.types.js';
export declare const genAI: any;
export declare function getGeminiModel(modelConfig?: Partial<GeminiConfig>): any;
export declare function getGeminiWithSearch(): any;
export declare function getGeminiVision(): any;
export declare function getGeminiChat(): any;
export declare function generateStructuredOutput<T>(prompt: string, schema: GeminiStructuredSchema, modelConfig?: Partial<GeminiConfig>): Promise<T>;
export declare function analyzeImage(imageData: string, // base64 encoded
prompt: string, mimeType?: string): Promise<string>;
export declare function generateWithSearch(prompt: string): Promise<{
    text: string;
    searchResults?: any[];
}>;
export declare function testGeminiConnection(): Promise<boolean>;
export declare function createChatSession(systemInstruction?: string): any;
export declare function handleGeminiError(error: any): Error;
//# sourceMappingURL=gemini.d.ts.map