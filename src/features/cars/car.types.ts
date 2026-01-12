// car.types.ts
// Car API Types based on EthioCars documentation

// ========== CORE LISTING INTERFACES ==========
export interface CarListing {
  listing_id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  negotiable: boolean;
  mileage: number;
  fuel_type:
    | "Gasoline"
    | "Diesel"
    | "Electric"
    | "Hybrid"
    | "Plug-in Hybrid"
    | "Hydrogen"
    | "Natural Gas"
    | "Flex Fuel";
  transmission:
    | "Automatic"
    | "Manual"
    | "CVT"
    | "Semi-Automatic"
    | "Dual-Clutch";
  body_type:
    | "Sedan"
    | "SUV"
    | "Truck"
    | "Coupe"
    | "Hatchback"
    | "Van"
    | "Convertible"
    | "Wagon"
    | "Minivan"
    | "Crossover";
  drive_type?: "FWD" | "RWD" | "AWD" | "4WD";
  condition: "New" | "Like New" | "Excellent" | "Good" | "Fair" | "Poor";
  exterior_color?: string;
  interior_color?: string;
  doors?: number;
  seats?: number;
  vin?: string;
  description?: string;
  status:
    | "Active"
    | "Pending"
    | "Sold"
    | "Expired"
    | "Draft"
    | "Suspended"
    | "Deleted";
  views: number;
  region?: string;
  primary_image?: string;
  thumbnail?: string;
  created_at: string;
  updated_at?: string;

  // Seller info from your API response
  seller?: {
    user_id: string;
    username: string;
    is_dealer: boolean;
    company_name?: string;
  };
}

export interface CarDetail extends CarListing {
  make_id: number;
  model_id: number;

  location: {
    region_id?: number;
    region?: string;
    zone_id?: number;
    zone?: string;
    town_id?: number;
    town?: string;
  };

  images: Array<{
    image_id: number;
    url: string;
    thumbnail: string;
    type: "exterior" | "interior" | "damage" | "document" | "other";
    is_primary: boolean;
    created_at?: string;
  }>;

  features: Array<{
    feature_id: number;
    name: string;
    category: string;
    importance?: "Basic" | "Common" | "Premium";
  }>;

  // Extended seller info for detail view
  seller_detail?: {
    user_id: string;
    username: string;
    email?: string;
    phone?: string;
    is_dealer: boolean;
    company_name?: string;
    company_address?: string;
    company_phone?: string;
    company_email?: string;
    verification_status?: "verified" | "pending" | "unverified";
    member_since?: string;
    total_listings?: number;
    response_rate?: number;
    response_time?: string;
  };

  // Additional metadata
  is_saved?: boolean;
  similar_listings_count?: number;
  last_price_change?: string;
}

// ========== REQUEST/PAYLOAD INTERFACES ==========
export interface CreateCarRequest {
  make_id: number;
  model_id: string | number; // Accept both string and number for flexibility
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  body_type?: string;
  drive_type?: string;
  condition: string;
  negotiable?: boolean;
  exterior_color?: string;
  interior_color?: string;
  doors?: number;
  seats?: number;
  vin?: string;
  description?: string;
  region_id?: number;
  zone_id?: number;
  town_id?: number;
  features?: number[];
  images?: Array<{
    data: string;
    type?: "exterior" | "interior" | "damage" | "document" | "other";
    is_primary?: boolean;
  }>;
}

export interface UpdateCarRequest {
  price?: number;
  negotiable?: boolean;
  mileage?: number;
  description?: string;
  status?: string;
  features?: number[];
  region_id?: number;
  zone_id?: number;
  town_id?: number;
  add_images?: Array<{
    data: string;
    type?: string;
    is_primary?: boolean;
  }>;
  delete_images?: number[];
  make_id?: number;
  model_id?: number;
  year?: number;
  fuel_type?: string;
  transmission?: string;
  body_type?: string;
  drive_type?: string;
  condition?: string;
  exterior_color?: string;
  interior_color?: string;
  doors?: number;
  seats?: number;
  vin?: string;
}

