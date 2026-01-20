import { authService } from "@/src/features/auth/auth.service";
import { useAuthStore } from "@/src/features/auth/auth.store";
import { isUnder10MB, processImageToBase64 } from "@/src/utils/imageProcessor";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditProfilePage() {
  const { isAuthenticated, user, updateUser } = useAuthStore();
  const router = useRouter();

  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState(user?.city || "");
  const [region, setRegion] = useState(user?.region || "");
  const [isDealer, setIsDealer] = useState(user?.is_dealer || false);
  const [dealerCompanyName, setDealerCompanyName] = useState(
    user?.dealer_company_name || "",
  );
  const [dealerAddress, setDealerAddress] = useState(
    user?.dealer_address || "",
  );
  const [dealerCity, setDealerCity] = useState(user?.dealer_city || "");
  const [dealerRegion, setDealerRegion] = useState(user?.dealer_region || "");
  const [dealerLicenseNumber, setDealerLicenseNumber] = useState(
    user?.dealer_license_number || "",
  );
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(
    user?.profile_picture || null,
  );

  const handleChoosePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image from gallery");
      console.error("Image picker error:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Sign up first</Text>
      </View>
    );
  }

  const handleSaveChanges = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Error", "First name and last name are required");
      return;
    }

    // Validate dealer fields if dealer account is enabled
    if (isDealer) {
      if (!dealerCompanyName.trim()) {
        Alert.alert("Error", "Company name is required for dealer accounts");
        return;
      }
      if (!dealerAddress.trim()) {
        Alert.alert(
          "Error",
          "Business address is required for dealer accounts",
        );
        return;
      }
      if (!dealerCity.trim()) {
        Alert.alert("Error", "Business city is required for dealer accounts");
        return;
      }
      if (!dealerRegion.trim()) {
        Alert.alert("Error", "Business region is required for dealer accounts");
        return;
      }
      if (!dealerLicenseNumber.trim()) {
        Alert.alert("Error", "License number is required for dealer accounts");
        return;
      }
    }

    setSaving(true);
    try {
      const profileImageData = profileImage
        ? await processImageToBase64(profileImage)
        : null;

      if (profileImageData && !isUnder10MB(profileImageData)) {
        Alert.alert("Error", "Profile image is too large");
        return;
      }

      const updatedUser = await authService.updateProfile({
        firstName,
        lastName,
        email,
        bio,
        phone,
        city,
        region,
        is_dealer: isDealer,
        profilePicture: profileImageData,
        ...(isDealer && {
          dealer_company_name: dealerCompanyName,
          dealer_address: dealerAddress,
          dealer_city: dealerCity,
          dealer_region: dealerRegion,
          dealer_license_number: dealerLicenseNumber,
        }),
      });

      // Check if API call was successful
      if (updatedUser?.success) {
        if (updatedUser?.data) {
          updateUser(updatedUser.data);
          Alert.alert("Success", "Profile updated successfully");
          router.back();
        } else {
          Alert.alert("Error", "Profile update failed: No data returned");
        }
      } else {
        Alert.alert(
          "Error",
          `Failed to update profile: ${updatedUser?.message || "Unknown error"}`,
        );
      }
    } catch (error: any) {
      console.error("Save error:", error);
      Alert.alert(
        "Error",
        `Failed to update profile: ${error?.message || error}`,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Update your personal information</Text>

      {/* Profile Photo Section */}
      <View style={styles.photoSection}>
        <TouchableOpacity onPress={handleChoosePhoto}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require("../assets/images/profile.jpg")
              }
              style={styles.avatar}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.changePhotoButton}
          onPress={handleChoosePhoto}
        >
          <Text style={styles.changePhotoText}>Change Profile Photo</Text>
        </TouchableOpacity>
      </View>

      {/* User Info Display */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {firstName} {lastName}
        </Text>
        <Text style={styles.userEmail}>{email}</Text>
      </View>

      {/* Personal Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Details</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            editable={false} // Usually email shouldn't be changeable
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="City"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Region</Text>
          <TextInput
            style={styles.input}
            value={region}
            onChangeText={setRegion}
            placeholder="Region/State"
          />
        </View>

        {/* Dealer Toggle */}
        <View style={styles.inputContainer}>
          <View style={styles.toggleContainer}>
            <Text style={styles.label}>Convert to dealer account</Text>
            <TouchableOpacity
              style={[styles.toggle, isDealer && styles.toggleActive]}
              onPress={() => setIsDealer(!isDealer)}
            >
              <View
                style={[
                  styles.toggleButton,
                  isDealer && styles.toggleButtonActive,
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dealer Information - Only show if user is a dealer */}
        {isDealer && (
          <View style={styles.dealerSection}>
            <Text style={styles.sectionTitle}>Dealer Information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput
                style={styles.input}
                value={dealerCompanyName}
                onChangeText={setDealerCompanyName}
                placeholder="Company name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Business Address</Text>
              <TextInput
                style={styles.input}
                value={dealerAddress}
                onChangeText={setDealerAddress}
                placeholder="Business address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Business City</Text>
              <TextInput
                style={styles.input}
                value={dealerCity}
                onChangeText={setDealerCity}
                placeholder="Business city"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Business Region</Text>
              <TextInput
                style={styles.input}
                value={dealerRegion}
                onChangeText={setDealerRegion}
                placeholder="Business region"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>License Number</Text>
              <TextInput
                style={styles.input}
                value={dealerLicenseNumber}
                onChangeText={setDealerLicenseNumber}
                placeholder="License number"
              />
            </View>
          </View>
        )}
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSaveChanges}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "Saving..." : "Save Changes"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
  },
  changePhotoButton: {
    backgroundColor: "#333333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  changePhotoText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 30,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dealerSection: {
    backgroundColor: "#f8f9fa",
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dealerSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#333333",
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#666666",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
    color: "#666",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggle: {
    width: 50,
    height: 30,
    backgroundColor: "#ccc",
    borderRadius: 15,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  toggleActive: {
    backgroundColor: "#333333",
  },
  toggleButton: {
    width: 24,
    height: 24,
    backgroundColor: "white",
    borderRadius: 12,
  },
  toggleButtonActive: {
    alignSelf: "flex-end",
  },
});
