import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Checkbox, useTheme } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useCarFeatures, useCarLocations } from "../../features/cars/car.hooks";
import { Feature } from "../../features/cars/car.types";
import { useLocation } from "../../hooks/useLocation";
import { VehicleData } from "../../types/vehicle";

interface FeaturesAndLocationScreenProps {
  onContinue?: () => void;
  onBack?: () => void;
  currentStep?: number;
  vehicleData?: VehicleData;
  updateVehicleData?: (updates: Partial<VehicleData>) => void;
}

export default function FeaturesAndLocationScreen({
  onContinue,
  onBack,
  currentStep = 3,
  vehicleData,
  updateVehicleData,
}: FeaturesAndLocationScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");
  const styles = getDynamicStyles(theme, width, insets);

  // ========== FEATURES STATE ==========
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<Set<number>>(
    new Set(
      vehicleData?.features?.map((f) =>
        typeof f === "number" ? f : parseInt(f),
      ) || [],
    ),
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // ========== LOCATION STATE ==========
  const {
    location,
    isLoading: isLoadingLocation,
    error: locationError,
    getCurrentLocation,
    openAppSettings,
    requestLocationPermission,
  } = useLocation();

  // State for manual location
  const [selectedRegion, setSelectedRegion] = useState(""); // Start empty
  const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>(
    undefined,
  ); // Start empty
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ========== FEATURES DATA ==========
  const {
    data: featuresResponse,
    isLoading: isLoadingFeatures,
    error: featuresError,
    refetch: refetchFeatures,
  } = useCarFeatures();

  const {
    data: locationsResponse,
    isLoading: isLoadingLocations,
    error: locationsError,
  } = useCarLocations();

  const allFeatures = featuresResponse?.success
    ? featuresResponse.data.features
    : [];

  // Category data
  const categoryData = {
    Safety: {
      icon: "shield-checkmark",
      color: "#EF4444",
      description: "Protection and security features",
    },
    Comfort: {
      icon: "car",
      color: "#3B82F6",
      description: "Interior comfort and convenience",
    },
    Technology: {
      icon: "phone-portrait",
      color: "#8B5CF6",
      description: "Smart tech and connectivity",
    },
    Exterior: {
      icon: "car-outline",
      color: "#10B981",
      description: "External features and styling",
    },
    Performance: {
      icon: "speedometer",
      color: "#F59E0B",
      description: "Engine and driving features",
    },
    Interior: {
      icon: "settings",
      color: "#EC4899",
      description: "Cabin features and controls",
    },
  };

  // Get regions from API response
  let regions: any[] = [];
  if (locationsResponse?.success) {
    const responseData = locationsResponse.data as any;
    if (Array.isArray(responseData)) {
      regions = responseData;
    } else if (responseData?.data && Array.isArray(responseData.data)) {
      regions = responseData.data;
    }
  }

  // Fallback regions
  const fallbackRegions = [
    { region_id: 1, name: "Addis Ababa" },
    { region_id: 2, name: "Oromia" },
    { region_id: 3, name: "Amhara" },
    { region_id: 4, name: "Southern Nations" },
    { region_id: 5, name: "Tigray" },
  ];

  const displayRegions = regions.length > 0 ? regions : fallbackRegions;

  // ========== FEATURES FUNCTIONS ==========
  const getFeatureIcon = (featureName: string, category: string) => {
    const name = featureName.toLowerCase();
    if (category === "Safety") {
      if (name.includes("airbag")) return "shield";
      if (name.includes("brake")) return "car";
      if (name.includes("camera")) return "camera";
      return "shield-checkmark";
    }
    if (category === "Technology") {
      if (name.includes("navigation")) return "map";
      if (name.includes("bluetooth")) return "bluetooth";
      return "phone-portrait";
    }
    if (category === "Comfort") {
      if (name.includes("seat")) return "seat";
      return "happy";
    }
    if (name.includes("audio")) return "musical-notes";
    if (name.includes("light")) return "bulb";
    return "checkmark-circle";
  };

  const getImportanceStyle = (importance: string) => {
    switch (importance) {
      case "Premium":
        return { color: "#8B5CF6", bgColor: "#8B5CF620", label: "Premium" };
      case "Common":
        return { color: "#10B981", bgColor: "#10B98120", label: "Common" };
      case "Basic":
        return { color: "#6B7280", bgColor: "#6B728020", label: "Basic" };
      default:
        return { color: "#6B7280", bgColor: "#6B728020", label: importance };
    }
  };

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    allFeatures.forEach((feature: Feature) => {
      categories.add(feature.category);
    });
    return Array.from(categories).sort();
  }, [allFeatures]);

  const filteredFeatures = useMemo(() => {
    let filtered = allFeatures;

    if (searchQuery) {
      filtered = filtered.filter((feature: Feature) =>
        feature.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (feature: Feature) => feature.category === selectedCategory,
      );
    }

    const grouped = filtered.reduce(
      (acc: Record<string, Feature[]>, feature: Feature) => {
        if (!acc[feature.category]) {
          acc[feature.category] = [];
        }
        acc[feature.category].push(feature);
        return acc;
      },
      {} as Record<string, Feature[]>,
    );

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, features]) => ({
        category,
        features: features.sort((a: Feature, b: Feature) => {
          const importanceOrder = { Premium: 0, Common: 1, Basic: 2 };
          const aImp =
            importanceOrder[a.importance as keyof typeof importanceOrder] ?? 3;
          const bImp =
            importanceOrder[b.importance as keyof typeof importanceOrder] ?? 3;
          if (aImp !== bImp) return aImp - bImp;
          return a.name.localeCompare(b.name);
        }),
      }));
  }, [allFeatures, searchQuery, selectedCategory]);

  const toggleFeature = (featureId: number) => {
    setSelectedFeatures((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(featureId)) {
        newSet.delete(featureId);
      } else {
        newSet.add(featureId);
      }
      return newSet;
    });
  };

  const selectAllInCategory = (category: string) => {
    const categoryFeatures = allFeatures.filter(
      (f: Feature) => f.category === category,
    );
    const allCategoryIds = categoryFeatures.map((f: Feature) => f.feature_id);

    setSelectedFeatures((prev) => {
      const newSet = new Set(prev);
      const currentIdsInCategory = categoryFeatures
        .filter((f: Feature) => newSet.has(f.feature_id))
        .map((f: Feature) => f.feature_id);

      if (currentIdsInCategory.length > 0) {
        allCategoryIds.forEach((id) => newSet.delete(id));
      } else {
        allCategoryIds.forEach((id) => newSet.add(id));
      }

      return newSet;
    });
  };

  const clearAllFeatures = () => {
    setSelectedFeatures(new Set());
  };

  // ========== LOCATION FUNCTIONS ==========
  const handleUseLocation = async () => {
    setIsGettingLocation(true);
    const granted = await requestLocationPermission();
    if (!granted) {
      Alert.alert(
        "Location Permission Required",
        "Please enable location permissions or enter manually.",
        [
          { text: "Enter Manually", style: "cancel" },
          { text: "Open Settings", onPress: openAppSettings },
        ],
      );
      setIsGettingLocation(false);
      return;
    }

    const locationData = await getCurrentLocation();
    if (locationData) {
      setSelectedRegion(locationData.region || "");
      Alert.alert("Location Found", `Found: ${locationData.region}`, [
        { text: "OK" },
      ]);
    } else if (locationError) {
      Alert.alert("Location Error", locationError, [{ text: "OK" }]);
    }
    setIsGettingLocation(false);
  };

  // ========== CONTINUE HANDLER ==========
  const handleContinue = () => {
    // Validate features
    const featuresArray = Array.from(selectedFeatures);

    // Validate location
    if (!selectedRegion) {
      Alert.alert("Location Required", "Please select location");
      return;
    }

    // Validate features
    if (featuresArray.length === 0) {
      Alert.alert("Features Required", "Please add at least one feature");
      return;
    }

    // Update vehicle data
    if (updateVehicleData) {
      updateVehicleData({
        features: featuresArray,
        location: {
          region: selectedRegion,
          region_id: selectedRegionId,
          zone: "",
          city: "",
          address: location.address || "",
        },
      });
    }

    onContinue?.();
  };

  const handleBackPress = () => {
    if (onBack) {
      onBack();
    }
  };

  // Step indicator - linear progress like step 1 & 2
  const steps = [
    { number: 1, label: "Basics", completed: true },
    { number: 2, label: "Pricing & Photos", completed: true },
    { number: 3, label: "Features & Location", completed: false },
    { number: 4, label: "Review", completed: false },
  ];

  const currentStepIndex = 2; // 0-based index for step 3
  const selectedCount = selectedFeatures.size;
  const totalCount = allFeatures.length;

  return (
    <SafeAreaView style={styles.fullScreen} edges={["bottom", "left", "right"]}>
      <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons
            name="chevron-back"
            size={28}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text
            style={[styles.headerTitle, { color: theme.colors.onBackground }]}
          >
            Features & Location
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Step {currentStep} • Complete Your Listing
          </Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="car" size={24} color={theme.colors.primary} />
        </View>
      </Animated.View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar - Linear like step 1 & 2 */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            </View>
          </View>
          <View style={styles.stepLabels}>
            {steps.map((step, index) => (
              <View key={step.number} style={styles.stepLabelItem}>
                <Text
                  style={[
                    styles.stepLabelText,
                    {
                      color:
                        step.completed || index <= currentStepIndex
                          ? theme.colors.primary
                          : theme.colors.onSurfaceVariant,
                      fontWeight: index <= currentStepIndex ? "600" : "400",
                    },
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features and Location Section */}
        <View>
          {/* Location Section */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.onBackground },
              ]}
            >
              Vehicle Location
            </Text>

            {/* Auto-location Button */}
            <TouchableOpacity
              style={[
                styles.locationButton,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={handleUseLocation}
              disabled={isGettingLocation}
            >
              <View
                style={[
                  styles.locationIcon,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                {isGettingLocation ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                  />
                ) : (
                  <Ionicons
                    name="navigate"
                    size={24}
                    color={theme.colors.primary}
                  />
                )}
              </View>
              <View style={styles.locationContent}>
                <Text
                  style={[
                    styles.locationTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {isGettingLocation
                    ? "Getting Location..."
                    : "Use Current Location"}
                </Text>
                <Text
                  style={[
                    styles.locationDescription,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Automatically detect your location
                </Text>
              </View>
            </TouchableOpacity>

            <Text
              style={[
                styles.orDivider,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              ─── OR Enter Manually ───
            </Text>

            {/* Manual Location */}
            <TouchableOpacity
              style={[
                styles.locationInput,
                { backgroundColor: theme.colors.surface },
                selectedRegion && { borderColor: "#3B82F6" },
              ]}
              onPress={() => setShowRegionModal(true)}
            >
              <Ionicons
                name="earth"
                size={20}
                color={
                  selectedRegion ? "#3B82F6" : theme.colors.onSurfaceVariant
                }
                style={styles.locationInputIcon}
              />
              <View style={styles.locationInputContent}>
                <Text
                  style={[
                    styles.locationInputLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Region
                </Text>
                <Text
                  style={[
                    styles.locationInputValue,
                    {
                      color: selectedRegion
                        ? theme.colors.onSurface
                        : theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {selectedRegion || "Select Region"}
                </Text>
              </View>
              <Ionicons
                name="chevron-down"
                size={20}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>

            {location.address && (
              <View
                style={[
                  styles.locationCard,
                  { backgroundColor: theme.colors.primary + "08" },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text
                  style={[
                    styles.locationAddress,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {location.address}
                </Text>
              </View>
            )}
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.onBackground },
              ]}
            >
              Vehicle Features
            </Text>

            {/* Stats Card */}
            <View
              style={[
                styles.statsCard,
                { backgroundColor: theme.colors.primary + "08" },
              ]}
            >
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text
                    style={[styles.statValue, { color: theme.colors.primary }]}
                  >
                    {selectedCount}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Selected
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text
                    style={[styles.statValue, { color: theme.colors.primary }]}
                  >
                    {totalCount}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Available
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text
                    style={[styles.statValue, { color: theme.colors.primary }]}
                  >
                    {Math.round((selectedCount / totalCount) * 100) || 0}%
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Complete
                  </Text>
                </View>
              </View>
            </View>

            {/* Search Bar */}
            <View
              style={[
                styles.searchContainer,
                isSearchFocused && styles.searchContainerFocused,
              ]}
            >
              <Ionicons
                name="search"
                size={20}
                color={
                  isSearchFocused
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant
                }
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search features..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={theme.colors.onSurfaceVariant + "80"}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              {searchQuery && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={theme.colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              <View style={styles.categoryContainer}>
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    !selectedCategory && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      !selectedCategory && styles.categoryChipTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {allCategories.map((category) => {
                  const isActive = selectedCategory === category;
                  const catData =
                    categoryData[category as keyof typeof categoryData];
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        isActive && styles.categoryChipActive,
                      ]}
                      onPress={() =>
                        setSelectedCategory(isActive ? null : category)
                      }
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          isActive && styles.categoryChipTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Action Bar */}
            <View style={styles.actionBar}>
              <Text
                style={[
                  styles.selectedCount,
                  { color: theme.colors.onSurface },
                ]}
              >
                {selectedCount} features selected
              </Text>
              {selectedCount > 0 && (
                <TouchableOpacity
                  onPress={clearAllFeatures}
                  style={styles.clearButton}
                >
                  <Text
                    style={[
                      styles.clearButtonText,
                      { color: theme.colors.error },
                    ]}
                  >
                    Clear All
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Loading State */}
            {isLoadingFeatures && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text
                  style={[
                    styles.loadingText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Loading features...
                </Text>
              </View>
            )}

            {/* Feature Categories */}
            {!isLoadingFeatures &&
              !featuresError &&
              filteredFeatures.length > 0 && (
                <View style={styles.categoriesContainer}>
                  {filteredFeatures.map(({ category, features }) => {
                    const catData =
                      categoryData[category as keyof typeof categoryData];
                    const categoryFeatures = allFeatures.filter(
                      (f: Feature) => f.category === category,
                    );
                    const selectedInCategory = categoryFeatures.filter(
                      (f: Feature) => selectedFeatures.has(f.feature_id),
                    ).length;

                    return (
                      <View key={category} style={styles.categorySection}>
                        <View style={styles.categoryHeader}>
                          <View style={styles.categoryTitleRow}>
                            <View
                              style={[
                                styles.categoryIcon,
                                { backgroundColor: catData?.color + "20" },
                              ]}
                            >
                              <Ionicons
                                name={(catData?.icon as any) || "cube"}
                                size={20}
                                color={catData?.color || theme.colors.primary}
                              />
                            </View>
                            <View style={styles.categoryTitleContainer}>
                              <Text
                                style={[
                                  styles.categoryTitle,
                                  { color: theme.colors.onBackground },
                                ]}
                              >
                                {category}
                              </Text>
                              <Text
                                style={[
                                  styles.categorySubtitle,
                                  { color: theme.colors.onSurfaceVariant },
                                ]}
                              >
                                {selectedInCategory} of {features.length}{" "}
                                selected
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.featuresList}>
                          {features.map((feature: Feature) => {
                            const isSelected = selectedFeatures.has(
                              feature.feature_id,
                            );
                            const importanceStyle = getImportanceStyle(
                              feature.importance,
                            );

                            return (
                              <TouchableOpacity
                                key={feature.feature_id}
                                style={[
                                  styles.featureItem,
                                  isSelected && styles.featureItemSelected,
                                ]}
                                onPress={() =>
                                  toggleFeature(feature.feature_id)
                                }
                              >
                                <View style={styles.featureContent}>
                                  <Checkbox
                                    status={
                                      isSelected ? "checked" : "unchecked"
                                    }
                                    color={
                                      catData?.color || theme.colors.primary
                                    }
                                  />
                                  <View style={styles.featureTextContainer}>
                                    <Text
                                      style={[
                                        styles.featureName,
                                        { color: theme.colors.onSurface },
                                      ]}
                                    >
                                      {feature.name}
                                    </Text>
                                    <View
                                      style={[
                                        styles.importanceBadge,
                                        {
                                          backgroundColor:
                                            importanceStyle.bgColor,
                                        },
                                      ]}
                                    >
                                      <Text
                                        style={[
                                          styles.importanceText,
                                          { color: importanceStyle.color },
                                        ]}
                                      >
                                        {importanceStyle.label}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleContinue}
          style={[
            styles.continueButton,
            { backgroundColor: theme.colors.primary },
          ]}
          labelStyle={[styles.buttonLabel, { color: theme.colors.onPrimary }]}
          contentStyle={styles.buttonContent}
          disabled={false}
        >
          Continue to Review
        </Button>
      </View>

      {/* Region Modal */}
      {showRegionModal && (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={() => setShowRegionModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContainer,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: theme.colors.onBackground },
                  ]}
                >
                  Select Region
                </Text>
                <TouchableOpacity onPress={() => setShowRegionModal(false)}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={theme.colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {displayRegions.map((region) => (
                  <TouchableOpacity
                    key={region.region_id || region.name}
                    style={[
                      styles.modalItem,
                      selectedRegion === region.name &&
                        styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedRegion(region.name);
                      setSelectedRegionId(region.region_id);
                      setShowRegionModal(false);
                    }}
                  >
                    <Ionicons
                      name={
                        selectedRegion === region.name
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={20}
                      color={
                        selectedRegion === region.name
                          ? theme.colors.primary
                          : theme.colors.outline
                      }
                    />
                    <Text
                      style={[
                        styles.modalItemText,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      {region.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const getDynamicStyles = (theme: any, screenWidth: number, insets: any) => {
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 768;

  return StyleSheet.create({
    fullScreen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: isSmallScreen ? 16 : 20,
      paddingTop: insets.top,
      paddingBottom: 12,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline + "20",
    },
    backButton: {
      padding: 4,
    },
    headerCenter: {
      flex: 1,
      alignItems: "center",
    },
    headerTitle: {
      fontSize: isSmallScreen ? 18 : 20,
      fontWeight: "700",
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    headerIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary + "10",
      justifyContent: "center",
      alignItems: "center",
    },
    tabContainer: {
      flexDirection: "row",
      paddingHorizontal: isSmallScreen ? 16 : 20,
      paddingVertical: 8,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline + "20",
    },
    tabButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 8,
      marginHorizontal: 4,
    },
    activeTab: {
      backgroundColor: theme.colors.primary + "10",
    },
    tabText: {
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 8,
    },
    tabBadge: {
      color: theme.colors.primary,
      fontWeight: "700",
    },
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: isSmallScreen ? 16 : 20,
      paddingTop: 16,
      paddingBottom: 120,
    },
    progressContainer: {
      marginBottom: 20,
    },
    progressBar: {
      height: 4,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 2,
      overflow: "hidden",
      marginBottom: 8,
    },
    progressBarBackground: {
      height: "100%",
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 2,
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 2,
    },
    stepLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    stepLabelItem: {
      flex: 1,
      alignItems: "center",
    },
    stepLabelText: {
      fontSize: 11,
      fontWeight: "500",
      textAlign: "center",
    },
    statsCard: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    statItem: {
      flex: 1,
      alignItems: "center",
    },
    statValue: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 11,
      fontWeight: "500",
    },
    statDivider: {
      width: 1,
      height: 28,
      backgroundColor: theme.colors.outline + "40",
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    searchContainerFocused: {
      borderColor: theme.colors.primary,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      backgroundColor: "transparent",
      padding: 0,
      margin: 0,
    },
    categoryScroll: {
      marginBottom: 12,
    },
    categoryContainer: {
      flexDirection: "row",
      gap: 8,
      paddingVertical: 4,
    },
    categoryChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceVariant,
    },
    categoryChipActive: {
      backgroundColor: theme.colors.primary,
    },
    categoryChipText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.onSurfaceVariant,
    },
    categoryChipTextActive: {
      color: "white",
    },
    actionBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
      paddingVertical: 8,
    },
    selectedCount: {
      fontSize: 16,
      fontWeight: "600",
    },
    clearButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    clearButtonText: {
      fontSize: 14,
      fontWeight: "600",
    },
    loadingContainer: {
      alignItems: "center",
      paddingVertical: 40,
    },
    loadingText: {
      fontSize: 14,
      fontWeight: "500",
      marginTop: 12,
    },
    categoriesContainer: {
      marginBottom: 16,
    },
    categorySection: {
      marginBottom: 20,
    },
    categoryHeader: {
      marginBottom: 12,
    },
    categoryTitleRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    categoryIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    categoryTitleContainer: {
      flex: 1,
    },
    categoryTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 2,
    },
    categorySubtitle: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    featuresList: {
      gap: 8,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    featureItemSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + "08",
    },
    featureContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    featureTextContainer: {
      flex: 1,
      marginLeft: 12,
    },
    featureName: {
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 4,
    },
    importanceBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    importanceText: {
      fontSize: 10,
      fontWeight: "600",
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 12,
      color: theme.colors.onBackground,
    },
    locationButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      marginBottom: 12,
    },
    locationIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    locationContent: {
      flex: 1,
    },
    locationTitle: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 2,
    },
    locationDescription: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    orDivider: {
      textAlign: "center",
      fontSize: 12,
      marginVertical: 12,
      fontWeight: "500",
    },
    locationInput: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    locationInputIcon: {
      marginRight: 12,
    },
    locationInputContent: {
      flex: 1,
    },
    locationInputLabel: {
      fontSize: 11,
      fontWeight: "500",
      marginBottom: 2,
    },
    locationInputValue: {
      fontSize: 14,
      fontWeight: "600",
    },
    locationCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 12,
      marginTop: 12,
      gap: 8,
    },
    locationAddress: {
      fontSize: 13,
      fontWeight: "500",
      flex: 1,
    },
    descriptionContainer: {
      marginBottom: 16,
    },
    descriptionInput: {
      backgroundColor: theme.colors.surface,
      minHeight: 100,
    },
    descriptionFooter: {
      marginTop: 8,
    },
    descriptionCount: {
      fontSize: 12,
      fontWeight: "500",
      marginBottom: 4,
    },
    descriptionHint: {
      fontSize: 11,
    },
    contactOptions: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 12,
    },
    contactOption: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
      position: "relative",
      gap: 8,
    },
    contactOptionSelected: {
      borderWidth: 2,
    },
    contactOptionText: {
      fontSize: 13,
      fontWeight: "600",
    },
    contactOptionCheck: {
      position: "absolute",
      top: -4,
      right: -4,
      width: 16,
      height: 16,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    availabilityGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    availabilityOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
      gap: 6,
      minWidth: (screenWidth - 48) / 3 - 8,
    },
    availabilityOptionSelected: {
      borderWidth: 2,
    },
    availabilityOptionText: {
      fontSize: 12,
      fontWeight: "500",
    },
    spacer: {
      height: 40,
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: isSmallScreen ? 16 : 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline + "20",
    },
    continueButton: {
      borderRadius: 12,
      height: 48,
    },
    buttonContent: {
      height: "100%",
    },
    buttonLabel: {
      fontSize: 15,
      fontWeight: "600",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContainer: {
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: "60%",
      paddingBottom: insets.bottom,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline + "20",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
    },
    modalItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline + "20",
      gap: 12,
    },
    modalItemSelected: {
      backgroundColor: theme.colors.primary + "08",
    },
    modalItemText: {
      fontSize: 16,
      flex: 1,
    },
  });
};
