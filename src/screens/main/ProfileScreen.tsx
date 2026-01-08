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
  Switch,
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
  RadioButton,
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
  const { themeMode, setThemeMode } = useThemeStore();
  const logoutMutation = useLogout();

  const { data: listingsData } = useCarListings(1, 20);
  const userListings = listingsData?.data?.listings || [];

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showImagePickerSheet, setShowImagePickerSheet] = useState(false);
  const sheetAnimation = useRef(new Animated.Value(height)).current;

  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState({
    notifications: false,
    theme: false,
    language: false,
    currency: false,
    phoneVisibility: false,
    profileVisibility: false,
    dataUsage: false,
    myPosts: false,
  } as {
    notifications: boolean;
    theme: boolean;
    language: boolean;
    currency: boolean;
    phoneVisibility: boolean;
    profileVisibility: boolean;
    dataUsage: boolean;
    myPosts: boolean;
  });

  // Preference values
  const [pushNotifications, setPushNotifications] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [selectedCurrency, setSelectedCurrency] = useState("ETB");

  // Safety & privacy values
  const [showPhoneNumber, setShowPhoneNumber] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [dataUsage, setDataUsage] = useState("normal");

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
    router.push("/edit-profile");
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

  // Enhanced Expandable Section Component
  const ExpandableSection = ({
    title,
    description,
    icon,
    expanded,
    onToggle,
    children,
  }: {
    title: string;
    description: string;
    icon: string;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <>
      <TouchableOpacity
        style={[
          styles.expandableHeader,
          {
            backgroundColor: expanded
              ? theme.colors.surfaceVariant + "20"
              : "transparent",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          },
        ]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.expandableHeaderContent}>
          <View
            style={[
              styles.expandableIconWrap,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={theme.colors.onSurface}
            />
          </View>
          <View style={styles.expandableTextContainer}>
            <Text
              style={[
                styles.expandableTitle,
                { color: theme.colors.onSurface },
              ]}
            >
              {title}
            </Text>
            <Text
              style={[
                styles.expandableDescription,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {description}
            </Text>
          </View>
        </View>
        <View
          style={{
            width: 40,
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={22}
            color={theme.colors.outline}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <Animated.View
          style={[
            styles.expandedContent,
            {
              backgroundColor: theme.colors.surfaceVariant + "15",
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
            },
          ]}
        >
          <View style={styles.expandedContentInner}>{children}</View>
        </Animated.View>
      )}
    </>
  );

  // Enhanced Radio Option Component
  const EnhancedRadioOption = ({
    value,
    label,
    description,
    selected,
    onSelect,
  }: {
    value: string;
    label: string;
    description: string;
    selected: boolean;
    onSelect: () => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.enhancedRadioOption,
        {
          backgroundColor: selected
            ? theme.colors.primary + "20"
            : theme.colors.surface,
          borderColor: selected
            ? theme.colors.primary
            : theme.colors.surfaceVariant,
        },
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={styles.radioOptionContent}>
        <View style={styles.radioOptionHeader}>
          <RadioButton
            value={value}
            status={selected ? "checked" : "unchecked"}
            color={theme.colors.primary}
            onPress={onSelect}
          />
          <Text
            style={[styles.radioOptionLabel, { color: theme.colors.onSurface }]}
          >
            {label}
          </Text>
        </View>
        <Text
          style={[
            styles.radioOptionDescription,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {description}
        </Text>
      </View>
      {selected && (
        <View
          style={[
            styles.selectedIndicator,
            { backgroundColor: theme.colors.primary },
          ]}
        />
      )}
    </TouchableOpacity>
  );

  // Enhanced Switch Option Component
  const EnhancedSwitchOption = ({
    label,
    description,
    value,
    onToggle,
  }: {
    label: string;
    description: string;
    value: boolean;
    onToggle: (value: boolean) => void;
  }) => (
    <View style={styles.switchOption}>
      <View style={styles.switchOptionContent}>
        <Text
          style={[styles.switchOptionLabel, { color: theme.colors.onSurface }]}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.switchOptionDescription,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        thumbColor={value ? theme.colors.primary : theme.colors.surfaceVariant}
        trackColor={{
          false: theme.colors.surfaceVariant,
          true: theme.colors.primary + "40",
        }}
        style={styles.switch}
      />
    </View>
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

        {/* Push Notifications Section */}
        <ExpandableSection
          title="Push Notifications"
          description={pushNotifications ? "On" : "Off"}
          icon="bell-outline"
          expanded={expandedSections.notifications}
          onToggle={() => toggleSection("notifications")}
        >
          <View style={styles.switchOptionsContainer}>
            <EnhancedSwitchOption
              label="Enable Push Notifications"
              description="Receive notifications for important updates"
              value={pushNotifications}
              onToggle={setPushNotifications}
            />
            <EnhancedSwitchOption
              label="New Messages"
              description="Get notified when you receive new messages"
              value={pushNotifications}
              onToggle={setPushNotifications}
            />
            <EnhancedSwitchOption
              label="Listing Updates"
              description="Notifications about your car listings"
              value={pushNotifications}
              onToggle={setPushNotifications}
            />
            <EnhancedSwitchOption
              label="Promotional Offers"
              description="Receive offers and discounts"
              value={pushNotifications}
              onToggle={setPushNotifications}
            />
          </View>
        </ExpandableSection>

        <Divider style={styles.sectionDivider} />

        {/* Theme Section */}
        <ExpandableSection
          title="Theme"
          description={
            themeMode === "light"
              ? "Light"
              : themeMode === "dark"
                ? "Dark"
                : "System"
          }
          icon="theme-light-dark"
          expanded={expandedSections.theme}
          onToggle={() => toggleSection("theme")}
        >
          <View style={styles.radioOptionsContainer}>
            <EnhancedRadioOption
              value="light"
              label="Light"
              description="Bright theme optimized for daytime use"
              selected={themeMode === "light"}
              onSelect={() => setThemeMode("light")}
            />
            <EnhancedRadioOption
              value="dark"
              label="Dark"
              description="Dark theme for better night viewing"
              selected={themeMode === "dark"}
              onSelect={() => setThemeMode("dark")}
            />
            <EnhancedRadioOption
              value="system"
              label="System Default"
              description="Automatically match your device settings"
              selected={themeMode === "system"}
              onSelect={() => setThemeMode("system")}
            />
          </View>
        </ExpandableSection>

        <Divider style={styles.sectionDivider} />

        {/* Language Section */}
        <ExpandableSection
          title="Language"
          description={selectedLanguage === "english" ? "English" : "አማርኛ"}
          icon="translate"
          expanded={expandedSections.language}
          onToggle={() => toggleSection("language")}
        >
          <View style={styles.radioOptionsContainer}>
            <EnhancedRadioOption
              value="english"
              label="English"
              description="English language interface"
              selected={selectedLanguage === "english"}
              onSelect={() => setSelectedLanguage("english")}
            />
            <EnhancedRadioOption
              value="amharic"
              label="አማርኛ (Amharic)"
              description="አማርኛ ቋንቋ በይነገጽ"
              selected={selectedLanguage === "amharic"}
              onSelect={() => setSelectedLanguage("amharic")}
            />
          </View>
        </ExpandableSection>

        <Divider style={styles.sectionDivider} />

        {/* Currency Section */}
        <ExpandableSection
          title="Currency"
          description={selectedCurrency === "ETB" ? "ETB (Birr)" : "USD"}
          icon="currency-usd"
          expanded={expandedSections.currency}
          onToggle={() => toggleSection("currency")}
        >
          <View style={styles.radioOptionsContainer}>
            <EnhancedRadioOption
              value="ETB"
              label="ETB - Ethiopian Birr"
              description="ብር - Local currency for Ethiopian market"
              selected={selectedCurrency === "ETB"}
              onSelect={() => setSelectedCurrency("ETB")}
            />
            <EnhancedRadioOption
              value="USD"
              label="USD - US Dollar"
              description="$ - International currency for global transactions"
              selected={selectedCurrency === "USD"}
              onSelect={() => setSelectedCurrency("USD")}
            />
          </View>
        </ExpandableSection>
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

        {/* My Posts - navigate directly */}
        <List.Item
          title="My Posts"
          description="View your car listings"
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
                name="car-multiple"
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
          onPress={() => router.push("/my-posts")}
        />

        <Divider style={styles.sectionDivider} />

        {/* Phone Visibility Section */}
        <ExpandableSection
          title="Show Phone Number"
          description={showPhoneNumber ? "Everyone" : "Only Contacts"}
          icon="eye-outline"
          expanded={expandedSections.phoneVisibility}
          onToggle={() => toggleSection("phoneVisibility")}
        >
          <View style={styles.radioOptionsContainer}>
            <EnhancedRadioOption
              value="everyone"
              label="Everyone"
              description="All users can see your phone number for quick contact"
              selected={showPhoneNumber}
              onSelect={() => setShowPhoneNumber(true)}
            />
            <EnhancedRadioOption
              value="contacts"
              label="Only Contacts"
              description="Only people you've connected with can see your number"
              selected={!showPhoneNumber}
              onSelect={() => setShowPhoneNumber(false)}
            />
          </View>
        </ExpandableSection>

        <Divider style={styles.sectionDivider} />

        {/* Profile Visibility Section */}
        <ExpandableSection
          title="Profile Visibility"
          description={
            profileVisibility === "public"
              ? "Public"
              : profileVisibility === "friends"
                ? "Friends Only"
                : "Private"
          }
          icon="shield-account-outline"
          expanded={expandedSections.profileVisibility}
          onToggle={() => toggleSection("profileVisibility")}
        >
          <View style={styles.radioOptionsContainer}>
            <EnhancedRadioOption
              value="public"
              label="Public"
              description="Anyone can find and view your profile"
              selected={profileVisibility === "public"}
              onSelect={() => setProfileVisibility("public")}
            />
            <EnhancedRadioOption
              value="friends"
              label="Friends Only"
              description="Only your connections can view your profile"
              selected={profileVisibility === "friends"}
              onSelect={() => setProfileVisibility("friends")}
            />
            <EnhancedRadioOption
              value="private"
              label="Private"
              description="Your profile is hidden from other users"
              selected={profileVisibility === "private"}
              onSelect={() => setProfileVisibility("private")}
            />
          </View>
        </ExpandableSection>

        <Divider style={styles.sectionDivider} />

        {/* Data Usage Section */}
        <ExpandableSection
          title="Data Usage"
          description={
            dataUsage === "normal"
              ? "Normal"
              : dataUsage === "low"
                ? "Low"
                : "High"
          }
          icon="chart-bar"
          expanded={expandedSections.dataUsage}
          onToggle={() => toggleSection("dataUsage")}
        >
          <View style={styles.radioOptionsContainer}>
            <EnhancedRadioOption
              value="low"
              label="Low (Save Data)"
              description="Reduced image quality to minimize data usage"
              selected={dataUsage === "low"}
              onSelect={() => setDataUsage("low")}
            />
            <EnhancedRadioOption
              value="normal"
              label="Normal (Balanced)"
              description="Standard quality for everyday use"
              selected={dataUsage === "normal"}
              onSelect={() => setDataUsage("normal")}
            />
            <EnhancedRadioOption
              value="high"
              label="High (Best Quality)"
              description="High-resolution images for best viewing experience"
              selected={dataUsage === "high"}
              onSelect={() => setDataUsage("high")}
            />
          </View>
        </ExpandableSection>
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
          onPress={() =>
            Alert.alert(
              "Not supported",
              "This feature is currently not supported.",
              [{ text: "OK" }]
            )
          }
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
          onPress={() =>
            Alert.alert(
              "Not supported",
              "This feature is currently not supported.",
              [{ text: "OK" }]
            )
          }
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
          onPress={() =>
            Alert.alert(
              "Not supported",
              "This feature is currently not supported.",
              [{ text: "OK" }]
            )
          }
        />
      </Surface>

      {/* Become Verified Seller */}
      <TouchableOpacity
        style={[styles.verifiedCard, { backgroundColor: theme.colors.primary }]}
        onPress={() =>
          Alert.alert("Coming soon", "This feature is coming soon.")
        }
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
    letterSpacing: 0.5,
  },
  sectionDivider: {
    marginHorizontal: 16,
    marginVertical: 4,
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
  // My Posts Styles
  myPostsContent: {
    gap: 12,
    paddingVertical: 8,
  },
  myPostsAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  myPostsActionText: {
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 12,
  },
  // Enhanced Expandable Sections Styles
  expandableHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: -16,
    marginVertical: -8,
  },
  expandableHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  expandableIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  expandableTextContainer: {
    flex: 1,
  },
  expandableTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  expandableDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  expandedContent: {
    marginTop: 4,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  expandedContentInner: {
    gap: 8,
  },
  // Enhanced Radio Option
  enhancedRadioOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
    marginVertical: 4,
    position: "relative",
    overflow: "hidden",
  },
  radioOptionContent: {
    flex: 1,
  },
  radioOptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  radioOptionLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 8,
  },
  radioOptionDescription: {
    fontSize: 13,
    opacity: 0.8,
    marginLeft: 40,
  },
  selectedIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  // Enhanced Switch Option
  switchOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  switchOptionContent: {
    flex: 1,
    marginRight: 12,
  },
  switchOptionLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  switchOptionDescription: {
    fontSize: 13,
    opacity: 0.8,
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  // Options Containers
  radioOptionsContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  switchOptionsContainer: {
    gap: 12,
    paddingVertical: 4,
  },
});

export default ProfileScreen;
