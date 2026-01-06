// hooks/car.hook.ts
import { apiClient } from "@/src/api/apiClient";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React, { useEffect } from "react";
import { carService } from "./car.service";
import {
  CarFilters,
  CarListing,
  CreateCarRequest,
  UpdateCarRequest,
} from "./car.types";

// ========== INTERFACES ==========
export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface CarListResponse {
  success: boolean;
  message: string;
  data: {
    listings: CarListing[];
    pagination: PaginationResponse;
    filters_applied: {
      make_id: string | null;
      min_price: number | null;
      max_price: number | null;
      min_year: number | null;
      max_year: number | null;
      body_type: string | null;
      fuel_type: string | null;
      transmission: string | null;
      region_id: string | null;
      search: string | null;
      sort: string;
    };
  };
}

export interface Filters {
  search?: string;
  make?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  region?: string;
  sort?:
    | "newest"
    | "oldest"
    | "price_low"
    | "price_high"
    | "mileage_low"
    | "mileage_high"
    | "views_high";
}

// ========== QUERY KEYS ==========
export const carKeys = {
  all: ["cars"] as const,
  lists: () => [...carKeys.all, "list"] as const,
  list: (filters: any) => [...carKeys.lists(), filters] as const,
  details: () => [...carKeys.all, "detail"] as const,
  detail: (id: number) => [...carKeys.details(), id] as const,
  makes: () => [...carKeys.all, "makes"] as const,
  models: () => [...carKeys.all, "models"] as const,
  features: () => [...carKeys.all, "features"] as const,
  locations: () => [...carKeys.all, "locations"] as const,
  infinite: (filters: any) => [...carKeys.all, "infinite", filters] as const,
  stats: () => [...carKeys.all, "stats"] as const,
  saved: () => [...carKeys.all, "saved"] as const,
  priceRange: () => [...carKeys.all, "price-range"] as const,
};

// ========== INFINITE QUERY HOOKS ==========

// infinite query hook
// hooks/car.hook.ts - Update the infinite query hook
export const useInfiniteCarListings = (
  limit: number = 20,
  filters?: CarFilters
) => {
  const queryClient = useQueryClient();

  // Clear cache when filters change significantly
  useEffect(() => {
    carService.clearListingsCache();
    queryClient.invalidateQueries({
      queryKey: carKeys.infinite({ limit, ...filters }),
    });
  }, [filters, limit, queryClient]);

  return useInfiniteQuery({
    queryKey: carKeys.infinite({ limit, ...filters }),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await carService.getAllListings(
        pageParam,
        limit,
        filters
      );

      return response;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.success || !lastPage?.data?.pagination) {
        return undefined;
      }

      const pagination = lastPage.data.pagination as any;

      // Normalize pagination fields from various API shapes
      const currentPage = Number(pagination.page) || 1;
      const perPage =
        Number(pagination.limit) || Number(pagination.per_page) || 20;
      const total = Number(pagination.total) || 0;
      const totalPages =
        Number(pagination.total_pages) ||
        (perPage > 0 ? Math.ceil(total / perPage) : undefined);
      const hasNextFlag = pagination.has_next;

      // Prefer explicit has_next when provided
      if (typeof hasNextFlag === "boolean") {
        if (hasNextFlag) return currentPage + 1;
        return undefined;
      }

      // Fallback to comparing page vs totalPages
      if (typeof totalPages === "number" && currentPage < totalPages) {
        return currentPage + 1;
      }

      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Don't refetch on window focus to prevent cache issues
    refetchOnWindowFocus: false,
    // Keep previous data while fetching
    placeholderData: keepPreviousData,
  });
};

