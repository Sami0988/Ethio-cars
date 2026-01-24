import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Switch, useTheme } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { VehicleData } from "../../types/vehicle";

interface Photo {
  id: string;
  uri: string;
  type: string;
  slotId?: string;
  isCover?: boolean;
  isUploading?: boolean;
  uploaded?: boolean;
}

interface PricingAndPhotosScreenProps {
  onContinue?: () => void;
  onBack?: () => void;
  vehicleData?: VehicleData;
  updateVehicleData?: (updates: Partial<VehicleData>) => void;
}

export default function PricingAndPhotosScreen({
  onContinue,
  onBack,
  vehicleData,
  updateVehicleData,
}: PricingAndPhotosScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get("window");
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 768;

  const styles = getDynamicStyles(theme, width, height, insets);

  // ========== PRICING STATE ==========
  const [price, setPrice] = useState("0"); // Always start with "0" for fresh entry
  const [isNegotiable, setIsNegotiable] = useState(
    vehicleData?.negotiable ?? true,
  );
  const [isPriceInputFocused, setIsPriceInputFocused] = useState(false);
  const [priceError, setPriceError] = useState("");

  // ========== PHOTOS STATE ==========
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // ========== ANIMATIONS ==========
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const photoScale = useRef(new Animated.Value(1)).current;

  // ========== LIFECYCLE & EFFECTS ==========
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

  // Listen for keyboard
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

  // Request permissions
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || libraryStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera and gallery access needed for photos",
          [
            { text: "OK" },
            { text: "Settings", onPress: () => Linking.openSettings() },
          ],
        );
      }
    })();
  }, []);

  // Initialize photos from vehicleData
  useEffect(() => {
    if (vehicleData?.photos && vehicleData.photos.length > 0) {
      const initialPhotos: Photo[] = vehicleData.photos.map(
        (photo: string, index: number) => ({
          id: `photo-${index}`,
          uri: photo,
          type: "image/jpeg",
          isCover: index === 0,
          slotId: `slot-${index}`,
        }),
      );
      setPhotos(initialPhotos);
    }
  }, [vehicleData?.photos]);

  // ========== PRICING FUNCTIONS ==========
  const formatPrice = (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    const numberValue = parseInt(cleanValue) || 0;
    return numberValue.toLocaleString();
  };

  const handlePriceChange = (text: string) => {
    const cleanedText = text.replace(/[^0-9]/g, "");

    // Clear error when user starts typing
    if (priceError) {
      setPriceError("");
    }

    // Validate max amount (100 million)
    const numValue = parseInt(cleanedText) || 0;
    if (numValue > 100000000) {
      setPriceError("Amount is not valid (Maximum: 100,000,000 ETB)");
      return;
    }

    if (cleanedText.length <= 9) {
      setPrice(cleanedText);
      if (updateVehicleData) {
        updateVehicleData({ price: cleanedText });
      }
    }
  };

  const formatPriceForDisplay = (value: string) => {
    // Don't format with commas, just show the raw number
    return value;
  };

  const handleQuickPrice = (amount: string) => {
    setPrice(amount);
    if (updateVehicleData) {
      updateVehicleData({ price: amount });
    }
  };

  // ========== PHOTOS FUNCTIONS ==========
  const animatePhotoAddition = () => {
    Animated.sequence([
      Animated.timing(photoScale, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(photoScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await addNewPhoto(result.assets[0].uri, "Camera Photo");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const handleGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Disable editing for multiple selection
        allowsMultipleSelection: true, // Enable multiple selection
        quality: 0.8,
        selectionLimit: 10 - photos.length, // Allow up to 10 total photos
      });

      if (!result.canceled && result.assets.length > 0) {
        setIsUploading(true);

        const newPhotos = result.assets.map((asset, index) => ({
          id: Date.now().toString() + index,
          uri: asset.uri,
          type: "Gallery Photo",
          isUploading: true,
        }));

        setPhotos((prev) => [...prev, ...newPhotos]);
        animatePhotoAddition();

        setTimeout(() => {
          setPhotos((prev) =>
            prev.map((photo) => ({
              ...photo,
              isUploading: false,
              uploaded: true,
            })),
          );
          setIsUploading(false);
        }, 1000);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick images");
      setIsUploading(false);
    }
  };

  const addNewPhoto = async (uri: string, type: string) => {
    setIsUploading(true);
    const newPhoto: Photo = {
      id: Date.now().toString(),
      uri,
      type,
      isUploading: true,
    };

    setPhotos((prev) => {
      const newPhotos = [...prev, newPhoto];
      if (!newPhotos.some((p) => p.isCover)) {
        newPhotos[newPhotos.length - 1].isCover = true;
      }
      return newPhotos;
    });

    animatePhotoAddition();

    setTimeout(() => {
      setPhotos((prev) =>
        prev.map((photo) =>
          photo.id === newPhoto.id
            ? { ...photo, isUploading: false, uploaded: true }
            : photo,
        ),
      );
      setIsUploading(false);
    }, 800);
  };

  const handleSetCover = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((photo) => ({
        ...photo,
        isCover: photo.id === photoId,
      })),
    );
  };

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert("Remove Photo", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setPhotos((prev) => {
            const newPhotos = prev.filter((p) => p.id !== photoId);
            if (newPhotos.length > 0 && !newPhotos.some((p) => p.isCover)) {
              newPhotos[0].isCover = true;
            }
            return newPhotos;
          });
        },
      },
    ]);
  };

  // ========== CONTINUE HANDLER ==========
  const handleContinue = () => {
    // Clear previous errors
    setPriceError("");

    // Debug logs
    console.log("=== Continue Button Clicked ===");
    console.log("Current price:", price);
    console.log("Price as number:", parseInt(price.replace(/,/g, "")) || 0);
    console.log("Photos count:", photos.length);
    console.log(
      "Photos:",
      photos.map((p) => ({ id: p.id, uri: p.uri, isCover: p.isCover })),
    );

    let hasError = false;

    // Validate price - simple and direct check
    const numericPrice = parseInt(price.replace(/,/g, "")) || 0;

    if (numericPrice <= 0) {
      setPriceError("Price is required");
      hasError = true;
      console.log("❌ Price validation failed");
    } else {
      console.log("✅ Price validation passed");
    }

    // Validate photos
    if (photos.length < 3) {
      Alert.alert(
        "Photos Required",
        "Please add at least 3 photos of your vehicle.",
      );
      hasError = true;
      console.log("❌ Photo validation failed");
    } else {
      console.log("✅ Photo validation passed");
    }

    console.log("Has error:", hasError);
    console.log("=== End Validation ===");

    // Don't continue if there are errors
    if (hasError) {
      return;
    }

    // Update vehicle data
    if (updateVehicleData) {
      updateVehicleData({
        price: price,
        negotiable: isNegotiable,
        photos: photos.map((p) => p.uri),
      });
    }

    onContinue?.();
  };

  const handleBackPress = () => {
    onBack?.();
  };

  // Step indicator - linear progress like step 1
  const steps = [
    { number: 1, label: "Basics", completed: true },
    { number: 2, label: "Pricing & Photos", completed: false },
    { number: 3, label: "Features & Location", completed: false },
    { number: 4, label: "Review", completed: false },
  ];

  const currentStepIndex = 1; // 0-based index for step 2
  const uploadedCount = photos.filter((p) => p.uploaded).length;
  const photoScore = Math.min(Math.round((uploadedCount / 10) * 100), 100);
  const quickPrices = [
    { label: "100K", value: "100000", icon: "cash-outline" },
    { label: "250K", value: "250000", icon: "wallet-outline" },
    { label: "500K", value: "500000", icon: "diamond-outline" },
    { label: "750K", value: "750000", icon: "trophy-outline" },
    { label: "1M", value: "1000000", icon: "star-outline" },
    { label: "2M", value: "2000000", icon: "car-outline" },
    { label: "5M", value: "5000000", icon: "business-outline" },
    { label: "10M", value: "10000000", icon: "home-outline" },
    { label: "25M", value: "25000000", icon: "airplane-outline" },
    { label: "50M", value: "50000000", icon: "rocket-outline" },
    { label: "100M", value: "100000000", icon: "diamond" },
  ];

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
            Pricing & Photos
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Step {currentStepIndex + 1} of {steps.length}
          </Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="cash" size={24} color={theme.colors.primary} />
        </View>
      </Animated.View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress Bar - Linear like step 1 */}
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

        {/* Main Title */}
        <View style={styles.titleContainer}>
          <Text
            style={[styles.mainTitle, { color: theme.colors.onBackground }]}
          >
            Set Your Price
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Smart pricing + Great photos = Faster sale
          </Text>
        </View>

        {/* ========== PRICING SECTION ========== */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.priceInputContainer}>
              <View style={styles.currencyBox}>
                <Ionicons name="cash" size={16} color={theme.colors.primary} />
                <Text
                  style={[
                    styles.currencySymbol,
                    { color: theme.colors.primary },
                  ]}
                >
                  ETB
                </Text>
              </View>
              <TextInput
                placeholder="Enter price"
                value={formatPriceForDisplay(price)}
                onChangeText={handlePriceChange}
                onFocus={() => setIsPriceInputFocused(true)}
                onBlur={() => setIsPriceInputFocused(false)}
                style={[
                  styles.priceInput,
                  { color: theme.colors.onBackground },
                ]}
                keyboardType="numeric"
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
            </View>

            {/* Price Error Message */}
            {priceError ? (
              <View style={styles.errorContainer}>
                <Ionicons name="warning" size={16} color="#FF0000" />
                <Text style={[styles.errorMessage, { color: "#FF0000" }]}>
                  {priceError}
                </Text>
              </View>
            ) : null}

            {/* Quick Price Buttons */}
            <View style={styles.quickPriceContainer}>
              <Text
                style={[
                  styles.quickPriceLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Quick select:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.quickPriceScroll}
                contentContainerStyle={styles.quickPriceScrollContent}
              >
                {quickPrices.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.quickPriceButton,
                      price === item.value && styles.quickPriceButtonActive,
                    ]}
                    onPress={() => handleQuickPrice(item.value)}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={14}
                      color={
                        price === item.value ? "white" : theme.colors.primary
                      }
                    />
                    <Text
                      style={[
                        styles.quickPriceText,
                        {
                          color:
                            price === item.value
                              ? "white"
                              : theme.colors.onSurface,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Negotiable Toggle */}
            <View style={styles.toggleContainer}>
              <Text
                style={[styles.toggleLabel, { color: theme.colors.onSurface }]}
              >
                Open to offers
              </Text>
              <Switch
                value={isNegotiable}
                onValueChange={setIsNegotiable}
                color={theme.colors.primary}
              />
            </View>
          </View>
        </View>

        {/* ========== PHOTOS SECTION ========== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="camera" size={24} color={theme.colors.primary} />
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.onBackground },
              ]}
            >
              Vehicle Photos
            </Text>
          </View>

          {/* Stats Card */}
          <View
            style={[
              styles.statsCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text
                  style={[styles.statValue, { color: theme.colors.primary }]}
                >
                  {photos.length}/10
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Photos
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text
                  style={[
                    styles.statValue,
                    { color: photos.length >= 3 ? "#10B981" : "#EF4444" },
                  ]}
                >
                  {photos.length >= 3 ? "✓" : 3 - photos.length}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {photos.length >= 3 ? "Ready" : "Needed"}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text
                  style={[
                    styles.statValue,
                    { color: photoScore > 70 ? "#10B981" : "#F59E0B" },
                  ]}
                >
                  {photoScore}%
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Photo Score
                </Text>
              </View>
            </View>
          </View>

          {/* Photo Grid */}
          {photos.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="images"
                size={48}
                color={theme.colors.surfaceVariant}
              />
              <Text
                style={[styles.emptyTitle, { color: theme.colors.onSurface }]}
              >
                No Photos Yet
              </Text>
              <Text
                style={[
                  styles.emptyText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Add photos to show your vehicle
              </Text>
            </View>
          ) : (
            <Animated.View
              style={[styles.photoGrid, { transform: [{ scale: photoScale }] }]}
            >
              {photos.map((photo) => (
                <View key={photo.id} style={styles.photoContainer}>
                  <Image source={{ uri: photo.uri }} style={styles.photo} />
                  {photo.isUploading ? (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="small" color="white" />
                    </View>
                  ) : (
                    <View style={styles.photoOverlay}>
                      <TouchableOpacity
                        onPress={() => handleDeletePhoto(photo.id)}
                        style={styles.deleteButton}
                      >
                        <Ionicons name="close-circle" size={20} color="#fff" />
                      </TouchableOpacity>
                      {photo.isCover ? (
                        <View
                          style={[
                            styles.coverBadge,
                            { backgroundColor: "#F59E0B" },
                          ]}
                        >
                          <Ionicons name="star" size={12} color="white" />
                          <Text style={styles.coverText}>Cover</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => handleSetCover(photo.id)}
                          style={styles.setCoverButton}
                        >
                          <Ionicons
                            name="star-outline"
                            size={14}
                            color="white"
                          />
                          <Text style={styles.setCoverText}>Set Cover</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </Animated.View>
          )}

          {/* Add Photo Buttons */}
          <View style={styles.addPhotoSection}>
            <TouchableOpacity
              style={[
                styles.addPhotoButton,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={handleTakePhoto}
            >
              <Ionicons name="camera" size={24} color={theme.colors.primary} />
              <Text
                style={[styles.addPhotoText, { color: theme.colors.primary }]}
              >
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.addPhotoButton,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={handleGallery}
            >
              <Ionicons name="images" size={24} color={theme.colors.primary} />
              <Text
                style={[styles.addPhotoText, { color: theme.colors.primary }]}
              >
                Choose from Gallery
              </Text>
            </TouchableOpacity>
          </View>

          {/* Photo Tips */}
          <View
            style={[styles.tipsCard, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={20} color="#F59E0B" />
              <Text
                style={[styles.tipsTitle, { color: theme.colors.onBackground }]}
              >
                Photo Tips
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="sunny" size={16} color="#F59E0B" />
              <Text
                style={[styles.photoTipText, { color: theme.colors.onSurface }]}
              >
                Use natural daylight for best results
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="car-sport" size={16} color="#3B82F6" />
              <Text
                style={[styles.photoTipText, { color: theme.colors.onSurface }]}
              >
                Include all angles: front, back, sides, interior
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="images" size={16} color="#8B5CF6" />
              <Text
                style={[styles.photoTipText, { color: theme.colors.onSurface }]}
              >
                3+ photos increase views by 200%
              </Text>
            </View>
          </View>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Continue Button */}
      {!isKeyboardVisible && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleContinue}
            disabled={isUploading}
            activeOpacity={0.8}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Text
                  style={[
                    styles.continueButtonText,
                    { color: theme.colors.onPrimary },
                  ]}
                >
                  Continue to Features
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={theme.colors.onPrimary}
                />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <Ionicons
                name="trending-up"
                size={14}
                color={theme.colors.primary}
              />
              <Text
                style={[
                  styles.featureText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Market Insights
              </Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <Ionicons
                name="shield-checkmark"
                size={14}
                color={theme.colors.primary}
              />
              <Text
                style={[
                  styles.featureText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Photo Protection
              </Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <Ionicons name="timer" size={14} color={theme.colors.primary} />
              <Text
                style={[
                  styles.featureText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Quick Sale
              </Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const getDynamicStyles = (
  theme: any,
  screenWidth: number,
  screenHeight: number,
  insets: any,
) => {
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 768;

  // Responsive scaling
  const scaleFactor = isSmallScreen ? 0.9 : isMediumScreen ? 1 : 1.1;
  const fontSizeXS = Math.round(12 * scaleFactor);
  const fontSizeS = Math.round(14 * scaleFactor);
  const fontSizeM = Math.round(16 * scaleFactor);
  const fontSizeL = Math.round(18 * scaleFactor);
  const fontSizeXL = Math.round(20 * scaleFactor);
  const fontSizeXXL = Math.round(24 * scaleFactor);

  const spacingXS = Math.round(4 * scaleFactor);
  const spacingS = Math.round(8 * scaleFactor);
  const spacingM = Math.round(12 * scaleFactor);
  const spacingL = Math.round(16 * scaleFactor);
  const spacingXL = Math.round(20 * scaleFactor);
  const spacingXXL = Math.round(24 * scaleFactor);

  return StyleSheet.create({
    fullScreen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacingL,
      paddingTop: insets.top,
      paddingBottom: spacingM,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline + "20",
    },
    backButton: {
      padding: spacingS,
    },
    headerCenter: {
      flex: 1,
      alignItems: "center",
    },
    headerTitle: {
      fontSize: fontSizeL,
      fontWeight: "700",
    },
    headerSubtitle: {
      fontSize: fontSizeXS,
      color: theme.colors.onSurfaceVariant,
      marginTop: spacingXS,
    },
    headerIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary + "10",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: spacingL,
      paddingTop: spacingL,
      paddingBottom: 140,
    },
    progressContainer: {
      marginBottom: spacingXL,
    },
    progressBar: {
      height: 4,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 2,
      overflow: "hidden",
      marginBottom: spacingS,
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
      fontSize: fontSizeXS,
      fontWeight: "500",
      textAlign: "center",
    },
    titleContainer: {
      marginBottom: spacingXL,
    },
    mainTitle: {
      fontSize: fontSizeXXL,
      fontWeight: "800",
      marginBottom: spacingXS,
    },
    subtitle: {
      fontSize: fontSizeS,
      color: theme.colors.onSurfaceVariant,
    },
    section: {
      marginBottom: spacingXL,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacingL,
    },
    sectionTitle: {
      fontSize: fontSizeXL,
      fontWeight: "700",
      marginLeft: spacingM,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: spacingL,
      marginBottom: spacingL,
      borderWidth: 1,
      borderColor: theme.colors.outline + "20",
    },
    priceInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: 8,
      paddingHorizontal: spacingL,
      height: 56,
      marginBottom: spacingL,
    },
    currencyBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primary + "10",
      paddingHorizontal: spacingS,
      paddingVertical: spacingXS,
      borderRadius: 6,
      marginRight: spacingM,
      gap: spacingXS,
    },
    currencySymbol: {
      fontSize: fontSizeM,
      fontWeight: "700",
    },
    priceInput: {
      flex: 1,
      fontSize: fontSizeXL,
      fontWeight: "700",
    },
    errorMessage: {
      fontSize: fontSizeS,
      fontWeight: "500",
      marginTop: spacingS,
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacingS,
      gap: spacingXS,
    },
    quickPriceContainer: {
      marginBottom: spacingL,
    },
    quickPriceLabel: {
      fontSize: fontSizeS,
      fontWeight: "500",
      marginBottom: spacingM,
    },
    quickPriceScroll: {
      marginBottom: spacingS,
    },
    quickPriceScrollContent: {
      paddingRight: spacingL,
      gap: spacingS,
    },
    quickPriceButtons: {
      flexDirection: "row",
      gap: spacingS,
    },
    quickPriceButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacingXS,
      paddingVertical: spacingM,
      paddingHorizontal: spacingM,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
      minWidth: 80,
    },
    quickPriceButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    quickPriceText: {
      fontSize: fontSizeS,
      fontWeight: "600",
    },
    toggleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: spacingL,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline + "20",
    },
    toggleLabel: {
      fontSize: fontSizeM,
      fontWeight: "600",
    },
    statsCard: {
      borderRadius: 12,
      padding: spacingL,
      marginBottom: spacingL,
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
      fontSize: fontSizeXXL,
      fontWeight: "800",
      marginBottom: spacingXS,
    },
    statLabel: {
      fontSize: fontSizeXS,
      fontWeight: "500",
    },
    statDivider: {
      width: 1,
      height: 28,
      backgroundColor: theme.colors.outline + "40",
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: spacingXL,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: spacingL,
      borderWidth: 2,
      borderColor: theme.colors.outline + "20",
      borderStyle: "dashed",
    },
    emptyTitle: {
      fontSize: fontSizeL,
      fontWeight: "700",
      marginTop: spacingL,
      marginBottom: spacingXS,
    },
    emptyText: {
      fontSize: fontSizeS,
      color: theme.colors.onSurfaceVariant,
    },
    photoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacingM,
      marginBottom: spacingL,
    },
    photoContainer: {
      width: (screenWidth - spacingL * 2 - spacingM) / 2,
      aspectRatio: 4 / 3,
      borderRadius: 12,
      overflow: "hidden",
      position: "relative",
      backgroundColor: theme.colors.surfaceVariant,
    },
    photo: {
      width: "100%",
      height: "100%",
    },
    uploadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      alignItems: "center",
    },
    photoOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "space-between",
      padding: spacingS,
    },
    deleteButton: {
      alignSelf: "flex-end",
      padding: spacingXS,
    },
    coverBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      paddingHorizontal: spacingS,
      paddingVertical: spacingXS,
      borderRadius: 8,
      gap: spacingXS,
    },
    coverText: {
      color: "white",
      fontSize: fontSizeXS,
      fontWeight: "600",
    },
    setCoverButton: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      paddingHorizontal: spacingS,
      paddingVertical: spacingXS,
      borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.2)",
      gap: spacingXS,
    },
    setCoverText: {
      color: "white",
      fontSize: fontSizeXS,
      fontWeight: "600",
    },
    addPhotoSection: {
      flexDirection: "row",
      gap: spacingM,
      marginBottom: spacingL,
    },
    addPhotoButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacingS,
      paddingVertical: spacingL,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    addPhotoText: {
      fontSize: fontSizeM,
      fontWeight: "600",
    },
    tipsCard: {
      borderRadius: 12,
      padding: spacingL,
      borderWidth: 1,
      borderColor: theme.colors.outline + "20",
    },
    tipsHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacingM,
    },
    tipsTitle: {
      fontSize: fontSizeL,
      fontWeight: "700",
      marginLeft: spacingM,
    },
    tipItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacingS,
    },
    photoTipText: {
      fontSize: fontSizeS,
      marginLeft: spacingM,
      flex: 1,
      lineHeight: 20,
    },
    spacer: {
      height: 40,
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: spacingL,
      paddingVertical: spacingL,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline + "20",
    },
    continueButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      paddingVertical: spacingM,
      gap: spacingS,
    },
    continueButtonText: {
      fontSize: fontSizeM,
      fontWeight: "600",
    },
    featuresRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacingM,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    featureText: {
      fontSize: fontSizeXS,
      marginLeft: spacingXS,
    },
    featureDivider: {
      width: 1,
      height: 12,
      backgroundColor: theme.colors.outline + "40",
      marginHorizontal: spacingS,
    },
  });
};
