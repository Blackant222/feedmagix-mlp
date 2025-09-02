import { BaseService } from './base.js';
import { FoodProduct } from '../../types/database.types.js';
export declare class FoodProductService extends BaseService {
    protected tableName: string;
    findOrCreate(productData: {
        name: string;
        brand: string;
        barcode?: string;
        category?: string;
        species_suitable?: string[];
    }): Promise<FoodProduct>;
    updateProductDetails(productId: string, details: {
        ingredients?: string[];
        nutritional_info?: Record<string, any>;
        allergens?: string[];
        life_stage?: string[];
        image_url?: string;
    }): Promise<FoodProduct>;
    findByBrand(brand: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<{
        data: FoodProduct[];
        count: number;
    }>;
    findByCategory(category: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<{
        data: FoodProduct[];
        count: number;
    }>;
    findBySpecies(species: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<{
        data: FoodProduct[];
        count: number;
    }>;
    findByBarcode(barcode: string): Promise<FoodProduct | null>;
    searchProducts(query: string, options?: {
        species?: string;
        category?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: FoodProduct[];
        count: number;
    }>;
    getPopularProducts(limit?: number): Promise<Array<FoodProduct & {
        scan_count: number;
    }>>;
    getTopRatedProducts(species?: string, limit?: number): Promise<Array<FoodProduct & {
        avg_score: number;
    }>>;
    updateProductAnalytics(productId: string, scanResult: {
        compatibility_score: number;
        verdict: 'buy' | 'no-buy';
    }): Promise<void>;
}
//# sourceMappingURL=food-products.d.ts.map