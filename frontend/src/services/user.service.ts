import { supabase, type UserProfile } from '@/lib/supabase'
import { nanoid } from 'nanoid'

// Re-export types for use in other modules
export type { UserProfile }

export class UserService {
  /**
   * Register or get user by wallet address
   */
  async registerUser(walletAddress: string): Promise<UserProfile> {
    try {
      // First check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error fetching user:', fetchError)
        throw new Error('Failed to fetch user data')
      }

      if (existingUser) {
        // User exists, return profile
        return {
          wallet_address: existingUser.wallet_address,
          has_api_key: !!existingUser.api_key,
          api_key: existingUser.api_key,
          created_at: existingUser.created_at
        }
      }

      // User doesn't exist, create new one
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{
          wallet_address: walletAddress,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (insertError) {
        console.error('Error creating user:', insertError)
        throw new Error('Failed to create user')
      }

      return {
        wallet_address: newUser.wallet_address,
        has_api_key: false,
        created_at: newUser.created_at
      }
    } catch (error) {
      console.error('Error in registerUser:', error)
      throw error
    }
  }

  /**
   * Generate API key for user
   */
  async generateApiKey(walletAddress: string): Promise<string> {
    try {
      console.log('🔑 Generating API key for wallet:', walletAddress);
      
      // Generate a secure API key
      const apiKey = `spk_test_${nanoid(32)}`
      
      // Hash the API key for storage (simple hash for demo)
      const apiKeyHash = typeof window !== 'undefined' 
        ? btoa(apiKey) // Browser environment
        : Buffer.from(apiKey).toString('base64') // Node.js environment
      
      console.log('Generated API key:', apiKey);
      console.log('Generated hash:', apiKeyHash);

      // Update user with API key
      const { data, error } = await supabase
        .from('users')
        .update({
          api_key: apiKey,
          api_key_hash: apiKeyHash,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', walletAddress)
        .select()

      if (error) {
        console.error('❌ Error saving API key:', error)
        throw new Error('Failed to generate API key')
      }
      
      console.log('✅ API key saved successfully:', data);

      return apiKey
    } catch (error) {
      console.error('❌ Error in generateApiKey:', error)
      throw error
    }
  }

  /**
   * Get user profile by wallet address
   */
  async getUserProfile(walletAddress: string): Promise<UserProfile | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null
        }
        console.error('Error fetching user profile:', error)
        throw new Error('Failed to fetch user profile')
      }

      return {
        wallet_address: user.wallet_address,
        has_api_key: !!user.api_key,
        api_key: user.api_key,
        created_at: user.created_at
      }
    } catch (error) {
      console.error('Error in getUserProfile:', error)
      throw error
    }
  }

  /**
   * Validate API key exists for user
   */
  async validateUserApiKey(walletAddress: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(walletAddress)
      return profile?.has_api_key ?? false
    } catch (error) {
      console.error('Error validating API key:', error)
      return false
    }
  }

  /**
   * Revoke API key for user
   */
  async revokeApiKey(walletAddress: string): Promise<void> {
    try {
      console.log('🗑️ Revoking API key for wallet:', walletAddress);
      
      const { data, error } = await supabase
        .from('users')
        .update({
          api_key: null,
          api_key_hash: null,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', walletAddress)
        .select()

      if (error) {
        console.error('❌ Error revoking API key:', error)
        throw new Error('Failed to revoke API key')
      }
      
      console.log('✅ API key revoked successfully:', data);
    } catch (error) {
      console.error('❌ Error in revokeApiKey:', error)
      throw error
    }
  }
}

export const userService = new UserService()