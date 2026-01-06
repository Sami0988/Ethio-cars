// components/CarCard.tsx
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  CarListing,
  formatMileage,
  formatPrice,
  getCarTitle,
} from "../features/cars/car.types";

interface CarCardProps {
  listing: CarListing;
  index: number;
  isLoading?: boolean;
  onPress?: () => void;
  onCallPress?: () => void;
  onSavePress?: () => void;
}

const CarCard: React.FC<CarCardProps> = ({
  listing,
  index,
  isLoading = false,
  onPress,
  onCallPress,
  onSavePress,
}) => {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (!isLoading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay: index * 80,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          delay: index * 80,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          delay: index * 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, index]);

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ scale: scaleAnim }, { translateY }],
  };

  if (isLoading) {
    return (
      <Animated.View style={animatedStyle}>
        <Card
          style={[
            styles.listingCard,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <View style={styles.imageContainer}>
            <View
              style={[
                styles.skeletonImage,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            />
            <View
              style={[
                styles.skeletonPriceTag,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            />
          </View>

          <View style={styles.listingContent}>
            <View style={styles.carHeader}>
              <View
                style={[
                  styles.skeletonTitle,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              />
              <View
                style={[
                  styles.skeletonSubtitle,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              />
            </View>

            <View
              style={[
                styles.carDetails,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <View
                style={[
                  styles.skeletonDetail,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              />
              <View
                style={[
                  styles.skeletonDetail,
                  { backgroundColor: theme.colors.surfaceVariant, width: 80 },
                ]}
              />
              <View
                style={[
                  styles.skeletonDetail,
                  { backgroundColor: theme.colors.surfaceVariant, width: 60 },
                ]}
              />
            </View>

            <View
              style={[
                styles.sellerInfo,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <View
                style={[
                  styles.skeletonAvatar,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              />
              <View style={styles.sellerText}>
                <View
                  style={[
                    styles.skeletonSeller,
                    { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                />
                <View
                  style={[
                    styles.skeletonType,
                    { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                />
              </View>
            </View>
          </View>
        </Card>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <Card
          style={[
            styles.listingCard,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
          elevation={3}
        >
          {/* Image Section */}
          <View style={styles.imageContainer}>
            {listing.primary_image || listing.thumbnail ? (
              <Image
                source={{ uri: listing.primary_image || listing.thumbnail }}
                style={styles.carImage}
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
                  size={60}
                  color={theme.colors.onSurfaceVariant}
                />
              </View>
            )}

            {/* Price Tag */}
            <View
              style={[
                styles.priceTag,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text
                style={[styles.priceTagText, { color: theme.colors.onPrimary }]}
              >
                {formatPrice(listing.price)}
              </Text>
              {listing.negotiable && (
                <Text
                  style={[
                    styles.negotiableText,
                    { color: theme.colors.onPrimary },
                  ]}
                >
                  Negotiable
                </Text>
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={onSavePress}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="heart-outline"
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>

            {/* Condition Badge */}
            {listing.condition && (
              <View
                style={[
                  styles.conditionBadge,
                  {
                    backgroundColor:
                      listing.condition === "New"
                        ? "#10B981"
                        : listing.condition === "Excellent"
                          ? "#3B82F6"
                          : listing.condition === "Good"
                            ? "#F59E0B"
                            : "#6B7280",
                  },
                ]}
              >
                <Text style={styles.conditionText}>{listing.condition}</Text>
              </View>
            )}
          </View>

          {/* Content Section */}
          <View style={styles.listingContent}>
            {/* Car Title */}
            <View style={styles.carHeader}>
              <Text
                style={[styles.carTitle, { color: theme.colors.onSurface }]}
              >
                {getCarTitle(listing)}
              </Text>
              <View style={styles.verifiedContainer}>
                {listing.seller?.is_dealer && (
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={16}
                    color="#10B981"
                  />
                )}
              </View>
            </View>

            <Text
              style={[
                styles.carSubtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {listing.body_type} • {listing.transmission} • {listing.fuel_type}
            </Text>

            {/* Details */}
            <View style={styles.carDetails}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="speedometer"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text
                  style={[styles.detailText, { color: theme.colors.onSurface }]}
                >
                  {formatMileage(listing.mileage)}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text
                  style={[styles.detailText, { color: theme.colors.onSurface }]}
                >
                  {listing.region || "N/A"}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="eye"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text
                  style={[styles.detailText, { color: theme.colors.onSurface }]}
                >
                  {listing.views} views
                </Text>
              </View>
            </View>

            {/* Seller Info */}
            <View style={styles.sellerInfo}>
              <View
                style={[
                  styles.sellerAvatar,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <MaterialCommunityIcons
                  name={listing.seller?.is_dealer ? "store" : "account"}
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.sellerDetails}>
                <Text
                  style={[styles.sellerName, { color: theme.colors.onSurface }]}
                >
                  {listing.seller?.company_name ||
                    listing.seller?.username ||
                    "Private Seller"}
                </Text>
                <Text
                  style={[
                    styles.sellerType,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {listing.seller?.is_dealer
                    ? "Verified Dealer"
                    : "Private Seller"}
                </Text>
              </View>
              <Text
                style={[
                  styles.listedDate,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {new Date(listing.created_at).toLocaleDateString()}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                style={[styles.callButton, { backgroundColor: "#918d83" }]}
                onPress={onCallPress}
                icon="phone"
                compact
                textColor="#FFFFFF"
                labelStyle={{
                  color: "#FFFFFF",
                  fontWeight: "600",
                }}
              >
                Call
              </Button>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  listingCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  imageContainer: {
    position: "relative",
    height: 200,
  },
  carImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  priceTag: {
    position: "absolute",
    bottom: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    minWidth: 100,
  },
  priceTagText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "System",
  },
  negotiableText: {
    color: "#FFFFFF",
    fontSize: 10,
    opacity: 0.9,
    marginTop: 2,
  },
  saveButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  conditionBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  conditionText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  listingContent: {
    padding: 16,
  },
  carHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  carTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    fontFamily: "System",
  },
  verifiedContainer: {
    marginLeft: 8,
  },
  carSubtitle: {
    fontSize: 13,
    fontFamily: "System",
    marginBottom: 12,
  },
  carDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "System",
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  sellerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "System",
    marginBottom: 2,
  },
  sellerType: {
    fontSize: 11,
    fontFamily: "System",
  },
  listedDate: {
    fontSize: 11,
    fontFamily: "System",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
  },
  messageButton: {
    flex: 1,
    borderRadius: 10,
    height: 42,
  },
  callButton: {
    width: "100%",
    borderRadius: 10,
    height: 42,
  },
  callButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  // Skeleton styles
  skeletonImage: {
    width: "100%",
    height: "100%",
  },
  skeletonPriceTag: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 80,
    height: 32,
    borderRadius: 8,
  },
  skeletonTitle: {
    width: "70%",
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    width: "50%",
    height: 14,
    borderRadius: 4,
  },
  skeletonDetail: {
    width: 60,
    height: 14,
    borderRadius: 4,
  },
  skeletonAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  sellerText: {
    flex: 1,
  },
  skeletonSeller: {
    width: "60%",
    height: 14,
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonType: {
    width: "40%",
    height: 12,
    borderRadius: 4,
  },
});

export default CarCard;
