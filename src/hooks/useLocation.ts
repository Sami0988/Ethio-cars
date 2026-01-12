import * as Location from "expo-location";
import { useCallback, useState } from "react";
import { Alert, Linking } from "react-native";

interface LocationData {
  latitude: number | null;
  longitude: number | null;
  region: string;
  zone: string;
  city: string;
  address: string;
  accuracy: number | null;
  timestamp: number | null;
}

interface UseLocationReturn {
  location: LocationData;
  isLoading: boolean;
  error: string | null;
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<LocationData | null>;
  setManualLocation: (region: string, zone: string, city: string) => void;
  getCitiesForRegion: (region: string) => string[];
  getZonesForRegion: (region: string) => string[];
  openAppSettings: () => Promise<void>;
}

// Ethiopian regions and cities data
const ETHIOPIAN_REGIONS = [
  "Addis Ababa",
  "Afar",
  "Amhara",
  "Benishangul-Gumuz",
  "Dire Dawa",
  "Gambela",
  "Harari",
  "Oromia",
  "Sidama",
  "Somali",
  "South West Ethiopia",
  "Southern Nations, Nationalities, and Peoples' Region",
  "Tigray",
];

const CITIES_BY_REGION: Record<string, string[]> = {
  "Addis Ababa": [
    "Addis Ababa",
    "Bole",
    "Kirkos",
    "Kolfe",
    "Lideta",
    "Nifas Silk",
  ],
  Amhara: [
    "Bahir Dar",
    "Gondar",
    "Dessie",
    "Debre Markos",
    "Debre Birhan",
    "Kombolcha",
  ],
  Oromia: ["Adama", "Jimma", "Bishoftu", "Ambo", "Nekemte", "Shashamane"],
  Tigray: ["Mekele", "Adigrat", "Axum", "Shire", "Humera"],
  "Southern Nations, Nationalities, and Peoples' Region": [
    "Hawassa",
    "Arba Minch",
    "Sodo",
    "Dila",
    "Wolaita Sodo",
  ],
  Somali: ["Jijiga", "Dire Dawa", "Gode", "Kebri Dehar"],
  Afar: ["Semera", "Awash", "Logia"],
  "Benishangul-Gumuz": ["Assosa", "Metekel"],
  Gambela: ["Gambela", "Itang"],
  Harari: ["Harar"],
  Sidama: ["Hawassa", "Yirgalem"],
  "South West Ethiopia": ["Bonga", "Mizan Teferi"],
};

