import { BaseService } from './base.js'
import { FoodComparison, CreateComparisonData } from '../../types/database.types.js'
import { ComparisonAnalysis } from '../../types/ai.types.js'

export class ComparisonService extends BaseService {
  protected tableName = 'food_comparisons'

  // Create new comparison
  async createComparison(userId: string, data: CreateComparisonData): Promise<FoodComparison> {
    const comparisonData = {
      ...data,
      user_id: userId,
      created_at: new Date().toISOString()
    }

    return this.create(comparisonData)
  }

  // Get comparison by ID with ownership verification
  async getComparison(comparisonId: string, userId: string): Promise<FoodComparison> {
    const comparison = await this.findById(comparisonId)
    
    if (comparison.user_id !== userId) {
      throw new Error('Comparison not found or access denied')
    }

    return comparison
  }

  // Get user's comparison history
  async getUserComparisons(userId: string, options: {
    page?: number
    limit?: number
    petId?: string
  } = {}): Promise<{ data: Array<FoodComparison & {
    pet?: { name: string, species: string }
    product_count?: number
  }>, count: number }> {
    const filters: Record<string, any> = { user_id: userId }
    
    if (options.petId) {
      filters.pet_id = options.petId
    }

    const { data: comparisons, count } = await this.findAll(filters, {
      page: options.page,
      limit: options.limit,
      sort: 'created_at',
      order: 'desc'
    })

    // Enrich with pet information and product count
    const enrichedComparisons = await Promise.all(
      comparisons.map(async (comparison) => {
        // Get pet info
        let pet = null
        if (comparison.pet_id) {
          const { data: petData } = await this.supabase
            .from('pets')
            .select('name, species')
            .eq('id', comparison.pet_id)
            .single()
          
          pet = petData
        }

        return {
          ...comparison,
          pet,
          product_count: comparison.product_ids?.length || 0
        }
      })
    )

    return { data: enrichedComparisons, count }
  }

  // Update comparison with AI analysis results
  async updateComparisonResults(comparisonId: string, userId: string, analysis: ComparisonAnalysis): Promise<FoodComparison> {
    // Verify ownership
    await this.getComparison(comparisonId, userId)

    const updateData = {
      comparison_result: analysis,
      winner_product_id: analysis.best_choice
    }

    return this.update(comparisonId, updateData)
  }

  // Get comparison with detailed product information
  async getComparisonWithProducts(comparisonId: string, userId: string): Promise<{
    comparison: FoodComparison
    products: Array<{
      id: string
      name: string
      brand: string
      category?: string
      scan_data?: any
    }>
    pet?: { name: string, species: string, health_conditions?: string[], dietary_restrictions?: string[] }
  }> {
    const comparison = await this.getComparison(comparisonId, userId)

    // Get product details
    const { data: products } = await this.supabase
      .from('food_products')
      .select('id, name, brand, category')
      .in('id', comparison.product_ids)

    // Get scan data for each product by this user
    const productsWithScans = await Promise.all(
      (products || []).map(async (product) => {
        const { data: scanData } = await this.supabase
          .from('scan_history')
          .select('scan_result, compatibility_score')
          .eq('user_id', userId)
          .eq('food_product_id', product.id)
          .order('scanned_at', { ascending: false })
          .limit(1)
          .single()

        return {
          ...product,
          scan_data: scanData
        }
      })
    )

    // Get pet information
    let pet = null
    if (comparison.pet_id) {
      const { data: petData } = await this.supabase
        .from('pets')
        .select('name, species, health_conditions, dietary_restrictions')
        .eq('id', comparison.pet_id)
        .single()
      
      pet = petData
    }

    return {
      comparison,
      products: productsWithScans,
      pet
    }
  }

