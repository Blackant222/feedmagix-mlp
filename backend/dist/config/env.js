import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
// Validate required environment variables (from old-backend-files)
const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GEMINI_API_KEY'
];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}
// Export environment configuration
export const config = {
    port: Number(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    supabase: {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        model: 'gemini-2.5-flash'
    }
};
// Log configuration status (without sensitive values)
console.log('🔑 Environment configured:');
console.log(`- Port: ${config.port}`);
console.log(`- Node Environment: ${config.nodeEnv}`);
console.log(`- Client URL: ${config.clientUrl}`);
console.log(`- Supabase URL: ${config.supabase.url.substring(0, 30)}...`);
console.log(`- Gemini API: ${config.gemini.apiKey ? 'Configured' : 'Missing'}`);
console.log(`- Gemini Model: ${config.gemini.model}`);
//# sourceMappingURL=env.js.map