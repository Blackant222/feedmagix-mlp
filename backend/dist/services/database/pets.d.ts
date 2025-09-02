import { BaseService } from './base.js';
import { Pet, CreatePetData, UpdatePetData } from '../../types/database.types.js';
export declare class PetService extends BaseService {
    protected tableName: string;
    createPet(userId: string, data: CreatePetData): Promise<Pet>;
    updatePet(petId: string, userId: string, data: UpdatePetData): Promise<Pet>;
    deletePet(petId: string, userId: string): Promise<boolean>;
    getPet(petId: string, userId: string): Promise<Pet>;
    getUserPets(userId: string, options?: {
        page?: number;
        limit?: number;
        sort?: string;
        order?: 'asc' | 'desc';
        species?: string;
    }): Promise<{
        data: Pet[];
        count: number;
    }>;
    getPetWithScans(petId: string, userId: string, limit?: number): Promise<{
        recent_scans: any[];
        id: string;
        user_id: string;
        name: string;
        species: string;
        breed?: string;
        age?: number;
        weight?: number;
        gender?: string;
        health_conditions?: string[];
        dietary_restrictions?: string[];
        activity_level?: string;
        avatar_url?: string;
        created_at: string;
        updated_at: string;
    }>;
    getPetsBySpecies(userId: string, species: string): Promise<Pet[]>;
    getPetHealthSummary(petId: string, userId: string): Promise<{
        pet: Pet;
        health_summary: {
            total_scans: number;
            average_compatibility_score: number | null;
            good_food_count: number;
            bad_food_count: number;
            health_conditions: string[];
            dietary_restrictions: string[];
            last_scan_date: any;
        };
    }>;
    private verifyPetOwnership;
    searchPetsByName(userId: string, name: string): Promise<Pet[]>;
    getPetsNeedingAttention(userId: string): Promise<Pet[]>;
}
//# sourceMappingURL=pets.d.ts.map