// ========== DATA MODELS INTERFACES ==========
export interface Make {
  make_id: number;
  name: string;
  logo_url?: string;
  country_of_origin?: string;
  popular_models?: string[];
  is_popular?: boolean;
}

export interface Model {
  model_id: number;
  make_id: number;
  name: string;
  body_type?: string;
  years_available?: number[];
  is_popular?: boolean;
}

export interface Feature {
  feature_id: number;
  name: string;
  category: string;
  importance: "Basic" | "Common" | "Premium";
  icon?: string;
  description?: string;
}

export interface Location {
  region_id: number;
  name: string;
  zones?: Zone[];
}

export interface Zone {
  zone_id: number;
  region_id: number;
  name: string;
  towns?: Town[];
}

export interface Town {
  town_id: number;
  zone_id: number;
  name: string;
}

export interface FilterOptions {
  makes: Make[];
  price_range: {
    min: number;
    max: number;
  };
  year_range: {
    min: number;
    max: number;
  };
  body_types: string[];
  fuel_types: string[];
  transmissions: string[];
  regions: Location[];
  features: Feature[];
}

// ========== RESPONSE INTERFACES ==========
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface CarListResponse {
  success: boolean;
  message: string;
  data: {
    listings: CarListing[];
    pagination: Pagination;
    filters_applied: {
      make_id?: number | null;
      min_price?: number | null;
      max_price?: number | null;
      min_year?: number | null;
      max_year?: number | null;
      body_type?: string | null;
      fuel_type?: string | null;
      transmission?: string | null;
      region_id?: number | null;
      search?: string | null;
      sort?: string;
    };
    filter_options?: FilterOptions;
  };
}

export interface CarDetailResponse {
  success: boolean;
  message: string;
  data: CarDetail;
}

export interface MakeResponse {
  success: boolean;
  message: string;
  data: Make[];
}

export interface ModelResponse {
  success: boolean;
  message: string;
  data: Model[];
}

export interface FeatureResponse {
  success: boolean;
  message: string;
  data: Feature[];
}

export interface LocationResponse {
  success: boolean;
  message: string;
  data: {
    regions: Location[];
    zones?: Zone[];
    towns?: Town[];
  };
}

export interface CreateCarResponse {
  success: boolean;
  message: string;
  data: {
    listing_id: number;
    created_at: string;
    images_uploaded: number;
  };
}

export interface UpdateCarResponse {
  success: boolean;
  message: string;
  data: {
    listing_id: number;
    updated_at: string;
    changes: string[];
  };
}

export interface DeleteCarResponse {
  success: boolean;
  message: string;
  data: {
    listing_id: number;
    deleted_at: string;
  };
}

export interface SaveCarResponse {
  success: boolean;
  message: string;
  data: {
    is_saved: boolean;
    saved_count: number;
  };
}

// ========== STATISTICS & ANALYTICS ==========
export interface CarStats {
  total_listings: number;
  active_listings: number;
  average_price: number;
  price_range: {
    min: number;
    max: number;
    average: number;
  };
  popular_makes: Array<{
    make: string;
    count: number;
    percentage: number;
  }>;
  popular_regions: Array<{
    region: string;
    count: number;
    percentage: number;
  }>;
  listings_by_condition: Record<string, number>;
  listings_by_fuel_type: Record<string, number>;
  monthly_trend?: Array<{
    month: string;
    listings: number;
    average_price: number;
  }>;
}

export interface UserCarStats {
  total_listings: number;
  active_listings: number;
  sold_listings: number;
  draft_listings: number;
  expired_listings: number;
  total_views: number;
  average_price: number;
  listings_by_status: Record<string, number>;
  recent_activity: Array<{
    date: string;
    action: string;
    listing_id: number;
    title: string;
  }>;
}

// ========== FILTER & SEARCH TYPES ==========
export interface CarFilters {
  search?: string;
  make?: string;
  make_id?: number;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  region?: string;
  region_id?: number;
  zone_id?: number;
  town_id?: number;
  condition?: string;
  negotiable?: boolean;
  sort?:
    | "newest"
    | "oldest"
    | "price_low"
    | "price_high"
    | "mileage_low"
    | "mileage_high"
    | "views_high";
  limit?: number;
  page?: number;
  features?: number[];
  drive_type?: string;
  max_mileage?: number;
  color?: string;
  seller_type?: "dealer" | "private";
}

