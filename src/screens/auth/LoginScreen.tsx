import { useRouter } from "expo-router";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
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
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuthStore } from "../../features/auth/auth.store";
import { LoginFormData, loginSchema } from "../../utils/validation";

const { width } = Dimensions.get("window");

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

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

  const formik = useFormik<LoginFormData>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        clearError();
        await login(values);
      } catch (err) {
        // Error handled by store
      }
    },
  });

  const handleForgotPassword = () => {
    router.push("/screens/auth/ForgotPasswordScreen");
  };

  const handleSignUp = () => {
    router.push("/(auth)/register");
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log("Google login tapped");
  };

  const handleAppleLogin = () => {
    // TODO: Implement Apple Sign In
    console.log("Apple login tapped");
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
                color="#fff"
                style={[styles.logo, { backgroundColor: theme.colors.primary }]}
              />
              <MaterialCommunityIcons
                name="car-sports"
                size={40}
                color="#fff"
                style={styles.carIcon}
              />
            </Animated.View>

            <Text variant="headlineLarge" style={styles.title}>
              Welcome to EthioCars
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Sign in to access Ethiopia's largest automotive marketplace
            </Text>
          </View>

          {/* Login Card */}
          <Card style={styles.card} elevation={4}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
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
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                outlineColor="#E5E7EB"
                activeOutlineColor={theme.colors.primary}
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
                style={styles.input}
                outlineColor="#E5E7EB"
                activeOutlineColor={theme.colors.primary}
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
                style={styles.loginButton}
                icon="login"
                contentStyle={styles.buttonContent}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <Divider style={styles.divider} />
                <Text variant="bodySmall" style={styles.dividerText}>
                  OR CONTINUE WITH
                </Text>
                <Divider style={styles.divider} />
              </View>

              {/* Social Login */}
              <View style={styles.socialContainer}>
                <Button
                  mode="outlined"
                  onPress={handleGoogleLogin}
                  style={styles.socialButton}
                  icon={() => (
                    <MaterialCommunityIcons
                      name="google"
                      size={20}
                      color="#DB4437"
                    />
                  )}
                  contentStyle={styles.socialButtonContent}
                >
                  Google
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleAppleLogin}
                  style={styles.socialButton}
                  icon={() => (
                    <MaterialCommunityIcons
                      name="apple"
                      size={20}
                      color="#000"
                    />
                  )}
                  contentStyle={styles.socialButtonContent}
                >
                  Apple
                </Button>
              </View>

              {/* Register Link */}
              <View style={styles.registerContainer}>
                <Text variant="bodyMedium">Don't have an account?</Text>
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
          <Surface style={styles.featuresSurface} elevation={2}>
            <Text variant="titleSmall" style={styles.featuresTitle}>
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
                  <Text variant="bodySmall" style={styles.featureLabel}>
                    {feature.label}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </Surface>
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
    paddingBottom: 40,
  },
  backgroundCircle: {
    position: "absolute",
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: "#FEE2E2",
    top: -width * 0.5,
    left: -width * 0.25,
    opacity: 0.3,
  },
  backgroundCircle2: {
    position: "absolute",
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: "#DBEAFE",
    top: -width * 0.3,
    right: -width * 0.3,
    opacity: 0.3,
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
    marginBottom: 24,
  },
  cardTitle: {
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: 4,
    marginBottom: 20,
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 6,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
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
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
  },
  socialButtonContent: {
    paddingVertical: 6,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  registerButton: {
    marginLeft: 4,
  },
  featuresSurface: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  featuresTitle: {
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
    color: "#374151",
  },
  featuresGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
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
