import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Avatar,
  Button as PaperButton,
  Snackbar,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { apiClient } from "../../api/apiClient";
import { Button } from "../../components/common/buttons";
import { useAuthStore } from "../../features/auth/auth.store";
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

const UpdateProfileScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, updateUser, isAuthenticated } = useAuthStore();

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
    {},
  );
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error",
  });

  useEffect(() => {
    console.log("🚀 UpdateProfileScreen mounted");
    console.log("🔑 isAuthenticated:", isAuthenticated);

    // Only fetch profile if user is authenticated
    if (isAuthenticated) {
      console.log("✅ User is authenticated, fetching profile...");
      fetchProfile();
    } else {
      console.log("❌ User not authenticated, setting loading to false");
      setLoading(false);
    }
  }, [isAuthenticated]);

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
      console.log("🔄 Starting to fetch profile...");
      setLoading(true);
      const response =
        await apiClient.get<ApiResponse<UserProfile>>("/user/profile");

      console.log("📊 Profile response:", response.data);

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
        console.log("✅ Profile data loaded and updated in auth store");
      } else {
        showSnackbar(
          response.data.message || "Failed to load profile",
          "error",
        );
      }
    } catch (error: any) {
      console.error("❌ Fetch profile error:", error);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error data:", error.response?.data);

      // Handle authentication errors
      if (error.response?.status === 401) {
        console.log("🔐 401 error - redirecting to login");
        showSnackbar("Session expired. Please login again.", "error");
        // Store the intended redirect path
        SecureStore.setItemAsync("redirect_after_login", "/profile");
        setTimeout(() => {
          router.replace("/(auth)/login");
        }, 1500);
        return;
      }

      showSnackbar(
        error.response?.data?.message || "Failed to load profile",
        "error",
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
          "error",
        );
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      showSnackbar(
        error.response?.data?.error || "Failed to upload profile photo",
        "error",
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
        "/user/profile/photo",
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
          "error",
        );
      }
    } catch (error: any) {
      console.error("Remove error:", error);
      showSnackbar(
        error.response?.data?.error || "Failed to remove profile photo",
        "error",
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
        [{ text: "OK" }],
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
      ],
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
        updateData,
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
          router.replace("/(tabs)");
        }, 1500);
      } else {
        showSnackbar(
          response.data.message || "Failed to update profile",
          "error",
        );
      }
    } catch (error: any) {
      console.error("Save error:", error);
      showSnackbar(
        error.response?.data?.error || "Failed to update profile",
        "error",
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
      ],
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
      ],
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
      ],
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

  // Help & Support handlers
  const handleHelpCenter = () => {
    Alert.alert("Not supported", "This feature is currently not supported.", [
      { text: "OK" },
    ]);
  };

  const handleContactSupport = () => {
    Alert.alert("Not supported", "This feature is currently not supported.", [
      { text: "OK" },
    ]);
  };

  const handleAboutApp = () => {
    Alert.alert("Not supported", "This feature is currently not supported.", [
      { text: "OK" },
    ]);
  };

  // check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    const compare = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);
    return !compare(initialProfile, profile) || !!pickedImage;
  }, [initialProfile, profile, pickedImage]);

  // Unauthenticated UI
  if (!isAuthenticated) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.signInPrompt}>
          <MaterialCommunityIcons
            name="account-circle-outline"
            size={80}
            color={theme.colors.onBackground}
          />
          <Text
            style={[styles.signInTitle, { color: theme.colors.onBackground }]}
          >
            Please signup or login first
          </Text>
          <Text
            style={[
              styles.signInSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Sign in to manage your account and access all features
          </Text>
          <PaperButton
            mode="contained"
            style={[
              styles.signInButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => router.push("/(auth)/login")}
            textColor={theme.colors.onPrimary}
          >
            Sign In
          </PaperButton>
        </View>
      </View>
    );
  }

  if (loading) {
    console.log("📱 Showing loading state...");
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

  console.log("🎨 Rendering main UpdateProfileScreen UI...");
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <Surface
        style={[styles.header, { backgroundColor: theme.colors.background }]}
        elevation={0}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerSpacer} />
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Profile Settings
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
  signInPrompt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  signInTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  signInSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  signInButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
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
});

export default UpdateProfileScreen;
