// hooks/car.hook.ts
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { carService } from "./car.service";
import { CarListing, CreateCarRequest, UpdateCarRequest } from "./car.types";

// Query keys
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
};

// Hook to get all car listings (for home screen)
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
  });
};

// Hook to get user's car listings
export const useCarListings = (
  page: number = 1,
  limit: number = 20,
  status?: string
) => {
  return useQuery({
    queryKey: carKeys.list({ page, limit, status }),
    queryFn: () => carService.getMyListings(page, limit, status),
    placeholderData: keepPreviousData,
  });
};

// Hook to get single car details
export const useCarDetail = (id: number) => {
  return useQuery({
    queryKey: carKeys.detail(id),
    queryFn: () => carService.getCarDetail(id),
    enabled: !!id, // Only run query if id exists
  });
};

// Hook to get car makes
export const useCarMakes = () => {
  return useQuery({
    queryKey: carKeys.makes(),
    queryFn: () => carService.getMakes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get models for a specific make
export const useCarModels = (makeId: number) => {
  return useQuery({
    queryKey: [...carKeys.models(), makeId],
    queryFn: () => carService.getModels(makeId),
    enabled: !!makeId, // Only run query if makeId exists
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to get features
export const useCarFeatures = (category?: string) => {
  return useQuery({
    queryKey: [...carKeys.features(), category],
    queryFn: () => carService.getFeatures(category),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to get locations
export const useCarLocations = (regionId?: number, zoneId?: number) => {
  return useQuery({
    queryKey: [...carKeys.locations(), { regionId, zoneId }],
    queryFn: () => carService.getLocations(regionId, zoneId),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to create a new car listing
export const useCreateCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCarRequest) => carService.createCar(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: carKeys.lists() });
    },
  });
};

// Hook to update a car listing
export const useUpdateCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCarRequest }) =>
      carService.updateCar(id, data),
    onSuccess: (response, variables) => {
      // Invalidate both list and specific detail
      queryClient.invalidateQueries({ queryKey: carKeys.lists() });
      queryClient.invalidateQueries({ queryKey: carKeys.detail(variables.id) });

      // Update cache immediately
      if (response.success && response.data) {
        queryClient.setQueryData(carKeys.detail(variables.id), response);
      }
    },
  });
};

// Hook to delete a car listing
export const useDeleteCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => carService.deleteCar(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.invalidateQueries({ queryKey: carKeys.lists() });
      queryClient.removeQueries({ queryKey: carKeys.detail(id) });
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: carKeys.lists() });

      // Snapshot previous value
      const previousListings = queryClient.getQueryData(carKeys.lists());

      // Optimistically update
      queryClient.setQueryData(carKeys.lists(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            listings: old.data.listings.filter(
              (car: CarListing) => car.listing_id !== id
            ),
          },
        };
      });

      return { previousListings };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousListings) {
        queryClient.setQueryData(carKeys.lists(), context.previousListings);
      }
    },
  });
};
