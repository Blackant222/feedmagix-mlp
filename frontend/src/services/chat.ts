import { apiClient } from './api';
import { ChatSession, ChatMessage } from '../types';

interface SendMessageRequest {
  sessionId?: string;
  petId: string;
  message: string;
}

interface SendMessageResponse {
  session: ChatSession;
  message: ChatMessage;
}

export const chatService = {
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    return apiClient.request<SendMessageResponse>('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getChatSessions(petId?: string): Promise<ChatSession[]> {
    const params = petId ? `?petId=${petId}` : '';
    return apiClient.request<ChatSession[]>(`/api/chat/sessions${params}`);
  },

  async getChatSession(sessionId: string): Promise<ChatSession> {
    return apiClient.request<ChatSession>(`/api/chat/sessions/${sessionId}`);
  },

  async createChatSession(petId: string, title?: string): Promise<ChatSession> {
    return apiClient.request<ChatSession>('/api/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ petId, title }),
    });
  },

  async updateChatSession(sessionId: string, updates: { title?: string }): Promise<ChatSession> {
    return apiClient.request<ChatSession>(`/api/chat/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteChatSession(sessionId: string): Promise<void> {
    return apiClient.request<void>(`/api/chat/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }
};