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
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { customColors } from "../constants/colors";
import { useThemeStore } from "../features/theme/theme.store";

const { width } = Dimensions.get("window");

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

  const [carDetail, setCarDetail] = useState<CarDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    if (carDetail?.seller?.phone) {
      Linking.openURL(`tel:${carDetail.seller.phone}`);
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
        <IconButton
          icon="share"
          size={24}
          iconColor={theme.colors.onSurface}
          onPress={handleShare}
        />
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
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Button
          mode="outlined"
          onPress={() => Alert.alert("Message", "Message feature coming soon!")}
          style={styles.messageButton}
          icon="message"
        >
          Message
        </Button>
        <Button
          mode="contained"
          onPress={handleCall}
          style={[styles.callButton, { backgroundColor: "#4CAF50" }]}
          icon="phone"
          textColor="#FFFFFF"
        >
          Call Seller
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 8,
    fontFamily: "System",
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "System",
  },
  retryButton: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
    elevation: 2,
    zIndex: 100,
  },
  headerTitle: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "System",
  },
  imageGallery: {
    position: "relative",
    height: 250,
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageIndicator: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageIndicatorText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "System",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -20 }],
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  prevButton: {
    left: 16,
  },
  nextButton: {
    right: 16,
  },
  card: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },
  carHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
  },
  carTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: "System",
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  conditionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  conditionText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "System",
  },
  saveButton: {
    padding: 8,
  },
  priceSection: {
    marginBottom: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "System",
  },
  negotiable: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: "System",
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  statText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "System",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    fontFamily: "System",
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: "System",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "48%",
  },
  featureText: {
    fontSize: 14,
    fontFamily: "System",
    flex: 1,
  },
  sellerInfo: {
    flexDirection: "row",
    gap: 16,
  },
  sellerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    fontFamily: "System",
  },
  sellerType: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: "System",
  },
  sellerAddress: {
    fontSize: 13,
    marginBottom: 4,
    fontFamily: "System",
  },
  listingCount: {
    fontSize: 13,
    fontFamily: "System",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  locationText: {
    fontSize: 15,
    fontFamily: "System",
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
  messageButton: {
    flex: 1,
    borderRadius: 12,
    height: 48,
  },
  callButton: {
    flex: 1,
    borderRadius: 12,
    height: 48,
  },
});

export default CarDetailScreen;
