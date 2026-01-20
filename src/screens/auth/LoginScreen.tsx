import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import {
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
  HelperText,
  IconButton,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuthStore } from "../../features/auth/auth.store";
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
      setTimeout(async () => {
        try {
          // Check if there's a stored redirect path
          const redirectPath = await SecureStore.getItemAsync(
            "redirect_after_login",
          );
          if (redirectPath) {
            // Clear stored redirect
            await SecureStore.deleteItemAsync("redirect_after_login");
            // Navigate to intended destination
            router.replace(redirectPath);
          } else {
            // Default to home screen
            router.replace("/(tabs)");
          }
        } catch (error) {
          console.error("Error checking redirect path:", error);
          router.replace("/(tabs)");
        }
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

  const handleSignUp = () => {
    router.push("/(auth)/register");
  };

  const handleBackToHome = () => {
    router.replace("/(tabs)");
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
                outlineColor="#E5E7EB"
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
                outlineColor="#E5E7EB"
                activeOutlineColor={theme.colors.primary}
                textColor={theme.colors.onSurface}
              />
              <HelperText
                type="error"
                visible={!!(formik.touched.password && formik.errors.password)}
              >
                {formik.errors.password}
              </HelperText>

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
  loginButton: {
    borderRadius: 12,
    paddingVertical: getSpacing(4, 6, 8),
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: getSpacing(6, 8, 10),
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
