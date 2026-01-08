import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, useTheme } from "react-native-paper";
import { VehicleData } from "../../types/vehicle";

interface Photo {
  id: string;
  uri: string;
  type: string;
  slotId?: string; // Track which photo slot this belongs to
  isCover?: boolean;
  isUploading?: boolean;
  uploaded?: boolean;
}

interface AddPhotosScreenProps {
  onContinue?: () => void;
  onBack?: () => void;
  vehicleData?: VehicleData;
  updateVehicleData?: (updates: Partial<VehicleData>) => void;
}

export default function AddPhotosScreen({
  onContinue,
  onBack,
  vehicleData,
  updateVehicleData,
}: AddPhotosScreenProps) {
  const theme = useTheme();
  const { width } = Dimensions.get("window");
  const styles = getDynamicStyles(theme, width);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const photoScale = useRef(new Animated.Value(1)).current;

  // Recommended photo slots
  const photoSlots = [
    {
      id: "cover",
      type: "Cover Photo",
      icon: "star",
      color: "#F59E0B",
      required: true,
      description: "Best exterior shot",
    },
    {
      id: "front",
      type: "Front View",
      icon: "car",
      color: "#3B82F6",
      required: true,
      description: "Clear front angle",
    },
    {
      id: "side",
      type: "Side View",
      icon: "car-outline",
      color: "#10B981",
      required: true,
      description: "Profile view",
    },
    {
      id: "rear",
      type: "Rear View",
      icon: "car-sport",
      color: "#EF4444",
      required: false,
      description: "Back of vehicle",
    },
    {
      id: "interior",
      type: "Interior",
      icon: "settings",
      color: "#8B5CF6",
      required: false,
      description: "Dashboard & seats",
    },
    {
      id: "engine",
      type: "Engine Bay",
      icon: "speedometer",
      color: "#F59E0B",
      required: false,
      description: "Clean engine",
    },
    {
      id: "wheels",
      type: "Wheels",
      icon: "git-merge",
      color: "#3B82F6",
      required: false,
      description: "Close-up tires",
    },
    {
      id: "dashboard",
      type: "Dashboard",
      icon: "speedometer",
      color: "#10B981",
      required: false,
      description: "Controls & screen",
    },
    {
      id: "cargo",
      type: "Cargo Space",
      icon: "cube",
      color: "#8B5CF6",
      required: false,
      description: "Trunk/Storage",
    },
    {
      id: "extra",
      type: "Extra",
      icon: "add-circle",
      color: "#6B7280",
      required: false,
      description: "Any additional",
    },
  ];

  // Request permissions on mount
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
          ]
        );
      }
    })();
  }, []);

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
        aspect: [16, 9],
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0].uri) {
        const slot = selectedSlot
          ? photoSlots.find((s) => s.id === selectedSlot)
          : null;
        const photoType = slot ? slot.type : "Camera Photo";
        await addNewPhoto(
          result.assets[0].uri,
          photoType,
          selectedSlot || undefined
        );
        setSelectedSlot(null);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const handleGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        aspect: [16, 9],
        quality: 0.9,
        selectionLimit: 10 - photos.length,
      });

      if (!result.canceled && result.assets.length > 0) {
        setIsUploading(true);

        const slot = selectedSlot
          ? photoSlots.find((s) => s.id === selectedSlot)
          : null;
        const photoType = slot ? slot.type : "Gallery Photo";

        const newPhotos = result.assets.map((asset, index) => ({
          id: Date.now().toString() + index,
          uri: asset.uri,
          type: photoType,
          slotId: selectedSlot || undefined,
          isUploading: true,
        }));

        setPhotos((prev) => [...prev, ...newPhotos]);
        animatePhotoAddition();

        // Simulate upload
        setTimeout(() => {
          setPhotos((prev) =>
            prev.map((photo) => ({
              ...photo,
              isUploading: false,
              uploaded: true,
            }))
          );
          setIsUploading(false);
        }, 1500);

        setSelectedSlot(null);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image from gallery.");
      setIsUploading(false);
      setSelectedSlot(null);
    }
  };

  const handlePhotoSlotPress = (slotId: string, type: string) => {
    setSelectedSlot(slotId);
    Alert.alert(
      `Add ${type}`,
      "Choose how to add this photo",
      [
        {
          text: "📸 Take Photo",
          onPress: handleTakePhoto,
          style: "default",
        },
        {
          text: "🖼️ Choose from Gallery",
          onPress: handleGallery,
          style: "default",
        },
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setSelectedSlot(null),
        },
      ],
      { cancelable: true }
    );
  };

  const addNewPhoto = async (uri: string, type: string, slotId?: string) => {
    setIsUploading(true);
    const newPhoto: Photo = {
      id: Date.now().toString(),
      uri,
      type,
      slotId,
      isUploading: true,
    };

    setPhotos((prev) => {
      const newPhotos = [...prev, newPhoto];
      // If no cover photo exists, make this the cover
      if (!newPhotos.some((p) => p.isCover)) {
        newPhotos[newPhotos.length - 1].isCover = true;
      }
      return newPhotos;
    });

    animatePhotoAddition();

    // Simulate upload
    setTimeout(() => {
      setPhotos((prev) =>
        prev.map((photo) =>
          photo.id === newPhoto.id
            ? { ...photo, isUploading: false, uploaded: true }
            : photo
        )
      );
      setIsUploading(false);
    }, 1000);
  };

  const handleSetCover = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((photo) => ({
        ...photo,
        isCover: photo.id === photoId,
      }))
    );

    // Show success feedback
    Alert.alert("Success", "Cover photo updated!");
  };

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert("Remove Photo", "Are you sure you want to remove this photo?", [
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

  const handleEnhancePhoto = (photoId: string) => {
    Alert.alert("AI Enhancement", "Enhance photo quality using AI?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Enhance",
        onPress: () => {
          setPhotos((prev) =>
            prev.map((photo) =>
              photo.id === photoId ? { ...photo, isUploading: true } : photo
            )
          );

          // Simulate AI enhancement
          setTimeout(() => {
            setPhotos((prev) =>
              prev.map((photo) =>
                photo.id === photoId
                  ? { ...photo, isUploading: false, uploaded: true }
                  : photo
              )
            );
            Alert.alert("Success", "Photo enhanced with AI!");
          }, 2000);
        },
      },
    ]);
  };

  const handleReviewListing = () => {
    // FIXED: Check total photos count instead of filtering by type
    if (photos.length < 3) {
      Alert.alert(
        "More Photos Needed",
        "Please upload at least 3 photos of your vehicle.",
        [{ text: "OK" }]
      );
      return;
    }

    // Optional: Check for required slots (cover, front, side)
    const requiredSlotIds = ["cover", "front", "side"];
    const hasRequiredPhotos = requiredSlotIds.every((slotId) =>
      photos.some((photo) => photo.slotId === slotId)
    );

    // If you want to be strict about required photos, uncomment this:
    /*
    if (!hasRequiredPhotos) {
      Alert.alert(
        "Specific Photos Needed",
        "Please make sure you have photos for: Cover, Front, and Side views.",
        [{ text: "OK" }]
      );
      return;
    }
    */

    if (updateVehicleData) {
      updateVehicleData({
        photos: photos.map((photo) => photo.uri),
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

  // Step indicator data
  const steps = [
    { number: 1, label: "Basics", completed: true },
    { number: 2, label: "Pricing", completed: true },
    { number: 3, label: "Technical", completed: true },
    { number: 4, label: "Features", completed: true },
    { number: 5, label: "Photos", completed: false },
    { number: 6, label: "Location", completed: false },
    { number: 7, label: "Publish", completed: false },
  ];

  const currentStepIndex = 5;
  const uploadedCount = photos.filter((p) => p.uploaded).length;
  const requiredCount = 3;
  const photoScore = Math.min(Math.round((uploadedCount / 10) * 100), 100);

  // Helper function to get proper icon name
  const getProperIconName = (icon: string) => {
    const iconMap: { [key: string]: any } = {
      star: "star",
      car: "car",
      "car-outline": "car-outline",
      "car-sport": "car-sport",
      settings: "settings",
      speedometer: "speedometer",
      "git-merge": "git-merge",
      cube: "cube",
      "add-circle": "add-circle",
      images: "images",
      "checkmark-circle": "checkmark-circle",
      ellipse: "ellipse",
      sunny: "sunny",
      bulb: "bulb",
      "chevron-forward": "chevron-forward",
      "close-circle": "close-circle",
      "chevron-back": "chevron-back",
      "help-circle": "help-circle",
      camera: "camera",
      "trending-up": "trending-up",
      "shield-checkmark": "shield-checkmark",
      "cloud-upload": "cloud-upload",
    };
    return iconMap[icon] || "image";
  };

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
            Add Photos
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Step {currentStepIndex} • Visual Showcase
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
            <Ionicons name="camera" size={32} color={theme.colors.primary} />
            <View style={styles.titleContent}>
              <Text
                style={[styles.mainTitle, { color: theme.colors.onBackground }]}
              >
                Vehicle Photos
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Show your car from every angle
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Photo Stats Card */}
        <View
          style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {uploadedCount}/10
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
                  {
                    color:
                      photos.length >= requiredCount ? "#10B981" : "#EF4444",
                  },
                ]}
              >
                {photos.length >= requiredCount
                  ? "✓"
                  : requiredCount - photos.length}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {photos.length >= requiredCount ? "Ready" : "Needed"}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      photoScore > 70
                        ? "#10B981"
                        : photoScore > 40
                          ? "#F59E0B"
                          : "#EF4444",
                  },
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
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBackground,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <View
                style={[
                  styles.progressFillBar,
                  {
                    width: `${photoScore}%`,
                    backgroundColor:
                      photoScore > 70
                        ? "#10B981"
                        : photoScore > 40
                          ? "#F59E0B"
                          : "#EF4444",
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Photo Requirements */}
        <View style={styles.requirementsCard}>
          <View style={styles.requirementsHeader}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={theme.colors.primary}
            />
            <Text
              style={[
                styles.requirementsTitle,
                { color: theme.colors.onBackground },
              ]}
            >
              Photo Requirements
            </Text>
          </View>
          <View style={styles.requirementsList}>
            {photoSlots.slice(0, 3).map((slot) => {
              const hasPhoto = photos.some((p) => p.slotId === slot.id);
              return (
                <View key={slot.id} style={styles.requirementItem}>
                  <Ionicons
                    name={hasPhoto ? "checkmark-circle" : "ellipse"}
                    size={20}
                    color={hasPhoto ? "#10B981" : theme.colors.onSurfaceVariant}
                  />
                  <Text
                    style={[
                      styles.requirementText,
                      {
                        color: hasPhoto
                          ? theme.colors.onSurface
                          : theme.colors.onSurfaceVariant,
                        fontWeight: hasPhoto ? "600" : "400",
                      },
                    ]}
                  >
                    {slot.type} {slot.required && "(Required)"}
                  </Text>
                  <Text
                    style={[
                      styles.requirementDesc,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {slot.description}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Photo Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.onBackground },
              ]}
            >
              Your Photos
            </Text>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Add Photos",
                  "Choose how to add photos",
                  [
                    {
                      text: "📸 Take Photo",
                      onPress: handleTakePhoto,
                      style: "default",
                    },
                    {
                      text: "🖼️ Choose from Gallery",
                      onPress: handleGallery,
                      style: "default",
                    },
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                  ],
                  { cancelable: true }
                );
              }}
              style={styles.addMoreButton}
            >
              <Ionicons
                name="add-circle"
                size={20}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.addMoreText, { color: theme.colors.primary }]}
              >
                Add More
              </Text>
            </TouchableOpacity>
          </View>

          {photos.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="images"
                size={64}
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
              {photos.map((photo, index) => (
                <View key={photo.id} style={styles.photoContainer}>
                  <Image source={{ uri: photo.uri }} style={styles.photo} />

                  {photo.isUploading ? (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="large" color="white" />
                      <Text style={styles.uploadingText}>Uploading...</Text>
                    </View>
                  ) : (
                    <View style={styles.photoOverlay}>
                      <View style={styles.photoHeader}>
                        <View style={styles.photoTypeBadge}>
                          <Text style={styles.photoTypeText}>
                            {photo.type || "Photo"}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleDeletePhoto(photo.id)}
                          style={styles.deleteButton}
                        >
                          <Ionicons
                            name="close-circle"
                            size={24}
                            color="#fff"
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.photoFooter}>
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
                              size={16}
                              color="white"
                            />
                            <Text style={styles.setCoverText}>Set Cover</Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          onPress={() => handleEnhancePhoto(photo.id)}
                          style={styles.enhanceButton}
                        >
                          <View
                            style={[
                              styles.aiBadge,
                              { backgroundColor: "#8B5CF6" },
                            ]}
                          >
                            <Text style={styles.aiText}>AI</Text>
                          </View>
                          <Text style={styles.enhanceText}>Enhance</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </Animated.View>
          )}
        </View>

        {/* Photo Slots */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            Recommended Shots
          </Text>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Complete your photo collection
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.slotContainer}>
              {photoSlots.map((slot) => {
                const hasPhoto = photos.some((p) => p.slotId === slot.id);
                const iconName = getProperIconName(slot.icon);

                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.photoSlot,
                      hasPhoto && styles.photoSlotFilled,
                      hasPhoto && { borderColor: slot.color },
                    ]}
                    onPress={() => handlePhotoSlotPress(slot.id, slot.type)}
                  >
                    <View
                      style={[
                        styles.slotIcon,
                        {
                          backgroundColor: hasPhoto
                            ? slot.color + "20"
                            : theme.colors.surfaceVariant,
                        },
                      ]}
                    >
                      <Ionicons
                        name={hasPhoto ? "checkmark-circle" : iconName}
                        size={24}
                        color={
                          hasPhoto ? slot.color : theme.colors.onSurfaceVariant
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.slotTitle,
                        {
                          color: hasPhoto
                            ? theme.colors.onSurface
                            : theme.colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {slot.type}
                    </Text>
                    <Text
                      style={[
                        styles.slotDesc,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {slot.description}
                    </Text>
                    {slot.required && !hasPhoto && (
                      <View
                        style={[
                          styles.requiredBadge,
                          { backgroundColor: "#EF4444" },
                        ]}
                      >
                        <Text style={styles.requiredText}>Required</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={handleTakePhoto}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: theme.colors.primary + "20" },
              ]}
            >
              <Ionicons name="camera" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text
                style={[styles.actionTitle, { color: theme.colors.onSurface }]}
              >
                Take Photo
              </Text>
              <Text
                style={[
                  styles.actionDesc,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Use camera
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={handleGallery}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#8B5CF620" }]}>
              <Ionicons name="images" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.actionContent}>
              <Text
                style={[styles.actionTitle, { color: theme.colors.onSurface }]}
              >
                Choose from Gallery
              </Text>
              <Text
                style={[
                  styles.actionDesc,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Select existing photos
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>

        {/* Photo Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={24} color="#F59E0B" />
            <Text
              style={[styles.tipsTitle, { color: theme.colors.onBackground }]}
            >
              Pro Tips
            </Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="sunny" size={20} color="#F59E0B" />
              <Text style={[styles.tipText, { color: theme.colors.onSurface }]}>
                Use natural daylight for best results
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="cube" size={20} color="#10B981" />
              <Text style={[styles.tipText, { color: theme.colors.onSurface }]}>
                Clean car interior before shooting
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="car-sport" size={20} color="#3B82F6" />
              <Text style={[styles.tipText, { color: theme.colors.onSurface }]}>
                Show unique features and details
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="images" size={20} color="#8B5CF6" />
              <Text style={[styles.tipText, { color: theme.colors.onSurface }]}>
                8+ photos increase views by 300%
              </Text>
            </View>
          </View>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleReviewListing}
          style={[
            styles.continueButton,
            { backgroundColor: theme.colors.primary },
          ]}
          labelStyle={[styles.buttonLabel, { color: theme.colors.onPrimary }]}
          contentStyle={styles.buttonContent}
          disabled={photos.length < 3 || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="white" />
          ) : photos.length < 3 ? (
            `Add ${3 - photos.length} more photos`
          ) : (
            "Continue to Location"
          )}
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
              +{photoScore}% Views
            </Text>
          </View>
          <View style={styles.featureDivider} />
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
              Verified Photos
            </Text>
          </View>
          <View style={styles.featureDivider} />
          <View style={styles.featureItem}>
            <Ionicons
              name="cloud-upload"
              size={16}
              color={theme.colors.primary}
            />
            <Text
              style={[
                styles.featureText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Cloud Storage
            </Text>
          </View>
        </View>
      </View>

      {/* Uploading Overlay */}
      {isUploading && (
        <View style={styles.globalUploadingOverlay}>
          <View style={styles.globalUploadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text
              style={[
                styles.globalUploadingText,
                { color: theme.colors.onSurface },
              ]}
            >
              Uploading Photos...
            </Text>
          </View>
        </View>
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
      marginBottom: 16,
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
    progressContainer: {
      marginTop: 8,
    },
    progressBackground: {
      height: 8,
      borderRadius: 4,
      overflow: "hidden",
    },
    progressFillBar: {
      height: "100%",
      borderRadius: 4,
    },
    requirementsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.outline + "20",
    },
    requirementsHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    requirementsTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginLeft: 12,
    },
    requirementsList: {
      gap: 12,
    },
    requirementItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    requirementText: {
      fontSize: 14,
      marginLeft: 12,
      flex: 1,
    },
    requirementDesc: {
      fontSize: 12,
      marginLeft: 8,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
    },
    sectionSubtitle: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 16,
    },
    addMoreButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: theme.colors.primary + "10",
      gap: 6,
    },
    addMoreText: {
      fontSize: 14,
      fontWeight: "600",
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 40,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: theme.colors.outline + "20",
      borderStyle: "dashed",
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginTop: 16,
      marginBottom: 4,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    photoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    photoContainer: {
      width: (screenWidth - 52) / 2,
      aspectRatio: 16 / 9,
      borderRadius: 16,
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
    uploadingText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
      marginTop: 8,
    },
    photoOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "space-between",
      padding: 12,
    },
    photoHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    photoTypeBadge: {
      backgroundColor: "rgba(0,0,0,0.6)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    photoTypeText: {
      color: "white",
      fontSize: 10,
      fontWeight: "600",
    },
    deleteButton: {
      padding: 2,
    },
    photoFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    coverBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      gap: 4,
    },
    coverText: {
      color: "white",
      fontSize: 11,
      fontWeight: "700",
    },
    setCoverButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.2)",
      gap: 4,
    },
    setCoverText: {
      color: "white",
      fontSize: 10,
      fontWeight: "600",
    },
    enhanceButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.2)",
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 8,
      gap: 4,
    },
    aiBadge: {
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },
    aiText: {
      color: "white",
      fontSize: 8,
      fontWeight: "800",
    },
    enhanceText: {
      color: "white",
      fontSize: 10,
      fontWeight: "600",
    },
    slotContainer: {
      flexDirection: "row",
      gap: 12,
      paddingRight: 20,
    },
    photoSlot: {
      width: 140,
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.outline + "40",
      borderStyle: "dashed",
      alignItems: "center",
    },
    photoSlotFilled: {
      borderStyle: "solid",
      backgroundColor: theme.colors.surface,
    },
    slotIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    slotTitle: {
      fontSize: 14,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 4,
    },
    slotDesc: {
      fontSize: 11,
      textAlign: "center",
      lineHeight: 14,
    },
    requiredBadge: {
      position: "absolute",
      top: -8,
      right: -8,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
    },
    requiredText: {
      color: "white",
      fontSize: 9,
      fontWeight: "800",
    },
    quickActions: {
      gap: 12,
      marginBottom: 24,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.outline + "20",
    },
    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 2,
    },
    actionDesc: {
      fontSize: 12,
    },
    tipsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.colors.outline + "20",
    },
    tipsHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    tipsTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginLeft: 12,
    },
    tipsList: {
      gap: 12,
    },
    tipItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    tipText: {
      fontSize: 14,
      marginLeft: 12,
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
    globalUploadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    globalUploadingContainer: {
      backgroundColor: theme.colors.surface,
      padding: 30,
      borderRadius: 20,
      alignItems: "center",
    },
    globalUploadingText: {
      fontSize: 16,
      fontWeight: "600",
      marginTop: 16,
    },
  });
};
