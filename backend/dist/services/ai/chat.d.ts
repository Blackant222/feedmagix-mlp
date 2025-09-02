import { ChatContext, ChatResponse, ComparisonAnalysis, ProductIdentification, NutritionAnalysis } from '../../types/ai.types.js';
export declare class AIChatService {
    private sessions;
    private getSystemInstruction;
    startChatSession(sessionId: string, context: ChatContext): Promise<void>;
    sendMessage(sessionId: string, message: string): Promise<ChatResponse>;
    getSessionInfo(sessionId: string): {
        messageCount: number;
        context: ChatContext;
    } | null;
    clearSession(sessionId: string): void;
    updateSessionContext(sessionId: string, newContext: Partial<ChatContext>): void;
}
export declare function getComparisonRecommendation(products: Array<{
    identification: ProductIdentification;
    nutrition_analysis: NutritionAnalysis;
}>, petContext: {
    name: string;
    species: string;
    health_conditions?: string[];
    dietary_restrictions?: string[];
    age?: number;
    weight?: number;
}): Promise<ComparisonAnalysis>;
export declare const aiChatService: AIChatService;
//# sourceMappingURL=chat.d.ts.map