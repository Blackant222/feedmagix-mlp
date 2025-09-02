import { apiClient } from './api';
import { FoodProduct } from '../types';

interface ComparisonRequest {
  productIds: string[];
  petId: string;
}

interface ComparisonResult {
  products: FoodProduct[];
  comparison: {
    productId: string;
    scores: {
      nutritional: number;
      compatibility: number;
      overall: number;
    };
    pros: string[];
    cons: string[];
  }[];
  recommendation: {
    bestChoice: string;
    reasoning: string;
  };
}

export const comparisonService = {
  async compareProducts(data: ComparisonRequest): Promise<ComparisonResult> {
    return apiClient.request<ComparisonResult>('/api/comparison/compare', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async saveComparison(data: ComparisonRequest & { title?: string }): Promise<{ id: string }> {
    return apiClient.request<{ id: string }>('/api/comparison/save', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getSavedComparisons(): Promise<Array<{
    id: string;
    title: string;
    productCount: number;
    petName: string;
    createdAt: string;
  }>> {
    return apiClient.request('/api/comparison/saved');
  },

  async getComparisonById(comparisonId: string): Promise<ComparisonResult> {
    return apiClient.request<ComparisonResult>(`/api/comparison/${comparisonId}`);
  },

  async deleteComparison(comparisonId: string): Promise<void> {
    return apiClient.request<void>(`/api/comparison/${comparisonId}`, {
      method: 'DELETE',
    });
  }
};