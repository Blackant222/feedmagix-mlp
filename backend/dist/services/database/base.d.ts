import { SupabaseClient } from '@supabase/supabase-js';
export declare abstract class BaseService {
    protected supabase: SupabaseClient;
    protected abstract tableName: string;
    constructor(client?: SupabaseClient);
    findById(id: string): Promise<any>;
    findAll(filters?: Record<string, any>, options?: {
        page?: number;
        limit?: number;
        sort?: string;
        order?: 'asc' | 'desc';
    }): Promise<{
        data: any[];
        count: number;
    }>;
    create(data: Record<string, any>): Promise<any>;
    update(id: string, data: Record<string, any>): Promise<any>;
    delete(id: string): Promise<boolean>;
    count(filters?: Record<string, any>): Promise<number>;
    exists(id: string): Promise<boolean>;
    createMany(records: Record<string, any>[]): Promise<any[]>;
    findByUserId(userId: string, options?: {
        page?: number;
        limit?: number;
        sort?: string;
        order?: 'asc' | 'desc';
    }): Promise<{
        data: any[];
        count: number;
    }>;
}
//# sourceMappingURL=base.d.ts.map