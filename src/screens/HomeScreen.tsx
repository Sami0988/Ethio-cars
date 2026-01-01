import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Badge, Card, Chip, Surface, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { CarListing, carService } from "../services/car.service";
import { useAuthStore } from "../stores/auth.store";

const { width } = Dimensions.get("window");

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All Cars");
  const [carListings, setCarListings] = useState<CarListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filters = ["All Cars", "Under 500k ETB", "Toyota", "2018"];

  useEffect(() => {
    loadCarListings();
  }, []);

  const loadCarListings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await carService.getListings();
      if (result.success) {
        setCarListings(result.data);
      } else {
        setError(result.message || "Failed to load listings");
        // Fallback to dummy data if API fails
        setCarListings(getDummyListings());
      }
    } catch (err) {
      setError("Network error. Using sample data.");
      // Fallback to dummy data
      setCarListings(getDummyListings());
    } finally {
      setIsLoading(false);
    }
  };

  const getDummyListings = (): CarListing[] => [
    {
      id: "1",
      image:
        "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Toyota+Camry",
      year: 2018,
      make: "Toyota",
      model: "Camry",
      trim: "SE",
      mileage: "45,000 km",
      location: "Addis Ababa",
      price: 850000,
      badges: ["Verified Seller", "NEGOTIABLE"],
      isVerified: true,
      isNegotiable: true,
    },
    {
      id: "2",
      image:
        "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Toyota+Corolla",
      year: 2019,
      make: "Toyota",
      model: "Corolla",
      trim: "LE",
      mileage: "32,000 km",
      location: "Bahir Dar",
      price: 750000,
      badges: ["Dealer", "FIXED PRICE"],
      isDealer: true,
      isFixedPrice: true,
    },
    {
      id: "3",
      image:
        "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Honda+CR-V",
      year: 2020,
      make: "Honda",
      model: "CR-V",
      mileage: "28,000 km",
      location: "Hawassa",
      price: 1200000,
      badges: ["URGENT"],
      isUrgent: true,
    },
    {
      id: "4",
      image:
        "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Hyundai+Elantra",
      year: 2018,
      make: "Hyundai",
      model: "Elantra",
      mileage: "55,000 km",
      location: "Mekelle",
      price: 650000,
      badges: ["Verified Seller"],
      isVerified: true,
    },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    // TODO: Implement filter functionality
  };

  const handleCallPress = (listing: CarListing) => {
    Alert.alert(
      "Contact Seller",
      `Would you like to call the seller for the ${listing.year} ${listing.make} ${listing.model}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call", onPress: () => console.log("Calling seller...") },
      ]
    );
  };

  const renderCarListing = ({ item }: { item: CarListing }) => (
    <Card style={styles.listingCard} elevation={2}>
      <View style={styles.listingContent}>
        <Image source={{ uri: item.image }} style={styles.carImage} />

        <View style={styles.listingDetails}>
          <View style={styles.carInfo}>
            <Text style={styles.carTitle}>
              {item.year} {item.make} {item.model}
            </Text>
            {item.trim && <Text style={styles.carTrim}>{item.trim}</Text>}
            <Text style={styles.carSpecs}>{item.mileage}</Text>
            <Text style={styles.carLocation}>{item.location}</Text>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.price}>ETB {item.price.toLocaleString()}</Text>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCallPress(item)}
            >
              <MaterialCommunityIcons name="phone" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {item.badges && (
          <View style={styles.badgesContainer}>
            {item.badges.map((badge, index) => (
              <Chip
                key={index}
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      badge === "URGENT"
                        ? "#EF4444"
                        : badge === "FIXED PRICE"
                        ? "#10B981"
                        : badge === "NEGOTIABLE"
                        ? "#F59E0B"
                        : badge === "Dealer"
                        ? "#3B82F6"
                        : badge === "Verified Seller"
                        ? "#8B5CF6"
                        : "#6B7280",
                  },
                ]}
                textStyle={styles.badgeText}
              >
                {badge}
              </Chip>
            ))}
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <Surface style={styles.header} elevation={4}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.appTitle}>EthioCars</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={24}
                color={theme.colors.onSurface}
              />
              <Badge size={12} style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
        </View>
      </Surface>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color="#6B7280"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for cars..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#6B7280"
          />
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        <View style={styles.filtersRow}>
          {filters.map((filter) => (
            <Chip
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.selectedFilterChip,
              ]}
              textStyle={[
                styles.filterChipText,
                selectedFilter === filter && styles.selectedFilterChipText,
              ]}
              onPress={() => handleFilterSelect(filter)}
            >
              {filter}
            </Chip>
          ))}
        </View>
      </ScrollView>

      {/* Fresh Listings Section */}
      <View style={styles.listingsSection}>
        <Text style={styles.sectionTitle}>Fresh Listings</Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading cars...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={24}
              color="#EF4444"
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadCarListings}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={carListings}
            renderItem={renderCarListing}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listingsContainer}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="car" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>No cars available</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationButton: {
    position: "relative",
    padding: 4,
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    backgroundColor: "#F3F4F6",
  },
  selectedFilterChip: {
    backgroundColor: "#3B82F6",
  },
  filterChipText: {
    color: "#6B7280",
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: "#FFFFFF",
  },
  listingsSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  listingsContainer: {
    paddingBottom: 100, // Space for bottom nav
  },
  listingCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  listingContent: {
    padding: 12,
  },
  carImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#F3F4F6",
  },
  listingDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  carInfo: {
    flex: 1,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 2,
  },
  carTrim: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  carSpecs: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  carLocation: {
    fontSize: 12,
    color: "#6B7280",
  },
  priceSection: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 8,
  },
  callButton: {
    backgroundColor: "#059669",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 8,
  },
  badge: {
    height: 24,
  },
  badgeText: {
    fontSize: 10,
    color: "#FFFFFF",
    marginHorizontal: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default HomeScreen;
