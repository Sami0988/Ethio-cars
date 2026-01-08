// screens/EditCarScreen.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
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
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useUpdateCar } from "../features/cars/car.hooks";
import { useImagePicker } from "../hooks/useImagePicker";

const { width } = Dimensions.get("window");

interface EditCarScreenProps {}

const EditCarScreen: React.FC<EditCarScreenProps> = () => {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const updateCarMutation = useUpdateCar();
  const { takePhoto, pickFromLibrary, isPicking, error, pickedImage } =
    useImagePicker();

  const [formData, setFormData] = useState({
    price: "",
    negotiable: false,
    mileage: "",
    description: "",
    status: "Active",
  });

  const [currentImages, setCurrentImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

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
        `https://ethiocars.com/mobile-api/v1/cars/view/${id}`
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
        });
        // Load current images
        setCurrentImages(car.images || []);
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
                onPress: () => router.back(),
              },
            ]);
          } else {
            Alert.alert(
              "Error",
              response.message || "Failed to update car listing"
            );
          }
        },
        onError: (error: any) => {
          setIsSaving(false);
          Alert.alert(
            "Error",
            error?.response?.data?.message ||
              error?.message ||
              "Failed to update car listing"
          );
        },
      }
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
      { cancelable: true }
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
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
            Loading car details...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <IconButton
          icon="arrow-left"
          size={24}
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Fixed Bottom Actions */}
      <View
        style={[
          styles.bottomActions,
          { backgroundColor: theme.colors.surface },
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
    </View>
  );
};

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
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 2,
    zIndex: 100,
  },
  headerTitle: {
    flex: 1,
    alignItems: "center",
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "System",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  card: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    fontFamily: "System",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    fontFamily: "System",
  },
  input: {
    fontSize: 16,
  },
  textArea: {
    height: 120,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  imageContainer: {
    position: "relative",
    width: 100,
    height: 100,
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
    padding: 16,
    gap: 8,
  },
  addImageText: {
    fontSize: 16,
    fontWeight: "600",
  },
  switchGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: "row",
  },
  switchButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  statusButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
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
    padding: 16,
    gap: 12,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    height: 48,
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    height: 48,
  },
});

export default EditCarScreen;
