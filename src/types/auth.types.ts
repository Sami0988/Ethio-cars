// src/types/auth.types.ts

// ========== REQUEST TYPES ==========

export interface LoginRequest {
  email: string;
  password: string;
  device_info?: string; // EthioCars API accepts this
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone: string;
  first_name: string;
  last_name: string;
  device_info?: string;
  is_dealer?: boolean;
  dealer_company_name?: string;
  dealer_address?: string;
  dealer_city?: string;
  dealer_region?: string;
  dealer_license_number?: string;
}

// ========== RESPONSE TYPES ==========

/**
 * Raw EthioCars API Auth Response Format
 * Based on documentation: https://ethiocars.com/mobile-api/v1
 */
export interface ApiAuthResponse {
  success: boolean;
  message: string;
  data?: {
    user_id: string; // EthioCars uses user_id (not id)
    username: string;
    email: string;
    is_dealer: boolean;
    api_token: string; // EthioCars uses api_token (not token)
    first_name?: string; // Optional in response
    last_name?: string; // Optional in response
    phone?: string; // Optional in response
    dealer_company_name?: string | null;
    created_at?: string; // Different from created_at format
    updated_at?: string; // Different from updated_at format
  };
  error?: string; // EthioCars uses 'error' for error messages
}

/**
 * App Auth Response Format (converted for internal use)
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: AppUser;
    token: string;
  };
  error?: string; // EthioCars uses 'error' for error messages
}

// ========== USER TYPES ==========

/**
 * User object returned by EthioCars API
 * Note: Different from your User interface above
 */
export interface EthioCarsUser {
  user_id: string; // Different from 'id' in your interface
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_dealer: boolean;
  dealer_company_name?: string | null;
  dealer_address?: string | null;
  dealer_city?: string | null;
  dealer_region?: string | null;
  dealer_license_number?: string | null;
  is_verified?: boolean;
  profile_picture?: string | null;
  member_since?: string; // Format: "2025-12-30 18:30:25"
  listing_count?: number;
}

/**
 * App User type (converted from API response for internal use)
 */
export interface AppUser {
  id: string; // Same as user_id from API
  username: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  is_dealer: boolean;
  dealer_company_name?: string;
  dealer_address?: string;
  dealer_city?: string;
  dealer_region?: string;
  dealer_license_number?: string;
  created_at?: string;
  updated_at?: string;
}

// ========== STORE TYPES ==========

export interface AuthState {
  user: AppUser | null;
  token: string | null; // Store the api_token here
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>; // Make async for EthioCars API call
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>; // Add initialization
}

export type AuthStore = AuthState & AuthActions;

// ========== HELPER TYPES ==========

/**
 * Convert EthioCars API user to App User
 */
export const convertApiUserToAppUser = (apiUser: any): AppUser => ({
  id: apiUser.user_id || apiUser.id,
  username: apiUser.username,
  email: apiUser.email,
  phone: apiUser.phone || "",
  first_name: apiUser.first_name || "",
  last_name: apiUser.last_name || "",
  is_dealer: apiUser.is_dealer || false,
  dealer_company_name: apiUser.dealer_company_name || undefined,
  dealer_address: apiUser.dealer_address || undefined,
  dealer_city: apiUser.dealer_city || undefined,
  dealer_region: apiUser.dealer_region || undefined,
  dealer_license_number: apiUser.dealer_license_number || undefined,
  created_at: apiUser.member_since || apiUser.created_at,
  updated_at: apiUser.updated_at,
});

/**
 * Profile response type (GET /user/profile)
 */
export interface ProfileResponse {
  success: boolean;
  message: string;
  data?: EthioCarsUser;
  error?: string;
}