// Default zones/cities mapping (simplified)
const ZONES_BY_REGION: Record<string, string[]> = {
  "Addis Ababa": ["Central", "East", "West", "North", "South"],
  Amhara: [
    "North Gondar",
    "South Gondar",
    "North Wollo",
    "South Wollo",
    "West Gojjam",
    "East Gojjam",
  ],
  Oromia: ["East Shewa", "West Shewa", "North Shewa", "Arsi", "Bale", "Borena"],
  Tigray: ["Central", "Eastern", "Southern", "North Western"],
};

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
    region: "",
    zone: "",
    city: "",
    address: "",
    accuracy: null,
    timestamp: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === "granted";
    } catch (err) {
      console.error("Error requesting location permission:", err);
      return false;
    }
  }, []);

  const checkLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === "granted";
    } catch (err) {
      console.error("Error checking location permission:", err);
      return false;
    }
  }, []);

  const getCurrentLocation =
    useCallback(async (): Promise<LocationData | null> => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if we have permission
        const hasPermission = await checkLocationPermission();

        if (!hasPermission) {
          setError(
            "Location permission denied. Please enable location permissions to use this feature."
          );
          setIsLoading(false);
          return null;
        }

        // Get current location
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        // Reverse geocode to get address
        const geocoded = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        const firstResult = geocoded[0];

        // Try to determine Ethiopian region from geocoded data
        let region = "";
        let city = "";

        // Use the correct properties from geocoded result
        if (firstResult?.city) {
          city = firstResult.city;
        }
        if (firstResult?.subregion) {
          city = firstResult.subregion;
        }
        if (firstResult?.region) {
          region = firstResult.region;
        }

        // Simple mapping for Ethiopia (you might want to improve this with more accurate data)
        if (city.toLowerCase().includes("addis")) {
          region = "Addis Ababa";
        } else if (city.toLowerCase().includes("bahir")) {
          region = "Amhara";
        } else if (city.toLowerCase().includes("mekele")) {
          region = "Tigray";
        } else if (city.toLowerCase().includes("jimma")) {
          region = "Oromia";
        } else if (city.toLowerCase().includes("hawassa")) {
          region = "Southern Nations, Nationalities, and Peoples' Region";
        } else if (city.toLowerCase().includes("arba minch")) {
          region = "SNNPR";
        } else if (city.toLowerCase().includes("sodo")) {
          region = "Sidama";
        } else if (city.toLowerCase().includes("dila")) {
          region = "Somali";
        } else if (city.toLowerCase().includes("gambela")) {
          region = "Gambela";
        } else if (city.toLowerCase().includes("harari")) {
          region = "Harari";
        } else if (city.toLowerCase().includes("afar")) {
          region = "Somali";
        } else if (city.toLowerCase().includes("benishangul")) {
          region = "Benishangul-Gumuz";
        } else if (city.toLowerCase().includes("gambela")) {
          region = "Gambela";
        } else if (city.toLowerCase().includes("somali")) {
          region = "Somali";
        } else if (city.toLowerCase().includes("tigray")) {
          region = "Tigray";
        } else if (city.toLowerCase().includes("afar")) {
          region = "Somali";
        }

        // If we couldn't determine region, use the first Ethiopian region as fallback
        if (!region && ETHIOPIAN_REGIONS.length > 0) {
          region = ETHIOPIAN_REGIONS[0];
        }

        // Determine zone based on region
        let zone = "";
        if (
          region &&
          ZONES_BY_REGION[region] &&
          ZONES_BY_REGION[region].length > 0
        ) {
          zone = ZONES_BY_REGION[region][0];
        }

        const newLocation: LocationData = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          region,
          zone,
          city: city || "Unknown City",
          address: firstResult
            ? `${firstResult.street || ""}, ${firstResult.city || ""}, ${
                firstResult.region || ""
              }`
            : "Address not available",
          accuracy: currentLocation.coords.accuracy,
          timestamp: currentLocation.timestamp,
        };

        setLocation(newLocation);
        setIsLoading(false);
        return newLocation;
      } catch (err: any) {
        console.error("Error getting location:", err);
        let errorMessage = "Failed to get location";

        if (err.message?.includes("Not authorized")) {
          errorMessage =
            "Location access denied. Please enable location permissions in your device settings and restart the app.";
        } else if (
          err.message?.includes("Current location is unavailable") ||
          err.message?.includes("location services are enabled")
        ) {
          errorMessage =
            "Location services are disabled. Please enable GPS/location services in your device settings, then try again.";
        } else if (err.message?.includes("Location services are disabled")) {
          errorMessage =
            "Location services are disabled. Please enable GPS/location services in your device settings.";
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        setIsLoading(false);
        return null;
      }
    }, [checkLocationPermission]);

  const setManualLocation = useCallback(
    (region: string, zone: string, city: string) => {
      setLocation((prev) => ({
        ...prev,
        region,
        zone,
        city,
        address: `${city}, ${zone}, ${region}`,
      }));
    },
    []
  );

  // Get cities for a given region
  const getCitiesForRegion = useCallback((region: string): string[] => {
    return CITIES_BY_REGION[region] || [];
  }, []);

  // Get zones for a given region
  const getZonesForRegion = useCallback((region: string): string[] => {
    return ZONES_BY_REGION[region] || [];
  }, []);

  // Open app settings
  const openAppSettings = useCallback(async (): Promise<void> => {
    try {
      // For Expo Go, this will open the Expo Go app settings
      // For production builds, this will open the app's settings
      await Linking.openSettings();
    } catch (err) {
      console.error("Error opening app settings:", err);
      // Fallback: show manual instructions for Expo Go users
      Alert.alert(
        "Settings Instructions",
        "For Expo Go: Shake your device to open the developer menu, then go to Settings > Permissions.\n\nFor production builds: Go to Settings > Apps > EthioCarsApp > Permissions and enable Location access."
      );
    }
  }, []);

  return {
    location,
    isLoading,
    error,
    requestLocationPermission,
    getCurrentLocation,
    setManualLocation,
    // Export helper functions
    getCitiesForRegion,
    getZonesForRegion,
    openAppSettings,
  };
}
