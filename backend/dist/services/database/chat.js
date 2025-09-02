import { BaseService } from './base.js';
export class ChatService extends BaseService {
    tableName = 'chat_sessions';
    // Create new chat session
    async createSession(userId, data) {
        const sessionData = {
            ...data,
            user_id: userId,
            title: data.title || `Chat - ${new Date().toLocaleDateString()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        return this.create(sessionData);
    }
    // Get user's chat sessions
    async getUserSessions(userId, options = {}) {
        const { data: sessions, count } = await this.findByUserId(userId, {
            ...options,
            sort: 'updated_at',
            order: 'desc'
        });
        // Get message counts and last messages for each session
        const enrichedSessions = await Promise.all(sessions.map(async (session) => {
            const { count: messageCount } = await this.supabase
                .from('chat_messages')
                .select('*', { count: 'exact', head: true })
                .eq('session_id', session.id);
            const { data: lastMessage } = await this.supabase
                .from('chat_messages')
                .select('content')
                .eq('session_id', session.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            return {
                ...session,
                message_count: messageCount || 0,
                last_message: lastMessage?.content?.substring(0, 100) || null
            };
        }));
        return { data: enrichedSessions, count };
    }
    // Get session by ID with ownership verification
    async getSession(sessionId, userId) {
        const session = await this.findById(sessionId);
        if (session.user_id !== userId) {
            throw new Error('Chat session not found or access denied');
        }
        return session;
    }
    // Update session (e.g., title)
    async updateSession(sessionId, userId, data) {
        // Verify ownership
        await this.getSession(sessionId, userId);
        return this.update(sessionId, data);
    }
    // Delete session and all its messages
    async deleteSession(sessionId, userId) {
        // Verify ownership
        await this.getSession(sessionId, userId);
        // Delete all messages first
        await this.supabase
            .from('chat_messages')
            .delete()
            .eq('session_id', sessionId);
        // Delete session
        return this.delete(sessionId);
    }
    // Add message to session
    async addMessage(userId, data) {
        // Verify session ownership
        await this.getSession(data.session_id, userId);
        const messageData = {
            ...data,
            created_at: new Date().toISOString()
        };
        const { data: message, error } = await this.supabase
            .from('chat_messages')
            .insert(messageData)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to add message: ${error.message}`);
        }
        // Update session's updated_at timestamp
        await this.update(data.session_id, { updated_at: new Date().toISOString() });
        return message;
    }
    // Get session messages
    async getSessionMessages(sessionId, userId, options = {}) {
        // Verify session ownership
        await this.getSession(sessionId, userId);
        let query = this.supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId);
        if (options.since) {
            query = query.gt('created_at', options.since);
        }
        if (options.page && options.limit) {
            const from = (options.page - 1) * options.limit;
            const to = from + options.limit - 1;
            query = query.range(from, to);
        }
        query = query.order('created_at', { ascending: true });
        const { data, error, count } = await query;
        if (error) {
            throw new Error(`Failed to get session messages: ${error.message}`);
        }
        return { data: data || [], count: count || 0 };
    }
    // Get session with context (pet info, recent messages)
    async getSessionWithContext(sessionId, userId) {
        const session = await this.getSession(sessionId, userId);
        // Get pet information
        let pet = null;
        if (session.pet_id) {
            const { data: petData } = await this.supabase
                .from('pets')
                .select('name, species, health_conditions, dietary_restrictions')
                .eq('id', session.pet_id)
                .single();
            pet = petData;
        }
        // Get recent messages (last 10)
        const { data: recentMessages } = await this.getSessionMessages(sessionId, userId, { limit: 10 });
        // Get total message count
        const { count: messageCount } = await this.supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', sessionId);
        return {
            session,
            pet,
            recent_messages: recentMessages.data || [],
            message_count: messageCount || 0
        };
    }
    // Search messages in user's chat sessions
    async searchMessages(userId, query, options = {}) {
        let searchQuery = this.supabase
            .from('chat_messages')
            .select(`
        *,
        chat_sessions!inner (
          title,
          user_id
        )
      `)
            .eq('chat_sessions.user_id', userId)
            .ilike('content', `%${query}%`);
        if (options.page && options.limit) {
            const from = (options.page - 1) * options.limit;
            const to = from + options.limit - 1;
            searchQuery = searchQuery.range(from, to);
        }
        searchQuery = searchQuery.order('created_at', { ascending: false });
        const { data, error, count } = await searchQuery;
        if (error) {
            throw new Error(`Failed to search messages: ${error.message}`);
        }
        const enrichedMessages = (data || []).map(message => ({
            ...message,
            session_title: message.chat_sessions?.title
        }));
        return { data: enrichedMessages, count: count || 0 };
    }
    // Get chat statistics for user
    async getUserChatStats(userId) {
        // Get session count
        const { count: sessionCount } = await this.supabase
            .from('chat_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        // Get message count
        const { count: messageCount } = await this.supabase
            .from('chat_messages')
            .select(`
        *,
        chat_sessions!inner (user_id)
      `, { count: 'exact', head: true })
            .eq('chat_sessions.user_id', userId);
        // Get sessions with pet info to find most active pet
        const { data: sessions } = await this.supabase
            .from('chat_sessions')
            .select(`
        pet_id,
        pets (name),
        updated_at
      `)
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });
        // Count sessions per pet
        const petCounts = (sessions || []).reduce((acc, session) => {
            if (session.pet_id && session.pets) {
                const petName = session.pets.name;
                acc[petName] = (acc[petName] || 0) + 1;
            }
            return acc;
        }, {});
        const mostActivePet = Object.entries(petCounts).length > 0
            ? Object.entries(petCounts).sort(([, a], [, b]) => b - a)[0][0]
            : null;
        const recentSessionDate = sessions && sessions.length > 0 ? sessions[0].updated_at : null;
        return {
            total_sessions: sessionCount || 0,
            total_messages: messageCount || 0,
            avg_messages_per_session: sessionCount ? Math.round((messageCount || 0) / sessionCount * 100) / 100 : 0,
            most_active_pet: mostActivePet,
            recent_session_date: recentSessionDate
        };
    }
    // Delete all user's chat data (GDPR compliance)
    async deleteUserChatData(userId) {
        // Get session IDs first
        const { data: sessions } = await this.supabase
            .from('chat_sessions')
            .select('id')
            .eq('user_id', userId);
        const sessionIds = sessions?.map(s => s.id) || [];
        // Delete messages
        let messageDeleteCount = 0;
        if (sessionIds.length > 0) {
            const { data: deletedMessages } = await this.supabase
                .from('chat_messages')
                .delete()
                .in('session_id', sessionIds)
                .select('id');
            messageDeleteCount = deletedMessages?.length || 0;
        }
        // Delete sessions
        const { data: deletedSessions } = await this.supabase
            .from('chat_sessions')
            .delete()
            .eq('user_id', userId)
            .select('id');
        return {
            sessions: deletedSessions?.length || 0,
            messages: messageDeleteCount
        };
    }
}
//# sourceMappingURL=chat.js.map