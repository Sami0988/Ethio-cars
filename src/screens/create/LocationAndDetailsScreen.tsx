import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Animated,
} from "react-native";
import {
  Button,
  Card,
  RadioButton,
  TextInput,
  useTheme,
  Chip,
} from "react-native-paper";
import { useCarLocations } from "../../features/cars/car.hooks";
import { useLocation } from "../../hooks/useLocation";
import { VehicleData } from "../../types/vehicle";

interface LocationAndDetailsScreenProps {
  onContinue?: () => void;
  onBack?: () => void;
  currentStep?: number;
  vehicleData?: VehicleData;
  updateVehicleData?: (updates: Partial<VehicleData>) => void;
}

export default function LocationAndDetailsScreen({
  onContinue,
  onBack,
  currentStep = 6,
  vehicleData,
  updateVehicleData,
}: LocationAndDetailsScreenProps) {
  const theme = useTheme();
  const { width } = Dimensions.get("window");
  const styles = getDynamicStyles(theme, width);

  const {
    location,
    isLoading,
    error,
    getCurrentLocation,
    setManualLocation,
    getCitiesForRegion,
    getZonesForRegion,
    openAppSettings,
    requestLocationPermission,
  } = useLocation();

  const [description, setDescription] = useState(
    vehicleData?.description || ""
  );
  const [contactPreference, setContactPreference] = useState(
    vehicleData?.contactPreference || "in_app"
  );
  const [availability, setAvailability] = useState({
    weekends: true,
    weekdays: false,
    mornings: false,
    evenings: true,
    appointment: false,
  });
  const [showExamples, setShowExamples] = useState(false);

  // State for manual location inputs
  const [selectedRegion, setSelectedRegion] = useState(
    vehicleData?.location?.region || ""
  );
  const [selectedZone, setSelectedZone] = useState(
    vehicleData?.location?.zone || ""
  );
  const [selectedCity, setSelectedCity] = useState(
    vehicleData?.location?.city || ""
  );

  // State for modals
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const locationPulse = useRef(new Animated.Value(1)).current;

  // Fetch locations from API
  const {
    data: locationsResponse,
    isLoading: isLoadingLocations,
    error: locationsError,
    refetch: refetchLocations,
  } = useCarLocations();

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

  // Start location pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(locationPulse, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(locationPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Get regions from API response
  let regions: any[] = [];
  if (locationsResponse?.success) {
    const responseData = locationsResponse.data as any;
    if (Array.isArray(responseData)) {
      regions = responseData;
    } else if (
      responseData?.locations &&
      Array.isArray(responseData.locations)
    ) {
      regions = responseData.locations;
    } else if (responseData?.data && Array.isArray(responseData.data)) {
      regions = responseData.data;
    }
  }

  // Fallback regions
  const fallbackRegions = [
    {
      id: "addis",
      name: "Addis Ababa",
      cities: ["Addis Ababa"],
      zones: ["City"],
    },
    {
      id: "oromia",
      name: "Oromia",
      cities: ["Adama", "Jimma", "Bishoftu"],
      zones: ["East", "West", "North"],
    },
    {
      id: "amhara",
      name: "Amhara",
      cities: ["Bahir Dar", "Gonder", "Dessie"],
      zones: ["North", "South", "West"],
    },
    {
      id: "snnpr",
      name: "Southern Nations",
      cities: ["Hawassa", "Arba Minch", "Wolaita"],
      zones: ["Central", "North", "South"],
    },
    {
      id: "tigray",
      name: "Tigray",
      cities: ["Mekelle", "Axum", "Adigrat"],
      zones: ["Central", "Eastern", "Western"],
    },
    {
      id: "afar",
      name: "Afar",
      cities: ["Semera", "Awash", "Logiya"],
      zones: ["Zone 1", "Zone 2", "Zone 3"],
    },
    {
      id: "somali",
      name: "Somali",
      cities: ["Jijiga", "Degehabur", "Kebri Dahar"],
      zones: ["Fafan", "Jarar", "Shabelle"],
    },
    {
      id: "benishangul",
      name: "Benishangul-Gumuz",
      cities: ["Asosa", "Metekel"],
      zones: ["Asosa", "Metekel"],
    },
    {
      id: "gambela",
      name: "Gambela",
      cities: ["Gambela", "Abobo"],
      zones: ["Anywaa", "Nuer"],
    },
    { id: "harari", name: "Harari", cities: ["Harar"], zones: ["Harar City"] },
  ];

  // Use API data if available, otherwise use fallback
  const displayRegions = regions.length > 0 ? regions : fallbackRegions;

  // Get region name from object
  const getRegionName = (region: any) => {
    if (typeof region === "string") return region;
    if (region?.name) return region.name;
    if (region?.region) return region.region;
    return "";
  };

  // Get region by name
  const getRegionData = (regionName: string) => {
    return displayRegions.find((r) => getRegionName(r) === regionName);
  };

  // Get zones for selected region
  const getZonesForSelectedRegion = () => {
    const regionData = getRegionData(selectedRegion);
    if (!regionData) return [];

    if (Array.isArray(regionData.zones)) return regionData.zones;
    if (Array.isArray(regionData.subRegions)) return regionData.subRegions;
    return [];
  };

  // Get cities for selected region
  const getCitiesForSelectedRegion = () => {
    const regionData = getRegionData(selectedRegion);
    if (!regionData) return [];

    if (Array.isArray(regionData.cities)) return regionData.cities;
    if (Array.isArray(regionData.areas)) return regionData.areas;
    return [];
  };

  const availableZones = getZonesForSelectedRegion();
  const availableCities = getCitiesForSelectedRegion();

  const handleUseLocation = async () => {
    setIsGettingLocation(true);
    // First try to request permissions
    const granted = await requestLocationPermission();
    if (!granted) {
      Alert.alert(
        "Location Permission Required",
        "Location permission is required to get your current location. You can enter your location manually or enable permissions.",
        [
          { text: "Enter Manually", style: "cancel" },
          { text: "Open Settings", onPress: openAppSettings },
        ]
      );
      setIsGettingLocation(false);
      return;
    }

    const locationData = await getCurrentLocation();

    if (locationData) {
      setSelectedRegion(locationData.region || "");
      setSelectedZone(locationData.zone || "");
      setSelectedCity(locationData.city || "");

      Alert.alert(
        "Location Found",
        `Found your location: ${locationData.address}`,
        [{ text: "OK" }]
      );
    } else if (error) {
      const isPermissionError =
        error.includes("permission") || error.includes("denied");
      const isLocationServicesError =
        error.includes("Location services are disabled") ||
        error.includes("Current location is unavailable");

      Alert.alert(
        isLocationServicesError
          ? "Location Services Disabled"
          : "Location Error",
        error,
        isLocationServicesError
          ? [
              { text: "Enter Manually", style: "cancel" },
              { text: "Try Again", onPress: handleUseLocation },
            ]
          : isPermissionError
            ? [
                { text: "Cancel", style: "cancel" },
                { text: "Open Settings", onPress: openAppSettings },
              ]
            : [{ text: "OK" }]
      );
    }
    setIsGettingLocation(false);
  };

  const handleContinue = () => {
    // Validate location
    if (!selectedRegion) {
      Alert.alert(
        "Location Required",
        "Please select a region for your listing.",
        [{ text: "OK" }]
      );
      return;
    }

    // Validate description
    if (description.length < 50) {
      Alert.alert(
        "Description Too Short",
        "Please provide a detailed description (at least 50 characters) about your vehicle.",
        [{ text: "OK" }]
      );
      return;
    }

    const listingData = {
      location: {
        region: selectedRegion,
        zone: selectedZone,
        city: selectedCity,
        coordinates:
          location.latitude && location.longitude
            ? { latitude: location.latitude, longitude: location.longitude }
            : null,
        address: location.address,
      },
      description,
      contactPreference,
      availability,
    };

    console.log("Location & details submitted:", listingData);

    if (updateVehicleData) {
      updateVehicleData({
        location: listingData.location,
        description: listingData.description,
        contactPreference: listingData.contactPreference,
        availability: listingData.availability,
      });
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

  const toggleAvailability = (key: keyof typeof availability) => {
    setAvailability((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Step indicator data
  const steps = [
    { number: 1, label: "Basics", completed: true },
    { number: 2, label: "Pricing", completed: true },
    { number: 3, label: "Technical", completed: true },
    { number: 4, label: "Features", completed: true },
    { number: 5, label: "Photos", completed: true },
    { number: 6, label: "Location", completed: false },
    { number: 7, label: "Publish", completed: false },
  ];

  const currentStepIndex = 6;

  // Contact preference options
  const contactOptions = [
    {
      value: "in_app",
      label: "In-app Messages",
      icon: "chatbubbles",
      description: "Contact me through app messages first",
      color: "#3B82F6",
    },
    {
      value: "phone",
      label: "Phone Calls",
      icon: "call",
      description: "Call me directly anytime",
      color: "#10B981",
    },
    {
      value: "both",
      label: "Both Ways",
      icon: "chatbubbles",
      description: "Use app messages or call me",
      color: "#8B5CF6",
    },
  ];

  // Availability options
  const availabilityOptions = [
    { key: "weekends", label: "Weekends", icon: "calendar", color: "#3B82F6" },
    {
      key: "weekdays",
      label: "Weekdays",
      icon: "calendar-outline",
      color: "#10B981",
    },
    { key: "mornings", label: "Mornings", icon: "sunny", color: "#F59E0B" },
    { key: "evenings", label: "Evenings", icon: "moon", color: "#8B5CF6" },
    {
      key: "appointment",
      label: "By Appointment",
      icon: "time",
      color: "#6B7280",
    },
  ];

  // Render modal for selection
  const renderSelectionModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    items: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
    disabled?: boolean
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: theme.colors.onBackground },
                ]}
              >
                {title}
              </Text>
              <Text
                style={[
                  styles.modalSubtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Select an option
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons
                name="close-circle"
                size={28}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {disabled ? (
              <View style={styles.modalDisabledState}>
                <Ionicons
                  name="alert-circle"
                  size={48}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.modalDisabledText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Please select a region first
                </Text>
              </View>
            ) : items.length === 0 ? (
              <View style={styles.modalDisabledState}>
                <Ionicons
                  name="search"
                  size={48}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.modalDisabledText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  No options available
                </Text>
              </View>
            ) : (
              items.map((item) => {
                const isSelected = selectedValue === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.modalItem,
                      {
                        backgroundColor: theme.colors.surface,
                        borderLeftWidth: isSelected ? 4 : 0,
                        borderLeftColor: isSelected
                          ? theme.colors.primary
                          : "transparent",
                      },
                    ]}
                    onPress={() => {
                      onSelect(item);
                      onClose();
                    }}
                  >
                    <View style={styles.modalItemContent}>
                      {isSelected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={theme.colors.primary}
                        />
                      ) : (
                        <Ionicons
                          name="ellipse-outline"
                          size={24}
                          color={theme.colors.outline}
                        />
                      )}
                      <Text
                        style={[
                          styles.modalItemText,
                          {
                            color: isSelected
                              ? theme.colors.primary
                              : theme.colors.onSurface,
                            fontWeight: isSelected ? "600" : "400",
                          },
                        ]}
                      >
                        {item}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const descriptionScore = Math.min(
    Math.round((description.length / 2000) * 100),
    100
  );
  const locationComplete = selectedRegion && selectedCity;
  const isReadyToContinue = locationComplete && description.length >= 50;

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
            Location & Details
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Step {currentStepIndex} • Final Details
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
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.titleRow}>
            <Ionicons name="location" size={32} color={theme.colors.primary} />
            <View style={styles.titleContent}>
              <Text
                style={[styles.mainTitle, { color: theme.colors.onBackground }]}
              >
                Finalize Your Listing
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Add location and detailed description
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Completion Stats */}
        <View
          style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statValue,
                  { color: locationComplete ? "#10B981" : "#EF4444" },
                ]}
              >
                {locationComplete ? "✓" : "!"}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Location
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      descriptionScore > 50
                        ? "#10B981"
                        : descriptionScore > 20
                          ? "#F59E0B"
                          : "#EF4444",
                  },
                ]}
              >
                {descriptionScore}%
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Description
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statValue,
                  { color: isReadyToContinue ? "#10B981" : "#EF4444" },
                ]}
              >
                {isReadyToContinue ? "✓" : "!"}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Ready
              </Text>
            </View>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[styles.sectionIcon, { backgroundColor: "#3B82F620" }]}
            >
              <Ionicons name="location" size={20} color="#3B82F6" />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.onBackground },
                ]}
              >
                Vehicle Location
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Where can buyers view the car?
              </Text>
            </View>
          </View>

          {/* Auto-location Button */}
          <Animated.View style={{ transform: [{ scale: locationPulse }] }}>
            <TouchableOpacity
              style={[
                styles.locationButton,
                isGettingLocation && styles.locationButtonActive,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={handleUseLocation}
              disabled={isGettingLocation}
            >
              <View
                style={[
                  styles.locationIcon,
                  {
                    backgroundColor: isGettingLocation
                      ? theme.colors.primary + "20"
                      : theme.colors.surfaceVariant,
                  },
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
                    : "Use My Current Location"}
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
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </Animated.View>

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
              <View style={styles.locationCardContent}>
                <Text
                  style={[
                    styles.locationAddress,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {location.address}
                </Text>
                {location.accuracy && (
                  <Text
                    style={[
                      styles.locationAccuracy,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Accuracy: {Math.round(location.accuracy)} meters
                  </Text>
                )}
              </View>
            </View>
          )}

          <Text
            style={[styles.orDivider, { color: theme.colors.onSurfaceVariant }]}
          >
            ─── OR Enter Manually ───
          </Text>

          {/* Manual Location Inputs */}
          <View style={styles.locationForm}>
            {/* Region */}
            <TouchableOpacity
              style={[
                styles.locationInput,
                { backgroundColor: theme.colors.surface },
                selectedRegion && styles.locationInputFilled,
                selectedRegion && { borderColor: "#3B82F6" },
              ]}
              onPress={() => setShowRegionModal(true)}
            >
              <View style={styles.locationInputIcon}>
                <Ionicons
                  name="earth"
                  size={20}
                  color={
                    selectedRegion ? "#3B82F6" : theme.colors.onSurfaceVariant
                  }
                />
              </View>
              <View style={styles.locationInputContent}>
                <Text
                  style={[
                    styles.locationInputLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Region *
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

            {/* Zone */}
            <TouchableOpacity
              style={[
                styles.locationInput,
                { backgroundColor: theme.colors.surface },
                !selectedRegion && styles.locationInputDisabled,
                selectedZone && styles.locationInputFilled,
                selectedZone && { borderColor: "#10B981" },
              ]}
              onPress={() => selectedRegion && setShowZoneModal(true)}
              disabled={!selectedRegion}
            >
              <View style={styles.locationInputIcon}>
                <Ionicons
                  name="map"
                  size={20}
                  color={
                    selectedZone ? "#10B981" : theme.colors.onSurfaceVariant
                  }
                />
              </View>
              <View style={styles.locationInputContent}>
                <Text
                  style={[
                    styles.locationInputLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Zone
                </Text>
                <Text
                  style={[
                    styles.locationInputValue,
                    {
                      color: selectedZone
                        ? theme.colors.onSurface
                        : theme.colors.onSurfaceVariant,
                      opacity: !selectedRegion ? 0.5 : 1,
                    },
                  ]}
                >
                  {selectedZone || "Select Zone"}
                </Text>
              </View>
              <Ionicons
                name="chevron-down"
                size={20}
                color={
                  !selectedRegion
                    ? theme.colors.onSurfaceVariant + "80"
                    : theme.colors.onSurfaceVariant
                }
              />
            </TouchableOpacity>

            {/* City */}
            <TouchableOpacity
              style={[
                styles.locationInput,
                { backgroundColor: theme.colors.surface },
                !selectedRegion && styles.locationInputDisabled,
                selectedCity && styles.locationInputFilled,
                selectedCity && { borderColor: "#F59E0B" },
              ]}
              onPress={() => selectedRegion && setShowCityModal(true)}
              disabled={!selectedRegion}
            >
              <View style={styles.locationInputIcon}>
                <Ionicons
                  name="business"
                  size={20}
                  color={
                    selectedCity ? "#F59E0B" : theme.colors.onSurfaceVariant
                  }
                />
              </View>
              <View style={styles.locationInputContent}>
                <Text
                  style={[
                    styles.locationInputLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  City *
                </Text>
                <Text
                  style={[
                    styles.locationInputValue,
                    {
                      color: selectedCity
                        ? theme.colors.onSurface
                        : theme.colors.onSurfaceVariant,
                      opacity: !selectedRegion ? 0.5 : 1,
                    },
                  ]}
                >
                  {selectedCity || "Select City"}
                </Text>
              </View>
              <Ionicons
                name="chevron-down"
                size={20}
                color={
                  !selectedRegion
                    ? theme.colors.onSurfaceVariant + "80"
                    : theme.colors.onSurfaceVariant
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[styles.sectionIcon, { backgroundColor: "#F59E0B20" }]}
            >
              <Ionicons name="document-text" size={20} color="#F59E0B" />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.onBackground },
                ]}
              >
                Vehicle Description
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Tell buyers about your car
              </Text>
            </View>
          </View>

          {/* Description Tips */}
          <View
            style={[
              styles.tipCard,
              { backgroundColor: theme.colors.primary + "08" },
            ]}
          >
            <Ionicons name="bulb" size={24} color={theme.colors.primary} />
            <View style={styles.tipContent}>
              <Text
                style={[styles.tipTitle, { color: theme.colors.onSurface }]}
              >
                Pro Tips for Great Descriptions
              </Text>
              <View style={styles.tipList}>
                <Text
                  style={[
                    styles.tipItem,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  • Mention maintenance history and service records
                </Text>
                <Text
                  style={[
                    styles.tipItem,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  • Describe any special features or upgrades
                </Text>
                <Text
                  style={[
                    styles.tipItem,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  • Be honest about condition and any issues
                </Text>
              </View>
            </View>
          </View>

          {/* Description Input */}
          <View style={styles.descriptionContainer}>
            <View style={styles.descriptionHeader}>
              <Text
                style={[
                  styles.descriptionLabel,
                  { color: theme.colors.onSurface },
                ]}
              >
                Write your description *
              </Text>
              <Text
                style={[
                  styles.descriptionCount,
                  {
                    color:
                      description.length < 50
                        ? "#EF4444"
                        : description.length < 100
                          ? "#F59E0B"
                          : "#10B981",
                  },
                ]}
              >
                {description.length}/2000
              </Text>
            </View>

            <TextInput
              mode="outlined"
              multiline
              numberOfLines={6}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your vehicle's condition, features, maintenance history, and any other relevant details..."
              style={styles.descriptionInput}
              textAlignVertical="top"
              theme={{
                colors: {
                  primary: theme.colors.primary,
                  background: theme.colors.surface,
                  text: theme.colors.onSurface,
                  placeholder: theme.colors.onSurfaceVariant + "80",
                },
                roundness: 12,
              }}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />

            <View style={styles.descriptionFooter}>
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(descriptionScore, 100)}%`,
                        backgroundColor:
                          description.length < 50
                            ? "#EF4444"
                            : description.length < 100
                              ? "#F59E0B"
                              : "#10B981",
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.progressText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {description.length < 50
                    ? "Add more details"
                    : "Good description!"}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.examplesToggle}
                onPress={() => setShowExamples(!showExamples)}
              >
                <Ionicons
                  name={showExamples ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={theme.colors.primary}
                />
                <Text
                  style={[styles.examplesText, { color: theme.colors.primary }]}
                >
                  {showExamples ? "Hide Examples" : "Show Examples"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Examples Section */}
          {showExamples && (
            <View style={styles.examplesSection}>
              <View style={styles.exampleCard}>
                <View
                  style={[
                    styles.exampleBadge,
                    { backgroundColor: "#10B98120" },
                  ]}
                >
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={[styles.exampleBadgeText, { color: "#10B981" }]}>
                    Good Example
                  </Text>
                </View>
                <Text
                  style={[
                    styles.exampleText,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  "Well-maintained 2020 Toyota Camry with 45,000 km. Regular oil
                  changes every 5,000 km, new tires installed last year. No
                  accidents, clean interior with leather seats. AC works
                  perfectly, all features functional. Always serviced at
                  authorized dealership. Ready for immediate sale."
                </Text>
              </View>

              <View style={styles.exampleCard}>
                <View
                  style={[
                    styles.exampleBadge,
                    { backgroundColor: "#EF444420" },
                  ]}
                >
                  <Ionicons name="close-circle" size={16} color="#EF4444" />
                  <Text style={[styles.exampleBadgeText, { color: "#EF4444" }]}>
                    Poor Example
                  </Text>
                </View>
                <Text
                  style={[
                    styles.exampleText,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  "Car for sale. Good condition. Call me."
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Contact Preference Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[styles.sectionIcon, { backgroundColor: "#8B5CF620" }]}
            >
              <Ionicons name="chatbubbles" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.onBackground },
                ]}
              >
                Contact Preference
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                How buyers can contact you
              </Text>
            </View>
          </View>

          <View style={styles.contactOptions}>
            {contactOptions.map((option) => {
              const isSelected = contactPreference === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.contactOption,
                    isSelected && styles.contactOptionSelected,
                    isSelected && { borderColor: option.color },
                  ]}
                  onPress={() => setContactPreference(option.value)}
                >
                  <View
                    style={[
                      styles.contactOptionIcon,
                      {
                        backgroundColor: isSelected
                          ? option.color + "20"
                          : theme.colors.surfaceVariant,
                      },
                    ]}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={24}
                      color={
                        isSelected
                          ? option.color
                          : theme.colors.onSurfaceVariant
                      }
                    />
                  </View>
                  <View style={styles.contactOptionContent}>
                    <Text
                      style={[
                        styles.contactOptionTitle,
                        {
                          color: isSelected
                            ? option.color
                            : theme.colors.onSurface,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.contactOptionDescription,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {option.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <View
                      style={[
                        styles.contactOptionCheck,
                        { backgroundColor: option.color },
                      ]}
                    >
                      <Ionicons name="checkmark" size={16} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Availability Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[styles.sectionIcon, { backgroundColor: "#10B98120" }]}
            >
              <Ionicons name="time" size={20} color="#10B981" />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.onBackground },
                ]}
              >
                Availability for Viewing
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                When can buyers see the car?
              </Text>
            </View>
          </View>

          <View style={styles.availabilityGrid}>
            {availabilityOptions.map((option) => {
              const isSelected =
                availability[option.key as keyof typeof availability];
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.availabilityOption,
                    isSelected && styles.availabilityOptionSelected,
                    isSelected && { borderColor: option.color },
                  ]}
                  onPress={() =>
                    toggleAvailability(option.key as keyof typeof availability)
                  }
                >
                  <View
                    style={[
                      styles.availabilityOptionIcon,
                      {
                        backgroundColor: isSelected
                          ? option.color + "20"
                          : theme.colors.surfaceVariant,
                      },
                    ]}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={
                        isSelected
                          ? option.color
                          : theme.colors.onSurfaceVariant
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.availabilityOptionText,
                      {
                        color: isSelected
                          ? option.color
                          : theme.colors.onSurface,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <View
                      style={[
                        styles.availabilityOptionCheck,
                        { backgroundColor: option.color },
                      ]}
                    >
                      <Ionicons name="checkmark" size={12} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

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
          disabled={!isReadyToContinue}
        >
          {isReadyToContinue
            ? "Review Your Listing"
            : `Complete ${!selectedRegion ? "Location" : "Description"}`}
        </Button>

        {/* Features below button */}
        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <Ionicons
              name="shield-checkmark"
              size={16}
              color={theme.colors.primary}
            />
            <Text
              style={[
                styles.featureText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Secure Contact
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
              Location Verified
            </Text>
          </View>
          <View style={styles.featureDivider} />
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
              Fast Responses
            </Text>
          </View>
        </View>
      </View>

      {/* Modals */}
      {renderSelectionModal(
        showRegionModal,
        () => setShowRegionModal(false),
        "Select Region",
        displayRegions.map((r) => getRegionName(r)).filter(Boolean),
        selectedRegion,
        (region) => {
          setSelectedRegion(region);
          setSelectedZone("");
          setSelectedCity("");
        },
        isLoadingLocations
      )}

      {renderSelectionModal(
        showZoneModal,
        () => setShowZoneModal(false),
        "Select Zone",
        availableZones,
        selectedZone,
        setSelectedZone,
        !selectedRegion
      )}

      {renderSelectionModal(
        showCityModal,
        () => setShowCityModal(false),
        "Select City",
        availableCities,
        selectedCity,
        setSelectedCity,
        !selectedRegion
      )}
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
      paddingBottom: 180,
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
      padding: 20,
      borderRadius: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.outline + "20",
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
      fontSize: 28,
      fontWeight: "800",
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: "500",
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: theme.colors.outline + "40",
    },
    section: {
      marginBottom: 28,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    sectionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    sectionTitleContainer: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 2,
    },
    sectionSubtitle: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    locationButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.outline + "20",
      marginBottom: 16,
    },
    locationButtonActive: {
      borderColor: theme.colors.primary,
    },
    locationIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    locationContent: {
      flex: 1,
    },
    locationTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 2,
    },
    locationDescription: {
      fontSize: 13,
    },
    locationCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 16,
      marginBottom: 16,
    },
    locationCardContent: {
      flex: 1,
      marginLeft: 12,
    },
    locationAddress: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 4,
    },
    locationAccuracy: {
      fontSize: 12,
    },
    orDivider: {
      textAlign: "center",
      fontSize: 14,
      marginVertical: 16,
      fontWeight: "500",
    },
    locationForm: {
      gap: 12,
    },
    locationInput: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: theme.colors.outline,
    },
    locationInputFilled: {
      borderWidth: 2,
    },
    locationInputDisabled: {
      opacity: 0.6,
    },
    locationInputIcon: {
      marginRight: 12,
    },
    locationInputContent: {
      flex: 1,
    },
    locationInputLabel: {
      fontSize: 12,
      fontWeight: "500",
      marginBottom: 2,
    },
    locationInputValue: {
      fontSize: 16,
      fontWeight: "600",
    },
    tipCard: {
      flexDirection: "row",
      padding: 16,
      borderRadius: 16,
      marginBottom: 20,
      alignItems: "flex-start",
    },
    tipContent: {
      flex: 1,
      marginLeft: 12,
    },
    tipTitle: {
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 8,
    },
    tipList: {
      gap: 4,
    },
    tipItem: {
      fontSize: 13,
      lineHeight: 18,
    },
    descriptionContainer: {
      marginBottom: 20,
    },
    descriptionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    descriptionLabel: {
      fontSize: 16,
      fontWeight: "600",
    },
    descriptionCount: {
      fontSize: 14,
      fontWeight: "600",
    },
    descriptionInput: {
      backgroundColor: theme.colors.surface,
      minHeight: 140,
    },
    descriptionFooter: {
      marginTop: 12,
    },
    progressContainer: {
      marginBottom: 12,
    },
    progressText: {
      fontSize: 12,
      fontWeight: "500",
      marginTop: 4,
    },
    examplesToggle: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
    },
    examplesText: {
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 6,
    },
    examplesSection: {
      gap: 16,
    },
    exampleCard: {
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline + "20",
    },
    exampleBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 12,
      gap: 6,
    },
    exampleBadgeText: {
      fontSize: 12,
      fontWeight: "700",
    },
    exampleText: {
      fontSize: 14,
      lineHeight: 20,
    },
    contactOptions: {
      gap: 12,
    },
    contactOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
      position: "relative",
    },
    contactOptionSelected: {
      borderWidth: 2,
    },
    contactOptionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    contactOptionContent: {
      flex: 1,
    },
    contactOptionTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 4,
    },
    contactOptionDescription: {
      fontSize: 13,
      lineHeight: 18,
    },
    contactOptionCheck: {
      position: "absolute",
      top: -6,
      right: -6,
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    availabilityGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    availabilityOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
      minWidth: (screenWidth - 60) / 3,
      position: "relative",
    },
    availabilityOptionSelected: {
      borderWidth: 2,
    },
    availabilityOptionIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
    },
    availabilityOptionText: {
      fontSize: 13,
      fontWeight: "600",
    },
    availabilityOptionCheck: {
      position: "absolute",
      top: -4,
      right: -4,
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
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
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "flex-end",
    },
    modalContainer: {
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      maxHeight: "85%",
      paddingBottom: 40,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline + "30",
    },
    modalTitleContainer: {
      flex: 1,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: "700",
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    modalSubtitle: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    modalCloseButton: {
      padding: 4,
    },
    modalContent: {
      maxHeight: 500,
      paddingVertical: 8,
    },
    modalItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 18,
      marginHorizontal: 8,
      marginVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.outline + "20",
    },
    modalItemContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    modalItemText: {
      fontSize: 16,
      marginLeft: 16,
      flex: 1,
    },
    modalDisabledState: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
      paddingHorizontal: 24,
    },
    modalDisabledText: {
      fontSize: 16,
      fontWeight: "500",
      marginTop: 16,
      textAlign: "center",
    },
  });
};
