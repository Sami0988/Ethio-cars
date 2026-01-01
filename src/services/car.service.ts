import { apiClient } from "./api";

export interface CarListing {
  id: string;
  image: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage: string;
  location: string;
  price: number;
  badges?: string[];
  isVerified?: boolean;
  isDealer?: boolean;
  isNegotiable?: boolean;
  isFixedPrice?: boolean;
  isUrgent?: boolean;
  description?: string;
  transmission?: string;
  fuelType?: string;
  condition?: string;
  sellerName?: string;
  sellerPhone?: string;
  postedDate?: string;
  views?: number;
}

export interface CarFilters {
  search?: string;
  make?: string;
  year?: number;
  maxPrice?: number;
  minPrice?: number;
  location?: string;
  condition?: string;
}

class CarService {
  /**
   * Get all car listings with optional filters
   */
  async getListings(
    filters?: CarFilters
  ): Promise<{ success: boolean; data: CarListing[]; message?: string }> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
      }

      const response = await apiClient.get(`/cars?${params.toString()}`);

      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error: any) {
      console.error("Error fetching car listings:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to fetch car listings",
      };
    }
  }

  /**
   * Get a single car listing by ID
   */
  async getListing(
    id: string
  ): Promise<{ success: boolean; data: CarListing | null; message?: string }> {
    try {
      const response = await apiClient.get(`/cars/${id}`);

      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error: any) {
      console.error("Error fetching car listing:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to fetch car listing",
      };
    }
  }

  /**
   * Get featured/special listings
   */
  async getFeaturedListings(): Promise<{
    success: boolean;
    data: CarListing[];
    message?: string;
  }> {
    try {
      const response = await apiClient.get("/cars/featured");

      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error: any) {
      console.error("Error fetching featured listings:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to fetch featured listings",
      };
    }
  }

  /**
   * Get listings by a specific seller
   */
  async getSellerListings(
    sellerId: string
  ): Promise<{ success: boolean; data: CarListing[]; message?: string }> {
    try {
      const response = await apiClient.get(`/cars/seller/${sellerId}`);

      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error: any) {
      console.error("Error fetching seller listings:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to fetch seller listings",
      };
    }
  }

  /**
   * Save a car listing to user's favorites
   */
  async saveListing(
    listingId: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      await apiClient.post(`/cars/${listingId}/save`);

      return {
        success: true,
        message: "Listing saved successfully",
      };
    } catch (error: any) {
      console.error("Error saving listing:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to save listing",
      };
    }
  }

  /**
   * Remove a car listing from user's favorites
   */
  async unsaveListing(
    listingId: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      await apiClient.delete(`/cars/${listingId}/save`);

      return {
        success: true,
        message: "Listing removed from favorites",
      };
    } catch (error: any) {
      console.error("Error removing listing:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to remove listing",
      };
    }
  }

  /**
   * Get user's saved/favorite listings
   */
  async getSavedListings(): Promise<{
    success: boolean;
    data: CarListing[];
    message?: string;
  }> {
    try {
      const response = await apiClient.get("/cars/saved");

      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error: any) {
      console.error("Error fetching saved listings:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to fetch saved listings",
      };
    }
  }

  /**
   * Contact seller about a listing
   */
  async contactSeller(
    listingId: string,
    message: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      await apiClient.post(`/cars/${listingId}/contact`, { message });

      return {
        success: true,
        message: "Message sent to seller",
      };
    } catch (error: any) {
      console.error("Error contacting seller:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to contact seller",
      };
    }
  }
}

export const carService = new CarService();
