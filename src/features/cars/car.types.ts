// Car API Types based on EthioCars documentation
export interface CarListing {
  listing_id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  status:
    | "Active"
    | "Pending"
    | "Sold"
    | "Expired"
    | "Draft"
    | "Suspended"
    | "Deleted";
  views: number;
  primary_image?: string;
  created_at: string;
  updated_at: string;
}

export interface CarDetail {
  listing_id: number;
  make_id: number;
  make: string;
  model_id: number;
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
  drive_type: "FWD" | "RWD" | "AWD" | "4WD";
  condition: "New" | "Like New" | "Excellent" | "Good" | "Fair" | "Poor";
  exterior_color?: string;
  interior_color?: string;
  doors?: number;
  seats?: number;
  vin?: string;
  description?: string;
  status: string;
  views: number;

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
  }>;

  features: Array<{
    feature_id: number;
    name: string;
    category: string;
  }>;

  created_at: string;
  updated_at: string;
}

export interface CreateCarRequest {
  make_id: number;
  model_id: number;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  body_type: string;
  drive_type: string;
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
    data: string; // base64
    type?: string;
  }>;
}

export interface UpdateCarRequest {
  price?: number;
  negotiable?: boolean;
  mileage?: number;
  description?: string;
  status?: string;
  features?: number[];
  add_images?: Array<{
    data: string;
    type?: string;
  }>;
  delete_images?: number[];
}

export interface Make {
  make_id: number;
  name: string;
}

export interface Model {
  model_id: number;
  name: string;
}

export interface Feature {
  feature_id: number;
  name: string;
  category: string;
  importance: "Basic" | "Common" | "Premium";
}

export interface Location {
  region_id?: number;
  region?: string;
  zone_id?: number;
  zone?: string;
  town_id?: number;
  town?: string;
}

export interface Pagination {
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
    pagination: Pagination;
  };
}

export interface CarDetailResponse {
  success: boolean;
  message: string;
  data: CarDetail;
}
