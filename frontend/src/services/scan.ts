import { apiClient } from './api';
import { ScanResult, FoodProduct } from '../types';

interface ScanAnalysisResponse {
  product: FoodProduct;
  analysis: ScanResult;
}

export const scanService = {
  async uploadImage(imageFile: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', imageFile);

    return apiClient.upload('/api/scan/upload', formData);
  },

  async analyzeImage(imageUrl: string, petId: string): Promise<ScanAnalysisResponse> {
    return apiClient.request<ScanAnalysisResponse>('/api/scan/analyze', {
      method: 'POST',
      body: JSON.stringify({ imageUrl, petId }),
    });
  },

  async analyzeBarcodeOrText(data: string, petId: string): Promise<ScanAnalysisResponse> {
    return apiClient.request<ScanAnalysisResponse>('/api/scan/analyze-barcode', {
      method: 'POST',
      body: JSON.stringify({ data, petId }),
    });
  },

  async getScanHistory(petId?: string): Promise<ScanResult[]> {
    const params = petId ? `?petId=${petId}` : '';
    return apiClient.request<ScanResult[]>(`/api/scan/history${params}`);
  },

  async getScanById(scanId: string): Promise<ScanResult> {
    return apiClient.request<ScanResult>(`/api/scan/${scanId}`);
  },

  async deleteScan(scanId: string): Promise<void> {
    return apiClient.request<void>(`/api/scan/${scanId}`, {
      method: 'DELETE',
    });
  }
};