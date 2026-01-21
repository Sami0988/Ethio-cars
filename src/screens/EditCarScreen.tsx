// screens/EditCarScreen.tsx
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  IconButton,
  TextInput,
  useTheme,
} from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  useCarFeatures,
  useCarLocations,
  useUpdateCar,
} from "../features/cars/car.hooks";
import { Feature } from "../features/cars/car.types";
import { useImagePicker } from "../hooks/useImagePicker";
import { getFontSize, getSpacing } from "../utils/responsive";

interface EditCarScreenProps {}

const EditCarScreen: React.FC<EditCarScreenProps> = React.memo(() => {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const updateCarMutation = useUpdateCar();
  const { takePhoto, pickFromLibrary, isPicking, error, pickedImage } =
    useImagePicker();

  const [formData, setFormData] = useState({
    price: "",
    negotiable: false,
    mileage: "",
    description: "",
    status: "Active",
    // Technical Details
    fuel_type: "",
    transmission: "",
    body_type: "",
    drive_type: "",
    // Location
    region_id: undefined as number | undefined,
    // Features
    features: [] as number[],
  });

  const [currentImages, setCurrentImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  // Location state
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [showRegionModal, setShowRegionModal] = useState(false);

  // Features state
  const [selectedFeatures, setSelectedFeatures] = useState<Set<number>>(
    new Set(),
  );
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);

  // Fetch features and locations
  const { data: featuresResponse } = useCarFeatures();
  const { data: locationsResponse } = useCarLocations();


  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCarDetails();
    }
  }, [id]);

  // Watch for pickedImage changes and add to newImages immediately
  useEffect(() => {
    if (pickedImage && pickedImage.uri) {
      const newImage = {
        id: Date.now(),
        uri: pickedImage.uri,
        payload: pickedImage.payload,
        isNew: true,
      };

      // Check if this image is already in the list to avoid duplicates
      const isDuplicate = newImages.some((img) => img.uri === pickedImage.uri);
      if (!isDuplicate) {
        setNewImages((prev) => [...prev, newImage]);
      }
    }
  }, [pickedImage]);

  const fetchCarDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://ethiocars.com/mobile-api/v1/cars/view/${id}`,
      );
      const data = await response.json();

      if (data.success) {
        const car = data.data;
        setFormData({
          price: car.price?.toString() || "",
          negotiable: car.negotiable || false,
          mileage: car.mileage?.toString() || "",
          description: car.description || "",
          status: car.status || "Active",
          fuel_type: car.fuel_type || "",
          transmission: car.transmission || "",
          body_type: car.body_type || "",
          drive_type: car.drive_type || "",
          region_id: car.location?.region_id,
          features: car.features?.map((f: any) => f.feature_id) || [],
        });
        // Load current images
        setCurrentImages(car.images || []);
        // Set location display values
        setSelectedRegion(car.location?.region || "");
        // Set selected features
        setSelectedFeatures(
          new Set(car.features?.map((f: any) => f.feature_id) || []),
        );
      } else {
        Alert.alert("Error", data.message || "Failed to load car details");
      }
    } catch (err) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!id) {
      Alert.alert("Error", "Car ID is missing");
      return;
    }

    // Validate required fields
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert("Error", "Please enter a valid price");
      return;
    }

    if (!formData.mileage || parseInt(formData.mileage) < 0) {
      Alert.alert("Error", "Please enter valid mileage");
      return;
    }

    setIsSaving(true);

    const updateData: any = {};

    // Only include fields that have changed
    if (formData.price) updateData.price = parseFloat(formData.price);
    if (formData.negotiable !== undefined)
      updateData.negotiable = formData.negotiable;
    if (formData.mileage) updateData.mileage = parseInt(formData.mileage);
    if (formData.description) updateData.description = formData.description;
    if (formData.status) updateData.status = formData.status;

    // Add technical details
    if (formData.fuel_type) updateData.fuel_type = formData.fuel_type;
    if (formData.transmission) updateData.transmission = formData.transmission;
    if (formData.body_type) updateData.body_type = formData.body_type;
    if (formData.drive_type) updateData.drive_type = formData.drive_type;

    // Add location
    if (formData.region_id) updateData.region_id = formData.region_id;

    // Add features (replace all features with new list)
    if (formData.features.length > 0) {
      updateData.features = formData.features;
    }

    // Add image management
    if (imagesToDelete.length > 0) {
      updateData.delete_images = imagesToDelete;
    }

    if (newImages.length > 0) {
      updateData.add_images = newImages.map((img) => ({
        data: img.payload?.data || img.uri, // Use base64 payload if available
        type: "exterior",
      }));
    }

    updateCarMutation.mutate(
      { id: parseInt(id as string), data: updateData },
      {
        onSuccess: (response: any) => {
          setIsSaving(false);
          if (response.success) {
            Alert.alert("Success", "Car listing updated successfully", [
              {
                text: "OK",
                onPress: () => {
                  // Navigate to home screen to see fresh data
                  router.replace("/(tabs)");
                },
              },
            ]);
          } else {
            Alert.alert(
              "Error",
              response.message || "Failed to update car listing",
            );
          }
        },
        onError: (error: any) => {
          setIsSaving(false);
          Alert.alert(
            "Error",
            error?.response?.data?.message ||
              error?.message ||
              "Failed to update car listing",
          );
        },
      },
    );
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddImage = () => {
    Alert.alert(
      "Add Image",
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
        },
      ],
      { cancelable: true },
    );
  };

  const handleTakePhoto = async () => {
    try {
      await takePhoto("exterior");
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const handleGallery = async () => {
    try {
      await pickFromLibrary("exterior");
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image from gallery.");
    }
  };

  const handleDeleteImage = (imageId: number, isNew: boolean = false) => {
    if (isNew) {
      // Remove from new images
      setNewImages(newImages.filter((img) => img.id !== imageId));
    } else {
      // Add to delete list
      setImagesToDelete([...imagesToDelete, imageId]);
      setCurrentImages(currentImages.filter((img) => img.image_id !== imageId));
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
            Loading car details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom"]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            paddingTop: insets.top,
          },
        ]}
      >
        <IconButton
          icon="arrow-left"
          size={22}
          iconColor={theme.colors.onSurface}
          onPress={() => router.back()}
        />
        <View style={styles.headerTitle}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Edit Car Listing
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + getSpacing(100, 120, 140),
          },
        ]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        bounces={true}
        alwaysBounceVertical={false}
      >
        {/* Price Section */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Price Information
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Price (ETB) *
            </Text>
            <TextInput
              mode="outlined"
              value={formData.price}
              onChangeText={(value) => updateFormData("price", value)}
              keyboardType="numeric"
              style={styles.input}
              theme={{
                colors: {
                  primary: theme.colors.primary,
                  background: theme.colors.surface,
                  text: theme.colors.onSurface,
                  placeholder: theme.colors.onSurfaceVariant,
                },
              }}
            />
          </View>

          <View style={styles.switchGroup}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Negotiable
            </Text>
            <View style={styles.switchContainer}>
              <Button
                mode={formData.negotiable ? "contained" : "outlined"}
                onPress={() =>
                  updateFormData("negotiable", !formData.negotiable)
                }
                style={[
                  styles.switchButton,
                  {
                    backgroundColor: formData.negotiable
                      ? theme.colors.primary
                      : "transparent",
                  },
                ]}
                textColor={
                  formData.negotiable
                    ? theme.colors.onPrimary
                    : theme.colors.primary
                }
              >
                {formData.negotiable ? "Yes" : "No"}
              </Button>
            </View>
          </View>
        </Card>

        {/* Basic Information */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Basic Information
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Mileage (km) *
            </Text>
            <TextInput
              mode="outlined"
              value={formData.mileage}
              onChangeText={(value) => updateFormData("mileage", value)}
              keyboardType="numeric"
              style={styles.input}
              theme={{
                colors: {
                  primary: theme.colors.primary,
                  background: theme.colors.surface,
                  text: theme.colors.onSurface,
                  placeholder: theme.colors.onSurfaceVariant,
                },
              }}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Status
            </Text>
            <View style={styles.statusButtons}>
              {["Active", "Sold", "Pending", "Draft"].map((status) => (
                <Button
                  key={status}
                  mode={formData.status === status ? "contained" : "outlined"}
                  onPress={() => updateFormData("status", status)}
                  style={[
                    styles.statusButton,
                    {
                      backgroundColor:
                        formData.status === status
                          ? theme.colors.primary
                          : "transparent",
                    },
                  ]}
                  textColor={
                    formData.status === status
                      ? theme.colors.onPrimary
                      : theme.colors.primary
                  }
                >
                  {status}
                </Button>
              ))}
            </View>
          </View>
        </Card>

        {/* Images Section */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Images
          </Text>

          {/* Current Images */}
          {currentImages.length > 0 && (
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                Current Images
              </Text>
              <View style={styles.imageGrid}>
                {currentImages.map((image) => (
                  <View key={image.image_id} style={styles.imageContainer}>
                    <Image
                      source={{ uri: image.url || image.thumbnail }}
                      style={styles.image}
                    />
                    <TouchableOpacity
                      style={styles.deleteImageButton}
                      onPress={() => handleDeleteImage(image.image_id, false)}
                    >
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={20}
                        color="#F44336"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* New Images */}
          {newImages.length > 0 && (
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                New Images
              </Text>
              <View style={styles.imageGrid}>
                {newImages.map((image) => (
                  <View key={image.id} style={styles.imageContainer}>
                    <Image source={{ uri: image.uri }} style={styles.image} />
                    <TouchableOpacity
                      style={styles.deleteImageButton}
                      onPress={() => handleDeleteImage(image.id, true)}
                    >
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={20}
                        color="#F44336"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Add Image Button */}
          <View style={styles.formGroup}>
            <TouchableOpacity
              style={[
                styles.addImageButton,
                { borderColor: theme.colors.primary },
              ]}
              onPress={handleAddImage}
            >
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.addImageText, { color: theme.colors.primary }]}
              >
                Add Image
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Description */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Description
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Description
            </Text>
            <TextInput
              mode="outlined"
              value={formData.description}
              onChangeText={(value) => updateFormData("description", value)}
              multiline
              numberOfLines={6}
              style={[styles.input, styles.textArea]}
              theme={{
                colors: {
                  primary: theme.colors.primary,
                  background: theme.colors.surface,
                  text: theme.colors.onSurface,
                  placeholder: theme.colors.onSurfaceVariant,
                },
              }}
            />
          </View>
        </Card>

        {/* Technical Details */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Technical Details
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Fuel Type
            </Text>
            <View style={styles.buttonRow}>
              {[
                "Gasoline",
                "Diesel",
                "Electric",
                "Hybrid",
                "Plug-in Hybrid",
              ].map((fuel) => (
                <Button
                  key={fuel}
                  mode={formData.fuel_type === fuel ? "contained" : "outlined"}
                  onPress={() => updateFormData("fuel_type", fuel)}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor:
                        formData.fuel_type === fuel
                          ? theme.colors.primary
                          : "transparent",
                    },
                  ]}
                  textColor={
                    formData.fuel_type === fuel
                      ? theme.colors.onPrimary
                      : theme.colors.primary
                  }
                >
                  {fuel}
                </Button>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Transmission
            </Text>
            <View style={styles.buttonRow}>
              {[
                "Automatic",
                "Manual",
                "CVT",
                "Semi-Automatic",
                "Dual-Clutch",
              ].map((trans) => (
                <Button
                  key={trans}
                  mode={
                    formData.transmission === trans ? "contained" : "outlined"
                  }
                  onPress={() => updateFormData("transmission", trans)}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor:
                        formData.transmission === trans
                          ? theme.colors.primary
                          : "transparent",
                    },
                  ]}
                  textColor={
                    formData.transmission === trans
                      ? theme.colors.onPrimary
                      : theme.colors.primary
                  }
                >
                  {trans}
                </Button>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Body Type
            </Text>
            <View style={styles.buttonRow}>
              {[
                "Sedan",
                "SUV",
                "Truck",
                "Coupe",
                "Hatchback",
                "Van",
                "Convertible",
                "Wagon",
              ].map((body) => (
                <Button
                  key={body}
                  mode={formData.body_type === body ? "contained" : "outlined"}
                  onPress={() => updateFormData("body_type", body)}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor:
                        formData.body_type === body
                          ? theme.colors.primary
                          : "transparent",
                    },
                  ]}
                  textColor={
                    formData.body_type === body
                      ? theme.colors.onPrimary
                      : theme.colors.primary
                  }
                >
                  {body}
                </Button>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Drive Type
            </Text>
            <View style={styles.buttonRow}>
              {["FWD", "RWD", "AWD", "4WD"].map((drive) => (
                <Button
                  key={drive}
                  mode={
                    formData.drive_type === drive ? "contained" : "outlined"
                  }
                  onPress={() => updateFormData("drive_type", drive)}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor:
                        formData.drive_type === drive
                          ? theme.colors.primary
                          : "transparent",
                    },
                  ]}
                  textColor={
                    formData.drive_type === drive
                      ? theme.colors.onPrimary
                      : theme.colors.primary
                  }
                >
                  {drive}
                </Button>
              ))}
            </View>
          </View>
        </Card>

        {/* Location */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Location
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              Region
            </Text>
            <TouchableOpacity
              onPress={() => setShowRegionModal(true)}
              style={[
                styles.locationButton,
                { borderColor: theme.colors.outline },
              ]}
            >
              <Text
                style={[
                  styles.locationButtonText,
                  {
                    color: selectedRegion
                      ? theme.colors.onSurface
                      : theme.colors.onSurfaceVariant,
                  },
                ]}
              >
                {selectedRegion || "Select Region"}
              </Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={20}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Features */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Features & Extras
          </Text>

          <View style={styles.formGroup}>
            <TouchableOpacity
              onPress={() => setShowFeaturesModal(true)}
              style={[
                styles.locationButton,
                { borderColor: theme.colors.outline },
              ]}
            >
              <Text
                style={[
                  styles.locationButtonText,
                  { color: theme.colors.onSurface },
                ]}
              >
                {selectedFeatures.size > 0
                  ? `${selectedFeatures.size} features selected`
                  : "Select Features"}
              </Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={20}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>

            {selectedFeatures.size > 0 && (
              <View style={styles.selectedFeaturesContainer}>
                {Array.from(selectedFeatures).map((featureId) => {
                  const allFeatures = Array.isArray(featuresResponse?.data)
                    ? featuresResponse.data
                    : featuresResponse?.data?.features || [];
                  const feature = allFeatures.find(
                    (f: Feature) => f.feature_id === featureId,
                  );
                  return feature ? (
                    <View
                      key={featureId}
                      style={[
                        styles.featureChip,
                        { backgroundColor: theme.colors.primary + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.featureChipText,
                          { color: theme.colors.primary },
                        ]}
                      >
                        {feature.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          const newSet = new Set(selectedFeatures);
                          newSet.delete(featureId);
                          setSelectedFeatures(newSet);
                          updateFormData("features", Array.from(newSet));
                        }}
                      >
                        <MaterialCommunityIcons
                          name="close"
                          size={16}
                          color={theme.colors.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : null;
                })}
              </View>
            )}
          </View>
        </Card>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Fixed Bottom Actions */}
      <View
        style={[
          styles.bottomActions,
          {
            backgroundColor: theme.colors.surface,
            paddingBottom: insets.bottom + 16, // Add safe area padding
          },
        ]}
      >
        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={styles.cancelButton}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          disabled={isSaving}
          loading={isSaving}
        >
          Save Changes
        </Button>
      </View>

      {/* Region Selection Modal */}
      <Modal
        visible={showRegionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRegionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[styles.modalTitle, { color: theme.colors.onSurface }]}
              >
                Select Region
              </Text>
              <TouchableOpacity onPress={() => setShowRegionModal(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={theme.colors.onSurface}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {(
                (locationsResponse?.data as any)?.regions ||
                (Array.isArray(locationsResponse?.data)
                  ? locationsResponse.data
                  : [])
              )?.map((region: any) => (
                <TouchableOpacity
                  key={region.region_id}
                  onPress={() => {
                    updateFormData("region_id", region.region_id);
                    setSelectedRegion(region.name);
                    setShowRegionModal(false);
                  }}
                  style={[
                    styles.modalItem,
                    {
                      backgroundColor:
                        formData.region_id === region.region_id
                          ? theme.colors.primary + "20"
                          : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {region.name}
                  </Text>
                  {formData.region_id === region.region_id && (
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Features Selection Modal */}
      <Modal
        visible={showFeaturesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFeaturesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[styles.modalTitle, { color: theme.colors.onSurface }]}
              >
                Select Features ({selectedFeatures.size} selected)
              </Text>
              <TouchableOpacity onPress={() => setShowFeaturesModal(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={theme.colors.onSurface}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {(Array.isArray(featuresResponse?.data)
                ? featuresResponse.data
                : featuresResponse?.data?.features || []
              )?.map((feature: Feature) => {
                const isSelected = selectedFeatures.has(feature.feature_id);
                return (
                  <TouchableOpacity
                    key={feature.feature_id}
                    onPress={() => {
                      const newSet = new Set(selectedFeatures);
                      if (isSelected) {
                        newSet.delete(feature.feature_id);
                      } else {
                        newSet.add(feature.feature_id);
                      }
                      setSelectedFeatures(newSet);
                      updateFormData("features", Array.from(newSet));
                    }}
                    style={[
                      styles.modalItem,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.primary + "20"
                          : "transparent",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      {feature.name}
                    </Text>
                    {isSelected && (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.modalFooter}>
              <Button
                mode="contained"
                onPress={() => setShowFeaturesModal(false)}
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                Done
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
});

export default EditCarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "System",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: getSpacing(12, 16, 20),
    paddingVertical: getSpacing(6, 8, 10),
    elevation: 2,
    zIndex: 100,
  },
  headerTitle: {
    flex: 1,
    alignItems: "center",
    fontSize: getFontSize(16, 18, 20),
    fontWeight: "bold",
    fontFamily: "System",
  },
  title: {
    fontSize: getFontSize(16, 18, 20),
    fontWeight: "bold",
    fontFamily: "System",
  },
  placeholder: {
    width: getSpacing(32, 40, 48),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: getSpacing(12, 16, 20),
    paddingTop: getSpacing(8, 12, 16),
    paddingBottom: getSpacing(100, 120, 140),
  },
  card: {
    marginBottom: getSpacing(12, 16, 20),
    padding: getSpacing(12, 16, 20),
    borderRadius: 16,
    elevation: 2,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: getFontSize(16, 18, 20),
    fontWeight: "bold",
    marginBottom: getSpacing(12, 16, 20),
    fontFamily: "System",
  },
  formGroup: {
    marginBottom: getSpacing(12, 16, 20),
  },
  label: {
    fontSize: getFontSize(14, 16, 18),
    fontWeight: "500",
    marginBottom: getSpacing(6, 8, 10),
    fontFamily: "System",
  },
  input: {
    fontSize: getFontSize(14, 16, 18),
  },
  textArea: {
    minHeight: getSpacing(100, 120, 140),
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: getSpacing(8, 12, 16),
  },
  imageContainer: {
    position: "relative",
    width: getSpacing(80, 100, 120),
    height: getSpacing(80, 100, 120),
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  deleteImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: getSpacing(12, 16, 20),
    gap: getSpacing(6, 8, 10),
    minHeight: getSpacing(50, 60, 70),
  },
  addImageText: {
    fontSize: getFontSize(14, 16, 18),
    fontWeight: "600",
  },
  switchGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: getSpacing(12, 16, 20),
    flexWrap: "wrap",
  },
  switchContainer: {
    flexDirection: "row",
  },
  switchButton: {
    borderRadius: 8,
    paddingHorizontal: getSpacing(12, 16, 20),
    minHeight: getSpacing(36, 40, 44),
  },
  statusButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: getSpacing(6, 8, 10),
  },
  statusButton: {
    borderRadius: 8,
    paddingHorizontal: getSpacing(10, 12, 14),
    minHeight: getSpacing(36, 40, 44),
  },
  bottomPadding: {
    height: 20,
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: getSpacing(12, 16, 20),
    gap: getSpacing(8, 12, 16),
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    minHeight: getSpacing(44, 48, 52),
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    minHeight: getSpacing(44, 48, 52),
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: getSpacing(6, 8, 10),
    marginTop: getSpacing(4, 6, 8),
  },
  optionButton: {
    borderRadius: 8,
    paddingHorizontal: getSpacing(10, 12, 14),
    minHeight: getSpacing(36, 40, 44),
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    padding: getSpacing(12, 16, 20),
    minHeight: getSpacing(44, 48, 52),
  },
  locationButtonText: {
    fontSize: getFontSize(14, 16, 18),
    flex: 1,
  },
  selectedFeaturesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: getSpacing(6, 8, 10),
    marginTop: getSpacing(8, 12, 16),
  },
  featureChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: getSpacing(10, 12, 14),
    paddingVertical: getSpacing(6, 8, 10),
    borderRadius: 20,
    gap: getSpacing(4, 6, 8),
  },
  featureChipText: {
    fontSize: getFontSize(12, 14, 16),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: getSpacing(20, 24, 28),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: getSpacing(16, 20, 24),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalTitle: {
    fontSize: getFontSize(18, 20, 22),
    fontWeight: "bold",
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: getSpacing(12, 16, 20),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  modalItemText: {
    fontSize: getFontSize(14, 16, 18),
    flex: 1,
  },
  modalFooter: {
    padding: getSpacing(16, 20, 24),
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  modalButton: {
    borderRadius: 12,
    minHeight: getSpacing(44, 48, 52),
  },
});
