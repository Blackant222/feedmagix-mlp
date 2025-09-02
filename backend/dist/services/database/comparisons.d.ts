import { BaseService } from './base.js';
import { FoodComparison, CreateComparisonData } from '../../types/database.types.js';
import { ComparisonAnalysis } from '../../types/ai.types.js';
export declare class ComparisonService extends BaseService {
    protected tableName: string;
    createComparison(userId: string, data: CreateComparisonData): Promise<FoodComparison>;
    getComparison(comparisonId: string, userId: string): Promise<FoodComparison>;
    getUserComparisons(userId: string, options?: {
        page?: number;
        limit?: number;
        petId?: string;
    }): Promise<{
        data: Array<FoodComparison & {
            pet?: {
                name: string;
                species: string;
            };
            product_count?: number;
        }>;
        count: number;
    }>;
    updateComparisonResults(comparisonId: string, userId: string, analysis: ComparisonAnalysis): Promise<FoodComparison>;
    getComparisonWithProducts(comparisonId: string, userId: string): Promise<{
        comparison: FoodComparison;
        products: Array<{
            id: string;
            name: string;
            brand: string;
            category?: string;
            scan_data?: any;
        }>;
        pet?: {
            name: string;
            species: string;
            health_conditions?: string[];
            dietary_restrictions?: string[];
        };
    }>;
    getUserComparisonStats(userId: string): Promise<{
        total_comparisons: number;
        most_compared_brands: string[];
        avg_products_per_comparison: number;
        favorite_winner_brand: string | null;
        recent_comparison_date: string | null;
    }>;
    getPopularComparisons(limit?: number): Promise<Array<{
        brands: string[];
        comparison_count: number;
        avg_winner_score: number;
    }>>;
    deleteUserComparisons(userId: string): Promise<number>;
}
//# sourceMappingURL=comparisons.d.ts.map