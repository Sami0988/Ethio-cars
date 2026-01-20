import { getFontSize, getSpacing } from "@/src/utils/responsive";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, FlatList, Image, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Chip,
  IconButton,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuthStore } from "../../features/auth/auth.store";
import { useCarListings, useDeleteCar } from "../../features/cars/car.hooks";
import { CarListing } from "../../features/cars/car.types";

const MyPostsScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const deleteMutation = useDeleteCar();
  const { isAuthenticated } = useAuthStore();

  const {
    data: listingsData,
    isLoading,
    error,
    refetch,
  } = useCarListings(1, 20);
  const listings = listingsData?.data?.listings || [];

  // Unauthenticated UI
  if (!isAuthenticated) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.signInPrompt}>
          <MaterialCommunityIcons
            name="account-circle-outline"
            size={80}
            color={theme.colors.onBackground}
          />
          <Text
            style={[styles.signInTitle, { color: theme.colors.onBackground }]}
          >
            Please signup or login first
          </Text>
          <Text
            style={[
              styles.signInSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Sign in to manage your posts and access all features
          </Text>
          <Button
            mode="contained"
            style={[
              styles.signInButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => router.push("/(auth)/login")}
            textColor={theme.colors.onPrimary}
          >
            Sign In
          </Button>
        </View>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "#10B981";
      case "Pending":
        return "#F59E0B";
      case "Sold":
        return "#6B7280";
      default:
        return "#EF4444";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return "check-circle";
      case "Pending":
        return "clock";
      case "Sold":
        return "cash-check";
      default:
        return "alert-circle";
    }
  };

  const handleDelete = (listingId: number) => {
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
          onPress: () => {
            deleteMutation.mutate(listingId, {
              onSuccess: () => {
                Alert.alert("Success", "Listing deleted successfully");
                refetch();
              },
              onError: (error: any) => {
                Alert.alert("Error", "Failed to delete listing");
              },
            });
          },
        },
      ],
    );
  };

  const renderListing = ({ item }: { item: CarListing }) => (
    <Card style={styles.listingCard} elevation={2}>
      <Card.Content>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          {item.primary_image || item.thumbnail ? (
            <Image
              source={{ uri: item.primary_image || item.thumbnail }}
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
                size={40}
                color={theme.colors.onSurfaceVariant}
              />
            </View>
          )}
          <View style={styles.statusOverlay}>
            <Chip
              icon={getStatusIcon(item.status)}
              textStyle={styles.statusText}
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              {item.status}
            </Chip>
          </View>
        </View>

        {/* Car Info */}
        <View style={styles.listingHeader}>
          <View style={styles.listingInfo}>
            <Text style={styles.carTitle}>
              {item.year} {item.make} {item.model}
            </Text>
          </View>
        </View>

        <View style={styles.listingDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailText}>
              ETB {item.price.toLocaleString()}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="speedometer"
              size={16}
              color="#6B7280"
            />
            <Text style={styles.detailText}>
              {item.mileage.toLocaleString()} km
            </Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="eye" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.views} views</Text>
          </View>
        </View>

        <View style={styles.listingActions}>
          <Button
            mode="outlined"
            style={styles.actionButton}
            onPress={() => router.push(`/car/${item.listing_id}`)}
          >
            View Details
          </Button>
          <IconButton
            icon="pencil"
            mode="contained-tonal"
            size={20}
            onPress={() => router.push(`/edit-car/${item.listing_id}`)}
          />
          <IconButton
            icon="delete"
            mode="contained-tonal"
            size={20}
            onPress={() => handleDelete(item.listing_id)}
            style={styles.deleteButton}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="car-off"
        size={64}
        color={theme.colors.primary}
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
        No posts found
      </Text>
      <Text
        style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        Create your first car listing to get started
      </Text>
      <Button
        mode="contained"
        style={styles.createButton}
        onPress={() => router.push("/create")}
        icon="plus"
      >
        Create Listing
      </Button>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <Surface
        style={[styles.header, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            My Posts
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </Surface>

      {/* Listings */}
      <FlatList
        data={listings}
        renderItem={renderListing}
        keyExtractor={(item) => item.listing_id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        refreshing={isLoading}
        onRefresh={refetch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  signInPrompt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  signInTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  signInSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  signInButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  header: {
    elevation: 2,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: getSpacing(4, 6, 8),
  },
  title: {
    fontSize: getFontSize(18, 20, 22),
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: getSpacing(40, 48, 56),
  },
  listContainer: {
    paddingHorizontal: getSpacing(12, 16, 20),
    paddingBottom: getSpacing(80, 100, 120),
  },
  listingCard: {
    marginBottom: getSpacing(12, 16, 20),
    borderRadius: 12,
  },
  imageContainer: {
    height: 180,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: getSpacing(12, 16, 20),
    position: "relative",
  },
  carImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  statusOverlay: {
    position: "absolute",
    top: getSpacing(8, 10, 12),
    right: getSpacing(8, 10, 12),
  },
  listingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: getSpacing(8, 12, 16),
  },
  listingInfo: {
    flex: 1,
  },
  carTitle: {
    fontSize: getFontSize(16, 18, 20),
    fontWeight: "bold",
    marginBottom: getSpacing(3, 4, 6),
  },
  listingId: {
    fontSize: getFontSize(10, 12, 14),
    color: "#6B7280",
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusChip: {
    borderRadius: 16,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: getFontSize(10, 12, 14),
    fontWeight: "500",
  },
  listingDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: getSpacing(12, 16, 20),
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: getSpacing(3, 4, 6),
  },
  detailText: {
    fontSize: getFontSize(12, 14, 16),
    color: "#6B7280",
  },
  listingActions: {
    flexDirection: "row",
    gap: getSpacing(6, 8, 10),
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  createButton: {
    borderRadius: 8,
  },
});

export default MyPostsScreen;
