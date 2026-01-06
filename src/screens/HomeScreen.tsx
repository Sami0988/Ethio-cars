// screens/HomeScreen.tsx
import { useRouter } from "expo-router";
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
  Platform,
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
  Divider,
  IconButton,
  Searchbar,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import CarCard from "../components/CarCard";
import FilterModal from "../components/FilterModal";
import { customColors } from "../constants/colors";
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
import { useThemeStore } from "../features/theme/theme.store";

const { width, height } = Dimensions.get("window");

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const colors = customColors[isDarkMode ? "dark" : "light"];

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

  // Extract all listings - FIXED: Remove duplicates
  const allListings = useMemo(() => {
    if (!data?.pages) return [];

    const allItems = data.pages.flatMap((page) => page.data?.listings || []);

    // Remove duplicates using a Set
    const uniqueItems = Array.from(
      new Map(allItems.map((item) => [item.listing_id, item])).values()
    );

    return uniqueItems;
  }, [data]);

  const totalListings = data?.pages[0]?.data?.pagination?.total || 0;

  // Handle scroll for animations
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: headerScrollAnim } } }],
    { useNativeDriver: false }
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
        ]
      );
      return;
    }

    // If authenticated, proceed with call
    // TODO: Update when phone number is available in the API
    Alert.alert(
      "Call Feature",
      "This feature will be available once phone numbers are integrated with the listings."
    );
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
      setShowScrollTop(value > 400);
    });

    return () => {
      headerScrollAnim.removeListener(listener as any);
    };
  }, []);

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
      outputRange: [0, -60],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeText, { color: theme.colors.onSurface }]}>
            {user
              ? `Welcome back, ${user.first_name || user.username}!`
              : "Welcome to EthioCars!"}
          </Text>
          <Text
            style={[
              styles.subWelcomeText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {totalListings.toLocaleString()} cars available
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
                Cars Listed
              </Text>
            </View>
          </View>

          <Divider style={styles.statDivider} />

          <View style={styles.statItem}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: "#10B98120" },
              ]}
            >
              <MaterialCommunityIcons
                name="trending-up"
                size={20}
                color="#10B981"
              />
            </View>
            <View style={styles.statTextContainer}>
              <Text
                style={[styles.statNumber, { color: theme.colors.onSurface }]}
              >
                {priceRangeData?.data?.min_price
                  ? `ETB ${priceRangeData.data.min_price.toLocaleString()}`
                  : "..."}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Starting From
              </Text>
            </View>
          </View>

          <Divider style={styles.statDivider} />

          <View style={styles.statItem}>
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: "#3B82F620" },
              ]}
            >
              <MaterialCommunityIcons
                name="shield-check"
                size={20}
                color="#3B82F6"
              />
            </View>
            <View style={styles.statTextContainer}>
              <Text
                style={[styles.statNumber, { color: theme.colors.onSurface }]}
              >
                98%
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Verified
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
              icon="sort"
              onPress={() => setShowFilters(true)}
              style={styles.quickFilterChip}
              mode={filters.sort !== "newest" ? "flat" : "outlined"}
              selected={filters.sort !== "newest"}
            >
              Sort: {SORT_OPTIONS.find((s) => s.value === filters.sort)?.label}
            </Chip>

            {filters.make && (
              <Chip
                icon="car"
                onPress={() =>
                  setFilters((prev) => ({ ...prev, make: undefined }))
                }
                style={styles.quickFilterChip}
                mode="flat"
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
                style={styles.quickFilterChip}
                mode="flat"
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
              style={[
                styles.quickFilterChip,
                { backgroundColor: theme.colors.primary },
              ]}
              textStyle={{ color: "#FFFFFF" }}
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
          <Button
            mode="text"
            onPress={() => router.push("/browse")}
            textColor={theme.colors.primary}
            compact
            icon="arrow-right"
          >
            View All
          </Button>
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
      onCallPress={() => handleCallPress(item)}
      onSavePress={() => {}}
    />
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {/* Fixed Header */}
      {!showSearch && (
        <View
          style={[
            styles.fixedHeader,
            {
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          <View style={styles.fixedHeaderContent}>
            <Text
              style={[
                styles.fixedHeaderTitle,
                { color: theme.colors.onSurface },
              ]}
            >
              EthioCars
            </Text>
            <View style={styles.fixedHeaderIcons}>
              <IconButton
                icon="theme-light-dark"
                size={20}
                iconColor={theme.colors.onSurface}
                onPress={toggleTheme}
              />
            </View>
          </View>
        </View>
      )}

      {/* Main Content */}
      <FlatList
        ref={scrollRef}
        data={allListings}
        renderItem={renderCarItem}
        keyExtractor={getItemKey}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          {
            paddingTop: !showSearch ? (Platform.OS === "ios" ? 100 : 80) : 20,
          },
        ]}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3} // Changed from 0.5 to 0.3 for earlier trigger
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

      <Animated.View
        style={[
          styles.fabContainer,
          {
            opacity: fabAnim,
            transform: [{ scale: fabAnim }],
          },
        ]}
      >
        {showScrollTop && (
          <TouchableOpacity
            style={[
              styles.fab,
              styles.secondaryFab,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={() =>
              scrollRef.current?.scrollToOffset({ offset: 0, animated: true })
            }
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="arrow-up"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.fab,
            styles.secondaryFab,
            { backgroundColor: theme.colors.surface },
            (!hasNextPage || isFetchingNextPage) && { opacity: 0.5 },
          ]}
          onPress={loadMore}
          activeOpacity={0.8}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          <MaterialCommunityIcons
            name="arrow-down"
            size={22}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push("/create")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

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
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 16,
    height: Platform.OS === "ios" ? 90 : 70,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
    elevation: 4,
  },
  fixedHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 40,
  },
  fixedHeaderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "System",
  },
  fixedHeaderIcons: {
    flexDirection: "row",
    gap: 4,
  },
  headerContainer: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  brandContainer: {
    flexDirection: "column",
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
  topBarIcons: {
    flexDirection: "row",
    gap: 4,
  },
  welcomeContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "System",
    lineHeight: 32,
  },
  subWelcomeText: {
    fontSize: 16,
    fontFamily: "System",
    marginTop: 6,
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
});

export default HomeScreen;
