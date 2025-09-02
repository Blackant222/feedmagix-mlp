import { BaseService } from './base.js'
import { Profile, CreateProfileData, UpdateProfileData } from '../../types/database.types.js'

export class ProfileService extends BaseService {
  protected tableName = 'profiles'

  // Create or update profile (upsert pattern for auth integration)
  async createOrUpdate(userId: string, data: CreateProfileData): Promise<Profile> {
    const profileData = {
      id: userId,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .upsert(profileData, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create/update profile: ${error.message}`)
    }

    return result
  }

  // Update profile
  async updateProfile(userId: string, data: UpdateProfileData): Promise<Profile> {
    return this.update(userId, data)
  }

  // Get profile by email
  async findByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null
      }
      throw new Error(`Failed to find profile by email: ${error.message}`)
    }

    return data
  }

  // Check if profile exists
  async profileExists(userId: string): Promise<boolean> {
    return this.exists(userId)
  }

  // Get user stats
  async getUserStats(userId: string) {
    try {
      // Get basic profile info
      const profile = await this.findById(userId)

      // Get pet count
      const { count: petCount } = await this.supabase
        .from('pets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Get scan count
      const { count: scanCount } = await this.supabase
        .from('scan_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Get chat session count
      const { count: chatCount } = await this.supabase
        .from('chat_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Get average compatibility score
      const { data: avgScore } = await this.supabase
        .from('scan_history')
        .select('compatibility_score')
        .eq('user_id', userId)

      const averageScore = avgScore && avgScore.length > 0
        ? avgScore.reduce((sum, scan) => sum + scan.compatibility_score, 0) / avgScore.length
        : 0

      return {
        profile,
        stats: {
          total_pets: petCount || 0,
          total_scans: scanCount || 0,
          total_chat_sessions: chatCount || 0,
          average_compatibility_score: Math.round(averageScore * 100) / 100,
          member_since: profile.created_at
        }
      }
    } catch (error) {
      throw new Error(`Failed to get user stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}