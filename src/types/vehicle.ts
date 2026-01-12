// Shared types for the create listing flow
export interface VehicleData {
  make_id?: number;
  model_id?: string;
  make: string;
  model: string;
  year: string;
  color: string;
  condition: string;
  price: string;
  negotiable: boolean;
  mileage: string;
  transmission: string;
  fuel: string;
  photos: string[];
  location: {
    region_id?: number;
    zone_id?: number;
    town_id?: number;
    region: string;
    zone: string;
    city: string;
    address: string;
  };
  description: string;
  features: number[]; // Changed to number[] to match API
  contactPreference?: string;
  availability?: {
    weekends: boolean;
    weekdays: boolean;
    mornings: boolean;
    evenings: boolean;
    appointment: boolean;
  };
  // Additional fields for API
  interior_color?: string;
  doors?: number;
  seats?: number;
  body_type?: string;
  drive_type?: string;
}