export interface SearchSuggestion {
  type: "make" | "model" | "feature" | "location";
  value: string;
  count: number;
  id?: number;
}

export interface SearchResponse {
  success: boolean;
  message: string;
  data: {
    results: CarListing[];
    suggestions: SearchSuggestion[];
    search_term: string;
    total_results: number;
  };
}

// ========== SELLER & USER TYPES ==========
export interface SellerProfile {
  user_id: string;
  username: string;
  email: string;
  phone?: string;
  is_dealer: boolean;
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  verification_status: "verified" | "pending" | "unverified";
  member_since: string;
  total_listings: number;
  active_listings: number;
  sold_listings: number;
  response_rate: number;
  average_response_time: string;
  rating?: number;
  reviews_count?: number;
  profile_image?: string;
  website?: string;
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface SellerListingsResponse {
  success: boolean;
  message: string;
  data: {
    seller: SellerProfile;
    listings: CarListing[];
    pagination: Pagination;
  };
}

// ========== IMAGE & MEDIA TYPES ==========
export interface CarImage {
  image_id: number;
  listing_id: number;
  url: string;
  thumbnail: string;
  type: "exterior" | "interior" | "damage" | "document" | "other";
  is_primary: boolean;
  order: number;
  created_at: string;
  metadata?: {
    width: number;
    height: number;
    size: number;
    format: string;
  };
}

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  data: {
    uploaded_images: CarImage[];
    failed_uploads: Array<{
      filename: string;
      error: string;
    }>;
  };
}

// ========== SAVED & FAVORITE TYPES ==========
export interface SavedCar {
  saved_id: number;
  listing_id: number;
  user_id: string;
  created_at: string;
  listing: CarListing;
}

export interface SavedCarsResponse {
  success: boolean;
  message: string;
  data: {
    saved_cars: SavedCar[];
    pagination: Pagination;
    total_saved: number;
  };
}

// ========== PRICE & MARKET TYPES ==========
export interface PriceEstimate {
  listing_id: number;
  estimated_price: number;
  market_average: number;
  price_difference: number;
  price_difference_percent: number;
  factors: Array<{
    factor: string;
    impact: "positive" | "negative" | "neutral";
    value: string;
  }>;
  confidence_score: number;
  recommendation: "good_price" | "fair_price" | "high_price" | "low_price";
}

export interface MarketTrend {
  period: string;
  average_price: number;
  listings_count: number;
  price_change: number;
  popular_makes: Array<{
    make: string;
    average_price: number;
    count: number;
  }>;
}

export interface PriceRange {
  min_price: number;
  max_price: number;
  average_price: number;
  median_price: number;
}

// ========== VIEW & ANALYTICS TYPES ==========
export interface ListingView {
  view_id: number;
  listing_id: number;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  viewed_at: string;
  duration_seconds?: number;
  source?: "search" | "direct" | "recommendation" | "saved";
}

export interface ListingAnalytics {
  listing_id: number;
  total_views: number;
  unique_views: number;
  average_view_duration: number;
  views_by_day: Record<string, number>;
  views_by_source: Record<string, number>;
  saved_count: number;
  contact_clicks: number;
  last_updated: string;
}

// ========== COMPARISON TYPES ==========
export interface CarComparison {
  comparison_id?: string;
  cars: CarDetail[];
  comparison_points: Array<{
    attribute: string;
    values: Record<number, any>;
    winner?: number;
    notes?: string;
  }>;
  summary: {
    best_value: number;
    best_performance: number;
    best_features: number;
    best_overall: number;
  };
  created_at?: string;
}

// ========== UTILITY TYPES ==========
export type CarStatus =
  | "Active"
  | "Pending"
  | "Sold"
  | "Expired"
  | "Draft"
  | "Suspended"
  | "Deleted";
export type FuelType =
  | "Gasoline"
  | "Diesel"
  | "Electric"
  | "Hybrid"
  | "Plug-in Hybrid"
  | "Hydrogen"
  | "Natural Gas"
  | "Flex Fuel";
