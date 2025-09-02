import { BaseService } from './base.js';
export class PetService extends BaseService {
    tableName = 'pets';
    // Create a new pet
    async createPet(userId, data) {
        const petData = {
            ...data,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        return this.create(petData);
    }
    // Update pet
    async updatePet(petId, userId, data) {
        // Verify pet belongs to user
        await this.verifyPetOwnership(petId, userId);
        return this.update(petId, data);
    }
    // Delete pet
    async deletePet(petId, userId) {
        // Verify pet belongs to user
        await this.verifyPetOwnership(petId, userId);
        return this.delete(petId);
    }
    // Get pet by ID (with ownership verification)
    async getPet(petId, userId) {
        const pet = await this.findById(petId);
        if (pet.user_id !== userId) {
            throw new Error('Pet not found or access denied');
        }
        return pet;
    }
    // Get all pets for a user
    async getUserPets(userId, options = {}) {
        const filters = { user_id: userId };
        if (options.species) {
            filters.species = options.species;
        }
        return this.findAll(filters, {
            page: options.page,
            limit: options.limit,
            sort: options.sort || 'created_at',
            order: options.order || 'desc'
        });
    }
    // Get pet with recent scan history
    async getPetWithScans(petId, userId, limit = 5) {
        // Verify ownership
        const pet = await this.getPet(petId, userId);
        // Get recent scans
        const { data: scans } = await this.supabase
            .from('scan_history')
            .select(`
        *,
        food_products (
          name,
          brand,
          category
        )
      `)
            .eq('pet_id', petId)
            .order('scanned_at', { ascending: false })
            .limit(limit);
        return {
            ...pet,
            recent_scans: scans || []
        };
    }
    // Get pets by species
    async getPetsBySpecies(userId, species) {
        const { data } = await this.findAll({ user_id: userId, species });
        return data;
    }
    // Get pet health summary
    async getPetHealthSummary(petId, userId) {
        const pet = await this.getPet(petId, userId);
        // Get compatibility scores from recent scans
        const { data: recentScans } = await this.supabase
            .from('scan_history')
            .select('compatibility_score, scanned_at, recommendations')
            .eq('pet_id', petId)
            .order('scanned_at', { ascending: false })
            .limit(10);
        // Calculate average compatibility score
        const avgScore = recentScans && recentScans.length > 0
            ? recentScans.reduce((sum, scan) => sum + scan.compatibility_score, 0) / recentScans.length
            : null;
        // Get count of good vs bad verdicts
        const { data: verdicts } = await this.supabase
            .from('scan_history')
            .select('scan_result')
            .eq('pet_id', petId);
        const verdictCounts = verdicts?.reduce((acc, scan) => {
            const verdict = scan.scan_result?.nutrition_analysis?.verdict;
            if (verdict === 'buy')
                acc.good++;
            else if (verdict === 'no-buy')
                acc.bad++;
            return acc;
        }, { good: 0, bad: 0 }) || { good: 0, bad: 0 };
        return {
            pet,
            health_summary: {
                total_scans: recentScans?.length || 0,
                average_compatibility_score: avgScore ? Math.round(avgScore * 100) / 100 : null,
                good_food_count: verdictCounts.good,
                bad_food_count: verdictCounts.bad,
                health_conditions: pet.health_conditions || [],
                dietary_restrictions: pet.dietary_restrictions || [],
                last_scan_date: recentScans?.[0]?.scanned_at || null
            }
        };
    }
    // Verify pet ownership
    async verifyPetOwnership(petId, userId) {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('user_id')
            .eq('id', petId)
            .single();
        if (error || !data) {
            throw new Error('Pet not found');
        }
        if (data.user_id !== userId) {
            throw new Error('Access denied');
        }
    }
    // Search pets by name
    async searchPetsByName(userId, name) {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('user_id', userId)
            .ilike('name', `%${name}%`)
            .order('name');
        if (error) {
            throw new Error(`Failed to search pets: ${error.message}`);
        }
        return data || [];
    }
    // Get pets needing attention (health conditions)
    async getPetsNeedingAttention(userId) {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('user_id', userId)
            .not('health_conditions', 'is', null)
            .order('updated_at', { ascending: false });
        if (error) {
            throw new Error(`Failed to get pets needing attention: ${error.message}`);
        }
        return data || [];
    }
}
//# sourceMappingURL=pets.js.map