// search infinite query hook
export const useSearchCarListings = (
  searchTerm: string,
  limit: number = 20,
  filters?: Filters
) => {
  return useInfiniteQuery({
    queryKey: carKeys.infinite({ searchTerm, limit, ...filters }),
    queryFn: async ({ pageParam = 1, signal }) => {
      const response = await apiClient.get<CarListResponse>("cars/browse", {
        params: {
          page: pageParam,
          limit,
          search: searchTerm,
          ...filters,
          sort: filters?.sort || "newest",
        },
        signal,
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.data.pagination.page;
      const totalPages = lastPage.data.pagination.total_pages;

      if (currentPage < totalPages) {
        return currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: searchTerm.length > 0,
    staleTime: 3 * 60 * 1000, // 3 minutes for search results
    placeholderData: keepPreviousData,
  });
};

// ========== QUERY HOOKS ==========
export const useAllCarListings = (
  page: number = 1,
  limit: number = 20,
  filters?: {
    search?: string;
    make?: string;
    maxPrice?: number;
    minYear?: number;
    location?: string;
  }
) => {
  return useQuery({
    queryKey: carKeys.list({ page, limit, ...filters }),
    queryFn: () => carService.getAllListings(page, limit, filters),
    placeholderData: keepPreviousData,
    retry: 2,
  });
};

export const useHomeListings = (limit: number = 5) => {
  return useQuery({
    queryKey: carKeys.list({ limit, type: "home" }),
    queryFn: () => carService.getHomeListings(limit),
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useCarListings = (
  page: number = 1,
  limit: number = 20,
  status?: string
) => {
  return useQuery({
    queryKey: carKeys.list({ page, limit, status, type: "user" }),
    queryFn: () => carService.getMyListings(page, limit, status),
    placeholderData: keepPreviousData,
    retry: false, // Don't retry user listings - show error immediately
  });
};

export const useCarDetail = (id: number) => {
  return useQuery({
    queryKey: carKeys.detail(id),
    queryFn: () => carService.getCarDetail(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) =>
      error?.status !== 404 && failureCount < 2,
  });
};

export const useCarMakes = () => {
  return useQuery({
    queryKey: carKeys.makes(),
    queryFn: () => carService.getMakes(),
    staleTime: 30 * 60 * 1000, // 30 minutes - rarely changes
    retry: 2,
  });
};

export const useCarModels = (makeId: number) => {
  return useQuery({
    queryKey: [...carKeys.models(), makeId],
    queryFn: () => carService.getModels(makeId),
    enabled: !!makeId,
    staleTime: 30 * 60 * 1000,
  });
};

export const useCarFeatures = (category?: string) => {
  return useQuery({
    queryKey: [...carKeys.features(), category],
    queryFn: () => carService.getFeatures(category),
    staleTime: 60 * 60 * 1000, // 1 hour - rarely changes
  });
};

export const useCarLocations = (regionId?: number, zoneId?: number) => {
  return useQuery({
    queryKey: [...carKeys.locations(), { regionId, zoneId }],
    queryFn: () => carService.getLocations(regionId, zoneId),
    staleTime: 30 * 60 * 1000,
  });
};

export const useCarStats = () => {
  return useQuery({
    queryKey: carKeys.stats(),
    queryFn: () => carService.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCarPriceRange = () => {
  return useQuery({
    queryKey: carKeys.priceRange(),
    queryFn: () => carService.getPriceRange(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useSavedCars = () => {
  return useQuery({
    queryKey: carKeys.saved(),
    queryFn: () => carService.getSavedCars(),
    retry: 1,
  });
};

// ========== MUTATION HOOKS ==========
export const useCreateCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCarRequest) => carService.createCar(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: carKeys.lists() });
        queryClient.invalidateQueries({ queryKey: carKeys.stats() });

        // Invalidate user's listings specifically
        queryClient.invalidateQueries({
          queryKey: carKeys.list({ type: "user" }),
        });
      }
    },
    onError: (error) => {
      console.error("Create car error:", error);
    },
  });
};

export const useUpdateCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCarRequest }) =>
      carService.updateCar(id, data),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        // Update cache for the specific car
        queryClient.setQueryData(carKeys.detail(variables.id), response);

        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: carKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: carKeys.list({ type: "user" }),
        });

        // Update infinite queries if needed
        queryClient.invalidateQueries({ queryKey: carKeys.all });
      }
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: carKeys.detail(variables.id),
      });

      // Snapshot previous value
      const previousCar = queryClient.getQueryData(
        carKeys.detail(variables.id)
      );

      // Optimistically update the car
      queryClient.setQueryData(carKeys.detail(variables.id), (old: any) => ({
        ...old,
        data: { ...old?.data, ...variables.data },
      }));

      return { previousCar };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCar) {
        queryClient.setQueryData(
          carKeys.detail(variables.id),
          context.previousCar
        );
      }
    },
  });
};