export type Transmission =
  | "Automatic"
  | "Manual"
  | "CVT"
  | "Semi-Automatic"
  | "Dual-Clutch";
export type BodyType =
  | "Sedan"
  | "SUV"
  | "Truck"
  | "Coupe"
  | "Hatchback"
  | "Van"
  | "Convertible"
  | "Wagon"
  | "Minivan"
  | "Crossover";
export type Condition =
  | "New"
  | "Like New"
  | "Excellent"
  | "Good"
  | "Fair"
  | "Poor";
export type DriveType = "FWD" | "RWD" | "AWD" | "4WD";

// ========== TYPE GUARDS ==========
export const isCarListing = (obj: any): obj is CarListing => {
  return (
    obj && typeof obj.listing_id === "number" && typeof obj.make === "string"
  );
};

export const isCarDetail = (obj: any): obj is CarDetail => {
  return isCarListing(obj) && "images" in obj && Array.isArray(obj.images);
};

export const isMake = (obj: any): obj is Make => {
  return obj && typeof obj.make_id === "number" && typeof obj.name === "string";
};

// ========== HELPER FUNCTIONS ==========
export const formatPrice = (price: number): string => {
  return `ETB ${price.toLocaleString("en-US")}`;
};

export const formatMileage = (mileage: number): string => {
  return `${mileage.toLocaleString("en-US")} km`;
};

export const getCarTitle = (car: CarListing | CarDetail): string => {
  return `${car.year} ${car.make} ${car.model}`;
};

export const getPricePerKm = (price: number, mileage: number): number => {
  if (mileage === 0) return 0;
  return price / mileage;
};

export const getCarAge = (year: number): number => {
  return new Date().getFullYear() - year;
};

export const isGoodDeal = (car: CarListing, marketAverage: number): boolean => {
  if (!marketAverage) return false;
  const difference = marketAverage - car.price;
  const percentDifference = (difference / marketAverage) * 100;
  return percentDifference > 5; // 5% below market average
};

// ========== ENUM CONSTANTS ==========
export const FUEL_TYPES: FuelType[] = [
  "Gasoline",
  "Diesel",
  "Electric",
  "Hybrid",
  "Plug-in Hybrid",
  "Hydrogen",
  "Natural Gas",
  "Flex Fuel",
];

export const TRANSMISSIONS: Transmission[] = [
  "Automatic",
  "Manual",
  "CVT",
  "Semi-Automatic",
  "Dual-Clutch",
];

export const BODY_TYPES: BodyType[] = [
  "Sedan",
  "SUV",
  "Truck",
  "Coupe",
  "Hatchback",
  "Van",
  "Convertible",
  "Wagon",
  "Minivan",
  "Crossover",
];

export const CONDITIONS: Condition[] = [
  "New",
  "Like New",
  "Excellent",
  "Good",
  "Fair",
  "Poor",
];

export const DRIVE_TYPES: DriveType[] = ["FWD", "RWD", "AWD", "4WD"];

export const CAR_STATUSES: CarStatus[] = [
  "Active",
  "Pending",
  "Sold",
  "Expired",
  "Draft",
  "Suspended",
  "Deleted",
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "mileage_low", label: "Mileage: Low to High" },
  { value: "mileage_high", label: "Mileage: High to Low" },
  { value: "views_high", label: "Most Viewed" },
] as const;

// ========== DEFAULT VALUES ==========
export const DEFAULT_CAR_FILTERS: CarFilters = {
  sort: "newest",
  limit: 20,
  page: 1,
};

export const EMPTY_CAR_DETAIL: Partial<CarDetail> = {
  listing_id: 0,
  make: "",
  model: "",
  year: new Date().getFullYear(),
  price: 0,
  mileage: 0,
  fuel_type: "Gasoline",
  transmission: "Automatic",
  body_type: "Sedan",
  condition: "Good",
  status: "Active",
  views: 0,
  negotiable: false,
  images: [],
  features: [],
  location: {},
  created_at: new Date().toISOString(),
};
