import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Chip,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useCarListings } from "../../features/cars/car.hooks";
import { CarListing } from "../../features/cars/car.types";

const MyListingsScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const {
    data: listingsData,
    isLoading,
    error,
    refetch,
  } = useCarListings(
    1,
    20,
    selectedStatus === "all" ? undefined : selectedStatus,
  );
  const listings = listingsData?.data?.listings || [];

  const statusFilters = [
    { id: "all", label: "All Listings", icon: "car" },
    { id: "Active", label: "Active", icon: "check-circle" },
    { id: "Pending", label: "Pending", icon: "clock" },
    { id: "Sold", label: "Sold", icon: "cash-check" },
  ];

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

  const renderListing = ({ item }: { item: CarListing }) => (
    <Card style={styles.listingCard} elevation={2}>
      <Card.Content>
        <View style={styles.listingHeader}>
          <View style={styles.listingInfo}>
            <Text style={styles.carTitle}>
              {item.year} {item.make} {item.model}
            </Text>
            <Text style={styles.listingId}>ID: {item.listing_id}</Text>
          </View>
          <View style={styles.statusContainer}>
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

        <View style={styles.listingDetails}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="currency-etb"
              size={16}
              color="#6B7280"
            />
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
            onPress={() => router.push(`/edit/${item.listing_id}`)}
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
        No listings found
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          My Listings
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push("/create")}
          icon="plus"
          style={styles.addButton}
        >
          Add New
        </Button>
      </View>

      {/* Status Filters */}
      <View style={styles.filtersContainer}>
        {statusFilters.map((filter) => (
          <Chip
            key={filter.id}
            selected={selectedStatus === filter.id}
            onPress={() => setSelectedStatus(filter.id)}
            style={styles.filterChip}
            textStyle={
              selectedStatus === filter.id
                ? styles.selectedFilterText
                : styles.filterText
            }
          >
            {filter.label}
          </Chip>
        ))}
      </View>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    borderRadius: 8,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: "#F3F4F6",
  },
  filterText: {
    color: "#374151",
  },
  selectedFilterText: {
    color: "#FFFFFF",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  listingCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  listingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  listingInfo: {
    flex: 1,
  },
  carTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  listingId: {
    fontSize: 12,
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
    fontSize: 12,
    fontWeight: "500",
  },
  listingDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#6B7280",
  },
  listingActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
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

export default MyListingsScreen;
