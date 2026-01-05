// Shared types for the create listing flow
export interface VehicleData {
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
