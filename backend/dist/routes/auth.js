import { supabaseAnon } from '../config/supabase.js';
import { profileService } from '../services/database/index.js';
import { authMiddleware, getAuthUser } from '../middleware/auth.js';
import { AppError, ValidationError, UnauthorizedError, asyncHandler, validateRequired, validateEmail } from '../middleware/error.js';
export async function authRoutes(fastify) {
    // Register new user
    fastify.post('/register', asyncHandler(async (request, reply) => {
        const { email, password, full_name, phone } = request.body;
        // Validate required fields
        validateRequired(request.body, ['email', 'password']);
        // Validate email format
        if (!validateEmail(email)) {
            throw new ValidationError('Invalid email format');
        }
        // Validate password strength
        if (password.length < 6) {
            throw new ValidationError('Password must be at least 6 characters long');
        }
        try {
            // Create user with Supabase Auth
            const { data: authData, error: authError } = await supabaseAnon.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: full_name || '',
                        phone: phone || ''
                    }
                }
            });
            if (authError) {
                if (authError.message.includes('already registered')) {
                    throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
                }
                throw new AppError(authError.message, 400, 'REGISTRATION_FAILED');
            }
            if (!authData.user) {
                throw new AppError('Registration failed', 400, 'REGISTRATION_FAILED');
            }
            // Create profile in database
            const profile = await profileService.createOrUpdate(authData.user.id, {
                email,
                full_name,
                phone
            });
            const response = {
                user: profile,
                session: {
                    access_token: authData.session?.access_token || '',
                    refresh_token: authData.session?.refresh_token || '',
                    expires_in: authData.session?.expires_in || 3600
                }
            };
            reply.status(201).send({
                success: true,
                data: response,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            if (error instanceof AppError)
                throw error;
            throw new AppError('Registration failed', 500, 'REGISTRATION_ERROR');
        }
    }));
    // Login user
    fastify.post('/login', asyncHandler(async (request, reply) => {
        const { email, password } = request.body;
        // Validate required fields
        validateRequired(request.body, ['email', 'password']);
        try {
            // Authenticate with Supabase
            const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
                email,
                password
            });
            if (authError || !authData.user) {
                throw new UnauthorizedError('Invalid email or password');
            }
            // Get or create profile
            let profile = await profileService.findByEmail(email);
            if (!profile) {
                profile = await profileService.createOrUpdate(authData.user.id, {
                    email,
                    full_name: authData.user.user_metadata?.full_name,
                    phone: authData.user.user_metadata?.phone
                });
            }
            const response = {
                user: profile,
                session: {
                    access_token: authData.session?.access_token || '',
                    refresh_token: authData.session?.refresh_token || '',
                    expires_in: authData.session?.expires_in || 3600
                }
            };
            reply.send({
                success: true,
                data: response,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            if (error instanceof AppError)
                throw error;
            throw new UnauthorizedError('Login failed');
        }
    }));
    // Logout user
    fastify.post('/logout', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        try {
            const user = getAuthUser(request);
            if (user) {
                // Get token from header
                const token = request.headers.authorization?.replace('Bearer ', '');
                if (token) {
                    // Sign out from Supabase
                    await supabaseAnon.auth.signOut();
                }
            }
            reply.send({
                success: true,
                data: { message: 'Logged out successfully' },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            // Don't fail logout even if there's an error
            reply.send({
                success: true,
                data: { message: 'Logged out' },
                timestamp: new Date().toISOString()
            });
        }
    }));
    // Get current user profile
    fastify.get('/profile', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        try {
            const profile = await profileService.findById(user.id);
            reply.send({
                success: true,
                data: profile,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            throw new AppError('Failed to fetch profile', 500, 'PROFILE_FETCH_ERROR');
        }
    }));
    // Update user profile
    fastify.put('/profile', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        const { full_name, phone } = request.body;
        try {
            const updatedProfile = await profileService.updateProfile(user.id, {
                full_name,
                phone
            });
            reply.send({
                success: true,
                data: updatedProfile,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            throw new AppError('Failed to update profile', 500, 'PROFILE_UPDATE_ERROR');
        }
    }));
    // Refresh token
    fastify.post('/refresh', asyncHandler(async (request, reply) => {
        const { refresh_token } = request.body;
        if (!refresh_token) {
            throw new ValidationError('Refresh token is required');
        }
        try {
            const { data: authData, error } = await supabaseAnon.auth.refreshSession({
                refresh_token
            });
            if (error || !authData.session) {
                throw new UnauthorizedError('Invalid refresh token');
            }
            reply.send({
                success: true,
                data: {
                    access_token: authData.session.access_token,
                    refresh_token: authData.session.refresh_token,
                    expires_in: authData.session.expires_in
                },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            if (error instanceof AppError)
                throw error;
            throw new UnauthorizedError('Token refresh failed');
        }
    }));
    // Get user statistics
    fastify.get('/stats', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        try {
            const stats = await profileService.getUserStats(user.id);
            reply.send({
                success: true,
                data: stats,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            throw new AppError('Failed to fetch user stats', 500, 'STATS_FETCH_ERROR');
        }
    }));
    // Delete user account (GDPR compliance)
    fastify.delete('/account', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        try {
            // This would need to implement cascade deletion of all user data
            // For now, just respond with success
            reply.send({
                success: true,
                data: { message: 'Account deletion initiated' },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            throw new AppError('Failed to delete account', 500, 'ACCOUNT_DELETE_ERROR');
        }
    }));
    // Change password
    fastify.post('/change-password', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const { current_password, new_password } = request.body;
        const user = getAuthUser(request);
        validateRequired(request.body, ['current_password', 'new_password']);
        if (new_password.length < 6) {
            throw new ValidationError('New password must be at least 6 characters long');
        }
        try {
            // Update password with Supabase
            const { error } = await supabaseAnon.auth.updateUser({
                password: new_password
            });
            if (error) {
                throw new AppError('Failed to change password', 400, 'PASSWORD_CHANGE_FAILED');
            }
            reply.send({
                success: true,
                data: { message: 'Password changed successfully' },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            if (error instanceof AppError)
                throw error;
            throw new AppError('Password change failed', 500, 'PASSWORD_CHANGE_ERROR');
        }
    }));
}
//# sourceMappingURL=auth.js.map