// screens/profile/ProfileScreen.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useLogout } from "../../features/auth/auth.hooks";
import { useAuthStore } from "../../features/auth/auth.store";
import { useCarListings } from "../../features/cars/car.hooks";
import { useThemeStore } from "../../features/theme/theme.store";

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const logoutMutation = useLogout();
  const [showMenu, setShowMenu] = useState(false);

  const { data: listingsData } = useCarListings(1, 20);
  const userListings = listingsData?.data?.listings || [];

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

  const handleMyPosts = () => {
    router.push("/my-posts");
  };

  const handleMessages = () => {
    router.push("/messages");
  };

  const handleEditProfile = () => {
    router.push("/update-profile");
  };

  const handleHelp = () => {
    console.log("Help pressed");
  };

  const handleAbout = () => {
    console.log("About pressed");
  };

  if (!isAuthenticated) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.signInPrompt}>
          <MaterialCommunityIcons
            name="account-circle-outline"
            size={80}
            color={theme.colors.primary}
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
            style={styles.signInButton}
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
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode
            ? theme.colors.background
            : theme.colors.background,
        },
      ]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
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
        elevation={isDarkMode ? 0 : 2}
      >
        <View style={styles.profileHeader}>
          <Avatar.Image
            size={72}
            source={
              // @ts-ignore: optional profile_picture
              user?.profile_picture
                ? // @ts-ignore
                  { uri: user.profile_picture }
                : require("../../../assets/images/icon.png")
            }
          />
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
                  color="#2563EB"
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
                    backgroundColor: isDarkMode ? "#4B5563" : "#FEF9C3",
                  },
                ]}
                textStyle={[
                  styles.ratingText,
                  {
                    color: isDarkMode ? "#F9FAFB" : "#854D0E",
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
              {/* @ts-ignore optional member_since */}
              Member since {user?.member_since || "2023"}
            </Text>
          </View>
        </View>

        <Button
          mode="contained"
          style={[
            styles.editProfileButton,
            { backgroundColor: theme.colors.onBackground },
          ]}
          contentStyle={{ height: 40 }}
          onPress={handleEditProfile}
          icon="account-edit"
        >
          Edit Profile
        </Button>
      </Surface>

      {/* Account Information card */}
      <Surface
        style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}
        elevation={isDarkMode ? 0 : 1}
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
            <View style={styles.itemIconWrap}>
              <MaterialCommunityIcons
                name="email-outline"
                size={20}
                color="#EF4444"
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
            <View style={styles.itemIconWrap}>
              <MaterialCommunityIcons
                name="phone-outline"
                size={20}
                color="#F97316"
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
            <View style={styles.itemIconWrap}>
              <MaterialCommunityIcons
                name="id-card"
                size={20}
                color="#3B82F6"
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
            <View style={styles.itemIconWrap}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={20}
                color="#8B5CF6"
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
          onPress={() => console.log("Password")}
        />
      </Surface>

      {/* Preferences */}
      <Surface
        style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}
        elevation={isDarkMode ? 0 : 1}
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
            <View style={styles.itemIconWrap}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={20}
                color="#EF4444"
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
          onPress={() => console.log("Notifications")}
        />
        <Divider />

        <List.Item
          title="Theme"
          description={isDarkMode ? "Dark" : "System"}
          titleStyle={{ color: theme.colors.onSurface }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <View style={styles.itemIconWrap}>
              <MaterialCommunityIcons
                name="theme-light-dark"
                size={20}
                color="#F97316"
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
            <View style={styles.itemIconWrap}>
              <MaterialCommunityIcons
                name="translate"
                size={20}
                color="#22C55E"
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
        />
        <Divider />

        <List.Item
          title="Currency"
          description="ETB (Birr)"
          titleStyle={{ color: theme.colors.onSurface }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <View style={styles.itemIconWrap}>
              <MaterialCommunityIcons
                name="currency-usd"
                size={20}
                color="#3B82F6"
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
        />
      </Surface>

      {/* Safety & privacy */}
      <Surface
        style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}
        elevation={isDarkMode ? 0 : 1}
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
            <View style={styles.itemIconWrap}>
              <MaterialCommunityIcons
                name="eye-outline"
                size={20}
                color="#6366F1"
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
        />
        <Divider />

        <List.Item
          title="Profile Visibility"
          description="Public"
          titleStyle={{ color: theme.colors.onSurface }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <View style={styles.itemIconWrap}>
              <MaterialCommunityIcons
                name="shield-account-outline"
                size={20}
                color="#EC4899"
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
        />
        <Divider />

        <List.Item
          title="Data Usage"
          description="Normal"
          titleStyle={{ color: theme.colors.onSurface }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <View style={styles.itemIconWrap}>
              <MaterialCommunityIcons
                name="chart-bar"
                size={20}
                color="#0EA5E9"
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
        />
      </Surface>

      {/* Help & support */}
      <Surface
        style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}
        elevation={isDarkMode ? 0 : 1}
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
            <View style={styles.itemIconWrap}>
              <MaterialCommunityIcons
                name="lifebuoy"
                size={20}
                color="#10B981"
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
          onPress={handleHelp}
        />
        <Divider />

        <List.Item
          title="Contact Support"
          description="Get in touch with us"
          titleStyle={{ color: theme.colors.onSurface }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <View style={styles.itemIconWrap}>
              <MaterialCommunityIcons
                name="headset"
                size={20}
                color="#F97316"
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
        />
        <Divider />

        <List.Item
          title="About"
          description="App version and information"
          titleStyle={{ color: theme.colors.onSurface }}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={() => (
            <View style={styles.itemIconWrap}>
              <MaterialCommunityIcons
                name="information-outline"
                size={20}
                color="#3B82F6"
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
          onPress={handleAbout}
        />
      </Surface>

      {/* Become Verified Seller (red card) */}
      <Surface
        style={[styles.verifiedCard, { backgroundColor: "#EF4444" }]}
        elevation={isDarkMode ? 0 : 2}
      >
        <View style={styles.verifiedLeft}>
          <MaterialCommunityIcons
            name="shield-check"
            size={26}
            color="#FFFFFF"
          />
        </View>
        <View style={styles.verifiedInfo}>
          <Text style={styles.verifiedTitle}>Become a Verified Seller</Text>
          <Text style={styles.verifiedSubtitle}>
            Get trusted badges & more visibility
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color="#FFFFFF"
        />
      </Surface>

      {/* Actions */}
      <Surface
        style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}
        elevation={isDarkMode ? 0 : 1}
      >
        <List.Item
          title="Share Profile"
          titleStyle={{ color: theme.colors.onSurface }}
          left={() => (
            <View style={styles.itemIconWrap}>
              <MaterialCommunityIcons
                name="share-variant"
                size={20}
                color="#3B82F6"
              />
            </View>
          )}
          onPress={() => console.log("Share profile")}
        />
        <Divider />

        <List.Item
          title="Invite Friends"
          titleStyle={{ color: theme.colors.onSurface }}
          left={() => (
            <View style={styles.itemIconWrap}>
              <MaterialCommunityIcons
                name="account-plus-outline"
                size={20}
                color="#22C55E"
              />
            </View>
          )}
          onPress={() => console.log("Invite friends")}
        />
        <Divider />

        <List.Item
          title="Log Out"
          titleStyle={{ color: theme.colors.onSurface }}
          left={() => (
            <View style={styles.itemIconWrap}>
              <MaterialCommunityIcons name="logout" size={20} color="#F97316" />
            </View>
          )}
          onPress={handleLogout}
        />
        <Divider />

        <List.Item
          title="Delete Account"
          titleStyle={{ color: "#DC2626" }}
          left={() => (
            <View style={styles.itemIconWrap}>
              <MaterialCommunityIcons
                name="delete-outline"
                size={20}
                color="#DC2626"
              />
            </View>
          )}
          onPress={() =>
            Alert.alert(
              "Delete Account",
              "Are you sure you want to delete your account?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => console.log("Delete account"),
                },
              ]
            )
          }
        />
      </Surface>
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
    backgroundColor: "#F3F4F6",
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
  },
  verifiedLeft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
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
    color: "#FFFFFF",
  },
  verifiedSubtitle: {
    fontSize: 12,
    color: "#F9FAFB",
    marginTop: 2,
  },
});

export default ProfileScreen;
