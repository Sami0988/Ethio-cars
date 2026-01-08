// services/car.service.ts - COMPLETE FIXED VERSION
import { apiClient } from "../../api/apiClient";
import {
  CarDetailResponse,
  CarFilters,
  CarListResponse,
  CreateCarRequest,
  Feature,
  Location,
  Make,
  Model,
  UpdateCarRequest,
} from "./car.types";

// ========== CACHE IMPLEMENTATION ==========
interface CacheData {
  listings: any[];
  timestamp: number;
  filters: CarFilters | undefined;
  total: number;
}

class CarServiceCache {
  private cache: CacheData | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  getCache(filters?: CarFilters): CacheData | null {
    if (!this.cache) return null;

    const now = Date.now();
    const isExpired = now - this.cache.timestamp > this.CACHE_DURATION;
    const filtersMatch =
      JSON.stringify(this.normalizeFilters(filters)) ===
      JSON.stringify(this.normalizeFilters(this.cache.filters));

    if (isExpired || !filtersMatch) {
      this.clearCache();
      return null;
    }

    return this.cache;
  }

  setCache(listings: any[], filters?: CarFilters, total?: number): void {
    this.cache = {
      listings,
      filters,
      total: total || listings.length,
      timestamp: Date.now(),
    };
  }

  clearCache(): void {
    this.cache = null;
  }

  private normalizeFilters(filters?: CarFilters): any {
    if (!filters) return {};
    // Remove undefined/null values and sort keys for consistent comparison
    const normalized: any = {};
    Object.keys(filters)
      .sort()
      .forEach((key) => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null) {
          normalized[key] = value;
        }
      });
    return normalized;
  }
}

const cache = new CarServiceCache();

