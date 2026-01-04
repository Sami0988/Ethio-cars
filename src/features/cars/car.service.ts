// services/car.service.ts
import { apiClient } from "../../api/apiClient";
import {
  CarDetailResponse,
  CarListResponse,
  CreateCarRequest,
  Feature,
  Location,
  Make,
  Model,
  UpdateCarRequest,
} from "./car.types";

// You don't need to return error responses in the service anymore
// Let React Query handle errors
export const carService = {
  // Get all car listings (for home screen)
  async getAllListings(
    page: number = 1,
    limit: number = 20,
    filters?: {
      search?: string;
      make?: string;
      maxPrice?: number;
      minYear?: number;
      location?: string;
    }
  ): Promise<CarListResponse> {
    const response = await apiClient.get<CarListResponse>("/cars/listings", {
      params: { page, limit, ...filters },
    });
    return response.data;
  },

  // Get my car listings with pagination
  async getMyListings(
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<CarListResponse> {
    const response = await apiClient.get<CarListResponse>("/cars", {
      params: { page, limit, status },
    });
    return response.data;
  },

  // Get single car details
  async getCarDetail(id: number): Promise<CarDetailResponse> {
    const response = await apiClient.get<CarDetailResponse>(`/cars/${id}`);
    return response.data;
  },

  // Create new car listing
  async createCar(data: CreateCarRequest): Promise<CarDetailResponse> {
    const response = await apiClient.post<CarDetailResponse>("/cars", data);
    return response.data;
  },

  // Update existing car listing
  async updateCar(
    id: number,
    data: UpdateCarRequest
  ): Promise<CarDetailResponse> {
    const response = await apiClient.put<CarDetailResponse>(
      `/cars/${id}`,
      data
    );
    return response.data;
  },

  // Delete car listing (soft delete)
  async deleteCar(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/cars/${id}`);
    return response.data;
  },

  // Get car makes (brands)
  async getMakes(): Promise<{
    success: boolean;
    message: string;
    data: Make[];
  }> {
    const response = await apiClient.get("/data/makes");
    return response.data;
  },

  // Get models for a specific make
  async getModels(
    makeId: number
  ): Promise<{ success: boolean; message: string; data: { models: Model[] } }> {
    const response = await apiClient.get("/data/models", {
      params: { make_id: makeId },
    });
    return response.data;
  },

  // Get all features
  async getFeatures(category?: string): Promise<{
    success: boolean;
    message: string;
    data: { features: Feature[] };
  }> {
    const response = await apiClient.get("/data/features", {
      params: { category },
    });
    return response.data;
  },

  // Get Ethiopian locations
  async getLocations(
    regionId?: number,
    zoneId?: number
  ): Promise<{ success: boolean; message: string; data: Location[] }> {
    const response = await apiClient.get("/data/locations", {
      params: { region_id: regionId, zone_id: zoneId },
    });
    return response.data;
  },

  // Helper: Convert image to base64 (keep as is)
  async imageToBase64(uri: string, maxWidth: number = 1200): Promise<string> {
    // Implementation...
    return new Promise((resolve) => {
      resolve(`data:image/jpeg;base64,placeholder-base64-string`);
    });
  },

  // Helper: Compress and prepare images for upload (keep as is)
  async prepareImages(
    uris: string[],
    types: string[] = []
  ): Promise<Array<{ data: string; type?: string }>> {
    const preparedImages = [];

    for (let i = 0; i < uris.length; i++) {
      const base64 = await this.imageToBase64(uris[i]);
      preparedImages.push({
        data: base64,
        type: types[i] || "exterior",
      });
    }

    return preparedImages;
  },
};
