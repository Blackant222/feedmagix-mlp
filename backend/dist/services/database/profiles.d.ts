import { BaseService } from './base.js';
import { Profile, CreateProfileData, UpdateProfileData } from '../../types/database.types.js';
export declare class ProfileService extends BaseService {
    protected tableName: string;
    createOrUpdate(userId: string, data: CreateProfileData): Promise<Profile>;
    updateProfile(userId: string, data: UpdateProfileData): Promise<Profile>;
    findByEmail(email: string): Promise<Profile | null>;
    profileExists(userId: string): Promise<boolean>;
    getUserStats(userId: string): Promise<{
        profile: any;
        stats: {
            total_pets: number;
            total_scans: number;
            total_chat_sessions: number;
            average_compatibility_score: number;
            member_since: any;
        };
    }>;
}
//# sourceMappingURL=profiles.d.ts.map