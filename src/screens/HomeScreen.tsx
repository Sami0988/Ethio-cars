import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Avatar,
  Button,
  Card,
  Divider,
  IconButton,
  List,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { customColors } from "../constants/colors";
import { useAuthStore } from "../features/auth/auth.store";
import { useAllCarListings } from "../features/cars/car.hooks";
import { CarListing } from "../features/cars/car.types";
import { useThemeStore } from "../features/theme/theme.store";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.75;

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const colors = customColors[isDarkMode ? "dark" : "light"];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All Cars");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const translateX = useState(new Animated.Value(-DRAWER_WIDTH))[0];

  // Use the real car data hook
  const {
    data: carListingsData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useAllCarListings(1, 20, {
    search: searchQuery || undefined,
  });

  const carListings = carListingsData?.data?.listings || [];

  // Debug: Log API data
  console.log("HomeScreen - carListingsData:", carListingsData);
  console.log("HomeScreen - carListings:", carListings);
  console.log("HomeScreen - isLoading:", isLoading);
  console.log("HomeScreen - error:", error);

  const filters = [
    { id: "all", label: "All Cars" },
    { id: "budget", label: "Under 500k" },
    { id: "toyota", label: "Toyota" },
    { id: "recent", label: "2020+" },
  ];

  const handleRefresh = () => {
    refetch();
  };

  const handleCallPress = (listing: CarListing) => {
    console.log("Calling for:", listing.listing_id);
  };

  const handleMessagePress = (listing: CarListing) => {
    console.log("Message for:", listing.listing_id);
  };

  const handleCarPress = (listing: CarListing) => {
    router.push(`/car/${listing.listing_id}`);
  };

  // Drawer functions
  const openDrawer = () => {
    setIsDrawerOpen(true);
    Animated.timing(translateX, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    Animated.timing(translateX, {
      toValue: -DRAWER_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleMenuPress = (item: string) => {
    closeDrawer();

    switch (item) {
      case "profile":
        router.push("/(tabs)/profile");
        break;
      case "messages":
        router.push("/messages");
        break;
      case "myPosts":
        router.push("/my-posts");
        break;
      case "createListing":
        router.push("/create");
        break;
      case "saved":
        router.push("/saved");
        break;
      case "settings":
        router.push("/settings");
        break;
      case "help":
        router.push("/help");
        break;
      case "about":
        router.push("/about");
        break;
      case "logout":
        // TODO: Implement logout
        console.log("Logout pressed");
        break;
    }
  };

  const renderCarListing = ({ item }: { item: CarListing }) => (
    <Card
      style={[styles.listingCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleCarPress(item)}
      elevation={2}
    >
      {/* Car Image */}
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <MaterialCommunityIcons
            name="car"
            size={80}
            color={theme.colors.onSurfaceVariant}
          />
        </View>

        {/* Price Tag */}
        <View
          style={[styles.priceTag, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.priceTagText}>
            ETB {item.price.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Car Content */}
      <View style={styles.listingContent}>
        <View style={styles.carHeader}>
          <View style={styles.carTitleContainer}>
            <Text style={[styles.carTitle, { color: theme.colors.onSurface }]}>
              {item.year} {item.make} {item.model}
            </Text>
            <View style={styles.verifiedContainer}>
              <MaterialCommunityIcons
                name="check-circle"
                size={16}
                color="#10B981"
              />
            </View>
          </View>
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
              {item.mileage.toLocaleString()} km
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
              Addis Ababa
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
            onPress={() => handleMessagePress(item)}
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
            iconColor="#FFFFFF"
            onPress={() => handleCallPress(item)}
          />
        </View>
      </View>
    </Card>
  );

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="menu"
          size={24}
          iconColor={theme.colors.onSurface}
          onPress={openDrawer}
        />
        <View style={styles.brandContainer}>
          <Text style={[styles.brandName, { color: theme.colors.onSurface }]}>
            EthioCars
          </Text>
          <Text
            style={[
              styles.brandTagline,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Drive Your Dreams
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          mode="outlined"
          placeholder="Search cars, makes, models..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[
            styles.searchInput,
            { backgroundColor: theme.colors.surface },
          ]}
          left={
            <TextInput.Icon
              icon="magnify"
              color={theme.colors.onSurfaceVariant}
            />
          }
          right={
            <TextInput.Icon
              icon="filter-variant"
              color={theme.colors.onSurfaceVariant}
            />
          }
        />
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContainer}
      >
        {filters.map((filter) => (
          <Button
            key={filter.id}
            mode={selectedFilter === filter.label ? "contained" : "outlined"}
            onPress={() => setSelectedFilter(filter.label)}
            style={[
              styles.filterChip,
              selectedFilter === filter.label && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            textColor={
              selectedFilter === filter.label ? "#FFFFFF" : theme.colors.primary
            }
            compact
          >
            {filter.label}
          </Button>
        ))}
      </ScrollView>

      {/* Stats Card */}
      <Surface
        style={[styles.statsSurface, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.onSurface }]}>
            1,245+
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Cars Listed
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.onSurface }]}>
            98%
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Verified
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.onSurface }]}>
            24h
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Avg. Response
          </Text>
        </View>
      </Surface>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <Animated.View
          style={[
            styles.overlay,
            {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              opacity: translateX.interpolate({
                inputRange: [-DRAWER_WIDTH, 0],
                outputRange: [0, 1],
              }),
            },
          ]}
          onStartShouldSetResponder={() => true}
          onResponderRelease={closeDrawer}
        />
      )}

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX }],
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <View style={styles.drawerHeader}>
          <Avatar.Text
            size={60}
            label={
              user?.first_name?.charAt(0) || user?.username?.charAt(0) || "U"
            }
            style={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.drawerUserInfo}>
            <Text
              style={[styles.drawerUserName, { color: theme.colors.onSurface }]}
            >
              {user?.first_name && user?.last_name
                ? `${user.first_name} ${user.last_name}`
                : user?.username || "User"}
            </Text>
            <Text
              style={[
                styles.drawerUserEmail,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {user?.email || "user@example.com"}
            </Text>
          </View>
          <IconButton
            icon="close"
            size={24}
            iconColor={theme.colors.onSurfaceVariant}
            onPress={closeDrawer}
          />
        </View>

        <Divider style={styles.divider} />

        <ScrollView style={styles.drawerContent}>
          <List.Item
            title="Profile"
            description="View and edit your profile"
            left={(props) => (
              <List.Icon
                {...props}
                icon="account"
                color={theme.colors.primary}
              />
            )}
            onPress={() => handleMenuPress("profile")}
          />
          <List.Item
            title="Messages"
            description="View your conversations"
            left={(props) => (
              <List.Icon
                {...props}
                icon="message"
                color={theme.colors.primary}
              />
            )}
            onPress={() => handleMenuPress("messages")}
          />
          <List.Item
            title="My Posts"
            description="Manage your car listings"
            left={(props) => (
              <List.Icon
                {...props}
                icon="format-list-bulleted"
                color={theme.colors.primary}
              />
            )}
            onPress={() => handleMenuPress("myPosts")}
          />
          <List.Item
            title="Create Listing"
            description="Add a new car listing"
            left={(props) => (
              <List.Icon
                {...props}
                icon="plus-circle"
                color={theme.colors.primary}
              />
            )}
            onPress={() => handleMenuPress("createListing")}
          />
          <List.Item
            title="Saved Cars"
            description="View your saved listings"
            left={(props) => (
              <List.Icon {...props} icon="heart" color={theme.colors.primary} />
            )}
            onPress={() => handleMenuPress("saved")}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Theme"
            description={`${isDarkMode ? "Light" : "Dark"} mode`}
            left={(props) => (
              <List.Icon
                {...props}
                icon={
                  isDarkMode ? "white-balance-sunny" : "moon-waning-crescent"
                }
                color={theme.colors.primary}
              />
            )}
            onPress={toggleTheme}
          />
          <List.Item
            title="Settings"
            description="App settings and preferences"
            left={(props) => (
              <List.Icon {...props} icon="cog" color={theme.colors.primary} />
            )}
            onPress={() => handleMenuPress("settings")}
          />
          <List.Item
            title="Help"
            description="Get help and support"
            left={(props) => (
              <List.Icon
                {...props}
                icon="help-circle"
                color={theme.colors.primary}
              />
            )}
            onPress={() => handleMenuPress("help")}
          />
          <List.Item
            title="About"
            description="App information"
            left={(props) => (
              <List.Icon
                {...props}
                icon="information"
                color={theme.colors.primary}
              />
            )}
            onPress={() => handleMenuPress("about")}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Logout"
            description="Sign out of your account"
            left={(props) => (
              <List.Icon {...props} icon="logout" color={theme.colors.error} />
            )}
            onPress={() => handleMenuPress("logout")}
          />
        </ScrollView>
      </Animated.View>

      <FlatList
        data={isLoading ? [] : carListings}
        renderItem={renderCarListing}
        keyExtractor={(item) => item.listing_id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  style={[
                    styles.skeletonCard,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <View style={styles.skeletonImage} />
                  <View style={styles.skeletonContent}>
                    <View style={styles.skeletonTitle} />
                    <View style={styles.skeletonDetails} />
                  </View>
                </Card>
              ))}
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons
                name="car-off"
                size={64}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                style={[styles.errorTitle, { color: theme.colors.onSurface }]}
              >
                Couldn't load listings
              </Text>
              <Text
                style={[
                  styles.errorSubtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {error?.message || "Network error. Please try again."}
              </Text>
              <Button
                mode="contained"
                onPress={handleRefresh}
                style={styles.retryButton}
              >
                Try Again
              </Button>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="car-search"
                size={64}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                style={[styles.emptyTitle, { color: theme.colors.onSurface }]}
              >
                No cars found
              </Text>
              <Text
                style={[
                  styles.emptySubtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Try adjusting your filters
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 8,
  },
  brandContainer: {
    flexDirection: "column",
    marginLeft: 8,
  },
  brandName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  brandTagline: {
    fontSize: 12,
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    borderRadius: 12,
  },
  filtersScroll: {
    marginBottom: 16,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    borderRadius: 20,
  },
  statsSurface: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },
  listContainer: {
    paddingBottom: 100,
  },
  loadingContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  skeletonCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  skeletonImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonTitle: {
    width: 150,
    height: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonDetails: {
    flexDirection: "row",
    gap: 16,
  },
  listingCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 200,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  priceTag: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceTagText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  listingContent: {
    padding: 16,
  },
  carHeader: {
    marginBottom: 12,
  },
  carTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  carTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  verifiedContainer: {
    marginLeft: 8,
  },
  carDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  messageButton: {
    flex: 1,
    borderRadius: 8,
  },
  callButton: {
    borderRadius: 8,
  },
  errorContainer: {
    alignItems: "center",
    padding: 40,
    marginHorizontal: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  retryButton: {
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 60,
    marginHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  // Drawer styles
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    zIndex: 1001,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  drawerUserInfo: {
    flex: 1,
    marginLeft: 16,
  },
  drawerUserName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  drawerUserEmail: {
    fontSize: 14,
  },
  divider: {
    marginVertical: 8,
  },
  drawerContent: {
    flex: 1,
    paddingVertical: 8,
  },
});

export default HomeScreen;
