// components/AnimatedCarCard.tsx
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Image, StyleSheet, View } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { CarListing } from "../features/cars/car.types";

const { width } = Dimensions.get("window");

interface AnimatedCarCardProps {
  listing: CarListing;
  index: number;
  isLoading?: boolean;
  onPress?: () => void;
  onCallPress?: () => void;
  onMessagePress?: () => void;
}

export const AnimatedCarCard: React.FC<AnimatedCarCardProps> = ({
  listing,
  index,
  isLoading = false,
  onPress,
  onCallPress,
  onMessagePress,
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
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          delay: index * 100,
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
          {/* Skeleton Image */}
          <View style={styles.imageContainer}>
            <View
              style={[
                styles.skeletonImage,
                { backgroundColor: theme.colors.onSurface + "20" },
              ]}
            />
            <View
              style={[
                styles.skeletonPriceTag,
                { backgroundColor: theme.colors.onSurface + "20" },
              ]}
            />
          </View>

          {/* Skeleton Content */}
          <View style={styles.listingContent}>
            <View style={styles.carHeader}>
              <View
                style={[
                  styles.skeletonTitle,
                  { backgroundColor: theme.colors.onSurface + "20" },
                ]}
              />
            </View>

            <View style={styles.carDetails}>
              <View
                style={[
                  styles.skeletonDetail,
                  { backgroundColor: theme.colors.onSurface + "20" },
                ]}
              />
              <View
                style={[
                  styles.skeletonDetail,
                  {
                    backgroundColor: theme.colors.onSurface + "20",
                    width: 100,
                  },
                ]}
              />
            </View>

            <View style={styles.actionButtons}>
              <View
                style={[
                  styles.skeletonButton,
                  { backgroundColor: theme.colors.onSurface + "20" },
                ]}
              />
              <View
                style={[
                  styles.skeletonCallButton,
                  { backgroundColor: theme.colors.onSurface + "20" },
                ]}
              />
            </View>
          </View>
        </Card>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <Card
        style={[
          styles.listingCard,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
        onPress={onPress}
        elevation={4}
      >
        {/* Car Image with Gradient Overlay */}
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
                size={80}
                color={theme.colors.onSurfaceVariant}
              />
            </View>
          )}

          {/* Gradient Overlay */}
          <View style={styles.imageOverlay} />

          {/* Price Tag */}
          <View
            style={[styles.priceTag, { backgroundColor: theme.colors.primary }]}
          >
            <Text
              style={[styles.priceTagText, { color: theme.colors.onPrimary }]}
            >
              ETB {listing.price?.toLocaleString() || "0"}
            </Text>
            {listing.negotiable && (
              <Text
                style={[styles.priceSubtext, { color: theme.colors.onPrimary }]}
              >
                Negotiable
              </Text>
            )}
          </View>

          {/* Status Badges */}
          <View style={styles.badgesContainer}>
            {listing.negotiable && (
              <View
                style={[styles.negotiableBadge, { backgroundColor: "#10B981" }]}
              >
                <MaterialCommunityIcons
                  name="handshake"
                  size={12}
                  color="#FFFFFF"
                />
                <Text style={styles.badgeText}>Negotiable</Text>
              </View>
            )}

            {listing.seller?.is_dealer && (
              <View
                style={[styles.dealerBadge, { backgroundColor: "#3B82F6" }]}
              >
                <MaterialCommunityIcons
                  name="store"
                  size={12}
                  color="#FFFFFF"
                />
                <Text style={styles.badgeText}>Dealer</Text>
              </View>
            )}

            {listing.condition === "New" && (
              <View style={[styles.newBadge, { backgroundColor: "#EF4444" }]}>
                <MaterialCommunityIcons name="star" size={12} color="#FFFFFF" />
                <Text style={styles.badgeText}>New</Text>
              </View>
            )}
          </View>
        </View>

        {/* Car Content */}
        <View style={styles.listingContent}>
          <View style={styles.carHeader}>
            <View style={styles.carTitleContainer}>
              <Text
                style={[styles.carTitle, { color: theme.colors.onSurface }]}
              >
                {listing.year} {listing.make} {listing.model}
              </Text>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color="#10B981"
              />
            </View>
            <Text
              style={[
                styles.carSubtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {listing.body_type} • {listing.transmission} • {listing.fuel_type}
            </Text>
          </View>

          <View style={styles.carDetails}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons
                name="speedometer"
                size={18}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.detailText, { color: theme.colors.onSurface }]}
              >
                {listing.mileage?.toLocaleString() || "0"} km
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons
                name="map-marker"
                size={18}
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
                size={18}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.detailText, { color: theme.colors.onSurface }]}
              >
                {listing.views || 0} views
              </Text>
            </View>
          </View>

          {/* Seller Info */}
          <View style={styles.sellerInfo}>
            <View style={styles.sellerAvatar}>
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
              mode="outlined"
              style={[
                styles.messageButton,
                { borderColor: theme.colors.outline },
              ]}
              onPress={onMessagePress}
              textColor={theme.colors.primary}
              icon="message"
            >
              Message
            </Button>
            <Button
              mode="contained"
              style={[
                styles.callButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={onCallPress}
              icon="phone"
              textColor={theme.colors.onPrimary}
              labelStyle={{ color: theme.colors.onPrimary, fontWeight: "600" }}
            >
              Call Now
            </Button>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  listingCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  imageContainer: {
    position: "relative",
    height: 240,
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
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  priceTag: {
    position: "absolute",
    bottom: 16,
    right: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
  },
  priceTagText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "System",
  },
  priceSubtext: {
    color: "#FFFFFF",
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
  },
  badgesContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "column",
    gap: 8,
  },
  negotiableBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  dealerBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  newBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  listingContent: {
    padding: 20,
  },
  carHeader: {
    marginBottom: 16,
  },
  carTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  carTitle: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
    fontFamily: "System",
  },
  carSubtitle: {
    fontSize: 14,
    fontFamily: "System",
  },
  carDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "System",
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "System",
    marginBottom: 2,
  },
  sellerType: {
    fontSize: 12,
    fontFamily: "System",
  },
  listedDate: {
    fontSize: 12,
    fontFamily: "System",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
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
  callButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  // Skeleton styles
  skeletonImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  skeletonPriceTag: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 100,
    height: 40,
    borderRadius: 16,
  },
  skeletonTitle: {
    width: "70%",
    height: 28,
    borderRadius: 6,
    marginBottom: 12,
  },
  skeletonDetail: {
    width: 80,
    height: 20,
    borderRadius: 4,
  },
  skeletonButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
  },
  skeletonCallButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
  },
});

export default AnimatedCarCard;
