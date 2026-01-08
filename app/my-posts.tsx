import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { apiClient } from "../src/api/apiClient";
import { useAuthStore } from "../src/features/auth/auth.store";
import { useCarListings } from "../src/features/cars/car.hooks";
import { CarListing } from "../src/features/cars/car.types";

const { width, height } = Dimensions.get("window");

export default function () {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore() as any;
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Delete and update mutations
  const queryClient = useQueryClient();

  const deleteCarMutation = {
    mutate: async (listingId: number) => {
      try {
        const response = await apiClient.delete(`/cars/${listingId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    isLoading: false,
  };

  const updateCarMutation = {
    mutate: async ({ id, data }: { id: number; data: any }) => {
      try {
        const response = await apiClient.put(`/cars/${id}`, data);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    isLoading: false,
  };

  // Fetch user's car listings
  const { data: listingsData, isLoading, refetch } = useCarListings(1, 50);
  const userListings = listingsData?.data?.listings || [];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [120, 80],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  const handleDeleteCar = (listingId: number) => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to delete this car listing? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await deleteCarMutation.mutate(listingId);
              if (response.success) {
                Alert.alert("Success", "Car listing deleted successfully", [
                  {
                    text: "OK",
                    onPress: () => {
                      refetch();
                    },
                  },
                ]);
              } else {
                Alert.alert(
                  "Error",
                  response.message || "Failed to delete car listing"
                );
              }
            } catch (error: any) {
              Alert.alert(
                "Error",
                error?.response?.data?.message ||
                  error?.message ||
                  "Failed to delete car listing"
              );
            }
          },
        },
      ]
    );
  };

  const renderCarItem = ({
    item,
    index,
  }: {
    item: CarListing;
    index: number;
  }) => {
    const translateX = fadeAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    });

    return (
      <Animated.View
        style={[
          styles.carItem,
          {
            backgroundColor: theme.colors.surface,
            transform: [{ translateX }],
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.carContent}
          onPress={() => router.push(`/car/${item.listing_id}`)}
          activeOpacity={0.7}
        >
          <View style={styles.carImageContainer}>
            <View
              style={[
                styles.carImagePlaceholder,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="car-sports"
                size={36}
                color={theme.colors.primary}
              />
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    index % 3 === 0
                      ? theme.colors.primary
                      : index % 3 === 1
                        ? theme.colors.secondary
                        : "#4CAF50",
                },
              ]}
            >
              <Text style={styles.statusText}>
                {index % 3 === 0
                  ? "Active"
                  : index % 3 === 1
                    ? "Pending"
                    : "Sold"}
              </Text>
            </View>
          </View>

          <View style={styles.carInfo}>
            <View style={styles.carHeader}>
              <Text
                style={[styles.carTitle, { color: theme.colors.onSurface }]}
              >
                {item.make} {item.model}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={theme.colors.onSurfaceVariant}
              />
            </View>

            <View style={styles.carMeta}>
              <View style={styles.carMetaItem}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={14}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.carYear,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {item.year}
                </Text>
              </View>
              {item.mileage && (
                <View style={styles.carMetaItem}>
                  <MaterialCommunityIcons
                    name="speedometer"
                    size={14}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text
                    style={[
                      styles.carDetail,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {item.mileage.toLocaleString()} mi
                  </Text>
                </View>
              )}
            </View>

            <Text style={[styles.carPrice, { color: theme.colors.primary }]}>
              ${item.price.toLocaleString()}
            </Text>

            <View style={styles.carDetails}>
              {item.fuel_type && (
                <View style={styles.detailChip}>
                  <Text
                    style={[
                      styles.detailText,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {item.fuel_type}
                  </Text>
                </View>
              )}
              {item.transmission && (
                <View style={styles.detailChip}>
                  <Text
                    style={[
                      styles.detailText,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {item.transmission}
                  </Text>
                </View>
              )}
            </View>

            {item.region && (
              <View style={styles.locationRow}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={14}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.locationText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {item.region}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => router.push(`/edit-car/${item.listing_id}`)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="pencil" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteCar(item.listing_id)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Animated.View
          style={[
            styles.animatedHeader,
            {
              height: headerHeight,
              backgroundColor:
                theme.colors.elevation?.level2 || theme.colors.surface,
              opacity: headerOpacity,
            },
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
            <Text
              style={[styles.headerTitle, { color: theme.colors.onSurface }]}
            >
              My Posts
            </Text>
            <View style={styles.headerRight} />
          </View>
        </Animated.View>

        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.skeletonCard, { opacity: fadeAnim }]}>
            <View
              style={[
                styles.skeletonImage,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            />
            <View style={styles.skeletonContent}>
              <View
                style={[
                  styles.skeletonLine,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              />
              <View
                style={[
                  styles.skeletonLine,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              />
              <View
                style={[
                  styles.skeletonLine,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              />
            </View>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Animated.View
        style={[
          styles.animatedHeader,
          {
            height: headerHeight,
            backgroundColor:
              theme.colors.elevation?.level2 || theme.colors.surface,
            opacity: headerOpacity,
          },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            My Posts
          </Text>
        </View>
      </Animated.View>

      {userListings.length === 0 ? (
        <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
          <View
            style={[
              styles.emptyIllustration,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <MaterialCommunityIcons
              name="car-convertible"
              size={72}
              color={theme.colors.primary}
            />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
            No Listings Yet
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Start selling your car today and reach thousands of buyers
          </Text>
          <TouchableOpacity
            style={[
              styles.addButtonLarge,
              {
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.primary,
              },
            ]}
            onPress={() => router.push("/add")}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="plus-circle"
              size={24}
              color={theme.colors.onPrimary}
            />
            <Text
              style={[
                styles.addButtonLargeText,
                { color: theme.colors.onPrimary },
              ]}
            >
              Create New Listing
            </Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <Animated.FlatList
          data={userListings}
          renderItem={renderCarItem}
          keyExtractor={(item) => item.listing_id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        />
      )}

      {userListings.length > 0 && (
        <TouchableOpacity
          style={[
            styles.floatingButton,
            {
              backgroundColor: theme.colors.primary,
              shadowColor: theme.colors.primary,
            },
          ]}
          onPress={() => router.push("/add")}
          activeOpacity={0.9}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: "100%",
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 40,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  list: {
    paddingTop: 140,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  carItem: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  carContent: {
    flexDirection: "row",
    padding: 16,
  },
  carImageContainer: {
    position: "relative",
    marginRight: 16,
  },
  carImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  carInfo: {
    flex: 1,
  },
  carHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  carTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  carMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  carMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  carYear: {
    fontSize: 14,
    fontWeight: "500",
  },
  carPrice: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  carDetails: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  detailChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  detailText: {
    fontSize: 12,
    fontWeight: "500",
  },
  carDetail: {
    fontSize: 12,
    fontWeight: "500",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    gap: 8,
  },
  editButton: {
    backgroundColor: "#2196F3",
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIllustration: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
    opacity: 0.8,
  },
  addButtonLarge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonLargeText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 140,
  },
  skeletonCard: {
    width: width - 40,
    height: 150,
    borderRadius: 16,
    flexDirection: "row",
    padding: 16,
    marginBottom: 16,
  },
  skeletonImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
  },
  skeletonContent: {
    flex: 1,
    justifyContent: "space-around",
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    width: "100%",
  },
});
