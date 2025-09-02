import { supabase } from '../../config/supabase.js';
// Base service class for common database operations
export class BaseService {
    supabase;
    constructor(client = supabase) {
        this.supabase = client;
    }
    // Generic find by ID
    async findById(id) {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            throw new Error(`Failed to find ${this.tableName} by ID: ${error.message}`);
        }
        return data;
    }
    // Generic find all with optional filters
    async findAll(filters = {}, options = {}) {
        let query = this.supabase.from(this.tableName).select('*');
        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        // Apply sorting
        if (options.sort) {
            query = query.order(options.sort, { ascending: options.order === 'asc' });
        }
        // Apply pagination
        if (options.page && options.limit) {
            const from = (options.page - 1) * options.limit;
            const to = from + options.limit - 1;
            query = query.range(from, to);
        }
        const { data, error, count } = await query;
        if (error) {
            throw new Error(`Failed to find ${this.tableName}: ${error.message}`);
        }
        return {
            data: data || [],
            count: count || 0
        };
    }
    // Generic create
    async create(data) {
        // Remove undefined values
        const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
        const { data: result, error } = await this.supabase
            .from(this.tableName)
            .insert(cleanData)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to create ${this.tableName}: ${error.message}`);
        }
        return result;
    }
    // Generic update
    async update(id, data) {
        // Remove undefined values
        const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
        // Add updated_at timestamp
        cleanData.updated_at = new Date().toISOString();
        const { data: result, error } = await this.supabase
            .from(this.tableName)
            .update(cleanData)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to update ${this.tableName}: ${error.message}`);
        }
        return result;
    }
    // Generic delete
    async delete(id) {
        const { error } = await this.supabase
            .from(this.tableName)
            .delete()
            .eq('id', id);
        if (error) {
            throw new Error(`Failed to delete ${this.tableName}: ${error.message}`);
        }
        return true;
    }
    // Count records with optional filters
    async count(filters = {}) {
        let query = this.supabase
            .from(this.tableName)
            .select('*', { count: 'exact', head: true });
        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query = query.eq(key, value);
            }
        });
        const { count, error } = await query;
        if (error) {
            throw new Error(`Failed to count ${this.tableName}: ${error.message}`);
        }
        return count || 0;
    }
    // Check if record exists
    async exists(id) {
        try {
            await this.findById(id);
            return true;
        }
        catch {
            return false;
        }
    }
    // Batch create
    async createMany(records) {
        const cleanRecords = records.map(record => Object.fromEntries(Object.entries(record).filter(([_, v]) => v !== undefined)));
        const { data, error } = await this.supabase
            .from(this.tableName)
            .insert(cleanRecords)
            .select();
        if (error) {
            throw new Error(`Failed to create multiple ${this.tableName}: ${error.message}`);
        }
        return data || [];
    }
    // Find by user ID (common pattern)
    async findByUserId(userId, options = {}) {
        return this.findAll({ user_id: userId }, options);
    }
}
//# sourceMappingURL=base.js.map