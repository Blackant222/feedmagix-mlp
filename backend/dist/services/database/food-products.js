import { BaseService } from './base.js';
export class FoodProductService extends BaseService {
    tableName = 'food_products';
    // Find or create food product
    async findOrCreate(productData) {
        // Try to find existing product by name and brand
        const { data: existing, error: findError } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('name', productData.name)
            .eq('brand', productData.brand)
            .single();
        if (!findError && existing) {
            return existing;
        }
        // Create new product if not found
        const newProduct = {
            ...productData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        return this.create(newProduct);
    }
    // Update product with detailed information from AI analysis
    async updateProductDetails(productId, details) {
        return this.update(productId, details);
    }
    // Search products by brand
    async findByBrand(brand, options = {}) {
        return this.findAll({ brand }, options);
    }
    // Search products by category
    async findByCategory(category, options = {}) {
        return this.findAll({ category }, options);
    }
    // Search products by species
    async findBySpecies(species, options = {}) {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .contains('species_suitable', [species])
            .order('name')
            .range(options.page && options.limit ? (options.page - 1) * options.limit : 0, options.page && options.limit ? options.page * options.limit - 1 : 49);
        if (error) {
            throw new Error(`Failed to find products by species: ${error.message}`);
        }
        return { data: data || [], count: data?.length || 0 };
    }
    // Find products by barcode
    async findByBarcode(barcode) {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('barcode', barcode)
            .single();
        if (error) {
            if (error.code === 'PGRST116') { // No rows returned
                return null;
            }
            throw new Error(`Failed to find product by barcode: ${error.message}`);
        }
        return data;
    }
    // Search products by text (name or brand)
    async searchProducts(query, options = {}) {
        let queryBuilder = this.supabase
            .from(this.tableName)
            .select('*')
            .or(`name.ilike.%${query}%, brand.ilike.%${query}%`);
        // Apply filters
        if (options.species) {
            queryBuilder = queryBuilder.contains('species_suitable', [options.species]);
        }
        if (options.category) {
            queryBuilder = queryBuilder.eq('category', options.category);
        }
        // Apply pagination
        if (options.page && options.limit) {
            const from = (options.page - 1) * options.limit;
            const to = from + options.limit - 1;
            queryBuilder = queryBuilder.range(from, to);
        }
        queryBuilder = queryBuilder.order('name');
        const { data, error } = await queryBuilder;
        if (error) {
            throw new Error(`Failed to search products: ${error.message}`);
        }
        return { data: data || [], count: data?.length || 0 };
    }
    // Get popular products (most scanned)
    async getPopularProducts(limit = 10) {
        const { data, error } = await this.supabase
            .from('product_analytics')
            .select(`
        scan_count,
        food_products (*)
      `)
            .order('scan_count', { ascending: false })
            .limit(limit);
        if (error) {
            throw new Error(`Failed to get popular products: ${error.message}`);
        }
        return data?.map(item => ({
            ...item.food_products,
            scan_count: item.scan_count
        })) || [];
    }
    // Get products with high compatibility scores
    async getTopRatedProducts(species, limit = 10) {
        let queryBuilder = this.supabase
            .from('product_analytics')
            .select(`
        avg_compatibility_score,
        food_products (*)
      `)
            .order('avg_compatibility_score', { ascending: false })
            .limit(limit);
        if (species) {
            queryBuilder = queryBuilder.contains('food_products.species_suitable', [species]);
        }
        const { data, error } = await queryBuilder;
        if (error) {
            throw new Error(`Failed to get top rated products: ${error.message}`);
        }
        return data?.map(item => ({
            ...item.food_products,
            avg_score: item.avg_compatibility_score
        })) || [];
    }
    // Update product analytics
    async updateProductAnalytics(productId, scanResult) {
        // Get current analytics or create new entry
        const { data: existing } = await this.supabase
            .from('product_analytics')
            .select('*')
            .eq('product_id', productId)
            .single();
        if (existing) {
            // Update existing analytics
            const newScanCount = existing.scan_count + 1;
            const newAvgScore = ((existing.avg_compatibility_score * existing.scan_count) + scanResult.compatibility_score) / newScanCount;
            const updates = {
                scan_count: newScanCount,
                avg_compatibility_score: newAvgScore,
                last_scanned: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            if (scanResult.verdict === 'buy') {
                updates.positive_ratings = existing.positive_ratings + 1;
            }
            else {
                updates.negative_ratings = existing.negative_ratings + 1;
            }
            await this.supabase
                .from('product_analytics')
                .update(updates)
                .eq('product_id', productId);
        }
        else {
            // Create new analytics entry
            await this.supabase
                .from('product_analytics')
                .insert({
                product_id: productId,
                scan_count: 1,
                positive_ratings: scanResult.verdict === 'buy' ? 1 : 0,
                negative_ratings: scanResult.verdict === 'no-buy' ? 1 : 0,
                avg_compatibility_score: scanResult.compatibility_score,
                last_scanned: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }
    }
}
//# sourceMappingURL=food-products.js.map