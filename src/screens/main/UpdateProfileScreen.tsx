import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useThemeStore } from "../../features/theme/theme.store";

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

const EditProfileScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { isDarkMode } = useThemeStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get("/user/profile");
      if (response.data.success) {
        setProfile(response.data.data);
      }
    } catch (error) {
      showSnackbar("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, type: "success" | "error") => {
    setSnackbar({ visible: true, message, type });
  };

  const handleSave = async () => {
    if (!profile.first_name?.trim() || !profile.last_name?.trim()) {
      showSnackbar("First name and last name are required", "error");
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {
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

      const response = await apiClient.put("/user/profile", updateData);

      if (response.data.success) {
        showSnackbar("Profile updated successfully", "success");
        if (user) {
          updateUser({
            first_name: profile.first_name,
            last_name: profile.last_name,
            phone: profile.phone,
            is_dealer: profile.is_dealer,
          });
        }
        setTimeout(() => {
          router.back();
        }, 1500);
      }
    } catch (error) {
      showSnackbar("Failed to update profile", "error");
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
    Alert.alert("Change Profile Photo", "Select an option", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Take Photo",
        onPress: () => console.log("Take photo"),
      },
      {
        text: "Choose from Gallery",
        onPress: () => console.log("Choose from gallery"),
      },
    ]);
  };

  const handlePickBusinessLicense = () => {
    showSnackbar("Open business license picker", "success");
  };

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
          <CustomIconButton
            icon="chevron-left"
            variant="ghost"
            size="md"
            onPress={() => router.back()}
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
          elevation={isDarkMode ? 0 : 1}
        >
          <View style={styles.profileHeader}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleChangeProfilePhoto}
            >
              <Avatar.Image
                size={96}
                source={
                  profile.profile_picture
                    ? { uri: profile.profile_picture }
                    : require("../../../assets/images/icon.png")
                }
                style={[styles.avatar, { borderColor: theme.colors.surface }]}
              />
              <View
                style={[
                  styles.avatarOverlay,
                  { borderColor: theme.colors.surface },
                ]}
              >
                <MaterialCommunityIcons
                  name="camera"
                  size={18}
                  color="#FFFFFF"
                />
              </View>
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
                      backgroundColor: isDarkMode ? "#14532D" : "#DCFCE7",
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={14}
                    color="#16A34A"
                  />
                  <Text style={styles.verifiedText}>Verified Seller</Text>
                </View>
              )}
            </View>
          </View>
          <Button
            label="Change Profile Photo"
            variant="outline"
            icon="camera"
            size="sm"
            onPress={handleChangeProfilePhoto}
            style={styles.changePhotoButton}
          />
        </Surface>

        {/* Personal Details */}
        <Surface
          style={[
            styles.sectionCard,
            { backgroundColor: theme.colors.surface },
          ]}
          elevation={isDarkMode ? 0 : 1}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="account"
              size={18}
              color={theme.colors.error}
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

          {/* Inline Discard / Save */}
          <View style={styles.inlineButtonsRow}>
            <Button
              label="Discard"
              variant="outline"
              size="md"
              style={styles.inlineButton}
              onPress={() => router.back()}
            />
            <Button
              label="Save Changes"
              variant="primary"
              size="md"
              style={styles.inlineButton}
              onPress={handleSave}
              loading={saving}
              disabled={saving}
            />
          </View>
        </Surface>

        {/* Phone Number */}
        <Surface
          style={[
            styles.sectionCard,
            { backgroundColor: theme.colors.surface },
          ]}
          elevation={isDarkMode ? 0 : 1}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="phone"
              size={18}
              color={theme.colors.error}
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
                      backgroundColor: isDarkMode ? "#14532D" : "#DCFCE7",
                    },
                  ]}
                  textStyle={styles.verifiedChipText}
                >
                  Verified
                </Chip>
              ) : (
                <Button
                  label="Verify"
                  variant="outline"
                  size="sm"
                  onPress={handleVerifyPhone}
                  style={styles.verifyButton}
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
          elevation={isDarkMode ? 0 : 1}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="map-marker"
              size={18}
              color={theme.colors.error}
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
          elevation={isDarkMode ? 0 : 1}
        >
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <MaterialCommunityIcons
                name="store"
                size={18}
                color={theme.colors.error}
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
          elevation={isDarkMode ? 0 : 1}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="share-variant"
              size={18}
              color={theme.colors.error}
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
              backgroundColor: isDarkMode ? "#0B1120" : "#FEF3F2",
              borderColor: isDarkMode ? "#991B1B" : "#FECACA",
            },
          ]}
          elevation={isDarkMode ? 0 : 1}
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
            style={styles.applyButton}
          />
        </Surface>

        {/* Danger Zone */}
        <Surface
          style={[
            styles.dangerSection,
            {
              backgroundColor: isDarkMode ? "#111827" : "#FEF2F2",
              borderColor: "#FECACA",
            },
          ]}
          elevation={isDarkMode ? 0 : 1}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={18}
              color="#DC2626"
            />
            <Text style={styles.dangerTitle}>Danger Zone</Text>
          </View>

          <Text style={styles.dangerDescription}>
            Once you delete your account, there is no going back. Please be
            certain.
          </Text>

          <Button
            label="I want to delete my account"
            variant="danger"
            icon="trash-can"
            onPress={handleDeleteAccount}
            style={styles.deleteButton}
          />
        </Surface>

        {/* Bottom Save Button */}
        <View style={styles.saveButtonContainer}>
          <Button
            label="Save Changes"
            variant="primary"
            loading={saving}
            disabled={saving}
            onPress={handleSave}
            size="lg"
            fullWidth
            style={styles.saveButton}
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
            ? { backgroundColor: "#16A34A" }
            : { backgroundColor: "#DC2626" },
        ]}
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
    backgroundColor: "#EF4444",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
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
    color: "#166534",
  },
  changePhotoButton: {
    minWidth: 200,
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
    color: "#111827",
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
  },
  verifiedChip: {
    height: 32,
    justifyContent: "center",
  },
  verifiedChipText: {
    color: "#166534",
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
  inlineButtonsRow: {
    flexDirection: "row",
    columnGap: 10,
    marginTop: 4,
  },
  inlineButton: {
    flex: 1,
    borderRadius: 999,
    height: 44,
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
    color: "#DC2626",
  },
  dangerDescription: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 18,
    color: "#7F1D1D",
  },
  deleteButton: {
    borderColor: "#DC2626",
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

export default EditProfileScreen;
