import { create } from "zustand";
import { carService } from "./car.service";
import {
  CarListing,
  CarDetail,
  CreateCarRequest,
  UpdateCarRequest,
  Make,
  Model,
  Feature,
  Location,
} from "./car.types";

interface CarState {
  // State
  listings: CarListing[];
  currentCar: CarDetail | null;
  makes: Make[];
  models: Model[];
  features: Feature[];
  locations: Location[];

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;

  // Errors
  error: string | null;

  // Actions
  loadListings: (page?: number, status?: string) => Promise<void>;
  loadCarDetail: (id: number) => Promise<void>;
  createListing: (data: CreateCarRequest) => Promise<boolean>;
  updateListing: (id: number, data: UpdateCarRequest) => Promise<boolean>;
  deleteListing: (id: number) => Promise<boolean>;
  loadMakes: () => Promise<void>;
  loadModels: (makeId: number) => Promise<void>;
  loadFeatures: () => Promise<void>;
  loadLocations: (regionId?: number, zoneId?: number) => Promise<void>;
  clearError: () => void;
  clearCurrentCar: () => void;
}

export const useCarStore = create<CarState>((set, get) => ({
  // Initial state
  listings: [],
  currentCar: null,
  makes: [],
  models: [],
  features: [],
  locations: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  currentPage: 1,
  totalPages: 0,
  totalItems: 0,
  error: null,

  // Load user's car listings
  loadListings: async (page = 1, status?: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await carService.getMyListings(page, 20, status);

      if (response.success) {
        set({
          listings: response.data.listings,
          currentPage: page,
          totalPages: response.data.pagination.total_pages,
          totalItems: response.data.pagination.total,
          isLoading: false,
        });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Load single car details
  loadCarDetail: async (id: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await carService.getCarDetail(id);

      if (response.success) {
        set({ currentCar: response.data, isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Create new car listing
  createListing: async (data: CreateCarRequest) => {
    set({ isCreating: true, error: null });

    try {
      const response = await carService.createCar(data);

      if (response.success) {
        // Refresh listings
        await get().loadListings();
        set({ isCreating: false });
        return true;
      } else {
        set({ error: response.message, isCreating: false });
        return false;
      }
    } catch (error: any) {
      set({ error: error.message, isCreating: false });
      return false;
    }
  },

  // Update existing listing
  updateListing: async (id: number, data: UpdateCarRequest) => {
    set({ isUpdating: true, error: null });

    try {
      const response = await carService.updateCar(id, data);

      if (response.success) {
        // Refresh current car and listings
        await get().loadCarDetail(id);
        await get().loadListings();
        set({ isUpdating: false });
        return true;
      } else {
        set({ error: response.message, isUpdating: false });
        return false;
      }
    } catch (error: any) {
      set({ error: error.message, isUpdating: false });
      return false;
    }
  },

  // Delete listing
  deleteListing: async (id: number) => {
    set({ isDeleting: true, error: null });

    try {
      const response = await carService.deleteCar(id);

      if (response.success) {
        // Remove from local state
        set((state) => ({
          listings: state.listings.filter((car) => car.listing_id !== id),
          isDeleting: false,
        }));
        return true;
      } else {
        set({ error: response.message, isDeleting: false });
        return false;
      }
    } catch (error: any) {
      set({ error: error.message, isDeleting: false });
      return false;
    }
  },

  // Load car makes
  loadMakes: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await carService.getMakes();

      if (response.success) {
        set({ makes: response.data, isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Load models for a make
  loadModels: async (makeId: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await carService.getModels(makeId);

      if (response.success) {
        set({ models: response.data.models, isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Load features
  loadFeatures: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await carService.getFeatures();

      if (response.success) {
        set({ features: response.data.features, isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Load locations
  loadLocations: async (regionId?: number, zoneId?: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await carService.getLocations(regionId, zoneId);

      if (response.success) {
        set({ locations: response.data, isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Clear current car
  clearCurrentCar: () => set({ currentCar: null }),
}));
