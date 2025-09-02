import { BaseService } from './base.js';
import { ScanHistory, CreateScanData } from '../../types/database.types.js';
import { CompleteScanResult } from '../../types/ai.types.js';
export declare class ScanHistoryService extends BaseService {
    protected tableName: string;
    createScan(userId: string, data: CreateScanData): Promise<ScanHistory>;
    getScan(scanId: string, userId: string): Promise<ScanHistory>;
    getUserScans(userId: string, options?: {
        page?: number;
        limit?: number;
        petId?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<{
        data: Array<ScanHistory & {
            pet?: {
                name: string;
                species: string;
            };
            food_product?: {
                name: string;
                brand: string;
            };
        }>;
        count: number;
    }>;
    getPetScans(petId: string, userId: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<{
        data: ScanHistory[];
        count: number;
    }>;
    updateScanResults(scanId: string, userId: string, results: CompleteScanResult): Promise<ScanHistory>;
    getUserScanStats(userId: string): Promise<{
        total_scans: number;
        avg_compatibility_score: number;
        good_foods: number;
        bad_foods: number;
        most_scanned_brand: string | null;
        recent_scan_date: string | null;
    }>;
    getTrendingScans(limit?: number): Promise<Array<ScanHistory & {
        food_product: {
            name: string;
            brand: string;
        };
        scan_count: number;
    }>>;
    deleteUserScans(userId: string): Promise<number>;
    getScansByVerdict(userId: string, verdict: 'buy' | 'no-buy', options?: {
        page?: number;
        limit?: number;
    }): Promise<{
        data: ScanHistory[];
        count: number;
    }>;
}
//# sourceMappingURL=scan-history.d.ts.map