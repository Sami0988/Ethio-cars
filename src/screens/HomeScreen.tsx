// screens/HomeScreen.tsx
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Linking,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Chip,
  Searchbar,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import CarCard from "../components/CarCard";
import FilterModal from "../components/FilterModal";
import { useAuthStore } from "../features/auth/auth.store";
import {
  useCarPriceRange,
  useCarStats,
  useInfiniteCarListings,
} from "../features/cars/car.hooks";
import {
  CarFilters,
  CarListing,
  SORT_OPTIONS,
} from "../features/cars/car.types";

const { width, height } = Dimensions.get("window");

// Responsive utilities
const isSmallScreen = width < 375;
const isTablet = width >= 768;
const isLargeTablet = width >= 1024;

const getResponsiveValue = (
  phone: number,
  tablet: number,
  largeTablet?: number,
) => {
  if (isLargeTablet && largeTablet) return largeTablet;
  return isTablet ? tablet : phone;
};

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [filters, setFilters] = useState<CarFilters>({
    sort: "newest",
    limit: 20,
  });

  // Debounced filters: prevent fetching on every keystroke
  const [debouncedFilters, setDebouncedFilters] = useState<CarFilters>(() => ({
    ...filters,
    search: undefined,
  }));

  // Update debouncedFilters after a short delay when `searchQuery` or `filters` change
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters((prev) => ({
        ...prev,
        ...filters,
        search: searchQuery || undefined,
      }));
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [searchQuery, filters]);

  // Animation refs
  const headerScrollAnim = useRef(new Animated.Value(0)).current;
  const searchBarAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<FlatList>(null);

  // Fetch data
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteCarListings(20, debouncedFilters);

  const { data: statsData, isLoading: statsLoading } = useCarStats();
  const { data: priceRangeData } = useCarPriceRange();

  // Smart cache refresh - only refetch if data is stale
  useFocusEffect(
    useCallback(() => {
      const lastFetch = queryClient.getQueryData(["lastFetch"]);
      const now = Date.now();

      // Only refetch if data is older than 30 seconds
      if (!lastFetch || now - (lastFetch as number) > 30000) {
        refetch();
        queryClient.setQueryData(["lastFetch"], now);
      }
    }, [refetch, queryClient]),
  );

  // Extract all listings - FIXED: Remove duplicates
  const allListings = useMemo(() => {
    if (!data?.pages) return [];

    const allItems = data.pages.flatMap((page) => page.data?.listings || []);

    // Remove duplicates using a Set
    const uniqueItems = Array.from(
      new Map(allItems.map((item) => [item.listing_id, item])).values(),
    );

    return uniqueItems;
  }, [data]);

  const totalListings = data?.pages[0]?.data?.pagination?.total || 0;

  // Handle scroll for animations
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: headerScrollAnim } } }],
    { useNativeDriver: false },
  );

  // Load more function
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Apply filters
  const handleApplyFilters = (newFilters: CarFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({ sort: "newest", limit: 20 });
    setSearchQuery("");
  };

  // Toggle search bar
  const toggleSearch = () => {
    Animated.timing(searchBarAnim, {
      toValue: showSearch ? 0 : 1,
      duration: 300,
      // Animates `height` and `marginBottom` which are not supported by the
      // native driver; use the JS driver instead to avoid runtime errors.
      useNativeDriver: false,
    }).start();
    setShowSearch(!showSearch);
  };

  // Perform an immediate search (used when user taps search icon or submits)
  const performSearch = () => {
    // Apply current filters immediately with the current search query
    setDebouncedFilters((prev) => ({
      ...prev,
      ...filters,
      search: searchQuery || undefined,
    }));
    // Close the search UI
    setShowSearch(false);
    // Scroll to top so user sees results from page 1
    scrollRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // Handle call button press with authentication check
  const handleCallPress = (listing: CarListing) => {
    if (!isAuthenticated) {
      Alert.alert(
        "Authentication Required",
        "Please sign in or create an account to call the seller.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Sign In",
            onPress: () => router.push("/(auth)/login"),
          },
          {
            text: "Sign Up",
            onPress: () => router.push("/(auth)/register"),
          },
        ],
      );
      return;
    }

    // Get the phone number (prefer company phone for dealers, otherwise use personal phone)
    const phoneNumber = listing.seller?.is_dealer
      ? listing.seller?.company_phone || listing.seller?.phone
      : listing.seller?.phone;

    if (!phoneNumber) {
      Alert.alert(
        "Please Try Again Later",
        "Phone number not available at the moment.",
      );
      return;
    }

    // Open phone dialer
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert(
        "Please Try Again Later",
        "Unable to make call at the moment. Please try again later.",
      );
    });
  };

  // Handle message button press with authentication check
  const handleMessagePress = (listing: CarListing) => {
    if (!isAuthenticated) {
      Alert.alert(
        "Authentication Required",
        "Please sign in or create an account to message the seller.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Sign In",
            onPress: () => router.push("/(auth)/login"),
          },
          {
            text: "Sign Up",
            onPress: () => router.push("/(auth)/register"),
          },
        ],
      );
      return;
    }

    // Navigate to chat screen with seller info
    router.push({
      pathname: "/chat",
      params: {
        otherUserId: listing.seller?.user_id || "",
        otherUserName: listing.seller?.username || "Seller",
        listingId: listing.listing_id.toString(),
      },
    });
  };

  // Animation for FAB
  useEffect(() => {
    const listener = headerScrollAnim.addListener(({ value }) => {
      // hide FAB when scrolled far down
      if (value > 100) {
        Animated.timing(fabAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(fabAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }

      // show scroll-to-top button after a threshold
      setShowScrollTop(value > 200);
    });

    return () => {
      headerScrollAnim.removeListener(listener as any);
    };
  }, []);

  // Safe area insets used for spacing
  const insets = useSafeAreaInsets();

  // Approximate header height (used as fallback until we measure it)
  const headerHeight = 140 + (showSearch ? 56 : 0);
  const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState<number>(0);

  // Get unique key for each item
  const getItemKey = (item: CarListing, index: number): string => {
    if (!item?.listing_id) {
      return `item-${index}-${Date.now()}`;
    }
    return `listing-${item.listing_id}`;
  };

  // Render header
  const renderHeader = () => {
    const headerOpacity = headerScrollAnim.interpolate({
      inputRange: [0, 80],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    const headerTranslateY = headerScrollAnim.interpolate({
      inputRange: [0, 80],
      // don't translate the header further than its height so it doesn't disappear
      outputRange: [
        0,
        -(measuredHeaderHeight > 0
          ? Math.min(measuredHeaderHeight, 120)
          : Math.abs(Math.max(-headerHeight, -60))),
      ],
      extrapolate: "clamp",
    });

    const chipBg = "#F3F4F6";
    const chipText = "#374151";

    return (
      <Animated.View
        onLayout={(e) => setMeasuredHeaderHeight(e.nativeEvent.layout.height)}
        style={[
          styles.headerContainer,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        {/* EthioCars Logo */}
        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, { color: theme.colors.primary }]}>
            EthioCars
          </Text>
        </View>

        {/* Search Bar */}
        <Animated.View
          style={[
            styles.searchContainer,
            {
              height: searchBarAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 56],
              }),
              opacity: searchBarAnim,
              marginBottom: searchBarAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 16],
              }),
            },
          ]}
        >
          <Searchbar
            placeholder="Search cars, makes, models..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={theme.colors.primary}
            onSubmitEditing={() => performSearch()}
            onIconPress={() => performSearch()}
            clearIcon="close"
          />
        </Animated.View>

        {/* Quick Stats */}
        <Surface
          style={[
            styles.statsSurface,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.statItem}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: theme.colors.primary + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name="car"
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.statTextContainer}>
              <Text
                style={[styles.statNumber, { color: theme.colors.onSurface }]}
              >
                {statsLoading
                  ? "..."
                  : (
                      statsData?.data?.total_listings || totalListings
                    ).toLocaleString()}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Currently available cars
              </Text>
            </View>
          </View>
        </Surface>

        {/* Quick Filters */}
        <View style={styles.quickFiltersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickFiltersScroll}
          >
            <Chip
              onPress={() => setShowFilters(true)}
              style={[styles.quickFilterChip, { backgroundColor: chipBg }]}
              mode={filters.sort !== "newest" ? "flat" : "outlined"}
              selected={filters.sort !== "newest"}
              textStyle={{ color: chipText }}
            >
              Sort: {SORT_OPTIONS.find((s) => s.value === filters.sort)?.label}
            </Chip>

            {/* Applied Filters (displayed between Sort and More Filters) */}
            {filters.bodyType && (
              <Chip
                icon="car"
                onPress={() =>
                  setFilters((prev) => ({ ...prev, bodyType: undefined }))
                }
                style={[styles.quickFilterChip, { backgroundColor: chipBg }]}
                mode="flat"
                textStyle={{ color: chipText }}
              >
                {filters.bodyType}
              </Chip>
            )}

            {filters.fuelType && (
              <Chip
                icon="fuel"
                onPress={() =>
                  setFilters((prev) => ({ ...prev, fuelType: undefined }))
                }
                style={[styles.quickFilterChip, { backgroundColor: chipBg }]}
                mode="flat"
                textStyle={{ color: chipText }}
              >
                {filters.fuelType}
              </Chip>
            )}

            {filters.transmission && (
              <Chip
                icon="car-gear"
                onPress={() =>
                  setFilters((prev) => ({ ...prev, transmission: undefined }))
                }
                style={[styles.quickFilterChip, { backgroundColor: chipBg }]}
                mode="flat"
                textStyle={{ color: chipText }}
              >
                {filters.transmission}
              </Chip>
            )}

            {filters.negotiable === true && (
              <Chip
                icon="handshake"
                onPress={() =>
                  setFilters((prev) => ({ ...prev, negotiable: undefined }))
                }
                style={[styles.quickFilterChip, { backgroundColor: chipBg }]}
                mode="flat"
                textStyle={{ color: chipText }}
              >
                Negotiable
              </Chip>
            )}

            {filters.make && (
              <Chip
                icon="car"
                onPress={() =>
                  setFilters((prev) => ({ ...prev, make: undefined }))
                }
                style={[styles.quickFilterChip, { backgroundColor: chipBg }]}
                mode="flat"
                textStyle={{ color: chipText }}
              >
                {filters.make}
              </Chip>
            )}

            {(filters.minPrice || filters.maxPrice) && (
              <Chip
                icon="currency-usd"
                onPress={() =>
                  setFilters((prev) => ({
                    ...prev,
                    minPrice: undefined,
                    maxPrice: undefined,
                  }))
                }
                style={[styles.quickFilterChip, { backgroundColor: chipBg }]}
                mode="flat"
                textStyle={{ color: chipText }}
              >
                {filters.minPrice
                  ? `From ${filters.minPrice.toLocaleString()}`
                  : ""}
                {filters.maxPrice
                  ? ` To ${filters.maxPrice.toLocaleString()}`
                  : ""}
              </Chip>
            )}

            <Chip
              icon="filter"
              onPress={() => setShowFilters(true)}
              style={[styles.quickFilterChip, { backgroundColor: chipBg }]}
              mode="flat"
              textStyle={{ color: chipText }}
            >
              More Filters
            </Chip>
          </ScrollView>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Latest Listings
            </Text>
            <Text
              style={[
                styles.sectionSubtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {allListings.length} cars found
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text
            style={[
              styles.loadingText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Loading more cars...
          </Text>
        </View>
      );
    }

    if (!hasNextPage && allListings.length > 0) {
      return (
        <View style={styles.endFooter}>
          <MaterialCommunityIcons
            name="check-circle"
            size={32}
            color={theme.colors.primary}
          />
          <Text style={[styles.endText, { color: theme.colors.onSurface }]}>
            You've reached the end
          </Text>
          <Text
            style={[
              styles.endSubtext,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            No more cars available
          </Text>
        </View>
      );
    }

    if (allListings.length === 0 && !isLoading && !error) {
      return (
        <View style={styles.emptyFooter}>
          <MaterialCommunityIcons
            name="car-off"
            size={64}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
            No cars found
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Try adjusting your search or filters
          </Text>
          <Button
            mode="outlined"
            onPress={handleClearFilters}
            style={styles.clearFiltersButton}
            icon="filter-off"
          >
            Clear All Filters
          </Button>
        </View>
      );
    }

    return <View style={styles.footerSpacer} />;
  };

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map((item) => (
            <View key={`skeleton-${item}`} style={styles.skeletonCard}>
              <View
                style={[
                  styles.skeletonImage,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              />
              <View style={styles.skeletonContent}>
                <View
                  style={[
                    styles.skeletonTitle,
                    { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                />
                <View style={styles.skeletonDetails}>
                  <View
                    style={[
                      styles.skeletonDetail,
                      { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                  />
                  <View
                    style={[
                      styles.skeletonDetail,
                      { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                  />
                </View>
                <View style={styles.skeletonButtons}>
                  <View
                    style={[
                      styles.skeletonButton,
                      { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                  />
                  <View
                    style={[
                      styles.skeletonButton,
                      { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="car-off"
            size={80}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={[styles.errorTitle, { color: theme.colors.onSurface }]}>
            Couldn't load listings
          </Text>
          <Text
            style={[
              styles.errorSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {error.message || "Network error. Please try again."}
          </Text>
          <Button
            mode="contained"
            onPress={() => refetch()}
            style={styles.retryButton}
            icon="refresh"
            contentStyle={styles.retryButtonContent}
          >
            Try Again
          </Button>
        </View>
      );
    }

    return null;
  };

  // Render car item
  const renderCarItem = ({
    item,
    index,
  }: {
    item: CarListing;
    index: number;
  }) => (
    <CarCard
      listing={item}
      index={index}
      onPress={() => router.push(`/car/${item.listing_id}`)}
      onMessagePress={() => handleMessagePress(item)}
    />
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />

      {/* Main Content */}
      <FlatList
        ref={scrollRef}
        data={allListings}
        renderItem={renderCarItem}
        keyExtractor={(item) => item.listing_id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          {
            // Add comfortable padding to show welcome text below fixed header
            paddingTop: getResponsiveValue(56, 64, 72),
            paddingBottom: insets.bottom + 24,
          },
        ]}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.surface}
          />
        }
      />

      {/* Floating Action Button */}
      {isFetchingNextPage && (
        <View
          style={[
            styles.bottomLoadingBar,
            { backgroundColor: theme.colors.surface },
          ]}
          pointerEvents="none"
        >
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text
            style={[
              styles.bottomLoadingText,
              { color: theme.colors.onSurface },
            ]}
          >
            Loading more cars...
          </Text>
        </View>
      )}

      {/* Scroll to Top Button */}
      {true && (
        <Animated.View
          style={[
            styles.scrollTopContainer,
            {
              opacity: 1,
              transform: [{ scale: 1 }],
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.scrollTopButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() =>
              scrollRef.current?.scrollToOffset({ offset: 0, animated: true })
            }
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="arrow-up" size={24} color="white" />
            <Text style={styles.scrollTopText}>Top</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        priceRange={
          priceRangeData?.data
            ? {
                min: priceRangeData.data.min_price || 0,
                max: priceRangeData.data.max_price || 10000000,
              }
            : undefined
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 0,
    elevation: 6,
    height: getResponsiveValue(40, 48, 56),
    paddingTop: 0,
    marginTop: 0,
  },
  fixedHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: getResponsiveValue(32, 40, 48),
    paddingHorizontal: getResponsiveValue(12, 16, 20),
    paddingVertical: 0,
    paddingTop: 0,
    marginTop: 0,
  },
  brandText: {
    fontSize: getResponsiveValue(18, 22, 26),
    fontWeight: "800",
    fontFamily: "System",
    letterSpacing: -0.5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  fixedHeaderIcons: {
    flexDirection: "row",
    gap: 8,
  },
  leftHeaderSection: {
    flex: 1,
    alignItems: "flex-start",
  },
  rightHeaderSection: {
    flex: 1,
    alignItems: "flex-end",
  },
  carIconContainer: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 6,
  },
  themeButton: {
    borderRadius: 20,
    width: 40,
    height: 40,
  },
  headerContainer: {
    // padding is applied dynamically using safe area insets
    paddingBottom: getResponsiveValue(0, 1, 2),
    backgroundColor: "transparent",
    paddingVertical: 0,
    minHeight: getResponsiveValue(25, 30, 35),
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  brandName: {
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: "System",
  },
  brandTagline: {
    fontSize: 14,
    fontFamily: "System",
    marginTop: 2,
  },
  welcomeContainer: {
    paddingHorizontal: getResponsiveValue(16, 20, 24),
    marginBottom: getResponsiveValue(8, 12, 16),
    marginTop: getResponsiveValue(4, 6, 8),
  },
  welcomeText: {
    fontSize: getResponsiveValue(24, 28, 32),
    fontWeight: "bold",
    fontFamily: "System",
    lineHeight: getResponsiveValue(28, 32, 36),
    marginBottom: 0,
  },
  subWelcomeText: {
    fontSize: getResponsiveValue(14, 16, 18),
    fontFamily: "System",
    marginTop: getResponsiveValue(0, 1, 2),
  },
  logoContainer: {
    alignItems: "flex-start",
    paddingTop: 0,
    paddingBottom: getResponsiveValue(4, 6, 8),
    paddingLeft: getResponsiveValue(16, 20, 24),
  },
  logoText: {
    fontSize: getResponsiveValue(24, 28, 32),
    fontWeight: "bold",
    fontFamily: "System",
    letterSpacing: -0.5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  searchBar: {
    borderRadius: 12,
    elevation: 2,
    height: 48,
  },
  searchInput: {
    fontSize: 16,
  },
  statsSurface: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statTextContainer: {
    flexDirection: "column",
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "System",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "System",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E5E7EB",
  },
  quickFiltersContainer: {
    marginBottom: 20,
  },
  quickFiltersScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  quickFilterChip: {
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "System",
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: "System",
    marginTop: 4,
  },
  listContainer: {
    paddingBottom: 120,
  },
  skeletonContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  skeletonCard: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#FFF",
    elevation: 2,
  },
  skeletonImage: {
    width: "100%",
    height: 200,
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonTitle: {
    width: "70%",
    height: 20,
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  skeletonDetail: {
    width: 60,
    height: 16,
    borderRadius: 4,
  },
  skeletonButtons: {
    flexDirection: "row",
    gap: 12,
  },
  skeletonButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
  },
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "System",
  },
  endFooter: {
    alignItems: "center",
    padding: 40,
    gap: 12,
  },
  endText: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "System",
    marginTop: 8,
  },
  endSubtext: {
    fontSize: 14,
    fontFamily: "System",
    marginBottom: 20,
  },
  emptyFooter: {
    alignItems: "center",
    padding: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 8,
    fontFamily: "System",
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    fontFamily: "System",
  },
  clearFiltersButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  footerSpacer: {
    height: 20,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    minHeight: height * 0.6,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 8,
    fontFamily: "System",
  },
  errorSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
    fontFamily: "System",
  },
  retryButton: {
    borderRadius: 12,
    paddingHorizontal: 32,
  },
  retryButtonContent: {
    height: 48,
  },
  fabContainer: {
    position: "absolute",
    bottom: 30,
    right: 20,
    gap: 12,
  },
  bottomLoadingBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 110,
    zIndex: 250,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    elevation: 6,
  },
  bottomLoadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  secondaryFab: {
    elevation: 4,
  },
  scrollTopContainer: {
    position: "absolute",
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
  scrollTopButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    gap: 6,
  },
  scrollTopText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "System",
  },
});

export default HomeScreen;
