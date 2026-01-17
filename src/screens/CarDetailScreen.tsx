// screens/CarDetailScreen.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { customColors } from "../constants/colors";
import { useAuthStore } from "../features/auth/auth.store";
import { useDeleteCar, useUpdateCar } from "../features/cars/car.hooks";
import { useThemeStore } from "../features/theme/theme.store";

const { width, height } = Dimensions.get("window");

// Responsive dimensions
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 768;
const isLargeScreen = width >= 768;

// Dynamic spacing based on screen size
const getSpacing = (small: number, medium: number, large: number) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

const getFontSize = (small: number, medium: number, large: number) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

interface CarDetail {
  listing_id: number;
  make_id: number;
  make: string;
  model_id: number;
  model: string;
  year: number;
  price: number;
  negotiable: boolean;
  mileage: number;
  fuel_type: string;
  transmission: string;
  body_type: string;
  drive_type: string;
  exterior_color: string;
  interior_color: string;
  doors: number;
  seats: number;
  condition: string;
  vin: string | null;
  description: string;
  views: number;
  location: {
    region_id: number;
    region: string;
    zone_id: number | null;
    zone: string | null;
    town_id: number | null;
    town: string | null;
  };
  images: Array<{
    image_id: number;
    is_primary: boolean;
    thumbnail: string;
    type: string;
    url: string;
  }>;
  features: Array<{
    feature_id: number;
    name: string;
    category: string;
  }>;
  seller: {
    user_id: string;
    username: string;
    name: string;
    phone: string;
    is_dealer: boolean;
    is_verified: boolean;
    company_name: string | null;
    company_address: string | null;
    company_city: string | null;
    avatar: string | null;
    other_listings_count: number;
  };
  created_at: string;
  updated_at: string;
}

const CarDetailScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isDarkMode } = useThemeStore();
  const colors = customColors[isDarkMode ? "dark" : "light"];
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuthStore();

  const [carDetail, setCarDetail] = useState<CarDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Delete car mutation
  const deleteCarMutation = useDeleteCar();

  // Update car mutation
  const updateCarMutation = useUpdateCar();

  useEffect(() => {
    fetchCarDetail();
  }, [id]);

  const fetchCarDetail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://ethiocars.com/mobile-api/v1/cars/view/${id}`
      );
      const data = await response.json();

      if (data.success) {
        setCarDetail(data.data);
      } else {
        setError(data.message || "Failed to load car details");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = () => {
    // Remove authentication requirement - allow anyone to call seller
    if (carDetail?.seller?.phone) {
      Linking.openURL(`tel:${carDetail.seller.phone}`);
    } else {
      alert("Seller phone number not available");
    }
  };

  const handleMessage = () => {
    // Remove authentication requirement - allow anyone to message seller
    if (carDetail?.seller?.phone) {
      const message = `Hi, I'm interested in your ${carDetail?.make} ${carDetail?.model} (Listing ID: ${carDetail?.listing_id}). Please provide more details.`;
      Linking.openURL(
        `sms:${carDetail.seller.phone}?body=${encodeURIComponent(message)}`
      );
    } else {
      alert("Seller phone number not available");
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${carDetail?.make} ${carDetail?.model} - ${carDetail?.price} ETB on EthioCars!`,
        url: `https://ethiocars.com/car/${carDetail?.listing_id}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleDeleteCar = () => {
    Alert.alert(
      "Delete Car Listing",
      "Are you sure you want to delete this car listing? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteCarMutation.mutate(carDetail!.listing_id, {
              onSuccess: (response: any) => {
                if (response.success) {
                  Alert.alert("Success", "Car listing deleted successfully", [
                    {
                      text: "OK",
                      onPress: () => router.back(),
                    },
                  ]);
                } else {
                  Alert.alert(
                    "Error",
                    response.message || "Failed to delete car listing"
                  );
                }
              },
              onError: (error: any) => {
                Alert.alert(
                  "Error",
                  error?.response?.data?.message ||
                    error?.message ||
                    "Failed to delete car listing"
                );
              },
            });
          },
        },
      ]
    );
  };

  const handleEditCar = () => {
    // Navigate to edit screen with car data
    router.push({
      pathname: "/edit-car",
      params: { id: carDetail?.listing_id.toString() },
    });
  };

  const handleNextImage = () => {
    if (carDetail && currentImageIndex < carDetail.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const formatPrice = (price: number) => {
    return `ETB ${price.toLocaleString()}`;
  };

  const formatMileage = (mileage: number) => {
    return `${mileage.toLocaleString()} km`;
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "New":
        return "#10B981";
      case "Excellent":
        return "#3B82F6";
      case "Good":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  if (isLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
            Loading car details...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !carDetail) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="car-off"
            size={80}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={[styles.errorTitle, { color: theme.colors.onSurface }]}>
            Couldn't load car details
          </Text>
          <Text
            style={[
              styles.errorSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {error || "Car not found"}
          </Text>
          <Button
            mode="contained"
            onPress={fetchCarDetail}
            style={styles.retryButton}
            icon="refresh"
          >
            Try Again
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={theme.colors.onSurface}
          onPress={() => router.back()}
        />
        <View style={styles.headerTitle}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Car Details
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          {carDetail.images.length > 0 &&
          carDetail.images[currentImageIndex]?.url ? (
            <Image
              source={{ uri: carDetail.images[currentImageIndex].url }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="car"
                size={80}
                color={theme.colors.onSurfaceVariant}
              />
            </View>
          )}
          {/* Navigation Buttons */}
          {carDetail.images.length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <TouchableOpacity
                  style={[styles.navButton, styles.prevButton]}
                  onPress={handlePreviousImage}
                >
                  <MaterialCommunityIcons
                    name="chevron-left"
                    size={32}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              )}
              {currentImageIndex < carDetail.images.length - 1 && (
                <TouchableOpacity
                  style={[styles.navButton, styles.nextButton]}
                  onPress={handleNextImage}
                >
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={32}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              )}
              <View style={styles.imageIndicator}>
                <Text style={[styles.imageIndicatorText, { color: "#FFFFFF" }]}>
                  {currentImageIndex + 1} / {carDetail.images.length}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Car Info Card */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.carHeader}>
            <View style={styles.titleSection}>
              <Text
                style={[styles.carTitle, { color: theme.colors.onSurface }]}
              >
                {carDetail.year} {carDetail.make} {carDetail.model}
              </Text>
              <View style={styles.verifiedRow}>
                {carDetail.seller.is_dealer && (
                  <Chip
                    icon="check-decagram"
                    textStyle={{ fontSize: 11 }}
                    compact
                  >
                    Verified Dealer
                  </Chip>
                )}
                <View
                  style={[
                    styles.conditionBadge,
                    { backgroundColor: getConditionColor(carDetail.condition) },
                  ]}
                >
                  <Text style={styles.conditionText}>
                    {carDetail.condition}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.saveButton}>
              <MaterialCommunityIcons
                name="heart-outline"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.priceSection}>
            <Text style={[styles.price, { color: theme.colors.primary }]}>
              {formatPrice(carDetail.price)}
            </Text>
            {carDetail.negotiable && (
              <Text
                style={[
                  styles.negotiable,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Price is negotiable
              </Text>
            )}
          </View>

          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="speedometer"
                size={20}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.statText, { color: theme.colors.onSurface }]}
              >
                {formatMileage(carDetail.mileage)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="gas-station"
                size={20}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.statText, { color: theme.colors.onSurface }]}
              >
                {carDetail.fuel_type}
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="cog"
                size={20}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.statText, { color: theme.colors.onSurface }]}
              >
                {carDetail.transmission}
              </Text>
            </View>
          </View>

          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="car-door"
                size={20}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.statText, { color: theme.colors.onSurface }]}
              >
                {carDetail.doors} Doors
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="car-seat"
                size={20}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.statText, { color: theme.colors.onSurface }]}
              >
                {carDetail.seats} Seats
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="eye"
                size={20}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.statText, { color: theme.colors.onSurface }]}
              >
                {carDetail.views} views
              </Text>
            </View>
          </View>
        </Card>

        {/* Description */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Description
          </Text>
          <Text style={[styles.description, { color: theme.colors.onSurface }]}>
            {carDetail.description || "No description available"}
          </Text>
        </Card>

        {/* Features */}
        {carDetail.features.length > 0 && (
          <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
          >
            <Text
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Features & Extras
            </Text>
            <View style={styles.featuresGrid}>
              {carDetail.features.map((feature) => (
                <View key={feature.feature_id} style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.featureText,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {feature.name}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Seller Info */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Seller Information
          </Text>
          <View style={styles.sellerInfo}>
            <View
              style={[
                styles.sellerAvatar,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name={carDetail.seller.is_dealer ? "store" : "account"}
                size={32}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.sellerDetails}>
              <Text
                style={[styles.sellerName, { color: theme.colors.onSurface }]}
              >
                {carDetail.seller.company_name || carDetail.seller.name}
              </Text>
              <Text
                style={[
                  styles.sellerType,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {carDetail.seller.is_dealer ? "Car Dealer" : "Private Seller"}
              </Text>
              {carDetail.seller.company_address && (
                <Text
                  style={[
                    styles.sellerAddress,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {carDetail.seller.company_address},{" "}
                  {carDetail.seller.company_city}
                </Text>
              )}
              <Text
                style={[
                  styles.listingCount,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {carDetail.seller.other_listings_count} other listings
              </Text>
            </View>
          </View>
        </Card>

        {/* Location */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Location
          </Text>
          <View style={styles.locationInfo}>
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.locationText, { color: theme.colors.onSurface }]}
            >
              {carDetail.location.region}
              {carDetail.location.zone && `, ${carDetail.location.zone}`}
              {carDetail.location.town && `, ${carDetail.location.town}`}
            </Text>
          </View>
        </Card>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Fixed Bottom Actions */}
      <View
        style={[
          styles.bottomActions,
          {
            backgroundColor: theme.colors.surface,
            paddingBottom: insets.bottom + 16, // Add safe area padding
          },
        ]}
      >
        <Button
          mode="contained"
          onPress={handleCall}
          style={[styles.callButton, { backgroundColor: "#4CAF50" }]}
          icon="phone"
          textColor="#FFFFFF"
        >
          Call Seller
        </Button>
        <Button
          mode="outlined"
          onPress={handleMessage}
          style={[styles.messageButton, { borderColor: theme.colors.primary }]}
          icon="message"
          textColor={theme.colors.primary}
        >
          Message
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  imageGallery: {
    position: "relative",
    height: 250,
    backgroundColor: "#f8f9fa",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e9ecef",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  prevButton: {
    left: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  nextButton: {
    right: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "System",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
  },
  errorSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
  },
  card: {
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2ecc71",
  },
  negotiable: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
    fontStyle: "italic",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  detailItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  featureItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#333",
  },
  sellerContainer: {
    marginBottom: 16,
  },
  sellerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  sellerType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  sellerAddress: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  sellerListings: {
    fontSize: 12,
    color: "#666",
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  bottomPadding: {
    height: 100,
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 16,
    gap: 12,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  callButton: {
    flex: 1,
    borderRadius: 12,
    height: 48,
  },
  messageButton: {
    flex: 1,
    borderRadius: 12,
    height: 48,
  },
  // Missing styles for image indicators
  imageIndicator: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageIndicatorText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  // Missing styles for car header section
  carHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
    marginRight: 16,
  },
  carTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  conditionBadge: {
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2ecc71",
  },
  saveButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  priceSection: {
    marginBottom: 16,
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  statText: {
    fontSize: 14,
  },
  listingCount: {
    fontSize: 12,
    color: "#666",
  },
});

export default CarDetailScreen;
