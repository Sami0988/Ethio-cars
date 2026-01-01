import axios, { AxiosInstance, AxiosResponse } from "axios";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://ethiocars.com/mobile-api/v1";

// Platform detection for web vs native
const isWeb = typeof window !== "undefined" && window.localStorage;

// Helper functions for platform-specific storage
const getItemAsync = async (key: string): Promise<string | null> => {
  if (isWeb) {
    return localStorage.getItem(key);
  } else {
    try {
      const SecureStore = require("expo-secure-store");
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn(
        "SecureStore not available, falling back to localStorage:",
        error
      );
      return localStorage.getItem(key);
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
      console.warn(
        "SecureStore not available, falling back to localStorage:",
        error
      );
      localStorage.removeItem(key);
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
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await getItemAsync("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear storage
          await deleteItemAsync("auth_token");
          await deleteItemAsync("refresh_token");
          await deleteItemAsync("user_data");
        }
        return Promise.reject(error);
      }
    );
  }

  public get<T = any>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return this.client.get(url, { params });
  }

  public post<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.post(url, data);
  }

  public put<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.put(url, data);
  }

  public patch<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data);
  }

  public delete<T = any>(url: string): Promise<AxiosResponse<T>> {
    return this.client.delete(url);
  }
}

export const apiClient = new ApiClient();
