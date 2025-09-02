import { BaseService } from './base.js'
import { ScanHistory, CreateScanData } from '../../types/database.types.js'
import { CompleteScanResult } from '../../types/ai.types.js'

export class ScanHistoryService extends BaseService {
  protected tableName = 'scan_history'

  // Create scan history entry
  async createScan(userId: string, data: CreateScanData): Promise<ScanHistory> {
    const scanData = {
      ...data,
      user_id: userId,
      scanned_at: new Date().toISOString()
    }

    return this.create(scanData)
  }

  // Get scan by ID with ownership verification
  async getScan(scanId: string, userId: string): Promise<ScanHistory> {
    const scan = await this.findById(scanId)
    
    if (scan.user_id !== userId) {
      throw new Error('Scan not found or access denied')
    }

    return scan
  }

  // Get user's scan history
  async getUserScans(userId: string, options: {
    page?: number
    limit?: number
    petId?: string
    dateFrom?: string
    dateTo?: string
  } = {}): Promise<{ data: Array<ScanHistory & { 
    pet?: { name: string, species: string }
    food_product?: { name: string, brand: string }
  }>, count: number }> {
    let query = this.supabase
      .from(this.tableName)
      .select(`
        *,
        pets (name, species),
        food_products (name, brand)
      `)
      .eq('user_id', userId)

    // Apply filters
    if (options.petId) {
      query = query.eq('pet_id', options.petId)
    }

    if (options.dateFrom) {
      query = query.gte('scanned_at', options.dateFrom)
    }

    if (options.dateTo) {
      query = query.lte('scanned_at', options.dateTo)
    }

    // Apply pagination
    if (options.page && options.limit) {
      const from = (options.page - 1) * options.limit
      const to = from + options.limit - 1
      query = query.range(from, to)
    }

    query = query.order('scanned_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Failed to get user scans: ${error.message}`)
    }

    return { data: data || [], count: count || 0 }
  }

  // Get pet's scan history
  async getPetScans(petId: string, userId: string, options: {
    page?: number
    limit?: number
  } = {}): Promise<{ data: ScanHistory[], count: number }> {
    return this.findAll(
      { user_id: userId, pet_id: petId },
      {
        page: options.page,
        limit: options.limit,
        sort: 'scanned_at',
        order: 'desc'
      }
    )
  }

  // Update scan with complete AI results
  async updateScanResults(scanId: string, userId: string, results: CompleteScanResult): Promise<ScanHistory> {
    // Verify ownership
    await this.getScan(scanId, userId)

    const updateData = {
      scan_result: results,
      compatibility_score: results.nutrition_analysis.score,
      recommendations: results.nutrition_analysis.reasons.join('; '),
      warnings: results.nutrition_analysis.badIngredients.map(ing => ing.reason)
    }

    return this.update(scanId, updateData)
  }

  // Get scan statistics for user
  async getUserScanStats(userId: string): Promise<{
    total_scans: number
    avg_compatibility_score: number
    good_foods: number
    bad_foods: number
    most_scanned_brand: string | null
    recent_scan_date: string | null
  }> {
    const { data: scans } = await this.supabase
      .from(this.tableName)
      .select(`
        compatibility_score,
        scanned_at,
        scan_result,
        food_products (brand)
      `)
      .eq('user_id', userId)

    if (!scans || scans.length === 0) {
      return {
        total_scans: 0,
        avg_compatibility_score: 0,
        good_foods: 0,
        bad_foods: 0,
        most_scanned_brand: null,
        recent_scan_date: null
      }
    }

    // Calculate average compatibility score
    const avgScore = scans.reduce((sum, scan) => sum + scan.compatibility_score, 0) / scans.length

    // Count good vs bad verdicts
    const verdictCounts = scans.reduce((acc, scan) => {
      const verdict = scan.scan_result?.nutrition_analysis?.verdict
      if (verdict === 'buy') acc.good++
      else if (verdict === 'no-buy') acc.bad++
      return acc
    }, { good: 0, bad: 0 })

    // Find most scanned brand
    const brandCounts = scans.reduce((acc: Record<string, number>, scan) => {
      const brand = scan.food_products?.brand
      if (brand) {
        acc[brand] = (acc[brand] || 0) + 1
      }
      return acc
    }, {})

    const mostScannedBrand = Object.entries(brandCounts).length > 0
      ? Object.entries(brandCounts).sort(([,a], [,b]) => b - a)[0][0]
      : null

    // Get most recent scan date
    const recentScanDate = scans.length > 0
      ? scans.sort((a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime())[0].scanned_at
      : null

    return {
      total_scans: scans.length,
      avg_compatibility_score: Math.round(avgScore * 100) / 100,
      good_foods: verdictCounts.good,
      bad_foods: verdictCounts.bad,
      most_scanned_brand: mostScannedBrand,
      recent_scan_date: recentScanDate
    }
  }

  // Get trending food analysis results
  async getTrendingScans(limit: number = 10): Promise<Array<ScanHistory & {
    food_product: { name: string, brand: string }
    scan_count: number
  }>> {
    const { data, error } = await this.supabase
      .from('scan_history')
      .select(`
        *,
        food_products (name, brand)
      `)
      .order('scanned_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to get trending scans: ${error.message}`)
    }

    // Group by product and count occurrences
    const productCounts = (data || []).reduce((acc: Record<string, any>, scan) => {
      const productId = scan.food_product_id
      if (!acc[productId]) {
        acc[productId] = {
          ...scan,
          scan_count: 1
        }
      } else {
        acc[productId].scan_count++
      }
      return acc
    }, {})

    return Object.values(productCounts).sort((a: any, b: any) => b.scan_count - a.scan_count)
  }

  // Delete user's scan history (GDPR compliance)
  async deleteUserScans(userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('user_id', userId)
      .select('id')

    if (error) {
      throw new Error(`Failed to delete user scans: ${error.message}`)
    }

    return data?.length || 0
  }

  // Get scans by verdict
  async getScansByVerdict(userId: string, verdict: 'buy' | 'no-buy', options: {
    page?: number
    limit?: number
  } = {}): Promise<{ data: ScanHistory[], count: number }> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        food_products (name, brand),
        pets (name, species)
      `)
      .eq('user_id', userId)
      .contains('scan_result', { nutrition_analysis: { verdict } })
      .order('scanned_at', { ascending: false })
      .range(
        options.page && options.limit ? (options.page - 1) * options.limit : 0,
        options.page && options.limit ? options.page * options.limit - 1 : 49
      )

    if (error) {
      throw new Error(`Failed to get scans by verdict: ${error.message}`)
    }

    return { data: data || [], count: data?.length || 0 }
  }
}