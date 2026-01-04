import { useRouter } from "expo-router";
import { useFormik } from "formik";
import React, { useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuthStore } from "../../features/auth/auth.store";
import {
  formatPhoneNumber,
  FullRegistrationFormData,
  registrationSchema,
} from "../../utils/validation";

const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  React.useEffect(() => {
    if (error) {
      Alert.alert("Registration Error", error);
    }
  }, [error]);

  const formik = useFormik<FullRegistrationFormData>({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirm_password: "",
      phone: "",
      first_name: "",
      last_name: "",
      device_info: "",
      is_dealer: false,
      dealer_company_name: "",
      dealer_address: "",
      dealer_city: "",
      dealer_region: "",
      dealer_license_number: "",
    },
    validationSchema: registrationSchema,
    onSubmit: async (values) => {
      try {
        clearError();
        const formattedValues = {
          ...values,
          phone: formatPhoneNumber(values.phone),
          device_info: values.device_info || "EthioCars Mobile App",
        };
        const { confirm_password, ...submitData } = formattedValues;
        await register(submitData);
        // Success handled by store
      } catch (err) {
        // Error handled by store
      }
    },
  });

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    formik.setFieldValue("phone", formatted);
  };

  const isDealer = formik.values.is_dealer;

  const slideIn = {
    opacity: animation,
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, slideIn]}>
          {/* Header with Logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Avatar.Icon
                size={80}
                icon="car"
                color="#fff"
                style={[styles.logo, { backgroundColor: theme.colors.primary }]}
              />
              <Text style={styles.logoText}>🚗</Text>
            </View>
            <Text variant="headlineMedium" style={styles.title}>
              Join EthioCars
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Ethiopia's #1 Automotive Marketplace
            </Text>
          </View>

          <Card style={styles.card} elevation={2}>
            <Card.Content>
              {/* Account Type Toggle */}
              <View style={styles.accountTypeSection}>
                <Text variant="titleSmall" style={styles.sectionLabel}>
                  Account Type
                </Text>
                <View style={styles.toggleRow}>
                  <Chip
                    selected={!isDealer}
                    onPress={() => formik.setFieldValue("is_dealer", false)}
                    style={styles.chip}
                    mode="outlined"
                    icon={!isDealer ? "check-circle" : "account"}
                  >
                    Individual
                  </Chip>
                  <Chip
                    selected={isDealer}
                    onPress={() => formik.setFieldValue("is_dealer", true)}
                    style={styles.chip}
                    mode="outlined"
                    icon={isDealer ? "check-circle" : "office-building"}
                  >
                    Dealer
                  </Chip>
                </View>
              </View>

              <Divider style={styles.divider} />

              {/* Personal Information */}
              <Text variant="titleSmall" style={styles.sectionLabel}>
                Personal Information
              </Text>

              <View style={styles.nameRow}>
                <TextInput
                  label="First Name"
                  value={formik.values.first_name}
                  onChangeText={formik.handleChange("first_name")}
                  onBlur={formik.handleBlur("first_name")}
                  error={
                    !!(formik.touched.first_name && formik.errors.first_name)
                  }
                  style={styles.nameInput}
                  left={<TextInput.Icon icon="account" />}
                  mode="outlined"
                />
                <TextInput
                  label="Last Name"
                  value={formik.values.last_name}
                  onChangeText={formik.handleChange("last_name")}
                  onBlur={formik.handleBlur("last_name")}
                  error={
                    !!(formik.touched.last_name && formik.errors.last_name)
                  }
                  style={styles.nameInput}
                  mode="outlined"
                />
              </View>
              <View style={styles.errorRow}>
                {formik.touched.first_name && formik.errors.first_name && (
                  <HelperText type="error" visible>
                    {formik.errors.first_name}
                  </HelperText>
                )}
                {formik.touched.last_name && formik.errors.last_name && (
                  <HelperText type="error" visible>
                    {formik.errors.last_name}
                  </HelperText>
                )}
              </View>

              <TextInput
                label="Username"
                value={formik.values.username}
                onChangeText={formik.handleChange("username")}
                onBlur={formik.handleBlur("username")}
                error={!!(formik.touched.username && formik.errors.username)}
                left={<TextInput.Icon icon="account-circle" />}
                mode="outlined"
                style={styles.inputSpacing}
                autoCapitalize="none"
              />
              <HelperText
                type="error"
                visible={!!(formik.touched.username && formik.errors.username)}
              >
                {formik.errors.username}
              </HelperText>

              <TextInput
                label="Email"
                value={formik.values.email}
                onChangeText={formik.handleChange("email")}
                onBlur={formik.handleBlur("email")}
                error={!!(formik.touched.email && formik.errors.email)}
                left={<TextInput.Icon icon="email" />}
                mode="outlined"
                style={styles.inputSpacing}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <HelperText
                type="error"
                visible={!!(formik.touched.email && formik.errors.email)}
              >
                {formik.errors.email}
              </HelperText>

              <TextInput
                label="Phone Number"
                value={formik.values.phone}
                onChangeText={handlePhoneChange}
                onBlur={formik.handleBlur("phone")}
                error={!!(formik.touched.phone && formik.errors.phone)}
                left={<TextInput.Icon icon="phone" />}
                right={<TextInput.Icon icon="ethiopia" />}
                mode="outlined"
                style={styles.inputSpacing}
                keyboardType="phone-pad"
              />
              <HelperText
                type="error"
                visible={!!(formik.touched.phone && formik.errors.phone)}
              >
                {formik.errors.phone}
              </HelperText>

              <Divider style={styles.divider} />

              {/* Password Section */}
              <Text variant="titleSmall" style={styles.sectionLabel}>
                Security
              </Text>

              <TextInput
                label="Password"
                value={formik.values.password}
                onChangeText={formik.handleChange("password")}
                onBlur={formik.handleBlur("password")}
                error={!!(formik.touched.password && formik.errors.password)}
                secureTextEntry={!showPassword}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                mode="outlined"
                style={styles.inputSpacing}
              />
              <HelperText
                type="error"
                visible={!!(formik.touched.password && formik.errors.password)}
              >
                {formik.errors.password}
              </HelperText>

              <TextInput
                label="Confirm Password"
                value={formik.values.confirm_password}
                onChangeText={formik.handleChange("confirm_password")}
                onBlur={formik.handleBlur("confirm_password")}
                error={
                  !!(
                    formik.touched.confirm_password &&
                    formik.errors.confirm_password
                  )
                }
                secureTextEntry={!showConfirmPassword}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                mode="outlined"
                style={styles.inputSpacing}
              />
              <HelperText
                type="error"
                visible={
                  !!(
                    formik.touched.confirm_password &&
                    formik.errors.confirm_password
                  )
                }
              >
                {formik.errors.confirm_password}
              </HelperText>

              {/* Dealer Information */}
              {isDealer && (
                <>
                  <Divider style={styles.divider} />
                  <Text variant="titleSmall" style={styles.sectionLabel}>
                    Dealership Details
                  </Text>

                  <TextInput
                    label="Company Name"
                    value={formik.values.dealer_company_name}
                    onChangeText={formik.handleChange("dealer_company_name")}
                    onBlur={formik.handleBlur("dealer_company_name")}
                    error={
                      !!(
                        formik.touched.dealer_company_name &&
                        formik.errors.dealer_company_name
                      )
                    }
                    left={<TextInput.Icon icon="office-building" />}
                    mode="outlined"
                    style={styles.inputSpacing}
                  />
                  <HelperText
                    type="error"
                    visible={
                      !!(
                        formik.touched.dealer_company_name &&
                        formik.errors.dealer_company_name
                      )
                    }
                  >
                    {formik.errors.dealer_company_name}
                  </HelperText>

                  <TextInput
                    label="Business License Number"
                    value={formik.values.dealer_license_number}
                    onChangeText={formik.handleChange("dealer_license_number")}
                    onBlur={formik.handleBlur("dealer_license_number")}
                    error={
                      !!(
                        formik.touched.dealer_license_number &&
                        formik.errors.dealer_license_number
                      )
                    }
                    left={<TextInput.Icon icon="file-document" />}
                    mode="outlined"
                    style={styles.inputSpacing}
                  />
                  <HelperText
                    type="error"
                    visible={
                      !!(
                        formik.touched.dealer_license_number &&
                        formik.errors.dealer_license_number
                      )
                    }
                  >
                    {formik.errors.dealer_license_number}
                  </HelperText>

                  <View style={styles.locationRow}>
                    <TextInput
                      label="City"
                      value={formik.values.dealer_city}
                      onChangeText={formik.handleChange("dealer_city")}
                      onBlur={formik.handleBlur("dealer_city")}
                      error={
                        !!(
                          formik.touched.dealer_city &&
                          formik.errors.dealer_city
                        )
                      }
                      left={<TextInput.Icon icon="city" />}
                      mode="outlined"
                      style={styles.locationInput}
                    />
                    <TextInput
                      label="Region"
                      value={formik.values.dealer_region}
                      onChangeText={formik.handleChange("dealer_region")}
                      onBlur={formik.handleBlur("dealer_region")}
                      error={
                        !!(
                          formik.touched.dealer_region &&
                          formik.errors.dealer_region
                        )
                      }
                      left={<TextInput.Icon icon="map-marker" />}
                      mode="outlined"
                      style={styles.locationInput}
                    />
                  </View>

                  <TextInput
                    label="Business Address"
                    value={formik.values.dealer_address}
                    onChangeText={formik.handleChange("dealer_address")}
                    onBlur={formik.handleBlur("dealer_address")}
                    error={
                      !!(
                        formik.touched.dealer_address &&
                        formik.errors.dealer_address
                      )
                    }
                    left={<TextInput.Icon icon="home-map-marker" />}
                    mode="outlined"
                    multiline
                    numberOfLines={2}
                    style={styles.inputSpacing}
                  />
                </>
              )}

              {/* Terms and Conditions */}
              <View style={styles.termsContainer}>
                <Text variant="bodySmall" style={styles.termsText}>
                  By creating an account, you agree to our{" "}
                  <Text
                    style={[styles.termsLink, { color: theme.colors.primary }]}
                  >
                    Terms of Service
                  </Text>{" "}
                  and{" "}
                  <Text
                    style={[styles.termsLink, { color: theme.colors.primary }]}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </View>

              {/* Register Button */}
              <Button
                mode="contained"
                onPress={() => formik.handleSubmit()}
                loading={isLoading}
                disabled={isLoading}
                style={styles.registerButton}
                icon="account-plus"
                contentStyle={styles.buttonContent}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>

              {/* Already have account */}
              <View style={styles.loginContainer}>
                <Text variant="bodyMedium">Already have an account? </Text>
                <Button
                  mode="text"
                  onPress={() => router.push("/(auth)/login")}
                  compact
                  textColor={theme.colors.primary}
                >
                  Sign In
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Features Preview */}
          <View style={styles.featuresContainer}>
            <Text variant="titleSmall" style={styles.featuresTitle}>
              Why Join EthioCars?
            </Text>
            <View style={styles.featuresGrid}>
              <View style={styles.featureItem}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={24}
                  color="#10B981"
                />
                <Text variant="bodySmall" style={styles.featureText}>
                  Verified Sellers
                </Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialCommunityIcons name="car" size={24} color="#3B82F6" />
                <Text variant="bodySmall" style={styles.featureText}>
                  Thousands of Cars
                </Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={24}
                  color="#DC2626"
                />
                <Text variant="bodySmall" style={styles.featureText}>
                  All Ethiopian Regions
                </Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialCommunityIcons
                  name="message-text"
                  size={24}
                  color="#8B5CF6"
                />
                <Text variant="bodySmall" style={styles.featureText}>
                  Secure Messaging
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoContainer: {
    position: "relative",
    marginBottom: 16,
  },
  logo: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoText: {
    position: "absolute",
    top: 20,
    left: 20,
    fontSize: 24,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.7,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  accountTypeSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 8,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  chip: {
    flex: 1,
    height: 44,
    justifyContent: "center",
  },
  divider: {
    marginVertical: 16,
  },
  nameRow: {
    flexDirection: "row",
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  errorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputSpacing: {
    marginTop: 8,
  },
  locationRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  locationInput: {
    flex: 1,
  },
  termsContainer: {
    marginVertical: 20,
    paddingHorizontal: 8,
  },
  termsText: {
    textAlign: "center",
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: "bold",
  },
  registerButton: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 6,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  featuresContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  featuresTitle: {
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  featureItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 1,
  },
  featureText: {
    marginTop: 8,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default RegisterScreen;
