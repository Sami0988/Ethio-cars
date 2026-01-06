// components/CarListingCard.tsx
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Button, Card, IconButton, Text, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface CarListingCardProps {
  listing: any;
  isLoading?: boolean;
  onPress?: () => void;
  onCallPress?: () => void;
  onMessagePress?: () => void;
}

export const CarListingCard: React.FC<CarListingCardProps> = ({
  listing,
  isLoading = false,
  onPress,
  onCallPress,
  onMessagePress,
}) => {
  const theme = useTheme();

  if (isLoading) {
    return (
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
                { backgroundColor: theme.colors.onSurface + "20", width: 100 },
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
    );
  }

  return (
    <Card
      style={[
        styles.listingCard,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
      onPress={onPress}
      elevation={2}
    >
      {/* Car Image */}
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

        {/* Price Tag */}
        <View
          style={[styles.priceTag, { backgroundColor: theme.colors.primary }]}
        >
          <Text
            style={[styles.priceTagText, { color: theme.colors.onPrimary }]}
          >
            ETB {listing.price?.toLocaleString() || "0"}
          </Text>
        </View>

        {/* Badge for negotiable */}
        {listing.negotiable && (
          <View
            style={[styles.negotiableBadge, { backgroundColor: "#10B981" }]}
          >
            <MaterialCommunityIcons
              name="handshake"
              size={12}
              color="#FFFFFF"
            />
            <Text style={styles.negotiableText}>Negotiable</Text>
          </View>
        )}

        {/* Seller Type Badge */}
        {listing.seller?.is_dealer && (
          <View style={[styles.dealerBadge, { backgroundColor: "#3B82F6" }]}>
            <MaterialCommunityIcons name="store" size={12} color="#FFFFFF" />
            <Text style={styles.dealerText}>Dealer</Text>
          </View>
        )}
      </View>

      {/* Car Content */}
      <View style={styles.listingContent}>
        <View style={styles.carHeader}>
          <View style={styles.carTitleContainer}>
            <Text style={[styles.carTitle, { color: theme.colors.onSurface }]}>
              {listing.year} {listing.make} {listing.model}
            </Text>
            <View style={styles.verifiedContainer}>
              <MaterialCommunityIcons
                name="check-circle"
                size={16}
                color="#10B981"
              />
            </View>
          </View>
          <Text
            style={[
              styles.carSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {listing.condition} • {listing.transmission} • {listing.fuel_type}
          </Text>
        </View>

        <View style={styles.carDetails}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="speedometer"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.detailText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {listing.mileage?.toLocaleString() || "0"} km
            </Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.detailText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {listing.region || "Location not specified"}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="calendar"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.detailText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Listed {new Date(listing.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Seller Info */}
        <View
          style={[
            styles.sellerInfo,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <View style={styles.sellerNameContainer}>
            <MaterialCommunityIcons
              name={listing.seller?.is_dealer ? "store" : "account"}
              size={16}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.sellerName, { color: theme.colors.onSurface }]}
            >
              {listing.seller?.company_name ||
                listing.seller?.username ||
                "Private Seller"}
            </Text>
          </View>
          <View style={styles.viewCount}>
            <MaterialCommunityIcons
              name="eye"
              size={14}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.viewCountText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {listing.views || 0} views
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            style={[
              styles.messageButton,
              { borderColor: theme.colors.outline },
            ]}
            onPress={onMessagePress}
            textColor={theme.colors.primary}
          >
            Message
          </Button>
          <IconButton
            icon="phone"
            mode="contained"
            size={20}
            style={[
              styles.callButton,
              { backgroundColor: theme.colors.primary },
            ]}
            iconColor={theme.colors.onPrimary}
            onPress={onCallPress}
          />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  listingCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    position: "relative",
    height: 220,
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
    top: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
  priceTagText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "System",
  },
  negotiableBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  negotiableText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  dealerBadge: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  dealerText: {
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
    marginBottom: 6,
  },
  carTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    fontFamily: "System",
  },
  carSubtitle: {
    fontSize: 14,
  },
  verifiedContainer: {
    marginLeft: 8,
  },
  carDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    fontFamily: "System",
  },
  sellerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  sellerNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "System",
  },
  viewCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewCountText: {
    fontSize: 12,
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
    borderRadius: 12,
    height: 48,
    width: 48,
  },
  // Skeleton styles
  skeletonImage: {
    width: "100%",
    height: "100%",
  },
  skeletonPriceTag: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 80,
    height: 32,
    borderRadius: 8,
  },
  skeletonTitle: {
    width: "70%",
    height: 24,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonDetail: {
    width: 60,
    height: 16,
    borderRadius: 4,
  },
  skeletonButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
  },
  skeletonCallButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
});
