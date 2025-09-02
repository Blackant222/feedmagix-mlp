import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';
// Create Supabase client with service role key for backend operations
export const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});
// Create Supabase client with anon key for user operations
export const supabaseAnon = createClient(config.supabase.url, config.supabase.anonKey);
// Test database connection
export async function testDatabaseConnection() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('count')
            .limit(1)
            .single();
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned, which is fine
            console.error('Database connection test failed:', error);
            return false;
        }
        console.log('✅ Database connection successful');
        return true;
    }
    catch (error) {
        console.error('Database connection test error:', error);
        return false;
    }
}
// Helper function to get user client with token
export function getUserSupabaseClient(accessToken) {
    return createClient(config.supabase.url, config.supabase.anonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    });
}
//# sourceMappingURL=supabase.js.map