  // Get comparison statistics for user
  async getUserComparisonStats(userId: string): Promise<{
    total_comparisons: number
    most_compared_brands: string[]
    avg_products_per_comparison: number
    favorite_winner_brand: string | null
    recent_comparison_date: string | null
  }> {
    const { data: comparisons } = await this.supabase
      .from('food_comparisons')
      .select(`
        product_ids,
        winner_product_id,
        created_at
      `)
      .eq('user_id', userId)

    if (!comparisons || comparisons.length === 0) {
      return {
        total_comparisons: 0,
        most_compared_brands: [],
        avg_products_per_comparison: 0,
        favorite_winner_brand: null,
        recent_comparison_date: null
      }
    }

    // Get all product IDs that were compared
    const allProductIds = new Set<string>()
    const winnerProductIds: string[] = []
    
    comparisons.forEach(comparison => {
      comparison.product_ids.forEach((id: string) => allProductIds.add(id))
      if (comparison.winner_product_id) {
        winnerProductIds.push(comparison.winner_product_id)
      }
    })

    // Get brand information for compared products
    const { data: products } = await this.supabase
      .from('food_products')
      .select('id, brand')
      .in('id', Array.from(allProductIds))

    const productBrandMap = new Map<string, string>()
    products?.forEach(product => {
      if (product.brand) {
        productBrandMap.set(product.id, product.brand)
      }
    })

    // Count brand occurrences
    const brandCounts = new Map<string, number>()
    allProductIds.forEach(productId => {
      const brand = productBrandMap.get(productId)
      if (brand) {
        brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1)
      }
    })

    // Count winner brand occurrences
    const winnerBrandCounts = new Map<string, number>()
    winnerProductIds.forEach(productId => {
      const brand = productBrandMap.get(productId)
      if (brand) {
        winnerBrandCounts.set(brand, (winnerBrandCounts.get(brand) || 0) + 1)
      }
    })

    // Get top brands
    const mostComparedBrands = Array.from(brandCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([brand]) => brand)

    const favoriteWinnerBrand = winnerBrandCounts.size > 0
      ? Array.from(winnerBrandCounts.entries())
          .sort(([,a], [,b]) => b - a)[0][0]
      : null

    // Calculate average products per comparison
    const totalProducts = comparisons.reduce((sum, comp) => sum + comp.product_ids.length, 0)
    const avgProductsPerComparison = Math.round((totalProducts / comparisons.length) * 100) / 100

    // Get most recent comparison date
    const recentComparisonDate = comparisons.length > 0
      ? comparisons.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
      : null

    return {
      total_comparisons: comparisons.length,
      most_compared_brands: mostComparedBrands,
      avg_products_per_comparison: avgProductsPerComparison,
      favorite_winner_brand: favoriteWinnerBrand,
      recent_comparison_date: recentComparisonDate
    }
  }

  // Get popular comparison patterns
  async getPopularComparisons(limit: number = 10): Promise<Array<{
    brands: string[]
    comparison_count: number
    avg_winner_score: number
  }>> {
    const { data: comparisons } = await this.supabase
      .from('food_comparisons')
      .select(`
        product_ids,
        comparison_result
      `)
      .limit(100) // Limit for performance

    if (!comparisons || comparisons.length === 0) {
      return []
    }

    // Get all unique product IDs
    const allProductIds = new Set<string>()
    comparisons.forEach(comp => {
      comp.product_ids.forEach((id: string) => allProductIds.add(id))
    })

    // Get brand mapping
    const { data: products } = await this.supabase
      .from('food_products')
      .select('id, brand')
      .in('id', Array.from(allProductIds))

    const productBrandMap = new Map<string, string>()
    products?.forEach(product => {
      if (product.brand) {
        productBrandMap.set(product.id, product.brand)
      }
    })

    // Group comparisons by brand combinations
    const brandComboStats = new Map<string, {
      count: number
      scores: number[]
    }>()

    comparisons.forEach(comparison => {
      const brands = comparison.product_ids
        .map((id: string) => productBrandMap.get(id))
        .filter(Boolean)
        .sort()

      if (brands.length >= 2) {
        const comboKey = brands.join(' vs ')
        const stats = brandComboStats.get(comboKey) || { count: 0, scores: [] }
        
        stats.count++
        
        // Extract winner score if available
        const winnerScore = comparison.comparison_result?.rankings?.[0]?.score
        if (winnerScore) {
          stats.scores.push(winnerScore)
        }

        brandComboStats.set(comboKey, stats)
      }
    })

    // Convert to result format
    const results = Array.from(brandComboStats.entries())
      .map(([combo, stats]) => ({
        brands: combo.split(' vs '),
        comparison_count: stats.count,
        avg_winner_score: stats.scores.length > 0
          ? Math.round((stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length) * 100) / 100
          : 0
      }))
      .sort((a, b) => b.comparison_count - a.comparison_count)
      .slice(0, limit)

    return results
  }

  // Delete user's comparison history
  async deleteUserComparisons(userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('user_id', userId)
      .select('id')

    if (error) {
      throw new Error(`Failed to delete user comparisons: ${error.message}`)
    }

    return data?.length || 0
  }
}