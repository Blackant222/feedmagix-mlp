import { BaseService } from './base.js';
import { ChatSession, ChatMessage, CreateChatSessionData, CreateChatMessageData } from '../../types/database.types.js';
export declare class ChatService extends BaseService {
    protected tableName: string;
    createSession(userId: string, data: CreateChatSessionData): Promise<ChatSession>;
    getUserSessions(userId: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<{
        data: Array<ChatSession & {
            message_count?: number;
            last_message?: string;
        }>;
        count: number;
    }>;
    getSession(sessionId: string, userId: string): Promise<ChatSession>;
    updateSession(sessionId: string, userId: string, data: Partial<CreateChatSessionData>): Promise<ChatSession>;
    deleteSession(sessionId: string, userId: string): Promise<boolean>;
    addMessage(userId: string, data: CreateChatMessageData): Promise<ChatMessage>;
    getSessionMessages(sessionId: string, userId: string, options?: {
        page?: number;
        limit?: number;
        since?: string;
    }): Promise<{
        data: ChatMessage[];
        count: number;
    }>;
    getSessionWithContext(sessionId: string, userId: string): Promise<{
        session: ChatSession;
        pet?: {
            name: string;
            species: string;
            health_conditions?: string[];
            dietary_restrictions?: string[];
        };
        recent_messages: ChatMessage[];
        message_count: number;
    }>;
    searchMessages(userId: string, query: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<{
        data: Array<ChatMessage & {
            session_title?: string;
        }>;
        count: number;
    }>;
    getUserChatStats(userId: string): Promise<{
        total_sessions: number;
        total_messages: number;
        avg_messages_per_session: number;
        most_active_pet: string | null;
        recent_session_date: string | null;
    }>;
    deleteUserChatData(userId: string): Promise<{
        sessions: number;
        messages: number;
    }>;
}
//# sourceMappingURL=chat.d.ts.map