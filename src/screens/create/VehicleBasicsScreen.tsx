import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, TextInput, useTheme } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuthStore } from "../../features/auth/auth.store";
import { useCarMakes } from "../../features/cars/car.hooks";
import { VehicleData } from "../../types/vehicle";

interface VehicleBasicsScreenProps {
  onContinue?: () => void;
  onBack?: () => void;
  vehicleData?: VehicleData;
  updateVehicleData?: (updates: Partial<VehicleData>) => void;
}

export default React.memo(function VehicleBasicsScreen({
  onContinue,
  onBack,
  vehicleData,
  updateVehicleData,
}: VehicleBasicsScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");
  const styles = getDynamicStyles(theme, width, insets);

  // Check authentication status
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
  const user = useAuthStore((state: any) => state.user);

  const [formData, setFormData] = useState({
    make_id: vehicleData?.make_id || undefined,
    model_id: vehicleData?.model_id || "",
    make: vehicleData?.make || "",
    model: vehicleData?.model || "",
    year: vehicleData?.year || "",
    mileage: vehicleData?.mileage || "",
    condition:
      (vehicleData?.condition as any) ||
      ("" as "New" | "Like New" | "Excellent" | "Good" | "Fair" | "Poor"),
    color: vehicleData?.color || "",
    doors: vehicleData?.doors?.toString() || "",
    seats: vehicleData?.seats?.toString() || "",
    transmission: vehicleData?.transmission || "",
    fuel: vehicleData?.fuel || "",
    body_type:
      (vehicleData?.body_type as any) ||
      ("" as
        | "Sedan"
        | "SUV"
        | "Truck"
        | "Coupe"
        | "Hatchback"
        | "Van"
        | "Convertible"
        | "Wagon"
        | "Minivan"
        | "Crossover"),
    drive_type:
      (vehicleData?.drive_type as any) || ("" as "FWD" | "RWD" | "AWD" | "4WD"),
  });

  const [selectedMakeId, setSelectedMakeId] = useState<number | undefined>(
    vehicleData?.make_id,
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMakeModal, setShowMakeModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showDoorsModal, setShowDoorsModal] = useState(false);
  const [showSeatsModal, setShowSeatsModal] = useState(false);
  const [showTransmissionModal, setShowTransmissionModal] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showBodyTypeModal, setShowBodyTypeModal] = useState(false);
  const [showDriveTypeModal, setShowDriveTypeModal] = useState(false);

  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard visibility state
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Listen for keyboard show/hide events
  useEffect(() => {
    const keyboardShowEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const keyboardHideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(keyboardShowEvent, () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener(keyboardHideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Debounce search term
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Animated value for spinner rotation
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        "Authentication Required",
        "Please sign in first to create a car listing.",
        [
          {
            text: "Sign In",
            onPress: () => router.replace("/(auth)/login"),
            style: "default",
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
      );
    }
  }, [isAuthenticated, router]);

  // If not authenticated, show a message instead of the form
  if (!isAuthenticated) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <StatusBar
          barStyle={theme.dark ? "light-content" : "dark-content"}
          backgroundColor={theme.colors.background}
        />
        <View style={styles.authRequiredContainer}>
          <Ionicons name="lock-closed" size={80} color={theme.colors.primary} />
          <Text
            style={[
              styles.authRequiredTitle,
              { color: theme.colors.onBackground },
            ]}
          >
            Please Sign In First
          </Text>
          <Text
            style={[
              styles.authRequiredMessage,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            You need to be signed in to create a car listing.
          </Text>
          <Button
            mode="contained"
            onPress={() => router.replace("/(auth)/login")}
            style={[
              styles.signInButton,
              { backgroundColor: theme.colors.primary },
            ]}
            labelStyle={{ color: theme.colors.onPrimary }}
          >
            Sign In
          </Button>
        </View>
      </View>
    );
  }

  // Create animations
  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    );

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    spinAnimation.start();

    return () => spinAnimation.stop();
  }, []);

  // Interpolations
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Trigger the query only when modal is opened
  const {
    data: makesResponse,
    isLoading: isLoadingMakes,
    error: makesError,
    refetch: refetchMakes,
  } = useCarMakes(
    showMakeModal ? debouncedSearchTerm : undefined,
    showMakeModal ? 50 : undefined,
  );

  const handleOpenMakeModal = () => {
    setShowMakeModal(true);
    setSearchTerm("");
    setDebouncedSearchTerm("");
    refetchMakes();
  };

  const handleSearchMakes = (term: string) => {
    setSearchTerm(term);
  };

  // Generate years from 1886 to 2026
  const years = Array.from({ length: 2026 - 1886 + 1 }, (_, i) =>
    (2026 - i).toString(),
  );

  // Extract makes from API response
  const makes = useMemo(() => {
    if (!makesResponse?.success) {
      return [];
    }

    // Try different possible data structures
    let makesData: any[] = [];

    if (Array.isArray(makesResponse.data)) {
      makesData = makesResponse.data;
    } else if (
      (makesResponse.data as any)?.makes &&
      Array.isArray((makesResponse.data as any).makes)
    ) {
      makesData = (makesResponse.data as any).makes;
    } else if (
      (makesResponse.data as any)?.data &&
      Array.isArray((makesResponse.data as any).data)
    ) {
      makesData = (makesResponse.data as any).data;
    } else {
      return [];
    }

    return makesData.map((make: any) => ({
      id: make.make_id,
      name: make.name,
    }));
  }, [makesResponse]);

  const conditions = ["New", "Like New", "Excellent", "Good", "Fair", "Poor"];
  const transmissions = ["Manual", "Automatic", "CVT", "Semi-Automatic"];
  const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];
  const bodyTypes = [
    "Sedan",
    "SUV",
    "Truck",
    "Coupe",
    "Hatchback",
    "Van",
    "Convertible",
    "Wagon",
    "Minivan",
    "Crossover",
  ];
  const driveTypes = ["FWD", "RWD", "AWD", "4WD"];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.make) newErrors.make = "This field is required";
    if (!formData.model) newErrors.model = "This field is required";
    if (!formData.year) newErrors.year = "This field is required";
    if (!formData.mileage || parseInt(formData.mileage) < 0)
      newErrors.mileage = "This field is required";
    if (!formData.condition) newErrors.condition = "This field is required";
    if (!formData.doors) newErrors.doors = "This field is required";
    if (!formData.seats) newErrors.seats = "This field is required";
    if (!formData.transmission)
      newErrors.transmission = "This field is required";
    if (!formData.fuel) newErrors.fuel = "This field is required";
    if (!formData.body_type) newErrors.body_type = "This field is required";
    if (!formData.drive_type) newErrors.drive_type = "This field is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate individual field on blur
  const validateField = (fieldName: string) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case "make":
        if (!formData.make) {
          newErrors.make = "This field is required";
        } else {
          delete newErrors.make;
        }
        break;
      case "model":
        if (!formData.model) {
          newErrors.model = "This field is required";
        } else {
          delete newErrors.model;
        }
        break;
      case "year":
        if (!formData.year) {
          newErrors.year = "This field is required";
        } else {
          delete newErrors.year;
        }
        break;
      case "mileage":
        if (!formData.mileage || parseInt(formData.mileage) < 0) {
          newErrors.mileage = "This field is required";
        } else {
          delete newErrors.mileage;
        }
        break;
      case "condition":
        if (!formData.condition) {
          newErrors.condition = "This field is required";
        } else {
          delete newErrors.condition;
        }
        break;
      case "doors":
        if (!formData.doors) {
          newErrors.doors = "This field is required";
        } else {
          delete newErrors.doors;
        }
        break;
      case "seats":
        if (!formData.seats) {
          newErrors.seats = "This field is required";
        } else {
          delete newErrors.seats;
        }
        break;
      case "transmission":
        if (!formData.transmission) {
          newErrors.transmission = "This field is required";
        } else {
          delete newErrors.transmission;
        }
        break;
      case "fuel":
        if (!formData.fuel) {
          newErrors.fuel = "This field is required";
        } else {
          delete newErrors.fuel;
        }
        break;
      case "body_type":
        if (!formData.body_type) {
          newErrors.body_type = "This field is required";
        } else {
          delete newErrors.body_type;
        }
        break;
      case "drive_type":
        if (!formData.drive_type) {
          newErrors.drive_type = "This field is required";
        } else {
          delete newErrors.drive_type;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleSubmit = () => {
    // Validate all fields and show errors
    const newErrors: Record<string, string> = {};
    if (!formData.make) newErrors.make = "This field is required";
    if (!formData.model) newErrors.model = "This field is required";
    if (!formData.year) newErrors.year = "This field is required";
    if (!formData.mileage || parseInt(formData.mileage) < 0)
      newErrors.mileage = "This field is required";
    if (!formData.condition) newErrors.condition = "This field is required";
    if (!formData.doors) newErrors.doors = "This field is required";
    if (!formData.seats) newErrors.seats = "This field is required";
    if (!formData.transmission)
      newErrors.transmission = "This field is required";
    if (!formData.fuel) newErrors.fuel = "This field is required";
    if (!formData.body_type) newErrors.body_type = "This field is required";
    if (!formData.drive_type) newErrors.drive_type = "This field is required";

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.keys(newErrors).length > 0;
    if (hasErrors) {
      return; // Don't continue if there are errors
    }

    if (updateVehicleData) {
      updateVehicleData({
        make_id: selectedMakeId,
        model_id: formData.model,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        mileage: formData.mileage,
        condition: formData.condition,
        color: formData.color,
        doors: parseInt(formData.doors) || undefined,
        seats: parseInt(formData.seats) || undefined,
        transmission: formData.transmission,
        fuel: formData.fuel,
        body_type: formData.body_type,
        drive_type: formData.drive_type,
      });
    }

    onContinue?.();
  };

  const handleBackPress = () => {
    onBack?.();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const renderModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    items: string[] | { id: any; name: any }[],
    selectedValue: string,
    onSelect: (value: string) => void,
    isLoading?: boolean,
    error?: any,
    isMakeModal?: boolean,
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.colors.background,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  }),
                },
              ],
            },
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
              <View
                style={[
                  styles.modalIndicator,
                  { backgroundColor: theme.colors.primary },
                ]}
              />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close-circle"
                size={28}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>

          {/* Search Input - Only for Make Modal */}
          {isMakeModal && (
            <View style={styles.searchContainer}>
              <TextInput
                mode="outlined"
                placeholder="Search makes..."
                value={searchTerm}
                onChangeText={handleSearchMakes}
                style={styles.searchInput}
                left={
                  <TextInput.Icon
                    icon="magnify"
                    size={20}
                    color={theme.colors.onSurfaceVariant}
                  />
                }
                right={
                  searchTerm ? (
                    <TextInput.Icon
                      icon="close"
                      size={20}
                      color={theme.colors.onSurfaceVariant}
                      onPress={() => handleSearchMakes("")}
                    />
                  ) : undefined
                }
                theme={{
                  colors: {
                    background: theme.colors.surface,
                    onSurface: theme.colors.onSurface,
                    primary: theme.colors.primary,
                  },
                }}
              />
            </View>
          )}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Animated.View
                style={[styles.spinner, { transform: [{ rotate: spin }] }]}
              >
                <Ionicons
                  name="car-sport"
                  size={48}
                  color={theme.colors.primary}
                />
              </Animated.View>
              <Text
                style={[
                  styles.loadingText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Loading options...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="warning" size={48} color={theme.colors.error} />
              <Text style={[styles.errorText, { color: "#ff4444" }]}>
                Failed to load data
              </Text>
              <Text
                style={[
                  styles.errorSubtext,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Please check your connection
              </Text>
              <TouchableOpacity
                style={[
                  styles.retryButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => refetchMakes()}
              >
                <Ionicons
                  name="refresh"
                  size={20}
                  color={theme.colors.onPrimary}
                />
                <Text
                  style={[
                    styles.retryButtonText,
                    { color: theme.colors.onPrimary },
                  ]}
                >
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          ) : items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="car-outline"
                size={48}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.emptyText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                No options available
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {items.map((item) => {
                const itemValue = typeof item === "string" ? item : item.name;
                const itemId = typeof item === "string" ? item : item.id;

                return (
                  <TouchableOpacity
                    key={itemId}
                    style={[
                      styles.modalItem,
                      {
                        backgroundColor: theme.colors.surface,
                        borderLeftWidth: selectedValue === itemValue ? 4 : 0,
                        borderLeftColor:
                          selectedValue === itemValue
                            ? theme.colors.primary
                            : "transparent",
                      },
                    ]}
                    onPress={() => {
                      if (isMakeModal && typeof item !== "string") {
                        // For make modal, store both ID and name
                        setSelectedMakeId(item.id);
                        updateFormData("make", item.name);
                        updateFormData("make_id", item.id);
                        // Reset model when make changes
                        updateFormData("model", "");
                        updateFormData("model_id", "");
                      } else {
                        onSelect(itemValue);
                      }
                      onClose();
                    }}
                  >
                    <View style={styles.modalItemContent}>
                      {selectedValue === itemValue ? (
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
                            color:
                              selectedValue === itemValue
                                ? theme.colors.primary
                                : theme.colors.onSurface,
                            fontFamily:
                              selectedValue === itemValue ? "System" : "System",
                            fontWeight:
                              selectedValue === itemValue ? "600" : "400",
                          },
                        ]}
                      >
                        {itemValue}
                      </Text>
                    </View>
                    {selectedValue === itemValue && (
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.fullScreen} edges={["bottom", "left", "right"]}>
      <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Text
            style={[styles.headerTitle, { color: theme.colors.onBackground }]}
          >
            Vehicle Basics
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Step 1 • Essential Information
          </Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="car" size={24} color={theme.colors.primary} />
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.primary,
                  width: "14%", // 1/7 steps
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
            Step 1 of 4
          </Text>
        </View>

        {/* Main Section */}
        <View style={styles.mainSection}>
          <View style={styles.titleContainer}>
            <Ionicons
              name="car-sport"
              size={32}
              color={theme.colors.primary}
              style={styles.titleIcon}
            />
            <Text
              style={[styles.mainTitle, { color: theme.colors.onBackground }]}
            >
              Tell Us About Your Vehicle
            </Text>
            <Text
              style={[
                styles.subTitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Start with the basics - we'll help with the rest
            </Text>
          </View>

          {/* Form Grid */}
          <View style={styles.formGrid}>
            {/* Make */}
            <View style={styles.formField}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Make <Text style={{ color: "#ff4444" }}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.fieldInput,
                  {
                    borderColor: errors.make
                      ? theme.colors.error
                      : theme.colors.outline,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
                onPress={handleOpenMakeModal}
              >
                <View style={styles.inputContent}>
                  <Ionicons
                    name="business"
                    size={20}
                    color={
                      formData.make
                        ? theme.colors.primary
                        : theme.colors.onSurfaceVariant
                    }
                    style={styles.inputIcon}
                  />
                  <Text
                    style={[
                      styles.inputText,
                      {
                        color: formData.make
                          ? theme.colors.onSurface
                          : theme.colors.onSurfaceVariant,
                        fontFamily: formData.make ? "System" : "System",
                      },
                    ]}
                  >
                    {formData.make || "Select vehicle make"}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-down"
                  size={22}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
              {errors.make && (
                <View style={styles.errorContainerInline}>
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color={theme.colors.error}
                  />
                  <Text style={[styles.errorTextInline, { color: "#ff4444" }]}>
                    {errors.make}
                  </Text>
                </View>
              )}
            </View>

            {/* Model */}
            <View style={styles.formField}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Model <Text style={{ color: "#ff4444" }}>*</Text>
              </Text>
              <View
                style={[
                  styles.fieldInput,
                  {
                    borderColor: errors.model
                      ? theme.colors.error
                      : theme.colors.outline,
                    backgroundColor: theme.colors.surface,
                    opacity: !formData.make ? 0.5 : 1,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                  },
                ]}
              >
                <Ionicons
                  name="car-outline"
                  size={20}
                  color={
                    formData.model
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  mode="flat"
                  placeholder="Enter vehicle model"
                  value={formData.model}
                  onChangeText={(value) => updateFormData("model", value)}
                  style={[styles.textInput, { flex: 1 }]}
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  underlineColor="transparent"
                  theme={{
                    colors: {
                      primary: theme.colors.primary,
                      background: "transparent",
                      text: theme.colors.onSurface,
                      placeholder: theme.colors.onSurfaceVariant,
                    },
                  }}
                  disabled={!formData.make}
                />
              </View>
              {errors.model && (
                <View style={styles.errorContainerInline}>
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color={theme.colors.error}
                  />
                  <Text style={[styles.errorTextInline, { color: "#ff4444" }]}>
                    {errors.model}
                  </Text>
                </View>
              )}
            </View>

            {/* Year & Mileage Row */}
            <View style={styles.formRow}>
              <View style={[styles.formField, styles.halfField]}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Year <Text style={{ color: "#ff4444" }}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.fieldInput,
                    {
                      borderColor: errors.year
                        ? theme.colors.error
                        : theme.colors.outline,
                      backgroundColor: theme.colors.surface,
                    },
                  ]}
                  onPress={() => setShowYearModal(true)}
                >
                  <View style={styles.inputContent}>
                    <Ionicons
                      name="calendar"
                      size={20}
                      color={
                        formData.year
                          ? theme.colors.primary
                          : theme.colors.onSurfaceVariant
                      }
                      style={styles.inputIcon}
                    />
                    <Text
                      style={[
                        styles.inputText,
                        {
                          color: formData.year
                            ? theme.colors.onSurface
                            : theme.colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {formData.year || "Select year"}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-down"
                    size={22}
                    color={theme.colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
                {errors.year && (
                  <View style={styles.errorContainerInline}>
                    <Ionicons
                      name="alert-circle"
                      size={16}
                      color={theme.colors.error}
                    />
                    <Text
                      style={[styles.errorTextInline, { color: "#ff4444" }]}
                    >
                      {errors.year}
                    </Text>
                  </View>
                )}
              </View>

              <View style={[styles.formField, styles.halfField]}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Mileage <Text style={{ color: "#ff4444" }}>*</Text>
                </Text>
                <View
                  style={[
                    styles.fieldInput,
                    {
                      borderColor: errors.mileage
                        ? theme.colors.error
                        : theme.colors.outline,
                      backgroundColor: theme.colors.surface,
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                    },
                  ]}
                >
                  <Ionicons
                    name="speedometer"
                    size={20}
                    color={
                      formData.mileage
                        ? theme.colors.primary
                        : theme.colors.onSurfaceVariant
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    mode="flat"
                    placeholder="0"
                    value={formData.mileage}
                    onChangeText={(value) => updateFormData("mileage", value)}
                    style={[styles.textInput, { flex: 1 }]}
                    keyboardType="numeric"
                    error={!!errors.mileage}
                    dense
                    underlineColor="transparent"
                    theme={{
                      colors: {
                        primary: theme.colors.primary,
                        background: "transparent",
                        text: theme.colors.onSurface,
                        placeholder: theme.colors.onSurfaceVariant,
                        error: theme.colors.error,
                      },
                    }}
                  />
                  <Text
                    style={[
                      styles.unitText,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    km
                  </Text>
                </View>
                {errors.mileage && (
                  <View style={styles.errorContainerInline}>
                    <Ionicons
                      name="alert-circle"
                      size={16}
                      color={theme.colors.error}
                    />
                    <Text
                      style={[styles.errorTextInline, { color: "#ff4444" }]}
                    >
                      {errors.mileage}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Condition */}
            <View style={styles.formField}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Condition <Text style={{ color: "#ff4444" }}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.fieldInput,
                  {
                    borderColor: errors.condition
                      ? theme.colors.error
                      : theme.colors.outline,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
                onPress={() => setShowConditionModal(true)}
              >
                <View style={styles.inputContent}>
                  <Ionicons
                    name="construct"
                    size={20}
                    color={
                      formData.condition
                        ? theme.colors.primary
                        : theme.colors.onSurfaceVariant
                    }
                    style={styles.inputIcon}
                  />
                  <Text
                    style={[
                      styles.inputText,
                      {
                        color: formData.condition
                          ? theme.colors.onSurface
                          : theme.colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {formData.condition || "Select condition"}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-down"
                  size={22}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
              {errors.condition && (
                <View style={styles.errorContainerInline}>
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color={theme.colors.error}
                  />
                  <Text style={[styles.errorTextInline, { color: "#ff4444" }]}>
                    {errors.condition}
                  </Text>
                </View>
              )}
            </View>

            {/* Doors & Seats Row */}
            <View style={styles.formRow}>
              <View style={[styles.formField, styles.halfField]}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Doors <Text style={{ color: "#ff4444" }}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.fieldInput,
                    {
                      borderColor: errors.doors
                        ? theme.colors.error
                        : theme.colors.outline,
                      backgroundColor: theme.colors.surface,
                    },
                  ]}
                  onPress={() => setShowDoorsModal(true)}
                >
                  <View style={styles.inputContent}>
                    <Ionicons
                      name="car-sport"
                      size={20}
                      color={
                        formData.doors
                          ? theme.colors.primary
                          : theme.colors.onSurfaceVariant
                      }
                      style={styles.inputIcon}
                    />
                    <Text
                      style={[
                        styles.inputText,
                        {
                          color: formData.doors
                            ? theme.colors.onSurface
                            : theme.colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {formData.doors || "Select doors"}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-down"
                    size={22}
                    color={theme.colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
                {errors.doors && (
                  <View style={styles.errorContainerInline}>
                    <Ionicons
                      name="alert-circle"
                      size={16}
                      color={theme.colors.error}
                    />
                    <Text
                      style={[styles.errorTextInline, { color: "#ff4444" }]}
                    >
                      {errors.doors}
                    </Text>
                  </View>
                )}
              </View>
              <View style={[styles.formField, styles.halfField]}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Seats <Text style={{ color: "#ff4444" }}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.fieldInput,
                    {
                      borderColor: errors.seats
                        ? theme.colors.error
                        : theme.colors.outline,
                      backgroundColor: theme.colors.surface,
                    },
                  ]}
                  onPress={() => setShowSeatsModal(true)}
                >
                  <View style={styles.inputContent}>
                    <Ionicons
                      name="people"
                      size={20}
                      color={
                        formData.seats
                          ? theme.colors.primary
                          : theme.colors.onSurfaceVariant
                      }
                      style={styles.inputIcon}
                    />
                    <Text
                      style={[
                        styles.inputText,
                        {
                          color: formData.seats
                            ? theme.colors.onSurface
                            : theme.colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {formData.seats || "Select seats"}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-down"
                    size={22}
                    color={theme.colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
                {errors.seats && (
                  <View style={styles.errorContainerInline}>
                    <Ionicons
                      name="alert-circle"
                      size={16}
                      color={theme.colors.error}
                    />
                    <Text
                      style={[styles.errorTextInline, { color: "#ff4444" }]}
                    >
                      {errors.seats}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Transmission & Fuel Row */}
            <View style={styles.formRow}>
              <View style={[styles.formField, styles.halfField]}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Transmission <Text style={{ color: "#ff4444" }}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.fieldInput,
                    {
                      borderColor: errors.transmission
                        ? theme.colors.error
                        : theme.colors.outline,
                      backgroundColor: theme.colors.surface,
                    },
                  ]}
                  onPress={() => setShowTransmissionModal(true)}
                >
                  <View style={styles.inputContent}>
                    <Ionicons
                      name="settings"
                      size={20}
                      color={
                        formData.transmission
                          ? theme.colors.primary
                          : theme.colors.onSurfaceVariant
                      }
                      style={styles.inputIcon}
                    />
                    <Text
                      style={[
                        styles.inputText,
                        {
                          color: formData.transmission
                            ? theme.colors.onSurface
                            : theme.colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {formData.transmission || "Select transmission"}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-down"
                    size={22}
                    color={theme.colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
                {errors.transmission && (
                  <View style={styles.errorContainerInline}>
                    <Ionicons
                      name="alert-circle"
                      size={16}
                      color={theme.colors.error}
                    />
                    <Text
                      style={[styles.errorTextInline, { color: "#ff4444" }]}
                    >
                      {errors.transmission}
                    </Text>
                  </View>
                )}
              </View>
              <View style={[styles.formField, styles.halfField]}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Fuel Type <Text style={{ color: "#ff4444" }}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.fieldInput,
                    {
                      borderColor: errors.fuel
                        ? theme.colors.error
                        : theme.colors.outline,
                      backgroundColor: theme.colors.surface,
                    },
                  ]}
                  onPress={() => setShowFuelModal(true)}
                >
                  <View style={styles.inputContent}>
                    <Ionicons
                      name="flame"
                      size={20}
                      color={
                        formData.fuel
                          ? theme.colors.primary
                          : theme.colors.onSurfaceVariant
                      }
                      style={styles.inputIcon}
                    />
                    <Text
                      style={[
                        styles.inputText,
                        {
                          color: formData.fuel
                            ? theme.colors.onSurface
                            : theme.colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {formData.fuel || "Select fuel type"}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-down"
                    size={22}
                    color={theme.colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
                {errors.fuel && (
                  <View style={styles.errorContainerInline}>
                    <Ionicons
                      name="alert-circle"
                      size={16}
                      color={theme.colors.error}
                    />
                    <Text
                      style={[styles.errorTextInline, { color: "#ff4444" }]}
                    >
                      {errors.fuel}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Body Type & Drive Type Row */}
            <View style={styles.formRow}>
              <View style={[styles.formField, styles.halfField]}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Body Type <Text style={{ color: "#ff4444" }}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.fieldInput,
                    {
                      borderColor: errors.body_type
                        ? theme.colors.error
                        : theme.colors.outline,
                      backgroundColor: theme.colors.surface,
                    },
                  ]}
                  onPress={() => setShowBodyTypeModal(true)}
                >
                  <View style={styles.inputContent}>
                    <Ionicons
                      name="car"
                      size={20}
                      color={
                        formData.body_type
                          ? theme.colors.primary
                          : theme.colors.onSurfaceVariant
                      }
                      style={styles.inputIcon}
                    />
                    <Text
                      style={[
                        styles.inputText,
                        {
                          color: formData.body_type
                            ? theme.colors.onSurface
                            : theme.colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {formData.body_type || "Select body type"}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={theme.colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
                {errors.body_type && (
                  <View style={styles.errorContainerInline}>
                    <Ionicons
                      name="alert-circle"
                      size={16}
                      color={theme.colors.error}
                    />
                    <Text
                      style={[styles.errorTextInline, { color: "#ff4444" }]}
                    >
                      {errors.body_type}
                    </Text>
                  </View>
                )}
              </View>

              <View style={[styles.formField, styles.halfField]}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Drive Type <Text style={{ color: "#ff4444" }}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.fieldInput,
                    {
                      borderColor: errors.drive_type
                        ? theme.colors.error
                        : theme.colors.outline,
                      backgroundColor: theme.colors.surface,
                    },
                  ]}
                  onPress={() => setShowDriveTypeModal(true)}
                >
                  <View style={styles.inputContent}>
                    <Ionicons
                      name="speedometer"
                      size={20}
                      color={
                        formData.drive_type
                          ? theme.colors.primary
                          : theme.colors.onSurfaceVariant
                      }
                      style={styles.inputIcon}
                    />
                    <Text
                      style={[
                        styles.inputText,
                        {
                          color: formData.drive_type
                            ? theme.colors.onSurface
                            : theme.colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {formData.drive_type || "Select drive type"}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={theme.colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
                {errors.drive_type && (
                  <View style={styles.errorContainerInline}>
                    <Ionicons
                      name="alert-circle"
                      size={16}
                      color={theme.colors.error}
                    />
                    <Text
                      style={[styles.errorTextInline, { color: "#ff4444" }]}
                    >
                      {errors.drive_type}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button - Hidden when keyboard is visible */}
      {!isKeyboardVisible && (
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={[
              styles.continueButton,
              { backgroundColor: theme.colors.primary },
            ]}
            labelStyle={[styles.buttonLabel, { color: theme.colors.onPrimary }]}
            contentStyle={styles.buttonContent}
          >
            <Ionicons
              name="arrow-forward"
              size={20}
              color={theme.colors.onPrimary}
            />
            <Text style={styles.buttonText}>Continue</Text>
          </Button>
        </View>
      )}

      {/* Modals */}
      {renderModal(
        showMakeModal,
        () => setShowMakeModal(false),
        "Select Make",
        makes,
        formData.make,
        (value) => updateFormData("make", value),
        isLoadingMakes,
        makesError,
        true,
      )}

      {renderModal(
        showYearModal,
        () => setShowYearModal(false),
        "Select Year",
        years,
        formData.year,
        (value) => updateFormData("year", value),
      )}

      {renderModal(
        showConditionModal,
        () => setShowConditionModal(false),
        "Select Condition",
        conditions,
        formData.condition,
        (value) => updateFormData("condition", value),
      )}

      {renderModal(
        showDoorsModal,
        () => setShowDoorsModal(false),
        "Select Doors",
        ["2", "3", "4", "5"],
        formData.doors,
        (value) => updateFormData("doors", value),
      )}

      {renderModal(
        showSeatsModal,
        () => setShowSeatsModal(false),
        "Select Seats",
        ["2", "4", "5", "6", "7", "8"],
        formData.seats,
        (value) => updateFormData("seats", value),
      )}

      {renderModal(
        showTransmissionModal,
        () => setShowTransmissionModal(false),
        "Select Transmission",
        transmissions,
        formData.transmission,
        (value) => updateFormData("transmission", value),
      )}

      {renderModal(
        showFuelModal,
        () => setShowFuelModal(false),
        "Select Fuel Type",
        fuelTypes,
        formData.fuel,
        (value) => updateFormData("fuel", value),
      )}

      {renderModal(
        showBodyTypeModal,
        () => setShowBodyTypeModal(false),
        "Select Body Type",
        bodyTypes,
        formData.body_type,
        (value) => updateFormData("body_type", value),
      )}

      {renderModal(
        showDriveTypeModal,
        () => setShowDriveTypeModal(false),
        "Select Drive Type",
        driveTypes,
        formData.drive_type,
        (value) => updateFormData("drive_type", value),
      )}
    </SafeAreaView>
  );
});

const getDynamicStyles = (theme: any, screenWidth: number, insets: any) => {
  const isSmallScreen = screenWidth < 375;
  const isLargeScreen = screenWidth > 414;

  return StyleSheet.create({
    fullScreen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: isSmallScreen ? 16 : 24,
      paddingTop: insets.top, // Use safe area inset for status bar
      paddingBottom: isSmallScreen ? 8 : 10,
      backgroundColor: theme.colors.background,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primary + "10",
      justifyContent: "center",
      alignItems: "center",
    },
    headerCenter: {
      alignItems: "center",
      flex: 1,
      marginHorizontal: 12,
    },
    headerTitle: {
      fontSize: isSmallScreen ? 20 : 24,
      fontWeight: "700",
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      fontWeight: "500",
    },
    headerIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primary + "10",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: isSmallScreen ? 16 : 24,
      paddingTop: 8,
      paddingBottom: 100,
    },
    progressContainer: {
      marginBottom: isSmallScreen ? 24 : 32,
    },
    progressBar: {
      height: 6,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 3,
      overflow: "hidden",
      marginBottom: 8,
    },
    progressFill: {
      height: "100%",
      borderRadius: 3,
    },
    progressText: {
      fontSize: 13,
      fontWeight: "500",
      textAlign: "right",
    },
    tipCard: {
      borderRadius: 16,
      marginBottom: isSmallScreen ? 28 : 36,
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    tipContent: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: isSmallScreen ? 16 : 20,
      paddingHorizontal: isSmallScreen ? 16 : 20,
    },
    tipIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    tipTextContainer: {
      flex: 1,
    },
    tipTitle: {
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: "700",
      marginBottom: 4,
    },
    tipText: {
      fontSize: isSmallScreen ? 13 : 14,
      lineHeight: 20,
    },
    mainSection: {
      marginBottom: 40,
    },
    titleContainer: {
      marginBottom: isSmallScreen ? 28 : 36,
    },
    titleIcon: {
      marginBottom: 12,
    },
    mainTitle: {
      fontSize: isSmallScreen ? 26 : 32,
      fontWeight: "800",
      letterSpacing: -0.8,
      marginBottom: 8,
    },
    subTitle: {
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: "400",
    },
    formGrid: {
      gap: isSmallScreen ? 20 : 24,
    },
    formField: {
      gap: 8,
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 4,
    },
    fieldInput: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 2,
      borderRadius: 14,
      paddingHorizontal: 16,
      height: 60,
      minHeight: 60,
    },
    inputContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    inputIcon: {
      marginRight: 12,
    },
    inputText: {
      fontSize: 16,
      flex: 1,
    },
    textInput: {
      backgroundColor: "transparent",
      fontSize: 16,
      height: 56,
      paddingHorizontal: 0,
    },
    unitText: {
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 8,
    },
    formRow: {
      flexDirection: "row",
      gap: isSmallScreen ? 12 : 16,
    },
    halfField: {
      flex: 1,
    },
    disabledInput: {
      opacity: 0.6,
    },
    errorContainerInline: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 4,
      marginLeft: 4,
    },
    errorTextInline: {
      fontSize: 12,
      fontWeight: "500",
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: isSmallScreen ? 16 : 24,
      paddingVertical: 20,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline + "20",
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    continueButton: {
      borderRadius: 16,
      height: 60,
      justifyContent: "center",
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
    },
    buttonLabel: {
      fontSize: 18,
      fontWeight: "700",
    },
    buttonText: {
      fontSize: 18,
      fontWeight: "700",
      marginLeft: 8,
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
      marginBottom: 8,
    },
    modalIndicator: {
      width: 40,
      height: 4,
      borderRadius: 2,
    },
    closeButton: {
      padding: 4,
    },
    modalContent: {
      maxHeight: 500,
      paddingVertical: 8,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline + "30",
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      height: 40,
      paddingHorizontal: 16,
      borderRadius: 8,
      fontSize: 16,
      borderWidth: 1,
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
    loadingContainer: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
    },
    spinner: {
      marginBottom: 20,
    },
    loadingText: {
      fontSize: 16,
      fontWeight: "500",
    },
    errorContainer: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
      paddingHorizontal: 24,
    },
    errorText: {
      fontSize: 18,
      fontWeight: "600",
      textAlign: "center",
      marginTop: 16,
      marginBottom: 8,
    },
    errorSubtext: {
      fontSize: 14,
      textAlign: "center",
      marginBottom: 24,
    },
    retryButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
    },
    retryButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    emptyContainer: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: "500",
      marginTop: 16,
    },
    // Authentication required styles
    authRequiredContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
      paddingVertical: 60,
    },
    authRequiredTitle: {
      fontSize: 28,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 16,
      marginTop: 24,
    },
    authRequiredMessage: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 32,
      lineHeight: 24,
    },
    signInButton: {
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 12,
    },
  });
};
