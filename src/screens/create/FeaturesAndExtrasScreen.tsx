import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Animated,
  ActivityIndicator,
} from "react-native";
import {
  Button,
  Card,
  Checkbox,
  TextInput,
  useTheme,
  Chip,
} from "react-native-paper";
import { useCarFeatures } from "../../features/cars/car.hooks";
import { Feature } from "../../features/cars/car.types";
import { VehicleData } from "../../types/vehicle";

interface FeaturesAndExtrasScreenProps {
  onContinue?: () => void;
  onBack?: () => void;
  currentStep?: number;
  vehicleData?: VehicleData;
  updateVehicleData?: (updates: Partial<VehicleData>) => void;
}

export default function FeaturesAndExtrasScreen({
  onContinue,
  onBack,
  currentStep = 4,
  vehicleData,
  updateVehicleData,
}: FeaturesAndExtrasScreenProps) {
  const theme = useTheme();
  const { width } = Dimensions.get("window");
  const styles = getDynamicStyles(theme, width);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<Set<number>>(
    new Set(
      vehicleData?.features?.map((f) =>
        typeof f === "number" ? f : parseInt(f)
      ) || []
    )
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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

  // Fetch features from API
  const {
    data: featuresResponse,
    isLoading: isLoadingFeatures,
    error: featuresError,
    refetch: refetchFeatures,
  } = useCarFeatures();

  // Get features data from response
  const allFeatures = featuresResponse?.success
    ? featuresResponse.data.features
    : [];

  // Category data with colors and icons
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
    Audio: {
      icon: "musical-notes",
      color: "#06B6D4",
      description: "Sound and entertainment systems",
    },
    Lighting: {
      icon: "bulb",
      color: "#8B5CF6",
      description: "Lighting systems and features",
    },
  };

  // Feature icons mapping
  const getFeatureIcon = (featureName: string, category: string) => {
    const name = featureName.toLowerCase();

    // Category-specific icons
    if (category === "Safety") {
      if (name.includes("airbag")) return "shield";
      if (name.includes("brake")) return "car";
      if (name.includes("camera")) return "camera";
      if (name.includes("sensor")) return "radio";
      if (name.includes("alarm")) return "alert-circle";
      return "shield-checkmark";
    }

    if (category === "Technology") {
      if (name.includes("navigation") || name.includes("gps")) return "map";
      if (name.includes("bluetooth")) return "bluetooth";
      if (name.includes("apple") || name.includes("carplay"))
        return "logo-apple";
      if (name.includes("android")) return "logo-android";
      if (name.includes("usb") || name.includes("charge"))
        return "battery-charging";
      if (name.includes("wifi")) return "wifi";
      return "phone-portrait";
    }

    if (category === "Comfort") {
      if (name.includes("seat") && name.includes("heat")) return "flame";
      if (name.includes("seat") && name.includes("cool")) return "snow";
      if (name.includes("seat") && name.includes("massage")) return "body";
      if (name.includes("climate") || name.includes("ac")) return "thermometer";
      if (name.includes("steering")) return "car-sport";
      return "happy";
    }

    if (name.includes("audio") || name.includes("music"))
      return "musical-notes";
    if (name.includes("wheel")) return "car-sport";
    if (name.includes("light") || name.includes("lamp") || name.includes("led"))
      return "bulb";
    if (name.includes("tire") || name.includes("wheel")) return "speedometer";
    if (name.includes("sunroof") || name.includes("moonroof")) return "sunny";
    if (name.includes("parking")) return "car";

    return "checkmark-circle";
  };

  // Get importance styling
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

  // Get all unique categories
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    allFeatures.forEach((feature: Feature) => {
      categories.add(feature.category);
    });
    return Array.from(categories).sort();
  }, [allFeatures]);

  // Filter and group features
  const filteredFeatures = useMemo(() => {
    let filtered = allFeatures;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((feature: Feature) =>
        feature.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        (feature: Feature) => feature.category === selectedCategory
      );
    }

    // Group by category
    const grouped = filtered.reduce(
      (acc: Record<string, Feature[]>, feature: Feature) => {
        if (!acc[feature.category]) {
          acc[feature.category] = [];
        }
        acc[feature.category].push(feature);
        return acc;
      },
      {} as Record<string, Feature[]>
    );

    // Sort categories and features
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, features]) => ({
        category,
        features: features.sort((a: Feature, b: Feature) => {
          // Sort by importance first
          const importanceOrder = { Premium: 0, Common: 1, Basic: 2 };
          const aImp =
            importanceOrder[a.importance as keyof typeof importanceOrder] ?? 3;
          const bImp =
            importanceOrder[b.importance as keyof typeof importanceOrder] ?? 3;
          if (aImp !== bImp) return aImp - bImp;

          // Then by name
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
      (f: Feature) => f.category === category
    );
    const allCategoryIds = categoryFeatures.map((f: Feature) => f.feature_id);

    setSelectedFeatures((prev) => {
      const newSet = new Set(prev);
      const currentIdsInCategory = categoryFeatures
        .filter((f: Feature) => newSet.has(f.feature_id))
        .map((f: Feature) => f.feature_id);

      // If some are selected, deselect all; otherwise select all
      if (currentIdsInCategory.length > 0) {
        allCategoryIds.forEach((id) => newSet.delete(id));
      } else {
        allCategoryIds.forEach((id) => newSet.add(id));
      }

      return newSet;
    });
  };

  const clearAll = () => {
    setSelectedFeatures(new Set());
  };

  const selectedCount = selectedFeatures.size;
  const totalCount = allFeatures.length;

  const handleContinue = () => {
    const featuresArray = Array.from(selectedFeatures);
    console.log("Selected features:", featuresArray);

    if (updateVehicleData) {
      updateVehicleData({ features: featuresArray });
    }

    if (onContinue) {
      onContinue();
    }
  };

  const handleBackPress = () => {
    if (onBack) {
      onBack();
    }
  };

  // Step indicator data
  const steps = [
    { number: 1, label: "Basics", completed: true },
    { number: 2, label: "Pricing", completed: true },
    { number: 3, label: "Technical", completed: true },
    { number: 4, label: "Features", completed: false },
    { number: 5, label: "Photos", completed: false },
    { number: 6, label: "Location", completed: false },
    { number: 7, label: "Publish", completed: false },
  ];

  const currentStepIndex = 4;

  return (
    <View style={styles.fullScreen}>
      <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {/* Enhanced Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
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
            Features & Extras
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Step {currentStep} • Add Premium Features
          </Text>
        </View>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons
            name="help-circle"
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Indicator */}
        <View style={styles.stepContainer}>
          <View style={styles.stepProgress}>
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <View style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      step.completed
                        ? styles.completedCircle
                        : currentStepIndex === step.number
                          ? styles.activeCircle
                          : styles.inactiveCircle,
                    ]}
                  >
                    {step.completed ? (
                      <Ionicons name="checkmark" size={16} color="white" />
                    ) : (
                      <Text
                        style={[
                          styles.stepNumber,
                          {
                            color:
                              currentStepIndex === step.number
                                ? "white"
                                : theme.colors.onSurfaceVariant,
                          },
                        ]}
                      >
                        {step.number}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      {
                        color:
                          step.completed || currentStepIndex === step.number
                            ? theme.colors.primary
                            : theme.colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.stepConnector,
                      {
                        backgroundColor: step.completed
                          ? theme.colors.primary
                          : theme.colors.surfaceVariant,
                      },
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentStepIndex - 1) / (steps.length - 1)) * 100}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* Main Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.titleRow}>
            <Ionicons name="sparkles" size={32} color={theme.colors.primary} />
            <View style={styles.titleContent}>
              <Text
                style={[styles.mainTitle, { color: theme.colors.onBackground }]}
              >
                Premium Features
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Add details that buyers care about
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Stats Card */}
        <View
          style={[
            styles.statsCard,
            { backgroundColor: theme.colors.primary + "08" },
          ]}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
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
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
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
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
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
            placeholder="Search features (navigation, camera, heated seats...)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            mode="flat"
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            theme={{
              colors: {
                background: "transparent",
                placeholder: theme.colors.onSurfaceVariant + "80",
                text: theme.colors.onSurface,
              },
            }}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category Filter Chips */}
        <View style={styles.categoryFilter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipContainer}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  !selectedCategory && styles.chipActive,
                  !selectedCategory && {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text
                  style={[
                    styles.chipText,
                    !selectedCategory && styles.chipTextActive,
                  ]}
                >
                  All Features
                </Text>
              </TouchableOpacity>

              {allCategories.map((category) => {
                const catData =
                  categoryData[category as keyof typeof categoryData];
                const isActive = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.chip,
                      isActive && styles.chipActive,
                      isActive && {
                        backgroundColor: catData?.color || theme.colors.primary,
                      },
                    ]}
                    onPress={() =>
                      setSelectedCategory(isActive ? null : category)
                    }
                  >
                    <Ionicons
                      name={(catData?.icon as any) || "cube"}
                      size={16}
                      color={
                        isActive
                          ? "white"
                          : catData?.color || theme.colors.primary
                      }
                      style={styles.chipIcon}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        isActive && styles.chipTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Action Bar */}
        <View style={styles.actionBar}>
          <View style={styles.selectedCountContainer}>
            <Text
              style={[styles.selectedCount, { color: theme.colors.onSurface }]}
            >
              {selectedCount} features selected
            </Text>
            <Text
              style={[
                styles.selectedHint,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {selectedCount === 0
                ? "Select features to increase value"
                : "Great selection!"}
            </Text>
          </View>
          <TouchableOpacity onPress={clearAll} style={styles.clearButton}>
            <Ionicons
              name="close-circle"
              size={18}
              color={theme.colors.error}
            />
            <Text
              style={[styles.clearButtonText, { color: theme.colors.error }]}
            >
              Clear All
            </Text>
          </TouchableOpacity>
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
              Loading premium features...
            </Text>
          </View>
        )}

        {/* Error State */}
        {featuresError && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={48} color={theme.colors.error} />
            <Text style={[styles.errorTitle, { color: theme.colors.error }]}>
              Failed to load features
            </Text>
            <Text
              style={[
                styles.errorMessage,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Please check your connection and try again
            </Text>
            <TouchableOpacity
              style={[
                styles.retryButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => refetchFeatures()}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={[styles.retryButtonText, { color: "white" }]}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Feature Categories */}
        {!isLoadingFeatures && !featuresError && (
          <View style={styles.categoriesContainer}>
            {filteredFeatures.map(({ category, features }) => {
              const catData =
                categoryData[category as keyof typeof categoryData];
              const categoryFeatures = allFeatures.filter(
                (f: Feature) => f.category === category
              );
              const selectedInCategory = categoryFeatures.filter((f: Feature) =>
                selectedFeatures.has(f.feature_id)
              ).length;
              const isAllSelected =
                selectedInCategory === categoryFeatures.length;

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
                          {catData?.description ||
                            `${features.length} features available`}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.selectAllButton}
                      onPress={() => selectAllInCategory(category)}
                    >
                      <Text
                        style={[
                          styles.selectAllText,
                          {
                            color: isAllSelected
                              ? theme.colors.error
                              : theme.colors.primary,
                          },
                        ]}
                      >
                        {isAllSelected ? "Deselect All" : "Select All"}
                      </Text>
                      <Ionicons
                        name={
                          isAllSelected ? "close-circle" : "checkmark-circle"
                        }
                        size={20}
                        color={
                          isAllSelected
                            ? theme.colors.error
                            : theme.colors.primary
                        }
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.featuresGrid}>
                    {features.map((feature: Feature) => {
                      const isSelected = selectedFeatures.has(
                        feature.feature_id
                      );
                      const importanceStyle = getImportanceStyle(
                        feature.importance
                      );

                      return (
                        <TouchableOpacity
                          key={feature.feature_id}
                          style={[
                            styles.featureCard,
                            isSelected && styles.featureCardSelected,
                            isSelected && {
                              borderColor:
                                catData?.color || theme.colors.primary,
                            },
                          ]}
                          onPress={() => toggleFeature(feature.feature_id)}
                        >
                          <View style={styles.featureHeader}>
                            <View
                              style={[
                                styles.featureIcon,
                                { backgroundColor: catData?.color + "20" },
                              ]}
                            >
                              <Ionicons
                                name={
                                  getFeatureIcon(
                                    feature.name,
                                    feature.category
                                  ) as any
                                }
                                size={20}
                                color={catData?.color || theme.colors.primary}
                              />
                            </View>
                            <View style={styles.featureCheckbox}>
                              <Checkbox
                                status={isSelected ? "checked" : "unchecked"}
                                color={catData?.color || theme.colors.primary}
                              />
                            </View>
                          </View>

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
                              { backgroundColor: importanceStyle.bgColor },
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

                          {isSelected && (
                            <View
                              style={[
                                styles.selectedBadge,
                                { backgroundColor: catData?.color },
                              ]}
                            >
                              <Ionicons
                                name="checkmark"
                                size={12}
                                color="white"
                              />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {!isLoadingFeatures &&
          !featuresError &&
          filteredFeatures.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="search"
                size={64}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                style={[styles.emptyTitle, { color: theme.colors.onSurface }]}
              >
                No features found
              </Text>
              <Text
                style={[
                  styles.emptyMessage,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Try a different search term or category
              </Text>
            </View>
          )}

        {/* Popular Features Quick Add */}
        {selectedCount === 0 && !searchQuery && !selectedCategory && (
          <View style={styles.quickAddSection}>
            <Text
              style={[
                styles.quickAddTitle,
                { color: theme.colors.onBackground },
              ]}
            >
              Popular Features
            </Text>
            <Text
              style={[
                styles.quickAddSubtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Add these to increase value quickly
            </Text>
            <View style={styles.quickAddGrid}>
              {allFeatures
                .filter((f: Feature) => f.importance === "Premium")
                .slice(0, 6)
                .map((feature: Feature) => {
                  const isSelected = selectedFeatures.has(feature.feature_id);
                  const catData =
                    categoryData[feature.category as keyof typeof categoryData];

                  return (
                    <TouchableOpacity
                      key={feature.feature_id}
                      style={[
                        styles.quickAddCard,
                        isSelected && styles.quickAddCardSelected,
                        isSelected && {
                          borderColor: catData?.color || theme.colors.primary,
                        },
                      ]}
                      onPress={() => toggleFeature(feature.feature_id)}
                    >
                      <Ionicons
                        name={
                          getFeatureIcon(feature.name, feature.category) as any
                        }
                        size={20}
                        color={
                          isSelected
                            ? catData?.color
                            : theme.colors.onSurfaceVariant
                        }
                      />
                      <Text
                        style={[
                          styles.quickAddText,
                          {
                            color: isSelected
                              ? catData?.color
                              : theme.colors.onSurfaceVariant,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {feature.name.length > 15
                          ? feature.name.substring(0, 15) + "..."
                          : feature.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
          </View>
        )}

        {/* Spacer */}
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
        >
          Continue to Photos
        </Button>

        {/* Features below button */}
        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <Ionicons
              name="trending-up"
              size={16}
              color={theme.colors.primary}
            />
            <Text
              style={[
                styles.featureText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              +{Math.round(selectedCount * 0.5)}% Value
            </Text>
          </View>
          <View style={styles.featureDivider} />
          <View style={styles.featureItem}>
            <Ionicons name="eye" size={16} color={theme.colors.primary} />
            <Text
              style={[
                styles.featureText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {selectedCount * 2} More Views
            </Text>
          </View>
          <View style={styles.featureDivider} />
          <View style={styles.featureItem}>
            <Ionicons name="time" size={16} color={theme.colors.primary} />
            <Text
              style={[
                styles.featureText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Faster Sale
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const getDynamicStyles = (theme: any, screenWidth: number) => {
  const isSmallScreen = screenWidth < 375;

  return StyleSheet.create({
    fullScreen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: isSmallScreen ? 16 : 20,
      paddingTop: 60,
      paddingBottom: 16,
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
    helpButton: {
      padding: 4,
    },
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: isSmallScreen ? 16 : 20,
      paddingTop: 16,
      paddingBottom: 160,
    },
    stepContainer: {
      marginBottom: 24,
    },
    stepProgress: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    stepItem: {
      alignItems: "center",
      minWidth: 50,
    },
    stepCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 6,
    },
    inactiveCircle: {
      borderColor: theme.colors.surfaceVariant,
      backgroundColor: "transparent",
    },
    activeCircle: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    completedCircle: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    stepNumber: {
      fontSize: 14,
      fontWeight: "600",
    },
    stepLabel: {
      fontSize: 11,
      fontWeight: "500",
      textAlign: "center",
    },
    stepConnector: {
      flex: 1,
      height: 2,
      maxWidth: 40,
      marginHorizontal: 4,
      marginTop: -20,
    },
    progressBar: {
      height: 4,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 2,
    },
    titleContainer: {
      marginBottom: 20,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    titleContent: {
      flex: 1,
      marginLeft: 12,
    },
    mainTitle: {
      fontSize: isSmallScreen ? 26 : 30,
      fontWeight: "800",
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    statsCard: {
      padding: 16,
      borderRadius: 16,
      marginBottom: 20,
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
      fontSize: 24,
      fontWeight: "800",
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: "500",
    },
    statDivider: {
      width: 1,
      height: 32,
      backgroundColor: theme.colors.outline + "40",
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 16,
      borderWidth: 1.5,
      borderColor: theme.colors.outline,
    },
    searchContainerFocused: {
      borderColor: theme.colors.primary,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      backgroundColor: "transparent",
      padding: 0,
      margin: 0,
    },
    categoryFilter: {
      marginBottom: 20,
    },
    chipContainer: {
      flexDirection: "row",
      gap: 8,
      paddingVertical: 4,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1.5,
      borderColor: theme.colors.surfaceVariant,
    },
    chipActive: {
      borderColor: "transparent",
    },
    chipIcon: {
      marginRight: 6,
    },
    chipText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.onSurfaceVariant,
    },
    chipTextActive: {
      color: "white",
    },
    actionBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
      paddingVertical: 8,
    },
    selectedCountContainer: {
      flex: 1,
    },
    selectedCount: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 2,
    },
    selectedHint: {
      fontSize: 13,
    },
    clearButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: theme.colors.error + "10",
    },
    clearButtonText: {
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 6,
    },
    loadingContainer: {
      alignItems: "center",
      paddingVertical: 60,
    },
    loadingText: {
      fontSize: 15,
      fontWeight: "500",
      marginTop: 16,
    },
    errorContainer: {
      alignItems: "center",
      paddingVertical: 60,
      paddingHorizontal: 20,
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginTop: 16,
      marginBottom: 8,
    },
    errorMessage: {
      fontSize: 14,
      textAlign: "center",
      marginBottom: 24,
    },
    retryButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
    },
    retryButtonText: {
      fontSize: 15,
      fontWeight: "600",
    },
    categoriesContainer: {
      marginBottom: 24,
    },
    categorySection: {
      marginBottom: 28,
    },
    categoryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    categoryTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    categoryIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    categoryTitleContainer: {
      flex: 1,
    },
    categoryTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 2,
    },
    categorySubtitle: {
      fontSize: 13,
    },
    selectAllButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceVariant,
      gap: 6,
    },
    selectAllText: {
      fontSize: 13,
      fontWeight: "600",
    },
    featuresGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    featureCard: {
      width: (screenWidth - 60) / 2,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
      marginBottom: 10,
    },
    featureCardSelected: {
      borderWidth: 2,
      backgroundColor: theme.colors.primary + "08",
    },
    featureHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    featureIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    featureCheckbox: {
      marginTop: -8,
      marginRight: -8,
    },
    featureName: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
      lineHeight: 18,
    },
    importanceBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    importanceText: {
      fontSize: 11,
      fontWeight: "700",
    },
    selectedBadge: {
      position: "absolute",
      top: -8,
      right: -8,
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyContainer: {
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginTop: 16,
      marginBottom: 8,
    },
    emptyMessage: {
      fontSize: 14,
      textAlign: "center",
    },
    quickAddSection: {
      marginBottom: 24,
    },
    quickAddTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 4,
    },
    quickAddSubtitle: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 16,
    },
    quickAddGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    quickAddCard: {
      width: (screenWidth - 60) / 3,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    quickAddCardSelected: {
      borderWidth: 2,
      backgroundColor: theme.colors.primary + "08",
    },
    quickAddText: {
      fontSize: 11,
      fontWeight: "600",
      marginTop: 8,
      textAlign: "center",
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
      paddingVertical: 20,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline + "20",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 5,
    },
    continueButton: {
      borderRadius: 16,
      height: 56,
    },
    buttonContent: {
      height: "100%",
    },
    buttonLabel: {
      fontSize: 16,
      fontWeight: "600",
    },
    featuresRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 12,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    featureText: {
      fontSize: 12,
      marginLeft: 4,
    },
    featureDivider: {
      width: 1,
      height: 12,
      backgroundColor: theme.colors.outline + "40",
      marginHorizontal: 12,
    },
  });
};
