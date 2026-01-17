import { useRouter } from "expo-router";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
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
  Divider,
  HelperText,
  IconButton,
  Snackbar,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuthStore } from "../../features/auth/auth.store";
import { useThemeStore } from "../../features/theme/theme.store";
import {
  commonFontSizes,
  commonSpacing,
  getDynamicWidth,
  getSpacing,
} from "../../utils/responsive";
import { LoginFormData, loginSchema } from "../../utils/validation";

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const { login, isLoading, error, clearError, isAuthenticated } =
    useAuthStore();
  const { isDarkMode } = useThemeStore();
  const [showPassword, setShowPassword] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Staggered animations
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle navigation after successful login
  useEffect(() => {
    if (isAuthenticated) {
      // Show success message briefly before navigating
      setShowSuccessMessage(true);
      setTimeout(() => {
        router.replace("/(tabs)"); // Go directly to home screen
      }, 1500); // Show message for 1.5 seconds
    }
  }, [isAuthenticated, router]);

  // Handle error messages
  useEffect(() => {
    if (error) {
      // Error is now properly normalized in the auth store
      // No additional handling needed here
    }
  }, [error]);

  const formik = useFormik<LoginFormData>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        clearError();
        setShowSuccessMessage(false);
        await login(values);
      } catch (err) {
        // Error handled by store - stays on login screen
      }
    },
  });

  const handleForgotPassword = () => {
    Alert.alert(
      "Coming Soon",
      "Password reset feature will be available soon!",
      [{ text: "OK", style: "cancel" }],
    );
  };

  const handleSignUp = () => {
    router.push("/(auth)/register");
  };

  const handleBackToHome = () => {
    router.replace("/(tabs)");
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
  };

  const handleAppleLogin = () => {
    // TODO: Implement Apple Sign In
  };

  // Animation styles
  const fadeIn = {
    opacity: fadeAnim,
  };

  const slideUp = {
    opacity: slideAnim,
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
  };

  const features = [
    { icon: "shield-check", label: "Secure", color: "#10B981" },
    { icon: "car", label: "10K+ Cars", color: "#3B82F6" },
    { icon: "map-marker", label: "Ethiopia", color: "#DC2626" },
    { icon: "star", label: "Verified", color: "#F59E0B" },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Back Button */}
      <View style={styles.backButtonContainer}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={theme.colors.onSurface}
          onPress={handleBackToHome}
          style={styles.backButton}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Background Decorative Elements */}
        <Animated.View style={[styles.backgroundCircle, fadeIn]} />
        <Animated.View style={[styles.backgroundCircle2, fadeIn]} />

        <Animated.View style={[styles.content, slideUp]}>
          {/* Header Section */}
          <View style={styles.header}>
            <Animated.View style={[styles.logoContainer, fadeIn]}>
              <Avatar.Icon
                size={100}
                icon="car"
                color={theme.colors.onPrimary}
                style={[styles.logo, { backgroundColor: theme.colors.primary }]}
              />
              <MaterialCommunityIcons
                name="car-sports"
                size={40}
                color={theme.colors.onPrimary}
                style={styles.carIcon}
              />
            </Animated.View>

            <Text
              variant="headlineLarge"
              style={[styles.title, { color: theme.colors.onSurface }]}
            >
              Welcome to EthioCars
            </Text>
            <Text
              variant="bodyLarge"
              style={[
                styles.subtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Sign in to access Ethiopia's largest automotive marketplace
            </Text>
          </View>

          {/* Login Card */}
          <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            elevation={4}
          >
            <Card.Content>
              <Text
                variant="titleLarge"
                style={[styles.cardTitle, { color: theme.colors.onSurface }]}
              >
                Sign In to Your Account
              </Text>

              {/* Email Input */}
              <TextInput
                label="Email Address"
                value={formik.values.email}
                onChangeText={formik.handleChange("email")}
                onBlur={formik.handleBlur("email")}
                error={!!(formik.touched.email && formik.errors.email)}
                left={<TextInput.Icon icon="email" />}
                mode="outlined"
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.surface },
                ]}
                keyboardType="email-address"
                autoCapitalize="none"
                outlineColor={isDarkMode ? "#374151" : "#E5E7EB"}
                activeOutlineColor={theme.colors.primary}
                textColor={theme.colors.onSurface}
              />
              <HelperText
                type="error"
                visible={!!(formik.touched.email && formik.errors.email)}
              >
                {formik.errors.email}
              </HelperText>

              {/* Password Input */}
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
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.surface },
                ]}
                outlineColor={isDarkMode ? "#374151" : "#E5E7EB"}
                activeOutlineColor={theme.colors.primary}
                textColor={theme.colors.onSurface}
              />
              <HelperText
                type="error"
                visible={!!(formik.touched.password && formik.errors.password)}
              >
                {formik.errors.password}
              </HelperText>

              {/* Forgot Password */}
              <Button
                mode="text"
                onPress={handleForgotPassword}
                style={styles.forgotButton}
                textColor={theme.colors.primary}
                compact
              >
                Forgot Password?
              </Button>

              {/* Login Button */}
              <Button
                mode="contained"
                onPress={() => formik.handleSubmit()}
                loading={isLoading}
                disabled={isLoading}
                style={[
                  styles.loginButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                icon="login"
                contentStyle={styles.buttonContent}
                buttonColor={theme.colors.primary}
                textColor={theme.colors.onPrimary}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <Divider
                  style={[
                    styles.divider,
                    { backgroundColor: isDarkMode ? "#374151" : "#E5E7EB" },
                  ]}
                />
                <Text
                  variant="bodySmall"
                  style={[
                    styles.dividerText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  OR CONTINUE WITH
                </Text>
                <Divider
                  style={[
                    styles.divider,
                    { backgroundColor: isDarkMode ? "#374151" : "#E5E7EB" },
                  ]}
                />
              </View>

              {/* Social Login */}
              <View style={styles.socialContainer}>
                <Button
                  mode="outlined"
                  onPress={handleGoogleLogin}
                  style={[
                    styles.socialButton,
                    { borderColor: isDarkMode ? "#374151" : "#E5E7EB" },
                  ]}
                  icon={() => (
                    <MaterialCommunityIcons
                      name="google"
                      size={20}
                      color="#DB4437"
                    />
                  )}
                  contentStyle={styles.socialButtonContent}
                  textColor={theme.colors.onSurface}
                >
                  Google
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleAppleLogin}
                  style={[
                    styles.socialButton,
                    { borderColor: isDarkMode ? "#374151" : "#E5E7EB" },
                  ]}
                  icon={() => (
                    <MaterialCommunityIcons
                      name="apple"
                      size={20}
                      color={isDarkMode ? "#FFFFFF" : "#000"}
                    />
                  )}
                  contentStyle={styles.socialButtonContent}
                  textColor={theme.colors.onSurface}
                >
                  Apple
                </Button>
              </View>

              {/* Register Link */}
              <View style={styles.registerContainer}>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Don't have an account?
                </Text>
                <Button
                  mode="text"
                  onPress={handleSignUp}
                  textColor={theme.colors.primary}
                  compact
                  style={styles.registerButton}
                >
                  Create Account
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Features Showcase */}
          <Surface
            style={[
              styles.featuresSurface,
              { backgroundColor: theme.colors.surface },
            ]}
            elevation={2}
          >
            <Text
              variant="titleSmall"
              style={[styles.featuresTitle, { color: theme.colors.onSurface }]}
            >
              Why Choose EthioCars?
            </Text>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <Animated.View
                  key={feature.label}
                  style={[
                    styles.featureItem,
                    {
                      opacity: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                      transform: [
                        {
                          translateY: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [30, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.featureIconContainer,
                      { backgroundColor: `${feature.color}15` },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={feature.icon as any}
                      size={24}
                      color={feature.color}
                    />
                  </View>
                  <Text
                    variant="bodySmall"
                    style={[
                      styles.featureLabel,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {feature.label}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </Surface>
        </Animated.View>
      </ScrollView>

      {/* Success Message */}
      <Snackbar
        visible={showSuccessMessage}
        onDismiss={() => setShowSuccessMessage(false)}
        duration={1500}
        style={{ backgroundColor: "#10B981" }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          Login Successful! Redirecting to home...
        </Text>
      </Snackbar>

      {/* Error Message */}
      <Snackbar
        visible={!!error}
        onDismiss={clearError}
        duration={4000}
        style={{ backgroundColor: "#EF4444" }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          {error === "Login failed" || error === "Invalid credentials"
            ? "Invalid Credentials"
            : error}
        </Text>
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButtonContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  backgroundCircle: {
    position: "absolute",
    width: getDynamicWidth(280, 350, 420),
    height: getDynamicWidth(280, 350, 420),
    borderRadius: getDynamicWidth(210, 262, 315),
    backgroundColor: "#FEE2E2",
    top: getDynamicWidth(-140, -175, -210),
    left: getDynamicWidth(-70, -87, -105),
    opacity: 0.3,
  },
  backgroundCircle2: {
    position: "absolute",
    width: getDynamicWidth(200, 250, 300),
    height: getDynamicWidth(200, 250, 300),
    borderRadius: getDynamicWidth(100, 125, 150),
    backgroundColor: "#E0E7FF",
    top: getDynamicWidth(-100, -125, -150),
    left: getDynamicWidth(-50, -62, -75),
    opacity: 0.2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoContainer: {
    position: "relative",
    marginBottom: 20,
  },
  logo: {
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  carIcon: {
    position: "absolute",
    bottom: -10,
    right: -10,
    backgroundColor: "#DC2626",
    borderRadius: 20,
    padding: 4,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#1F2937",
  },
  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    maxWidth: "80%",
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: commonSpacing.card,
    marginHorizontal: commonSpacing.container,
  },
  cardTitle: {
    textAlign: "center",
    marginBottom: commonSpacing.medium,
    fontWeight: "600",
    color: "#374151",
    fontSize: commonFontSizes.large,
  },
  input: {
    marginBottom: commonSpacing.small,
    backgroundColor: "#fff",
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: commonSpacing.small,
    marginBottom: commonSpacing.medium,
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: getSpacing(4, 6, 8),
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: getSpacing(6, 8, 10),
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: commonSpacing.medium,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    paddingHorizontal: 16,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  socialContainer: {
    flexDirection: "row",
    gap: commonSpacing.small,
    marginBottom: commonSpacing.card,
  },
  socialButton: {
    flex: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
  },
  socialButtonContent: {
    paddingVertical: getSpacing(4, 6, 8),
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: commonSpacing.small,
  },
  registerButton: {
    marginLeft: commonSpacing.small,
  },
  featuresSurface: {
    borderRadius: 16,
    padding: commonSpacing.container,
    marginBottom: commonSpacing.card,
    backgroundColor: "#FFFFFF",
  },
  featuresTitle: {
    textAlign: "center",
    marginBottom: commonSpacing.medium,
    fontWeight: "600",
    color: "#374151",
    fontSize: commonFontSizes.large,
  },
  featuresGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: commonSpacing.medium,
  },
  featureItem: {
    alignItems: "center",
    minWidth: "22%",
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  featureLabel: {
    textAlign: "center",
    fontWeight: "500",
    color: "#4B5563",
  },
  testimonialCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  testimonialContent: {
    alignItems: "center",
  },
  quoteIcon: {
    marginBottom: 12,
    opacity: 0.8,
  },
  testimonialText: {
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 20,
    color: "#4B5563",
    lineHeight: 22,
  },
  testimonialAuthor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontWeight: "600",
    color: "#1F2937",
  },
  authorLocation: {
    color: "#6B7280",
  },
});

export default LoginScreen;
