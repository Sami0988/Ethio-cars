import axios, { AxiosInstance, AxiosResponse } from "axios";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://10.156.76.164:3000/mobile-api/v1";
// ⚠️ Change IP to your machine’s LAN IP for dev; keep HTTPS-only in production builds.

const isWeb =
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

// Platform-specific storage helpers
const getItemAsync = async (key: string): Promise<string | null> => {
  if (isWeb) {
    return localStorage.getItem(key);
  } else {
    try {
      const SecureStore = require("expo-secure-store");
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn("SecureStore not available on native:", error);
      return null; // do NOT use localStorage on native
    }
  }
};

const deleteItemAsync = async (key: string): Promise<void> => {
  if (isWeb) {
    localStorage.removeItem(key);
  } else {
    try {
      const SecureStore = require("expo-secure-store");
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn("SecureStore not available on native:", error);
      // safe no-op on native if secure storage fails
    }
  }
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request: attach auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await getItemAsync("auth_token");
        if (token) {
          // Ensure headers object exists and set Authorization header
          config.headers = config.headers || {};
          (config.headers as any)["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response: handle 401 (unauthorized)
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Clear auth-related storage; UI should react by redirecting to login
          await deleteItemAsync("auth_token");
          await deleteItemAsync("refresh_token");
          await deleteItemAsync("user_data");
        }
        return Promise.reject(error);
      }
    );
  }

  // You can keep AxiosResponse<T> if you like,
  // or switch to returning just T (response.data) for nicer typing.

  // Accept a full Axios config object (including `params`) and pass it through.
  public get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  public post<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data);
  }

  public put<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data);
  }

  public patch<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data);
  }

  public delete<T = any>(url: string): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url);
  }
}

export const apiClient = new ApiClient();