export const useDeleteCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => carService.deleteCar(id),
    onSuccess: (response, id) => {
      if (response.success) {
        // Remove from cache
        queryClient.removeQueries({ queryKey: carKeys.detail(id) });
        queryClient.invalidateQueries({ queryKey: carKeys.lists() });
        queryClient.invalidateQueries({ queryKey: carKeys.stats() });

        // Invalidate user's listings
        queryClient.invalidateQueries({
          queryKey: carKeys.list({ type: "user" }),
        });
      }
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: carKeys.lists() });
      await queryClient.cancelQueries({ queryKey: carKeys.detail(id) });

      // Snapshot previous values
      const previousListings = queryClient.getQueryData(carKeys.lists());
      const previousUserListings = queryClient.getQueryData(
        carKeys.list({ type: "user" })
      );
      const previousCar = queryClient.getQueryData(carKeys.detail(id));

      // Optimistically remove from lists
      queryClient.setQueryData(carKeys.lists(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            listings: old.data.listings?.filter(
              (car: CarListing) => car.listing_id !== id
            ),
          },
        };
      });

      // Optimistically remove from user listings
      queryClient.setQueryData(carKeys.list({ type: "user" }), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            listings: old.data.listings?.filter(
              (car: CarListing) => car.listing_id !== id
            ),
          },
        };
      });

      // Remove car detail
      queryClient.removeQueries({ queryKey: carKeys.detail(id) });

      return { previousListings, previousUserListings, previousCar };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousListings) {
        queryClient.setQueryData(carKeys.lists(), context.previousListings);
      }
      if (context?.previousUserListings) {
        queryClient.setQueryData(
          carKeys.list({ type: "user" }),
          context.previousUserListings
        );
      }
      if (context?.previousCar) {
        queryClient.setQueryData(carKeys.detail(id), context.previousCar);
      }
    },
  });
};

export const useToggleSaveCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => carService.toggleSaveCar(id),
    onSuccess: (response, id) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: carKeys.saved() });
        queryClient.invalidateQueries({ queryKey: carKeys.detail(id) });
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: carKeys.saved() });

      const previousSaved = queryClient.getQueryData(carKeys.saved());

      return { previousSaved };
    },
    onError: (err, id, context) => {
      if (context?.previousSaved) {
        queryClient.setQueryData(carKeys.saved(), context.previousSaved);
      }
    },
  });
};

// ========== UTILITY HOOKS ==========
export const usePrefetchCarListings = () => {
  const queryClient = useQueryClient();

  return (filters: Filters, currentPage: number) => {
    queryClient.prefetchQuery({
      queryKey: carKeys.list({ ...filters, page: currentPage + 1 }),
      queryFn: () => carService.getAllListings(currentPage + 1, 20, filters),
    });
  };
};

export const useClearCarCache = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.removeQueries({ queryKey: carKeys.all });
  };
};

// ========== HOOK COMPOSITION ==========
export const useCarListingsWithStats = (
  limit: number = 20,
  filters?: Filters
) => {
  const listings = useInfiniteCarListings(limit, filters);
  const stats = useCarStats();

  return {
    ...listings,
    stats: stats.data,
    isStatsLoading: stats.isLoading,
    statsError: stats.error,
  };
};

export const useCarDetailWithRelated = (id: number) => {
  const carDetail = useCarDetail(id);
  const [makeId, setMakeId] = React.useState<number | undefined>();

  React.useEffect(() => {
    if (carDetail.data?.data?.make) {
      // Extract make ID from car data if available
      // This would need adjustment based on your actual data structure
    }
  }, [carDetail.data]);

  const relatedCars = useInfiniteCarListings(4, {
    make: carDetail.data?.data?.make,
    sort: "newest",
  });

  return {
    car: carDetail.data,
    isLoading: carDetail.isLoading,
    error: carDetail.error,
    relatedCars: relatedCars.data?.pages[0]?.data.listings || [],
    isRelatedLoading: relatedCars.isLoading,
    refetchCar: carDetail.refetch,
    refetchRelated: relatedCars.refetch,
  };
};
