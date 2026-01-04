import * as SecureStore from "expo-secure-store";
import { apiClient } from "../../api/apiClient";
import {
  ApiAuthResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  convertApiUserToAppUser,
} from "./auth.types";

// Platform detection for web vs native
const isWeb = typeof window !== "undefined" && window.localStorage;

const AUTH_TOKEN_KEY = "auth_token";
const USER_DATA_KEY = "user_data";

// Helper functions for platform-specific storage
const setItemAsync = async (key: string, value: string): Promise<void> => {
  if (isWeb) {
    localStorage.setItem(key, value);
  } else {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (secureStoreError) {
      // Fallback to localStorage if SecureStore fails
      console.warn(
        "SecureStore not available, falling back to localStorage:",
        secureStoreError
      );
    }
  }
};

const getItemAsync = async (key: string): Promise<string | null> => {
  if (isWeb) {
    return localStorage.getItem(key);
  } else {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (secureStoreError) {
      // Fallback to localStorage if SecureStore fails
      console.warn(
        "SecureStore not available, falling back to localStorage:",
        secureStoreError
      );
      return null;
    }
  }
};

const deleteItemAsync = async (key: string): Promise<void> => {
  if (isWeb) {
    localStorage.removeItem(key);
  } else {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (secureStoreError) {
      // Fallback to localStorage if SecureStore fails
      console.warn(
        "SecureStore not available, falling back to localStorage:",
        secureStoreError
      );
    }
  }
};

const storage = {
  getItem: async (name: string) => {
    try {
      if (isWeb) {
        const value = localStorage.getItem(name);
        return value ? JSON.parse(value) : null;
      } else {
        try {
          const value = await SecureStore.getItemAsync(name);
          return value ? JSON.parse(value) : null;
        } catch (secureStoreError) {
          console.warn(
            "SecureStore not available on native:",
            secureStoreError
          );
          return null;
        }
      }
    } catch (error) {
      console.error("Error reading from storage:", error);
      return null;
    }
  },
  setItem: async (name: string, value: any) => {
    try {
      const serialized = JSON.stringify(value);
      if (isWeb) {
        localStorage.setItem(name, serialized);
      } else {
        try {
          await SecureStore.setItemAsync(name, serialized);
        } catch (secureStoreError) {
          console.warn(
            "SecureStore not available on native:",
            secureStoreError
          );
        }
      }
    } catch (error) {
      console.error("Error writing to storage:", error);
    }
  },
  removeItem: async (name: string) => {
    try {
      if (isWeb) {
        localStorage.removeItem(name);
      } else {
        try {
          await SecureStore.deleteItemAsync(name);
        } catch (secureStoreError) {
          console.warn(
            "SecureStore not available on native:",
            secureStoreError
          );
        }
      }
    } catch (error) {
      console.error("Error removing from storage:", error);
    }
  },
};

class AuthService {
  /**
   * Login user using EthioCars API
   * Note: API returns 'api_token' not 'token'
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiAuthResponse>("/auth/login", {
        email: credentials.email,
        password: credentials.password,
        device_info: credentials.device_info || "EthioCars Mobile App",
      });

      const data = response.data;

      if (data.success && data.data) {
        // EthioCars returns 'api_token' field
        const apiToken = data.data.api_token;
        const { api_token, ...rawUserData } = data.data; // Remove api_token from user data

        // Convert API user to app user format
        const userData = convertApiUserToAppUser(rawUserData);

        // Store token and user data
        await setItemAsync(AUTH_TOKEN_KEY, apiToken);
        await setItemAsync(USER_DATA_KEY, JSON.stringify(rawUserData));

        return {
          ...data,
          data: {
            user: userData,
            token: apiToken, // Map api_token to token for app compatibility
          },
        };
      }

      return {
        success: data.success,
        message: data.message,
        error: data.error,
        data: undefined,
      };
    } catch (error: any) {
      console.error("Login API error:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Login failed";
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  }

  /**
   * Register user using EthioCars API
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Format phone number before sending
      const formattedData = {
        ...userData,
        phone: this.formatPhoneForApi(userData.phone),
        device_info: userData.device_info || "EthioCars Mobile App",
      };

      const response = await apiClient.post<ApiAuthResponse>(
        "/auth/register",
        formattedData
      );

      const data = response.data;

      if (data.success && data.data) {
        // EthioCars returns 'api_token' field
        const apiToken = data.data.api_token;
        const { api_token, ...rawUserData } = data.data; // Remove api_token from user data

        // Convert API user to app user format
        const userData = convertApiUserToAppUser(rawUserData);

        // Store token and user data
        await setItemAsync(AUTH_TOKEN_KEY, apiToken);
        await setItemAsync(USER_DATA_KEY, JSON.stringify(rawUserData));

        return {
          ...data,
          data: {
            user: userData,
            token: apiToken,
          },
        };
      }

      return {
        success: data.success,
        message: data.message,
        error: data.error,
        data: undefined,
      };
    } catch (error: any) {
      console.error("Registration API error:", error);

      let errorMessage = "Registration failed";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.errors?.missing_fields) {
        errorMessage = `Missing fields: ${error.response.data.errors.missing_fields.join(
          ", "
        )}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  }

  /**
   * Logout user (calls EthioCars API)
   */
  async logout(allDevices: boolean = false): Promise<void> {
    try {
      const token = await this.getStoredToken();

      if (token) {
        // Call EthioCars logout API
        await apiClient.post("/auth/logout", { all_devices: allDevices });
      }
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with local logout even if API fails
    } finally {
      // Always clear local storage
      await deleteItemAsync(AUTH_TOKEN_KEY);
      await deleteItemAsync(USER_DATA_KEY);
    }
  }

  /**
   * Get stored user data
   */
  async getStoredUser(): Promise<any> {
    try {
      const userJson = await getItemAsync(USER_DATA_KEY);
      if (userJson) {
        const apiUser = JSON.parse(userJson);
        // Convert EthioCars API user format to app user format
        return convertApiUserToAppUser(apiUser);
      }
      return null;
    } catch (error) {
      console.error("Error getting stored user:", error);
      return null;
    }
  }

  /**
   * Get stored token
   */
  async getStoredToken(): Promise<string | null> {
    try {
      return await getItemAsync(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting stored token:", error);
      return null;
    }
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    const user = await this.getStoredUser();
    return !!(token && user);
  }

  /**
   * Validate token by calling profile endpoint
   */
  async validateToken(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      if (!token) return false;

      const response = await apiClient.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.success === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Format phone number for EthioCars API
   * Expected format: +2519XXXXXXXX
   */
  private formatPhoneForApi(phone: string): string {
    if (!phone) return "";

    // Remove all non-digits
    const digits = phone.replace(/\D/g, "");

    if (digits.startsWith("0") && digits.length === 10) {
      return `+251${digits.substring(1)}`;
    } else if (digits.startsWith("251") && digits.length === 12) {
      return `+${digits}`;
    } else if (
      (digits.startsWith("9") || digits.startsWith("7")) &&
      digits.length === 9
    ) {
      return `+251${digits}`;
    }

    return phone; // Return as-is if already formatted
  }
}

export const authService = new AuthService();
