// screens/profile/ProfileScreen.tsx
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
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
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  Portal,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useLogout } from "../../features/auth/auth.hooks";
import { useAuthStore } from "../../features/auth/auth.store";
import { useCarListings } from "../../features/cars/car.hooks";
import { useThemeStore } from "../../features/theme/theme.store";

const { width, height } = Dimensions.get("window");

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore() as any;
  const { toggleTheme } = useThemeStore();
  const logoutMutation = useLogout();

  const { data: listingsData } = useCarListings(1, 20);
  const userListings = listingsData?.data?.listings || [];

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showImagePickerSheet, setShowImagePickerSheet] = useState(false);
  const sheetAnimation = useRef(new Animated.Value(height)).current;

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logoutMutation.mutate();
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    router.push("/update-profile");
  };

  // Show image picker bottom sheet
  const handleChangeProfilePhoto = () => {
    showBottomSheet();
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

  // Request permissions
  const requestPermissions = async (type: "camera" | "library") => {
    let permission;
    if (type === "camera") {
      permission = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        `Please grant permission to access ${type === "camera" ? "camera" : "photo library"}.`,
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  // Take photo with camera
  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions("camera");
    if (!hasPermission) return;

    hideBottomSheet();

    setTimeout(async () => {
      try {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          setProfileImage(result.assets[0].uri);
          // Here you would upload to your server
          console.log("New profile photo:", result.assets[0].uri);
          Alert.alert("Success", "Profile photo updated!");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to take photo");
      }
    }, 300);
  };

  // Choose from gallery
  const handleChooseFromGallery = async () => {
    const hasPermission = await requestPermissions("library");
    if (!hasPermission) return;

    hideBottomSheet();

    setTimeout(async () => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          setProfileImage(result.assets[0].uri);
          // Here you would upload to your server
          console.log("Selected profile photo:", result.assets[0].uri);
          Alert.alert("Success", "Profile photo updated!");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to pick image");
      }
    }, 300);
  };

  // Remove current photo
  const handleRemovePhoto = () => {
    Alert.alert(
      "Remove Photo",
      "Are you sure you want to remove your profile photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setProfileImage(null);
            // Here you would update on server
            hideBottomSheet();
            Alert.alert("Success", "Profile photo removed!");
          },
        },
      ]
    );
  };

  // Decide which avatar image to show
  const avatarSource = profileImage
    ? { uri: profileImage }
    : user?.profile_picture
      ? { uri: user.profile_picture }
      : require("../../../assets/images/profile.jpg");

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

            {/* Options */}
            <View style={styles.optionsContainer}>
              {/* Take Photo Option */}
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
                onPress={handleTakePhoto}
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
              {(profileImage || user?.profile_picture) && (
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                  onPress={handleRemovePhoto}
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
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </Portal>
  );

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
            Please Sign In
          </Text>
          <Text
            style={[
              styles.signInSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Sign in to manage your account and access all features
          </Text>
          <Button
            mode="contained"
            style={[
              styles.signInButton,
              { backgroundColor: theme.colors.primary },
            ]}
            labelStyle={{ color: theme.colors.onPrimary }}
            onPress={() => router.push("/(auth)/login")}
          >
            Sign In
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Image Picker Bottom Sheet */}
      <ImagePickerBottomSheet />

      {/* Header bar */}
      <View style={styles.topBar}>
        <IconButton
          icon="chevron-left"
          size={24}
          iconColor={theme.colors.onBackground}
          onPress={() => router.back()}
        />
        <Text
          style={[styles.topBarTitle, { color: theme.colors.onBackground }]}
        >
          Profile
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Profile card */}
      <Surface
        style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}
        elevation={theme.dark ? 0 : 2}
      >
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleChangeProfilePhoto}
          >
            <Avatar.Image size={72} source={avatarSource} />
            {/* Edit overlay */}
            <View
              style={[
                styles.editAvatarOverlay,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <MaterialCommunityIcons
                name="camera"
                size={20}
                color={theme.colors.onPrimary}
              />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text
                style={[styles.profileName, { color: theme.colors.onSurface }]}
              >
                {user?.first_name} {user?.last_name}
              </Text>
              {user?.is_dealer && (
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={18}
                  color={theme.colors.primary}
                />
              )}
            </View>
            <Text
              style={[
                styles.profileUsername,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              @{user?.username}
            </Text>
            <View style={styles.metaRow}>
              <Chip
                mode="flat"
                style={[
                  styles.ratingChip,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                  },
                ]}
                textStyle={[
                  styles.ratingText,
                  {
                    color: theme.colors.onSurfaceVariant,
                  },
                ]}
                icon="star"
              >
                4.8 (24 reviews)
              </Chip>
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.metaText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Addis Ababa, Ethiopia
              </Text>
            </View>
            <Text
              style={[
                styles.memberSince,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Member since {user?.member_since || "2023"}
            </Text>
          </View>
        </View>

        <Button
          mode="contained"
          style={[
            styles.editProfileButton,
            { backgroundColor: theme.colors.primary },
          ]}
          contentStyle={{ height: 40 }}
          labelStyle={{ color: theme.colors.onPrimary }}
          onPress={handleEditProfile}
          icon="account-edit"
        >
          Edit Profile
        </Button>
      </Surface>

      {/* Account Information card */}
      <Surface
        style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}
        elevation={theme.dark ? 0 : 1}
      >
        <Text
          style={[
            styles.sectionHeaderLabel,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Account Information
        </Text>

        <List.Item
          title="Email"
          description={user?.email}
          titleStyle={{ color: theme.colors.onSurface }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <View
              style={[
                styles.itemIconWrap,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="email-outline"
                size={20}
                color={theme.colors.onSurface}
              />
            </View>
          )}
          right={() => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.colors.outline}
            />
          )}
          onPress={handleEditProfile}
        />
        <Divider />

        <List.Item
          title="Phone"
          description={user?.phone || "Add phone number"}
          titleStyle={{ color: theme.colors.onSurface }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <View
              style={[
                styles.itemIconWrap,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="phone-outline"
                size={20}
                color={theme.colors.onSurface}
              />
            </View>
          )}
          right={() => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.colors.outline}
            />
          )}
          onPress={handleEditProfile}
        />
        <Divider />

        <List.Item
          title="Account Type"
          description={user?.is_dealer ? "Dealer" : "Individual"}
          titleStyle={{ color: theme.colors.onSurface }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <View
              style={[
                styles.itemIconWrap,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="id-card"
                size={20}
                color={theme.colors.onSurface}
              />
            </View>
          )}
          right={() => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.colors.outline}
            />
          )}
          onPress={handleEditProfile}
        />
        <Divider />

        <List.Item
          title="Password"
          description="Change your password"
          titleStyle={{ color: theme.colors.onSurface }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <View
              style={[
                styles.itemIconWrap,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="lock-outline"
                size={20}
                color={theme.colors.onSurface}
              />
            </View>
          )}
          right={() => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.colors.outline}
            />
          )}
          onPress={() => router.push("/change-password")}
        />
      </Surface>

      {/* Preferences */}
      <Surface
        style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}
        elevation={theme.dark ? 0 : 1}
      >
        <Text
          style={[
            styles.sectionHeaderLabel,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Preferences
        </Text>

        <List.Item
          title="Push Notifications"
          description="On"
          titleStyle={{ color: theme.colors.onSurface }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <View
              style={[
                styles.itemIconWrap,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="bell-outline"
                size={20}
                color={theme.colors.onSurface}
              />
            </View>
          )}
          right={() => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.colors.outline}
            />
          )}
          onPress={() => router.push("/notifications")}
        />
        <Divider />

        <List.Item
          title="Theme"
          description={theme.dark ? "Dark" : "Light"}
          titleStyle={{ color: theme.colors.onSurface }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <View
              style={[
                styles.itemIconWrap,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="theme-light-dark"
                size={20}
                color={theme.colors.onSurface}
              />
            </View>
          )}
          right={() => (
            <TouchableOpacity onPress={toggleTheme}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={theme.colors.outline}
              />
            </TouchableOpacity>
          )}
        />
        <Divider />

        <List.Item
          title="Language"
          description="English"
          titleStyle={{ color: theme.colors.onSurface }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <View
              style={[
                styles.itemIconWrap,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="translate"
                size={20}
                color={theme.colors.onSurface}
              />
            </View>
          )}
          right={() => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.colors.outline}
            />
          )}
          onPress={() => router.push("/language")}
        />
        <Divider />

        <List.Item
          title="Currency"
          description="ETB (Birr)"
          titleStyle={{ color: theme.colors.onSurface }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <View
              style={[
                styles.itemIconWrap,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="currency-usd"
                size={20}
                color={theme.colors.onSurface}
              />
            </View>
          )}
          right={() => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.colors.outline}
            />
          )}
          onPress={() => router.push("/currency")}
        />
      </Surface>

      {/* Safety & privacy */}
      <Surface
        style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}
        elevation={theme.dark ? 0 : 1}
      >
        <Text
          style={[
            styles.sectionHeaderLabel,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Safety & Privacy
        </Text>

        <List.Item
          title="Show Phone Number"
          description="Control who can see your phone"
          titleStyle={{ color: theme.colors.onSurface }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <View
              style={[
                styles.itemIconWrap,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="eye-outline"
                size={20}
                color={theme.colors.onSurface}
              />
            </View>
          )}
          right={() => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.colors.outline}
            />
          )}
          onPress={() => router.push("/privacy")}
        />
        <Divider />

        <List.Item
          title="Profile Visibility"
          description="Public"
          titleStyle={{ color: theme.colors.onSurface }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <View
              style={[
                styles.itemIconWrap,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="shield-account-outline"
                size={20}
                color={theme.colors.onSurface}
              />
            </View>
          )}
          right={() => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.colors.outline}
            />
          )}
          onPress={() => router.push("/visibility")}
        />
        <Divider />

        <List.Item
          title="Data Usage"
          description="Normal"
          titleStyle={{ color: theme.colors.onSurface }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <View
              style={[
                styles.itemIconWrap,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="chart-bar"
                size={20}
                color={theme.colors.onSurface}
              />
            </View>
          )}
          right={() => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.colors.outline}
            />
          )}
          onPress={() => router.push("/data-usage")}
        />
      </Surface>

      {/* Help & support */}
      <Surface
        style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}
        elevation={theme.dark ? 0 : 1}
      >
        <Text
          style={[
            styles.sectionHeaderLabel,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Help & Support
        </Text>

        <List.Item
          title="Help Center"
          description="FAQs and guides"
          titleStyle={{ color: theme.colors.onSurface }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <View
              style={[
                styles.itemIconWrap,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="lifebuoy"
                size={20}
                color={theme.colors.onSurface}
              />
            </View>
          )}
          right={() => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.colors.outline}
            />
          )}
          onPress={() => router.push("/help")}
        />
        <Divider />

        <List.Item
          title="Contact Support"
          description="Get in touch with us"
          titleStyle={{ color: theme.colors.onSurface }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <View
              style={[
                styles.itemIconWrap,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="headset"
                size={20}
                color={theme.colors.onSurface}
              />
            </View>
          )}
          right={() => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.colors.outline}
            />
          )}
          onPress={() => router.push("/contact-support")}
        />
        <Divider />

        <List.Item
          title="About"
          description="App version and information"
          titleStyle={{ color: theme.colors.onSurface }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <View
              style={[
                styles.itemIconWrap,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={20}
                color={theme.colors.onSurface}
              />
            </View>
          )}
          right={() => (
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.colors.outline}
            />
          )}
          onPress={() => router.push("/about")}
        />
      </Surface>

      {/* Become Verified Seller */}
      <TouchableOpacity
        style={[styles.verifiedCard, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push("/become-verified")}
      >
        <View
          style={[
            styles.verifiedLeft,
            {
              backgroundColor: theme.dark
                ? "rgba(255,255,255,0.2)"
                : "rgba(255,255,255,0.3)",
            },
          ]}
        >
          <MaterialCommunityIcons
            name="shield-check"
            size={26}
            color={theme.colors.onPrimary}
          />
        </View>
        <View style={styles.verifiedInfo}>
          <Text
            style={[styles.verifiedTitle, { color: theme.colors.onPrimary }]}
          >
            Become a Verified Seller
          </Text>
          <Text
            style={[
              styles.verifiedSubtitle,
              { color: theme.colors.onPrimary, opacity: 0.9 },
            ]}
          >
            Get trusted badges & more visibility
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={theme.colors.onPrimary}
        />
      </TouchableOpacity>

      {/* Actions: share, invite, logout, delete */}
      <Surface
        style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}
        elevation={theme.dark ? 0 : 1}
      >
        <List.Item
          title="Share Profile"
          titleStyle={{ color: theme.colors.onSurface }}
          left={() => (
            <View
              style={[
                styles.itemIconWrap,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="share-variant"
                size={20}
                color={theme.colors.onSurface}
              />
            </View>
          )}
          onPress={() => {
            Alert.alert(
              "Share Profile",
              "Profile sharing feature would open here"
            );
          }}
        />
        <Divider />

        <List.Item
          title="Invite Friends"
          titleStyle={{ color: theme.colors.onSurface }}
          left={() => (
            <View
              style={[
                styles.itemIconWrap,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="account-plus-outline"
                size={20}
                color={theme.colors.onSurface}
              />
            </View>
          )}
          onPress={() => {
            Alert.alert("Invite Friends", "Invite feature would open here");
          }}
        />
        <Divider />

        <List.Item
          title="Log Out"
          titleStyle={{ color: theme.colors.onSurface }}
          left={() => (
            <View
              style={[
                styles.itemIconWrap,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="logout"
                size={20}
                color={theme.colors.onSurface}
              />
            </View>
          )}
          onPress={handleLogout}
        />
        <Divider />

        <List.Item
          title="Delete Account"
          titleStyle={{ color: theme.colors.onSurface }}
          left={() => (
            <View
              style={[
                styles.itemIconWrap,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={20}
                color={theme.colors.onSurface}
              />
            </View>
          )}
          onPress={() =>
            Alert.alert(
              "Delete Account",
              "Are you sure you want to delete your account? This action cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => {
                    Alert.alert(
                      "Account Deletion",
                      "Account deletion feature would be implemented here"
                    );
                  },
                },
              ]
            )
          }
        />
      </Surface>

      {/* Spacing at bottom */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  topBarTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
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
    marginTop: 16,
    marginBottom: 8,
  },
  signInSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  signInButton: {
    borderRadius: 10,
  },
  profileCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: "row",
    columnGap: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  editAvatarOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
  },
  profileUsername: {
    fontSize: 13,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
    marginTop: 6,
  },
  ratingChip: {
    height: 26,
  },
  ratingText: {
    fontSize: 11,
  },
  metaText: {
    fontSize: 12,
  },
  memberSince: {
    marginTop: 4,
    fontSize: 11,
  },
  editProfileButton: {
    marginTop: 8,
    borderRadius: 999,
  },
  sectionCard: {
    borderRadius: 18,
    paddingHorizontal: 0,
    paddingVertical: 8,
    marginBottom: 16,
  },
  sectionHeaderLabel: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  itemIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
    marginRight: 8,
  },
  verifiedCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  verifiedLeft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  verifiedInfo: {
    flex: 1,
  },
  verifiedTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  verifiedSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  bottomSpacing: {
    height: 20,
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

export default ProfileScreen;
