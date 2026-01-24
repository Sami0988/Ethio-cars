import { authService } from "@/src/features/auth/auth.service";
import { useAuthStore } from "@/src/features/auth/auth.store";
import { isUnder10MB, processImageToBase64 } from "@/src/utils/imageProcessor";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  const { isAuthenticated, user, updateUser, fetchProfile } = useAuthStore();
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

  // Validation errors state
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    city: "",
    region: "",
    dealerCompanyName: "",
    dealerAddress: "",
    dealerCity: "",
    dealerRegion: "",
    dealerLicenseNumber: "",
  });

  // Validation function
  const validateField = (fieldName: string, value: string): string => {
    if (value.trim().length > 0 && value.trim().length < 3) {
      return `${fieldName.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())} must be at least 3 characters`;
    }

    // Special validation for first name and last name - only letters allowed
    if (
      (fieldName === "firstName" || fieldName === "lastName") &&
      value.trim().length > 0
    ) {
      const nameRegex = /^[a-zA-Z\s'-]+$/;
      if (!nameRegex.test(value.trim())) {
        return `${fieldName.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())} can only contain letters`;
      }
    }

    return "";
  };

  // Handle field change with validation
  const handleFieldChange = (
    fieldName: string,
    value: string,
    setter: (val: string) => void,
  ) => {
    setter(value);
    const fieldDisplayName = fieldName
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
    const error = validateField(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  // Update form state when user data changes
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
      setPhone(user.phone || "");
      setCity(user.city || "");
      setRegion(user.region || "");
      setIsDealer(user.is_dealer || false);
      setDealerCompanyName(user.dealer_company_name || "");
      setDealerAddress(user.dealer_address || "");
      setDealerCity(user.dealer_city || "");
      setDealerRegion(user.dealer_region || "");
      setDealerLicenseNumber(user.dealer_license_number || "");
      setProfileImage(user.profile_picture || null);
    }
  }, [user]);

  // Fetch complete profile data on component mount - only if data is incomplete
  // DISABLED: This is causing redirects due to auth state updates
  // useEffect(() => {
  //   if (isAuthenticated && user) {
  //     // Check if user data is incomplete (missing key fields)
  //     const isIncomplete = !user.city || !user.region || !user.bio;

  //     if (isIncomplete) {
  //       console.log(
  //         "EditProfile: User data incomplete, fetching fresh data...",
  //       );
  //       fetchProfile().catch((error) => {
  //         console.error("EditProfile - Failed to fetch profile:", error);
  //       });
  //     }
  //   }
  // }, [isAuthenticated, user, fetchProfile]);

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
    // Validate all fields before saving
    const newErrors = {
      firstName: validateField("firstName", firstName),
      lastName: validateField("lastName", lastName),
      email: validateField("email", email),
      phone: validateField("phone", phone),
      bio: validateField("bio", bio),
      city: validateField("city", city),
      region: validateField("region", region),
      dealerCompanyName: validateField("dealerCompanyName", dealerCompanyName),
      dealerAddress: validateField("dealerAddress", dealerAddress),
      dealerCity: validateField("dealerCity", dealerCity),
      dealerRegion: validateField("dealerRegion", dealerRegion),
      dealerLicenseNumber: validateField(
        "dealerLicenseNumber",
        dealerLicenseNumber,
      ),
    };

    setErrors(newErrors);

    // Check if there are any validation errors
    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) {
      Alert.alert("Validation Error", "Please fix the errors before saving.");
      return;
    }

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
            style={[styles.input, errors.firstName ? styles.inputError : null]}
            value={firstName}
            onChangeText={(value) =>
              handleFieldChange("firstName", value, setFirstName)
            }
            placeholder="First name"
            onBlur={() =>
              setErrors((prev) => ({
                ...prev,
                firstName: validateField("firstName", firstName),
              }))
            }
          />
          {errors.firstName ? (
            <Text style={styles.errorText}>{errors.firstName}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={[styles.input, errors.lastName ? styles.inputError : null]}
            value={lastName}
            onChangeText={(value) =>
              handleFieldChange("lastName", value, setLastName)
            }
            placeholder="Last name"
            onBlur={() =>
              setErrors((prev) => ({
                ...prev,
                lastName: validateField("lastName", lastName),
              }))
            }
          />
          {errors.lastName ? (
            <Text style={styles.errorText}>{errors.lastName}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, errors.email ? styles.inputError : null]}
            value={email}
            onChangeText={(value) =>
              handleFieldChange("email", value, setEmail)
            }
            placeholder="Email"
            keyboardType="email-address"
            editable={false}
          />
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={[styles.input, errors.phone ? styles.inputError : null]}
            value={phone}
            onChangeText={(value) =>
              handleFieldChange("phone", value, setPhone)
            }
            placeholder="Phone number"
            keyboardType="phone-pad"
            onBlur={() =>
              setErrors((prev) => ({
                ...prev,
                phone: validateField("phone", phone),
              }))
            }
          />
          {errors.phone ? (
            <Text style={styles.errorText}>{errors.phone}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              errors.bio ? styles.inputError : null,
            ]}
            value={bio}
            onChangeText={(value) => handleFieldChange("bio", value, setBio)}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={4}
            onBlur={() =>
              setErrors((prev) => ({ ...prev, bio: validateField("bio", bio) }))
            }
          />
          {errors.bio ? (
            <Text style={styles.errorText}>{errors.bio}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={[styles.input, errors.city ? styles.inputError : null]}
            value={city}
            onChangeText={(value) => handleFieldChange("city", value, setCity)}
            placeholder="City"
            onBlur={() =>
              setErrors((prev) => ({
                ...prev,
                city: validateField("city", city),
              }))
            }
          />
          {errors.city ? (
            <Text style={styles.errorText}>{errors.city}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Region</Text>
          <TextInput
            style={[styles.input, errors.region ? styles.inputError : null]}
            value={region}
            onChangeText={(value) =>
              handleFieldChange("region", value, setRegion)
            }
            placeholder="Region/State"
            onBlur={() =>
              setErrors((prev) => ({
                ...prev,
                region: validateField("region", region),
              }))
            }
          />
          {errors.region ? (
            <Text style={styles.errorText}>{errors.region}</Text>
          ) : null}
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
                style={[
                  styles.input,
                  errors.dealerCompanyName ? styles.inputError : null,
                ]}
                value={dealerCompanyName}
                onChangeText={(value) =>
                  handleFieldChange(
                    "dealerCompanyName",
                    value,
                    setDealerCompanyName,
                  )
                }
                placeholder="Company name"
                onBlur={() =>
                  setErrors((prev) => ({
                    ...prev,
                    dealerCompanyName: validateField(
                      "dealerCompanyName",
                      dealerCompanyName,
                    ),
                  }))
                }
              />
              {errors.dealerCompanyName ? (
                <Text style={styles.errorText}>{errors.dealerCompanyName}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Business Address</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.dealerAddress ? styles.inputError : null,
                ]}
                value={dealerAddress}
                onChangeText={(value) =>
                  handleFieldChange("dealerAddress", value, setDealerAddress)
                }
                placeholder="Business address"
                onBlur={() =>
                  setErrors((prev) => ({
                    ...prev,
                    dealerAddress: validateField(
                      "dealerAddress",
                      dealerAddress,
                    ),
                  }))
                }
              />
              {errors.dealerAddress ? (
                <Text style={styles.errorText}>{errors.dealerAddress}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Business City</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.dealerCity ? styles.inputError : null,
                ]}
                value={dealerCity}
                onChangeText={(value) =>
                  handleFieldChange("dealerCity", value, setDealerCity)
                }
                placeholder="Business city"
                onBlur={() =>
                  setErrors((prev) => ({
                    ...prev,
                    dealerCity: validateField("dealerCity", dealerCity),
                  }))
                }
              />
              {errors.dealerCity ? (
                <Text style={styles.errorText}>{errors.dealerCity}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Business Region</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.dealerRegion ? styles.inputError : null,
                ]}
                value={dealerRegion}
                onChangeText={(value) =>
                  handleFieldChange("dealerRegion", value, setDealerRegion)
                }
                placeholder="Business region"
                onBlur={() =>
                  setErrors((prev) => ({
                    ...prev,
                    dealerRegion: validateField("dealerRegion", dealerRegion),
                  }))
                }
              />
              {errors.dealerRegion ? (
                <Text style={styles.errorText}>{errors.dealerRegion}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>License Number</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.dealerLicenseNumber ? styles.inputError : null,
                ]}
                value={dealerLicenseNumber}
                onChangeText={(value) =>
                  handleFieldChange(
                    "dealerLicenseNumber",
                    value,
                    setDealerLicenseNumber,
                  )
                }
                placeholder="License number"
                onBlur={() =>
                  setErrors((prev) => ({
                    ...prev,
                    dealerLicenseNumber: validateField(
                      "dealerLicenseNumber",
                      dealerLicenseNumber,
                    ),
                  }))
                }
              />
              {errors.dealerLicenseNumber ? (
                <Text style={styles.errorText}>
                  {errors.dealerLicenseNumber}
                </Text>
              ) : null}
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
  inputError: {
    borderColor: "#ff4444",
    backgroundColor: "#fff5f5",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginTop: 4,
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
