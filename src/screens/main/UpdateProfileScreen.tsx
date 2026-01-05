// screens/profile/EditProfileScreen.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Avatar,
  Chip,
  Divider,
  Portal,
  Snackbar,
  Surface,
  Switch,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { apiClient } from "../../api/apiClient";
import {
  Button,
  IconButton as CustomIconButton,
} from "../../components/common/buttons";
import { useAuthStore } from "../../features/auth/auth.store";
import { useAndroidBackHandler } from "../../hooks/useAndroidBackHandler";
import { ImageType, useImagePicker } from "../../hooks/useImagePicker";
import { isUnder10MB } from "../../utils/imageProcessor";

const { width, height } = Dimensions.get("window");

interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  bio: string;
  city: string;
  region: string;
  is_dealer: boolean;
  dealer_company_name: string | null;
  dealer_address: string | null;
  dealer_city: string | null;
  dealer_region: string | null;
  dealer_license_number: string | null;
  is_verified: boolean;
  profile_picture: string | null;
  member_since: string;
  listing_count: number;
  telegram_username?: string;
  facebook_profile?: string;
  instagram_handle?: string;
  phone_verified?: boolean;
}

interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  city?: string;
  region?: string;
  is_dealer?: boolean;
  dealer_company_name?: string;
  dealer_address?: string;
  dealer_city?: string;
  dealer_region?: string;
  dealer_license_number?: string;
  telegram_username?: string;
  facebook_profile?: string;
  instagram_handle?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

const EditProfileScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    first_name: "",
    last_name: "",
    phone: "",
    bio: "",
    city: "",
    region: "",
    is_dealer: false,
    dealer_company_name: "",
    dealer_address: "",
    dealer_city: "",
    dealer_region: "",
    dealer_license_number: "",
    telegram_username: "",
    facebook_profile: "",
    instagram_handle: "",
    phone_verified: false,
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showImagePickerSheet, setShowImagePickerSheet] = useState(false);
  const sheetAnimation = useRef(new Animated.Value(height)).current;

  // Use your image picker hook
  const {
    pickFromLibrary,
    takePhoto,
    reset: resetImagePicker,
    pickedImage,
    isPicking,
    error: imageError,
  } = useImagePicker();

  const [initialProfile, setInitialProfile] = useState<Partial<UserProfile>>(
    {}
  );
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  // Process picked image and upload it
  useEffect(() => {
    if (pickedImage?.payload) {
      handleUploadProfilePhoto(pickedImage.payload);
    }
  }, [pickedImage]);

  useEffect(() => {
    if (imageError) {
      showSnackbar(imageError, "error");
    }
  }, [imageError]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response =
        await apiClient.get<ApiResponse<UserProfile>>("/user/profile");

      if (response.data.success && response.data.data) {
        const profileData = response.data.data;
        setProfile(profileData);
        setInitialProfile(profileData);
        setProfileImage(profileData.profile_picture || null);

        // Update auth store with full profile data
        updateUser({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone,
          is_dealer: profileData.is_dealer,
          profile_picture: profileData.profile_picture,
          is_verified: profileData.is_verified,
          username: profileData.username,
          email: profileData.email,
        });
      } else {
        showSnackbar(
          response.data.message || "Failed to load profile",
          "error"
        );
      }
    } catch (error: any) {
      console.error("Fetch profile error:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to load profile",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, type: "success" | "error") => {
    setSnackbar({ visible: true, message, type });
  };

  // Upload profile photo to server
  const handleUploadProfilePhoto = async (imagePayload: {
    data: string;
    type: ImageType;
  }) => {
    // Check if image is under 10MB
    if (!isUnder10MB(imagePayload.data)) {
      showSnackbar("Image is too large (max 10MB)", "error");
      resetImagePicker();
      return;
    }

    setUploadingPhoto(true);
    try {
      // Your backend expects the image in { image: { data: "...", type: "..." } } format
      const response = await apiClient.put<
        ApiResponse<{ profile_picture: string }>
      >("/user/profile/photo", {
        image: {
          data: imagePayload.data,
          type: "profile", // Use "profile" type for profile photos
        },
      });

      if (response.data.success && response.data.data) {
        const newProfilePicture = response.data.data.profile_picture;
        setProfileImage(newProfilePicture);

        // Update auth store
        updateUser({
          profile_picture: newProfilePicture,
        });

        showSnackbar("Profile photo updated successfully!", "success");
        resetImagePicker();
      } else {
        showSnackbar(
          response.data.message || "Failed to upload photo",
          "error"
        );
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      showSnackbar(
        error.response?.data?.error || "Failed to upload profile photo",
        "error"
      );
    } finally {
      setUploadingPhoto(false);
      hideBottomSheet();
    }
  };

  // Remove profile photo
  const handleRemoveProfilePhoto = async () => {
    setUploadingPhoto(true);
    try {
      const response = await apiClient.delete<ApiResponse>(
        "/user/profile/photo"
      );

      if (response.data.success) {
        setProfileImage(null);

        // Update auth store
        updateUser({
          profile_picture: null,
        });

        showSnackbar("Profile photo removed successfully!", "success");
      } else {
        showSnackbar(
          response.data.message || "Failed to remove photo",
          "error"
        );
      }
    } catch (error: any) {
      console.error("Remove error:", error);
      showSnackbar(
        error.response?.data?.error || "Failed to remove profile photo",
        "error"
      );
    } finally {
      setUploadingPhoto(false);
      hideBottomSheet();
    }
  };

  // Bottom sheet animations
  const showBottomSheet = () => {
    setShowImagePickerSheet(true);
    Animated.timing(sheetAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideBottomSheet = () => {
    Animated.timing(sheetAnimation, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowImagePickerSheet(false);
    });
  };

  // Take photo with camera using your hook
  const handleTakePhoto = () => {
    hideBottomSheet();
    setTimeout(() => {
      takePhoto("other"); // Use 'other' type for profile photos
    }, 300);
  };

  // Choose from gallery using your hook
  const handleChooseFromGallery = () => {
    hideBottomSheet();
    setTimeout(() => {
      pickFromLibrary("other"); // Use 'other' type for profile photos
    }, 300);
  };

  // View current photo
  const handleViewPhoto = () => {
    if (profileImage) {
      // You can implement a full-screen image viewer here
      Alert.alert(
        "View Photo",
        "Profile photo preview.\n\nTo implement full-screen viewer, add react-native-image-viewing library.",
        [{ text: "OK" }]
      );
    }
    hideBottomSheet();
  };

  // Remove current photo with confirmation
  const handleRemovePhoto = () => {
    Alert.alert(
      "Remove Profile Photo",
      "Are you sure you want to remove your profile photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: handleRemoveProfilePhoto,
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!profile.first_name?.trim() || !profile.last_name?.trim()) {
      showSnackbar("First name and last name are required", "error");
      return;
    }

    setSaving(true);
    try {
      const updateData: UpdateProfileRequest = {
        first_name: profile.first_name?.trim(),
        last_name: profile.last_name?.trim(),
        phone: profile.phone?.trim(),
        bio: profile.bio?.trim(),
        city: profile.city?.trim(),
        region: profile.region?.trim(),
        is_dealer: profile.is_dealer,
        telegram_username: profile.telegram_username?.trim(),
        facebook_profile: profile.facebook_profile?.trim(),
        instagram_handle: profile.instagram_handle?.trim(),
      };

      if (profile.is_dealer) {
        updateData.dealer_company_name = profile.dealer_company_name?.trim();
        updateData.dealer_address = profile.dealer_address?.trim();
        updateData.dealer_city = profile.dealer_city?.trim();
        updateData.dealer_region = profile.dealer_region?.trim();
        updateData.dealer_license_number =
          profile.dealer_license_number?.trim();
      }

      const response = await apiClient.put<ApiResponse>(
        "/user/profile",
        updateData
      );

      if (response.data.success) {
        showSnackbar("Profile updated successfully", "success");
        setInitialProfile(profile);

        // Update auth store with new values
        updateUser({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          is_dealer: profile.is_dealer,
          ...(profile.is_dealer && {
            dealer_company_name: profile.dealer_company_name || undefined,
            dealer_address: profile.dealer_address || undefined,
            dealer_city: profile.dealer_city || undefined,
            dealer_region: profile.dealer_region || undefined,
            dealer_license_number: profile.dealer_license_number || undefined,
          }),
        });

        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        showSnackbar(
          response.data.message || "Failed to update profile",
          "error"
        );
      }
    } catch (error: any) {
      console.error("Save error:", error);
      showSnackbar(
        error.response?.data?.error || "Failed to update profile",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyPhone = () => {
    Alert.alert(
      "Verify Phone Number",
      "We'll send a verification code to your phone number.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Code",
          onPress: () => {
            showSnackbar("Verification code sent", "success");
          },
        },
      ]
    );
  };

  const handleBecomeVerified = () => {
    Alert.alert(
      "Become Trusted Seller",
      "To become a verified trusted seller, please:\n\n1. Complete your profile\n2. Verify your phone number\n3. Provide valid ID\n4. Have at least 5 successful sales\n\nApply now?",
      [
        { text: "Not Now", style: "cancel" },
        {
          text: "Apply Now",
          onPress: () => {
            router.push("/verification/trusted-seller");
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            showSnackbar("Account deletion request sent", "success");
          },
        },
      ]
    );
  };

  const handleChangeProfilePhoto = () => {
    showBottomSheet();
  };

  const handlePickBusinessLicense = async () => {
    // You can use the same image picker hook for business license
    Alert.alert("Business License", "Upload your business license document", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Take Photo",
        onPress: () => {
          takePhoto("document");
          showSnackbar("Processing business license...", "success");
        },
      },
      {
        text: "Choose from Gallery",
        onPress: () => {
          pickFromLibrary("document");
          showSnackbar("Processing business license...", "success");
        },
      },
    ]);
  };

  // check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    const compare = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);
    return !compare(initialProfile, profile) || !!pickedImage;
  }, [initialProfile, profile, pickedImage]);

  // Android back handler: confirm leaving if unsaved changes
  useAndroidBackHandler(() => {
    if (!hasUnsavedChanges) return false;

    Alert.alert(
      "Discard changes?",
      "You have unsaved changes. Are you sure you want to go back?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]
    );
    return true;
  });

  // Image Picker Bottom Sheet Component
  const ImagePickerBottomSheet = () => (
    <Portal>
      <Modal
        visible={showImagePickerSheet}
        transparent
        animationType="none"
        onRequestClose={hideBottomSheet}
      >
        <TouchableOpacity
          style={styles.bottomSheetOverlay}
          activeOpacity={1}
          onPress={hideBottomSheet}
        >
          <Animated.View
            style={[
              styles.bottomSheetContainer,
              {
                backgroundColor: theme.colors.surface,
                transform: [{ translateY: sheetAnimation }],
              },
            ]}
          >
            {/* Handle */}
            <View style={styles.bottomSheetHandle}>
              <View
                style={[
                  styles.bottomSheetHandleBar,
                  {
                    backgroundColor: theme.colors.onSurfaceVariant,
                  },
                ]}
              />
            </View>

            {/* Header */}
            <View style={styles.bottomSheetHeader}>
              <Text
                style={[
                  styles.bottomSheetTitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                Profile Photo
              </Text>
              <Text
                style={[
                  styles.bottomSheetSubtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Choose how to update your profile picture
              </Text>
            </View>

            {/* Loading indicator for photo upload */}
            {(isPicking || uploadingPhoto) && (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text
                  style={[
                    styles.uploadingText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {uploadingPhoto
                    ? "Uploading photo..."
                    : "Processing image..."}
                </Text>
              </View>
            )}

            {/* Current Photo Preview */}
            {!isPicking && !uploadingPhoto && (
              <View style={styles.currentPhotoSection}>
                <Avatar.Image
                  size={80}
                  source={
                    pickedImage?.uri
                      ? { uri: pickedImage.uri }
                      : profileImage
                        ? { uri: profileImage }
                        : profile.profile_picture
                          ? { uri: profile.profile_picture }
                          : require("../../../assets/images/profile.jpg")
                  }
                  style={styles.currentPhotoAvatar}
                />
                <View style={styles.currentPhotoInfo}>
                  <Text
                    style={[
                      styles.currentPhotoLabel,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Current Photo
                  </Text>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={handleViewPhoto}
                  >
                    <MaterialCommunityIcons
                      name="eye-outline"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text
                      style={[
                        styles.viewButtonText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      View
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Options (only show when not uploading) */}
            {!isPicking && !uploadingPhoto && (
              <>
                <View style={styles.optionsContainer}>
                  {/* Take Photo Option */}
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                    onPress={handleTakePhoto}
                    disabled={isPicking}
                  >
                    <View style={styles.optionIconContainer}>
                      <View
                        style={[
                          styles.optionIconBackground,
                          { backgroundColor: theme.colors.surface },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="camera"
                          size={24}
                          color={theme.colors.onSurface}
                        />
                      </View>
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text
                        style={[
                          styles.optionTitle,
                          { color: theme.colors.onSurface },
                        ]}
                      >
                        Take Photo
                      </Text>
                      <Text
                        style={[
                          styles.optionDescription,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                      >
                        Use your camera
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={24}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>

                  {/* Choose from Gallery Option */}
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                    onPress={handleChooseFromGallery}
                    disabled={isPicking}
                  >
                    <View style={styles.optionIconContainer}>
                      <View
                        style={[
                          styles.optionIconBackground,
                          { backgroundColor: theme.colors.surface },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="image-multiple"
                          size={24}
                          color={theme.colors.onSurface}
                        />
                      </View>
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text
                        style={[
                          styles.optionTitle,
                          { color: theme.colors.onSurface },
                        ]}
                      >
                        Choose from Gallery
                      </Text>
                      <Text
                        style={[
                          styles.optionDescription,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                      >
                        Select from your photos
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={24}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>

                  {/* Remove Photo Option (if has photo) */}
                  {(profileImage || profile.profile_picture) && (
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        { backgroundColor: theme.colors.surfaceVariant },
                      ]}
                      onPress={handleRemovePhoto}
                      disabled={uploadingPhoto}
                    >
                      <View style={styles.optionIconContainer}>
                        <View
                          style={[
                            styles.optionIconBackground,
                            { backgroundColor: theme.colors.surface },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="trash-can-outline"
                            size={24}
                            color={theme.colors.onSurface}
                          />
                        </View>
                      </View>
                      <View style={styles.optionTextContainer}>
                        <Text
                          style={[
                            styles.optionTitle,
                            { color: theme.colors.onSurface },
                          ]}
                        >
                          Remove Photo
                        </Text>
                        <Text
                          style={[
                            styles.optionDescription,
                            { color: theme.colors.onSurfaceVariant },
                          ]}
                        >
                          Delete current photo
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={24}
                        color={theme.colors.onSurfaceVariant}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Cancel Button */}
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                  onPress={hideBottomSheet}
                >
                  <Text
                    style={[
                      styles.cancelButtonText,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                {/* Tips */}
                <View style={styles.tipsContainer}>
                  <MaterialCommunityIcons
                    name="lightbulb-outline"
                    size={16}
                    color={theme.colors.onSurface}
                  />
                  <Text
                    style={[
                      styles.tipsText,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Recommended: Square photo, at least 400×400 pixels
                  </Text>
                </View>
              </>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </Portal>
  );

  if (loading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
            Loading profile...
          </Text>
        </View>
      </View>
    );
  }

  const avatarSource = profileImage
    ? { uri: profileImage }
    : profile.profile_picture
      ? { uri: profile.profile_picture }
      : require("../../../assets/images/profile.jpg");

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Image Picker Bottom Sheet */}
      <ImagePickerBottomSheet />

      {/* Header */}
      <Surface
        style={[styles.header, { backgroundColor: theme.colors.background }]}
        elevation={0}
      >
        <View style={styles.headerContent}>
          <CustomIconButton
            icon="chevron-left"
            variant="ghost"
            size="md"
            onPress={() => {
              if (hasUnsavedChanges) {
                Alert.alert(
                  "Discard changes?",
                  "You have unsaved changes. Are you sure you want to go back?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Discard",
                      style: "destructive",
                      onPress: () => router.back(),
                    },
                  ]
                );
              } else {
                router.back();
              }
            }}
            iconStyle={{
              color: theme.colors.onBackground,
            }}
          />
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Edit Profile
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          Update your personal information
        </Text>
      </Surface>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Picture Section */}
        <Surface
          style={[
            styles.profileSection,
            { backgroundColor: theme.colors.surface },
          ]}
          elevation={theme.dark ? 0 : 1}
        >
          <View style={styles.profileHeader}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleChangeProfilePhoto}
              disabled={isPicking || uploadingPhoto}
            >
              <Avatar.Image
                size={96}
                source={avatarSource}
                style={[styles.avatar, { borderColor: theme.colors.surface }]}
              />
              <View
                style={[
                  styles.avatarOverlay,
                  {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.surface,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="camera"
                  size={18}
                  color={theme.colors.onPrimary}
                />
              </View>
              {(isPicking || uploadingPhoto) && (
                <View style={styles.avatarLoadingOverlay}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text
                style={[styles.profileName, { color: theme.colors.onSurface }]}
              >
                {profile.first_name} {profile.last_name}
              </Text>
              <Text
                style={[
                  styles.profileEmail,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {user?.email}
              </Text>
              {profile.is_verified && (
                <View
                  style={[
                    styles.verifiedBadge,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={14}
                    color={theme.colors.onSurface}
                  />
                  <Text
                    style={[
                      styles.verifiedText,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    Verified Seller
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Button
            label={
              uploadingPhoto
                ? "Uploading..."
                : isPicking
                  ? "Processing..."
                  : "Change Profile Photo"
            }
            variant="outline"
            icon={uploadingPhoto ? "loading" : "camera"}
            size="sm"
            onPress={handleChangeProfilePhoto}
            style={[
              styles.changePhotoButton,
              { borderColor: theme.colors.primary },
            ]}
            labelStyle={{ color: theme.colors.primary }}
            disabled={isPicking || uploadingPhoto}
            loading={uploadingPhoto}
          />
        </Surface>

        {/* Personal Details */}
        <Surface
          style={[
            styles.sectionCard,
            { backgroundColor: theme.colors.surface },
          ]}
          elevation={theme.dark ? 0 : 1}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="account"
              size={18}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Personal Details
            </Text>
          </View>

          {/* First Name */}
          <View style={styles.labeledField}>
            <Text
              style={[
                styles.fieldLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              First Name
            </Text>
            <TextInput
              value={profile.first_name || ""}
              onChangeText={(text) =>
                setProfile({ ...profile, first_name: text })
              }
              mode="outlined"
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              style={styles.textInput}
              theme={{ roundness: 12 }}
              textColor={theme.colors.onSurface}
            />
          </View>

          {/* Last Name */}
          <View style={styles.labeledField}>
            <Text
              style={[
                styles.fieldLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Last Name
            </Text>
            <TextInput
              value={profile.last_name || ""}
              onChangeText={(text) =>
                setProfile({ ...profile, last_name: text })
              }
              mode="outlined"
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              style={styles.textInput}
              theme={{ roundness: 12 }}
              textColor={theme.colors.onSurface}
            />
          </View>

          {/* Email (read-only) */}
          <View style={styles.labeledField}>
            <Text
              style={[
                styles.fieldLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Email
            </Text>
            <TextInput
              value={user?.email || ""}
              editable={false}
              mode="outlined"
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              style={styles.textInput}
              theme={{ roundness: 12 }}
              textColor={theme.colors.onSurfaceVariant}
              left={
                <TextInput.Icon
                  icon="email-outline"
                  color={theme.colors.onSurfaceVariant}
                />
              }
            />
          </View>

          {/* Username */}
          <View style={styles.labeledField}>
            <Text
              style={[
                styles.fieldLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Username
            </Text>
            <TextInput
              value={profile.username || ""}
              onChangeText={(text) =>
                setProfile({ ...profile, username: text })
              }
              mode="outlined"
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              style={styles.textInput}
              theme={{ roundness: 12 }}
              textColor={theme.colors.onSurface}
              left={
                <TextInput.Icon
                  icon="at"
                  color={theme.colors.onSurfaceVariant}
                />
              }
            />
          </View>

          {/* Bio */}
          <View style={styles.labeledField}>
            <Text
              style={[
                styles.fieldLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Bio
            </Text>
            <TextInput
              value={profile.bio || ""}
              onChangeText={(text) => setProfile({ ...profile, bio: text })}
              mode="outlined"
              multiline
              numberOfLines={3}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              style={[styles.textInput, { height: 100 }]}
              theme={{ roundness: 12 }}
              placeholder="Tell us about yourself..."
              textColor={theme.colors.onSurface}
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
          </View>
        </Surface>

        {/* Phone Number */}
        <Surface
          style={[
            styles.sectionCard,
            { backgroundColor: theme.colors.surface },
          ]}
          elevation={theme.dark ? 0 : 1}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="phone"
              size={18}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Phone Number
            </Text>
          </View>

          <View style={styles.labeledField}>
            <Text
              style={[
                styles.fieldLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Phone Number
            </Text>
            <View style={styles.phoneRow}>
              <TextInput
                value={profile.phone || ""}
                onChangeText={(text) => setProfile({ ...profile, phone: text })}
                mode="outlined"
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
                style={[styles.textInput, styles.phoneInput]}
                keyboardType="phone-pad"
                theme={{ roundness: 12 }}
                textColor={theme.colors.onSurface}
                left={
                  <TextInput.Icon
                    icon="phone"
                    color={theme.colors.onSurfaceVariant}
                  />
                }
              />
              {profile.phone_verified ? (
                <Chip
                  icon="check"
                  style={[
                    styles.verifiedChip,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                    },
                  ]}
                  textStyle={[
                    styles.verifiedChipText,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Verified
                </Chip>
              ) : (
                <Button
                  label="Verify"
                  variant="outline"
                  size="sm"
                  onPress={handleVerifyPhone}
                  style={[
                    styles.verifyButton,
                    { borderColor: theme.colors.primary },
                  ]}
                  labelStyle={{ color: theme.colors.primary }}
                />
              )}
            </View>
          </View>
        </Surface>

        {/* Location */}
        <Surface
          style={[
            styles.sectionCard,
            { backgroundColor: theme.colors.surface },
          ]}
          elevation={theme.dark ? 0 : 1}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="map-marker"
              size={18}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Location
            </Text>
          </View>

          <View style={styles.labeledField}>
            <Text
              style={[
                styles.fieldLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              City, Region
            </Text>
            <TextInput
              value={`${profile.city || ""}${
                profile.region ? `, ${profile.region}` : ""
              }`}
              onChangeText={(text) => setProfile({ ...profile, city: text })}
              mode="outlined"
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              style={styles.textInput}
              theme={{ roundness: 12 }}
              textColor={theme.colors.onSurface}
              left={
                <TextInput.Icon
                  icon="map-marker"
                  color={theme.colors.onSurfaceVariant}
                />
              }
              right={
                <TextInput.Icon
                  icon="chevron-down"
                  color={theme.colors.onSurfaceVariant}
                  onPress={() => router.push("/location-selector")}
                />
              }
            />
          </View>
        </Surface>

        {/* Dealer Account */}
        <Surface
          style={[
            styles.sectionCard,
            { backgroundColor: theme.colors.surface },
          ]}
          elevation={theme.dark ? 0 : 1}
        >
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <MaterialCommunityIcons
                name="store"
                size={18}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.switchLabel, { color: theme.colors.onSurface }]}
              >
                Dealer Account
              </Text>
            </View>
            <Switch
              value={profile.is_dealer || false}
              onValueChange={(value) =>
                setProfile({ ...profile, is_dealer: value })
              }
              color={theme.colors.primary}
            />
          </View>

          {profile.is_dealer && (
            <>
              <Divider style={styles.divider} />
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                Register as Dealer
              </Text>
              <Text
                style={[
                  styles.sectionHelper,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Unlock verified badges and analytics.
              </Text>

              {/* Company Name */}
              <View style={styles.labeledField}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Company Name
                </Text>
                <TextInput
                  value={profile.dealer_company_name || ""}
                  onChangeText={(text) =>
                    setProfile({ ...profile, dealer_company_name: text })
                  }
                  mode="outlined"
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                  style={styles.textInput}
                  theme={{ roundness: 12 }}
                  textColor={theme.colors.onSurface}
                />
              </View>

              {/* Business License */}
              <View style={styles.labeledField}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Business License
                </Text>
                <TouchableOpacity
                  style={[
                    styles.licenseCard,
                    {
                      borderColor: theme.colors.outline,
                      backgroundColor: theme.colors.surface,
                    },
                  ]}
                  onPress={handlePickBusinessLicense}
                >
                  <MaterialCommunityIcons
                    name="cloud-upload-outline"
                    size={28}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text
                    style={[
                      styles.licenseTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    Upload License (PDF/JPG)
                  </Text>
                  <Text
                    style={[
                      styles.licenseHint,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Tap to upload your business license document.
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Surface>

        {/* Social Profiles */}
        <Surface
          style={[
            styles.sectionCard,
            { backgroundColor: theme.colors.surface },
          ]}
          elevation={theme.dark ? 0 : 1}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="share-variant"
              size={18}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Social Profiles
            </Text>
          </View>

          <View style={styles.labeledField}>
            <Text
              style={[
                styles.fieldLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Telegram Username
            </Text>
            <TextInput
              value={profile.telegram_username || ""}
              onChangeText={(text) =>
                setProfile({ ...profile, telegram_username: text })
              }
              mode="outlined"
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              style={styles.textInput}
              theme={{ roundness: 12 }}
              textColor={theme.colors.onSurface}
              left={
                <TextInput.Icon
                  icon="telegram"
                  color={theme.colors.onSurfaceVariant}
                />
              }
            />
          </View>

          <View style={styles.labeledField}>
            <Text
              style={[
                styles.fieldLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Facebook Profile Link
            </Text>
            <TextInput
              value={profile.facebook_profile || ""}
              onChangeText={(text) =>
                setProfile({ ...profile, facebook_profile: text })
              }
              mode="outlined"
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              style={styles.textInput}
              theme={{ roundness: 12 }}
              textColor={theme.colors.onSurface}
              left={
                <TextInput.Icon
                  icon="facebook"
                  color={theme.colors.onSurfaceVariant}
                />
              }
            />
          </View>

          <View style={styles.labeledField}>
            <Text
              style={[
                styles.fieldLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Instagram Handle
            </Text>
            <TextInput
              value={profile.instagram_handle || ""}
              onChangeText={(text) =>
                setProfile({ ...profile, instagram_handle: text })
              }
              mode="outlined"
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              style={styles.textInput}
              theme={{ roundness: 12 }}
              textColor={theme.colors.onSurface}
              left={
                <TextInput.Icon
                  icon="instagram"
                  color={theme.colors.onSurfaceVariant}
                />
              }
            />
          </View>
        </Surface>

        {/* Get Verified */}
        <Surface
          style={[
            styles.verifiedSection,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.outline,
            },
          ]}
          elevation={theme.dark ? 0 : 1}
        >
          <Text
            style={[
              styles.verifiedSectionTitle,
              { color: theme.colors.onSurface },
            ]}
          >
            Get Verified
          </Text>
          <Text
            style={[
              styles.verifiedSectionSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Become a Trusted Seller
          </Text>
          <View style={styles.verifiedBulletContainer}>
            <Text
              style={[
                styles.verifiedBullet,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              • Verified phone number
            </Text>
            <Text
              style={[
                styles.verifiedBullet,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              • Profile photo
            </Text>
            <Text
              style={[
                styles.verifiedBullet,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              • Government issued ID
            </Text>
          </View>
          <Button
            label="Apply for Verification"
            variant="primary"
            size="md"
            onPress={handleBecomeVerified}
            style={[
              styles.applyButton,
              { backgroundColor: theme.colors.primary },
            ]}
            labelStyle={{ color: theme.colors.onPrimary }}
          />
        </Surface>

        {/* Danger Zone */}
        <Surface
          style={[
            styles.dangerSection,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.outline,
            },
          ]}
          elevation={theme.dark ? 0 : 1}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={18}
              color={theme.colors.onSurface}
            />
            <Text
              style={[styles.dangerTitle, { color: theme.colors.onSurface }]}
            >
              Danger Zone
            </Text>
          </View>

          <Text
            style={[
              styles.dangerDescription,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Once you delete your account, there is no going back. Please be
            certain.
          </Text>

          <Button
            label="I want to delete my account"
            variant="danger"
            icon="trash-can"
            onPress={handleDeleteAccount}
            style={[styles.deleteButton, { borderColor: theme.colors.primary }]}
            labelStyle={{ color: theme.colors.primary }}
          />
        </Surface>

        {/* Bottom Save Button */}
        <View style={styles.saveButtonContainer}>
          <Button
            label="Save Changes"
            variant="primary"
            loading={saving}
            disabled={saving || !hasUnsavedChanges}
            onPress={handleSave}
            size="lg"
            fullWidth
            style={[
              styles.saveButton,
              { backgroundColor: theme.colors.primary },
            ]}
            labelStyle={{ color: theme.colors.onPrimary }}
          />
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        style={[
          styles.snackbar,
          snackbar.type === "success"
            ? { backgroundColor: theme.dark ? "#FFFFFF" : "#000000" }
            : { backgroundColor: theme.dark ? "#FFFFFF" : "#000000" },
        ]}
        theme={{ colors: { onSurface: theme.dark ? "#000000" : "#FFFFFF" } }}
      >
        {snackbar.message}
      </Snackbar>
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
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 40 : 24,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    opacity: 0.8,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  profileSection: {
    paddingTop: 24,
    paddingBottom: 12,
    alignItems: "center",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 8,
  },
  avatar: {
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
  },
  avatarLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    alignItems: "center",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    marginBottom: 6,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    columnGap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: "500",
  },
  changePhotoButton: {
    minWidth: 200,
    borderWidth: 1,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    columnGap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  sectionHelper: {
    fontSize: 12,
    marginBottom: 12,
  },
  labeledField: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: "transparent",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
  },
  phoneInput: {
    flex: 1,
  },
  verifyButton: {
    minWidth: 80,
    borderWidth: 1,
  },
  verifiedChip: {
    height: 32,
    justifyContent: "center",
  },
  verifiedChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  divider: {
    marginVertical: 14,
  },
  licenseCard: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    rowGap: 4,
  },
  licenseTitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  licenseHint: {
    fontSize: 12,
    textAlign: "center",
  },
  verifiedSection: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  verifiedSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  verifiedSectionSubtitle: {
    fontSize: 13,
    marginBottom: 8,
  },
  verifiedBulletContainer: {
    marginBottom: 12,
  },
  verifiedBullet: {
    fontSize: 13,
    marginBottom: 2,
  },
  applyButton: {
    borderRadius: 999,
    height: 44,
  },
  dangerSection: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  dangerDescription: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 18,
  },
  deleteButton: {
    borderWidth: 1,
  },
  saveButtonContainer: {
    marginTop: 4,
  },
  saveButton: {
    borderRadius: 12,
    height: 52,
  },
  snackbar: {
    borderRadius: 8,
  },
  // Bottom Sheet Styles
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bottomSheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    maxHeight: height * 0.8,
  },
  bottomSheetHandle: {
    alignItems: "center",
    paddingVertical: 12,
  },
  bottomSheetHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  bottomSheetHeader: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: "center",
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bottomSheetSubtitle: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
  },
  uploadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  uploadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  currentPhotoSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  currentPhotoAvatar: {
    marginRight: 16,
  },
  currentPhotoInfo: {
    flex: 1,
  },
  currentPhotoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
  },
  optionIconContainer: {
    marginRight: 16,
  },
  optionIconBackground: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    opacity: 0.7,
  },
  cancelButton: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  tipsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 20,
    gap: 8,
  },
  tipsText: {
    fontSize: 12,
    flex: 1,
    fontStyle: "italic",
  },
});

export default EditProfileScreen;
