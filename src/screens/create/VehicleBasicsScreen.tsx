import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, TextInput, useTheme } from "react-native-paper";
import { useAuthStore } from "../../features/auth/auth.store";
import { useCarMakes } from "../../features/cars/car.hooks";
import { VehicleData } from "../../types/vehicle";

interface VehicleBasicsScreenProps {
  onContinue?: () => void;
  onBack?: () => void;
  vehicleData?: VehicleData;
  updateVehicleData?: (updates: Partial<VehicleData>) => void;
}

export default function VehicleBasicsScreen({
  onContinue,
  onBack,
  vehicleData,
  updateVehicleData,
}: VehicleBasicsScreenProps) {
  const theme = useTheme();
  const { width } = Dimensions.get("window");
  const styles = getDynamicStyles(theme, width);

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
      vehicleData?.condition ||
      ("Good" as "New" | "Like New" | "Excellent" | "Good" | "Fair" | "Poor"),
    color: vehicleData?.color || "",
    doors: vehicleData?.doors?.toString() || "",
    seats: vehicleData?.seats?.toString() || "",
  });

  const [selectedMakeId, setSelectedMakeId] = useState<number | undefined>(
    vehicleData?.make_id
  );
  const [selectedModelId, setSelectedModelId] = useState<string>(
    vehicleData?.model_id || ""
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMakeModal, setShowMakeModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showDoorsModal, setShowDoorsModal] = useState(false);
  const [showSeatsModal, setShowSeatsModal] = useState(false);

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
        ]
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
      })
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
  } = useCarMakes();

  const handleOpenMakeModal = () => {
    setShowMakeModal(true);
    refetchMakes();
  };

  const handleOpenModelModal = () => {
    if (formData.make) {
      setShowModelModal(true);
    }
  };

  // Extract makes from API response
  const makes =
    makesResponse?.success && Array.isArray(makesResponse.data)
      ? makesResponse.data.map((make: any) => ({
          id: make.make_id,
          name: make.name,
        }))
      : [];

  // Debug: Log the actual response structure
  if (makesResponse) {
    console.log("Makes response:", makesResponse);
  }

  const models = [
    "Corolla",
    "Camry",
    "RAV4",
    "Civic",
    "Accord",
    "CR-V",
    "F-150",
    "Mustang",
    "3 Series",
    "5 Series",
    "C-Class",
    "E-Class",
    "Model 3",
    "Model Y",
  ];

  const conditions = ["New", "Like New", "Excellent", "Good", "Fair", "Poor"];

  // Generate years from 1886 to 2026
  const years = Array.from({ length: 2026 - 1886 + 1 }, (_, i) =>
    (2026 - i).toString()
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.make) newErrors.make = "Please select make";
    if (!formData.model) newErrors.model = "Please select model";
    if (!formData.year) newErrors.year = "Please select year";
    if (!formData.mileage || parseInt(formData.mileage) < 0)
      newErrors.mileage = "Valid mileage required";
    if (!formData.condition) newErrors.condition = "Please select condition";
    if (!formData.doors) newErrors.doors = "Please select number of doors";
    if (!formData.seats) newErrors.seats = "Please select number of seats";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (updateVehicleData) {
      updateVehicleData({
        make_id: selectedMakeId,
        model_id: selectedModelId || formData.model,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        mileage: formData.mileage,
        condition: formData.condition,
        color: formData.color,
        doors: parseInt(formData.doors) || undefined,
        seats: parseInt(formData.seats) || undefined,
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
    isMakeModal?: boolean
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
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
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
                onPress={() => isMakeModal && refetchMakes()}
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
                        setSelectedModelId("");
                        updateFormData("model", "");
                      } else if (!isMakeModal) {
                        // For model modal, store model ID
                        setSelectedModelId(itemValue);
                        onSelect(itemValue);
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
    <Animated.View style={[styles.fullScreen, { opacity: fadeAnim }]}>
      <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
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
            Step 1 of 7
          </Text>
        </View>

        {/* Tip Card */}
        <Card
          style={[
            styles.tipCard,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.primary,
            },
          ]}
        >
          <Card.Content style={styles.tipContent}>
            <View
              style={[
                styles.tipIconContainer,
                { backgroundColor: theme.colors.primary + "20" },
              ]}
            >
              <Ionicons
                name="information-circle"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.tipTextContainer}>
              <Text
                style={[styles.tipTitle, { color: theme.colors.onSurface }]}
              >
                Complete Details = Better Results
              </Text>
              <Text
                style={[
                  styles.tipText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Accurate information increases buyer trust and speeds up sales
              </Text>
            </View>
          </Card.Content>
        </Card>

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
                Make <Text style={{ color: theme.colors.error }}>*</Text>
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
                  <Text
                    style={[
                      styles.errorTextInline,
                      { color: theme.colors.error },
                    ]}
                  >
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
                Model <Text style={{ color: theme.colors.error }}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.fieldInput,
                  {
                    borderColor: errors.model
                      ? theme.colors.error
                      : theme.colors.outline,
                    backgroundColor: theme.colors.surface,
                  },
                  !formData.make && styles.disabledInput,
                ]}
                onPress={() => formData.make && setShowModelModal(true)}
                disabled={!formData.make}
              >
                <View style={styles.inputContent}>
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
                  <Text
                    style={[
                      styles.inputText,
                      {
                        color: formData.model
                          ? theme.colors.onSurface
                          : theme.colors.onSurfaceVariant,
                        opacity: !formData.make ? 0.5 : 1,
                      },
                    ]}
                  >
                    {formData.model || "Select vehicle model"}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-down"
                  size={22}
                  color={
                    !formData.make
                      ? theme.colors.onSurfaceVariant + "80"
                      : theme.colors.onSurfaceVariant
                  }
                />
              </TouchableOpacity>
              {errors.model && (
                <View style={styles.errorContainerInline}>
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color={theme.colors.error}
                  />
                  <Text
                    style={[
                      styles.errorTextInline,
                      { color: theme.colors.error },
                    ]}
                  >
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
                  Year <Text style={{ color: theme.colors.error }}>*</Text>
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
                      style={[
                        styles.errorTextInline,
                        { color: theme.colors.error },
                      ]}
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
                  Mileage <Text style={{ color: theme.colors.error }}>*</Text>
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
                        placeholder: theme.colors.onSurfaceVariant + "80",
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
                      style={[
                        styles.errorTextInline,
                        { color: theme.colors.error },
                      ]}
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
                Condition <Text style={{ color: theme.colors.error }}>*</Text>
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
                  <Text
                    style={[
                      styles.errorTextInline,
                      { color: theme.colors.error },
                    ]}
                  >
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
                  Doors <Text style={{ color: theme.colors.error }}>*</Text>
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
                      style={[
                        styles.errorTextInline,
                        { color: theme.colors.error },
                      ]}
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
                  Seats <Text style={{ color: theme.colors.error }}>*</Text>
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
                      style={[
                        styles.errorTextInline,
                        { color: theme.colors.error },
                      ]}
                    >
                      {errors.seats}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={[
            styles.continueButton,
            {
              backgroundColor: theme.colors.primary,
              opacity:
                !formData.make ||
                !formData.model ||
                !formData.year ||
                !formData.mileage ||
                !formData.condition ||
                !formData.doors ||
                !formData.seats
                  ? 0.6
                  : 1,
            },
          ]}
          labelStyle={[styles.buttonLabel, { color: theme.colors.onPrimary }]}
          contentStyle={styles.buttonContent}
          disabled={
            !formData.make ||
            !formData.model ||
            !formData.year ||
            !formData.mileage ||
            !formData.condition ||
            !formData.doors ||
            !formData.seats
          }
        >
          <Ionicons
            name="arrow-forward"
            size={20}
            color={theme.colors.onPrimary}
          />
          <Text style={styles.buttonText}>Continue</Text>
        </Button>
      </View>

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
        true
      )}

      {renderModal(
        showModelModal,
        () => setShowModelModal(false),
        "Select Model",
        models,
        formData.model,
        (value) => updateFormData("model", value)
      )}

      {renderModal(
        showYearModal,
        () => setShowYearModal(false),
        "Select Year",
        years,
        formData.year,
        (value) => updateFormData("year", value)
      )}

      {renderModal(
        showConditionModal,
        () => setShowConditionModal(false),
        "Select Condition",
        conditions,
        formData.condition,
        (value) => updateFormData("condition", value)
      )}

      {renderModal(
        showDoorsModal,
        () => setShowDoorsModal(false),
        "Select Doors",
        ["2", "3", "4", "5"],
        formData.doors,
        (value) => updateFormData("doors", value)
      )}

      {renderModal(
        showSeatsModal,
        () => setShowSeatsModal(false),
        "Select Seats",
        ["2", "4", "5", "6", "7", "8"],
        formData.seats,
        (value) => updateFormData("seats", value)
      )}
    </Animated.View>
  );
}

const getDynamicStyles = (theme: any, screenWidth: number) => {
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
      paddingTop: isSmallScreen ? 50 : 60,
      paddingBottom: isSmallScreen ? 16 : 20,
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
