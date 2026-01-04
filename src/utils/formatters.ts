/**
 * Utility functions for formatting data in EthioCars app
 */

// Currency formatter for Ethiopian Birr (ETB)
export const formatCurrency = (amount: number): string => {
  if (isNaN(amount)) return "ETB 0";

  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Alternative currency formatter (fallback)
export const formatBirr = (amount: number): string => {
  if (isNaN(amount)) return "ETB 0";

  return `ETB ${amount.toLocaleString("en-ET")}`;
};

// Format price with abbreviation for large numbers
export const formatPrice = (price: number): string => {
  if (isNaN(price)) return "ETB 0";

  if (price >= 1000000) {
    return `ETB ${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    return `ETB ${(price / 1000).toFixed(0)}K`;
  }

  return formatBirr(price);
};

// Format mileage
export const formatMileage = (mileage: string | number): string => {
  if (!mileage) return "0 km";

  const num =
    typeof mileage === "string"
      ? parseInt(mileage.replace(/\D/g, ""))
      : mileage;

  if (isNaN(num)) return "0 km";

  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k km`;
  }

  return `${num.toLocaleString()} km`;
};

// Format year
export const formatYear = (year: number | string): string => {
  const yearNum = typeof year === "string" ? parseInt(year) : year;

  if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
    return new Date().getFullYear().toString();
  }

  return yearNum.toString();
};

// Format date to Ethiopian format
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  return dateObj.toLocaleDateString("en-ET", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Format relative time (e.g., "2 days ago", "1 week ago")
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes <= 1 ? "Just now" : `${diffInMinutes} minutes ago`;
    }
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return years === 1 ? "1 year ago" : `${years} years ago`;
  }
};

// Format car name
export const formatCarName = (
  make: string,
  model: string,
  trim?: string
): string => {
  const parts = [make, model];
  if (trim && trim.trim()) {
    parts.push(trim.trim());
  }
  return parts.filter(Boolean).join(" ");
};

// Format location (Ethiopian cities)
export const formatLocation = (location: string): string => {
  if (!location) return "Unknown location";

  // Capitalize first letter of each word
  return location
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Format transmission type
export const formatTransmission = (transmission: string): string => {
  if (!transmission) return "Unknown";

  const lower = transmission.toLowerCase();
  if (lower === "manual") return "Manual";
  if (lower === "automatic") return "Automatic";
  if (lower === "cvt") return "CVT";
  if (lower === "dct") return "Dual Clutch";

  return transmission.charAt(0).toUpperCase() + transmission.slice(1);
};

// Format fuel type
export const formatFuelType = (fuelType: string): string => {
  if (!fuelType) return "Unknown";

  const lower = fuelType.toLowerCase();
  if (lower === "gasoline" || lower === "petrol") return "Petrol";
  if (lower === "diesel") return "Diesel";
  if (lower === "electric" || lower === "ev") return "Electric";
  if (lower === "hybrid") return "Hybrid";
  if (lower === "lpg") return "LPG";
  if (lower === "cng") return "CNG";

  return fuelType.charAt(0).toUpperCase() + fuelType.slice(1);
};

// Format condition
export const formatCondition = (condition: string): string => {
  if (!condition) return "Unknown";

  const lower = condition.toLowerCase();
  if (lower === "new") return "New";
  if (lower === "used") return "Used";
  if (lower === "like new") return "Like New";
  if (lower === "excellent") return "Excellent";
  if (lower === "good") return "Good";
  if (lower === "fair") return "Fair";
  if (lower === "salvage") return "Salvage";

  return condition.charAt(0).toUpperCase() + condition.slice(1);
};

// Format number with commas
export const formatNumber = (num: number): string => {
  if (isNaN(num)) return "0";
  return num.toLocaleString();
};

// Format percentage
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  if (isNaN(value)) return "0%";
  return `${value.toFixed(decimals)}%`;
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Format duration (for videos, calls, etc.)
export const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

// Format rating (stars)
export const formatRating = (rating: number, maxRating: number = 5): string => {
  if (isNaN(rating) || rating < 0) return "0.0";
  if (rating > maxRating) return `${maxRating}.0`;

  return rating.toFixed(1);
};

// Format discount percentage
export const formatDiscount = (
  originalPrice: number,
  discountedPrice: number
): string => {
  if (isNaN(originalPrice) || isNaN(discountedPrice) || originalPrice <= 0) {
    return "0% off";
  }

  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return `${Math.round(discount)}% off`;
};

// Format search query for display
export const formatSearchQuery = (
  query: string,
  maxLength: number = 30
): string => {
  if (!query) return "";

  const trimmed = query.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return trimmed.substring(0, maxLength) + "...";
};