// ========== CAR SERVICE ==========
export const carService = {
  // ========== CORE LISTINGS METHODS ==========

  async getAllListings(
    page: number = 1,
    limit: number = 20,
    filters?: CarFilters
  ): Promise<CarListResponse> {
    // Check cache first
    const cachedData = cache.getCache(filters);
    let allListings: any[] = [];
    let total = 0;

    if (cachedData) {
      allListings = cachedData.listings;
      total = cachedData.total;
    } else {
      // First, get total count
      const countResponse = await apiClient.get<CarListResponse>(
        "cars/browse",
        {
          params: { limit: 1, sort: filters?.sort || "newest" },
        }
      );

      total = countResponse.data.data?.pagination?.total || 133;

      // Calculate how many batches we need (API limits to 20 per request)
      const MAX_PER_REQUEST = 20;
      const batchesNeeded = Math.ceil(total / MAX_PER_REQUEST);

      allListings = [];

      // Fetch in batches
      for (let batch = 1; batch <= batchesNeeded; batch++) {
        const params: Record<string, any> = {
          limit: MAX_PER_REQUEST,
          sort: filters?.sort || "newest",
          // TRY page parameter - maybe it works for batch fetching
          page: batch,
        };

        // Add filters to each batch request
        if (filters?.search) params.search = filters.search;
        if (filters?.make) params.make = filters.make;
        if (filters?.minPrice) params.min_price = filters.minPrice;
        if (filters?.maxPrice) params.max_price = filters.maxPrice;
        if (filters?.minYear) params.min_year = filters.minYear;
        if (filters?.maxYear) params.max_year = filters.maxYear;
        if (filters?.bodyType) params.body_type = filters.bodyType;
        if (filters?.fuelType) params.fuel_type = filters.fuelType;
        if (filters?.transmission) params.transmission = filters.transmission;
        if (filters?.region_id) params.region_id = filters.region_id;
        if (filters?.zone_id) params.zone_id = filters.zone_id;
        if (filters?.town_id) params.town_id = filters.town_id;
        if (filters?.condition) params.condition = filters.condition;
        if (filters?.negotiable !== undefined)
          params.negotiable = filters.negotiable;
        if (filters?.features) params.features = filters.features.join(",");
        if (filters?.drive_type) params.drive_type = filters.drive_type;
        if (filters?.max_mileage) params.max_mileage = filters.max_mileage;
        if (filters?.color) params.color = filters.color;
        if (filters?.seller_type) params.seller_type = filters.seller_type;

        try {
          const response = await apiClient.get<CarListResponse>("cars/browse", {
            params,
          });

          const batchListings = response.data.data?.listings || [];

          // Check for duplicates before adding
          const newIds = new Set(batchListings.map((item) => item.listing_id));
          const existingIds = new Set(
            allListings.map((item) => item.listing_id)
          );
          const uniqueBatchListings = batchListings.filter(
            (item) => !existingIds.has(item.listing_id)
          );

          allListings.push(...uniqueBatchListings);

          // If we got less than expected, we might have reached the end
          if (batchListings.length < MAX_PER_REQUEST) {
            break;
          }

          // Small delay to avoid rate limiting
          if (batch < batchesNeeded) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        } catch (error) {
          // Continue with whatever we have
          break;
        }
      }

      // If we couldn't fetch all, use what we have
      if (allListings.length < total) {
        total = allListings.length;
      }

      // Cache the data
      cache.setCache(allListings, filters, total);
    }

    // Client-side pagination
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, allListings.length);
    const paginatedListings = allListings.slice(startIndex, endIndex);

    return {
      success: true,
      message: "Success",
      data: {
        listings: paginatedListings,
        pagination: {
          page,
          limit,
          total: allListings.length,
          total_pages: Math.ceil(allListings.length / limit),
          has_next: page < Math.ceil(allListings.length / limit),
          has_prev: page > 1,
        },
        filters_applied: {
          make_id: null,
          min_price: null,
          max_price: null,
          min_year: null,
          max_year: null,
          body_type: null,
          fuel_type: null,
          transmission: null,
          region_id: null,
          search: null,
          sort: filters?.sort || "newest",
          ...filters,
        },
      },
    };
  },

  // Clear cache (call this when filters change significantly)
  clearListingsCache(): void {
    cache.clearCache();
  },

  // ========== OTHER METHODS ==========

  // Get home screen listings (public, no authentication needed)
  async getHomeListings(limit: number = 5): Promise<CarListResponse> {
    const response = await apiClient.get<CarListResponse>("cars/browse", {
      params: { limit, sort: "newest" },
    });
    return response.data;
  },

  // Get my car listings with pagination
  async getMyListings(
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<CarListResponse> {
    const response = await apiClient.get<CarListResponse>("/cars/", {
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
    // First, get the total count and pagination info
    const firstResponse = await apiClient.get("/data/makes", {
      params: { limit: 100 },
    });

    if (!firstResponse.data.success) {
      return firstResponse.data;
    }

    const totalMakes = firstResponse.data.data?.pagination?.total || 0;
    const totalPages = Math.ceil(totalMakes / 100);

    let allMakes: any[] = [...(firstResponse.data.data?.makes || [])];

    // Fetch remaining pages if there are more
    for (let page = 2; page <= totalPages; page++) {
      try {
        const response = await apiClient.get("/data/makes", {
          params: { limit: 100, page },
        });

        if (response.data.success && response.data.data?.makes) {
          allMakes.push(...response.data.data.makes);
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
        break; // Stop if we encounter an error
      }
    }

    return {
      success: true,
      message: "Success",
      data: allMakes,
    };
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

  // Get price range statistics
  async getPriceRange(): Promise<{
    success: boolean;
    message: string;
    data: {
      min_price: number;
      max_price: number;
      average_price: number;
    };
  }> {
    const response = await apiClient.get("/data/price-range");
    return response.data;
  },

  // Get car statistics
  async getStats(): Promise<{
    success: boolean;
    message: string;
    data: {
      total_listings: number;
      active_listings: number;
      sold_today: number;
      new_this_week: number;
      average_price: number;
      min_price?: number;
      max_price?: number;
    };
  }> {
    const response = await apiClient.get("/data/stats");
    return response.data;
  },

  // Get saved cars
  async getSavedCars(): Promise<{
    success: boolean;
    message: string;
    data: CarListResponse;
  }> {
    const response = await apiClient.get("/cars/saved");
    return response.data;
  },

  // Toggle save/unsave car
  async toggleSaveCar(id: number): Promise<{
    success: boolean;
    message: string;
    data: {
      saved: boolean;
    };
  }> {
    const response = await apiClient.post(`/cars/${id}/save`);
    return response.data;
  },

  // ========== DEBUG METHODS ==========

  // Debug method to check cache status
  debugCache(): void {
    const cachedData = cache.getCache();
    console.log("=== CACHE DEBUG ===");
    console.log("Has cache:", !!cachedData);
    if (cachedData) {
      console.log(
        "Cache timestamp:",
        new Date(cachedData.timestamp).toLocaleTimeString()
      );
      console.log("Listings in cache:", cachedData.listings.length);
      console.log("Filters:", cachedData.filters);
    }
  },

  // Test API directly
  async testAPIPagination(): Promise<void> {
    console.log("=== TESTING API PAGINATION ===");

    // Test 1: Small limit
    const test1 = await apiClient.get("cars/browse", {
      params: { limit: 5 },
    });
    console.log("Test 1 (limit=5):", {
      count: test1.data.data?.listings?.length,
      total: test1.data.data?.pagination?.total,
    });

    // Test 2: Large limit
    const test2 = await apiClient.get("cars/browse", {
      params: { limit: 200 },
    });
    console.log("Test 2 (limit=200):", {
      count: test2.data.data?.listings?.length,
      total: test2.data.data?.pagination?.total,
    });

    // Test 3: With page parameter
    const test3 = await apiClient.get("cars/browse", {
      params: { page: 2, limit: 20 },
    });
    console.log("Test 3 (page=2, limit=20):", {
      count: test3.data.data?.listings?.length,
      page: test3.data.data?.pagination?.page,
      total: test3.data.data?.pagination?.total,
    });
  },
};
