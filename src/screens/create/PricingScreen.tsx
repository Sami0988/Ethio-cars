import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  Animated,
  Alert,
  Platform,
} from "react-native";
import { Button, Switch, useTheme } from "react-native-paper";
import { VehicleData } from "../../types/vehicle";

interface PricingScreenProps {
  onContinue?: () => void;
  onBack?: () => void;
  vehicleData?: VehicleData;
  updateVehicleData?: (updates: Partial<VehicleData>) => void;
}

export default function PricingScreen({
  onContinue,
  onBack,
  vehicleData,
  updateVehicleData,
}: PricingScreenProps) {
  const theme = useTheme();
  const { width, height } = Dimensions.get("window");
  const isSmallScreen = width < 375;
  const isTablet = width > 768;

  const styles = getDynamicStyles(theme, width, height);

  const [price, setPrice] = useState(vehicleData?.price || "550000");
  const [isNegotiable, setIsNegotiable] = useState(
    vehicleData?.negotiable ?? true
  );
  const [isPriceInputFocused, setIsPriceInputFocused] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [marketTip, setMarketTip] = useState("");
  const [hasPriceLimitAlert, setHasPriceLimitAlert] = useState(false);

  const priceInputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const numPrice = parseInt(price) || 0;

    // Calculate market tip
    setIsCalculating(true);
    setTimeout(() => {
      if (numPrice === 0) {
        setMarketTip("💡 Enter a price to see market insights");
      } else if (numPrice < 100000) {
        setMarketTip("💰 Very affordable! Great for budget buyers.");
      } else if (numPrice < 300000) {
        setMarketTip("📈 Good value! Should attract quick interest.");
      } else if (numPrice < 500000) {
        setMarketTip("🎯 Competitive pricing. Well-positioned in the market.");
      } else if (numPrice < 1000000) {
        setMarketTip(
          "⚡ Premium range. Highlight your vehicle's best features."
        );
      } else if (numPrice < 5000000) {
        setMarketTip(
          "🏆 Luxury pricing. Consider professional photos and certification."
        );
      } else {
        setMarketTip(
          "💎 Exclusive range. Target specialized buyers with premium features."
        );
      }
      setIsCalculating(false);
    }, 300);
  }, [price]);

  const formatPriceForDisplay = (value: string) => {
    const num = parseInt(value) || 0;
    if (num === 0) return "0";
    if (num >= 1000000) {
      const millions = num / 1000000;
      return millions % 1 === 0
        ? `${millions.toFixed(0)}M`
        : `${millions.toFixed(1)}M`;
    }
    if (num >= 1000) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return num.toString();
  };

  const formatFullPrice = (value: string) => {
    const num = parseInt(value) || 0;
    if (num === 0) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getPricePosition = () => {
    const num = parseInt(price) || 0;
    if (num === 0)
      return { position: 0, label: "Set Price", color: theme.colors.outline };
    if (num < 100000) return { position: 10, label: "Entry", color: "#10B981" };
    if (num < 300000) return { position: 25, label: "Value", color: "#22C55E" };
    if (num < 500000) return { position: 40, label: "Fair", color: "#3B82F6" };
    if (num < 1000000)
      return { position: 60, label: "Premium", color: "#F59E0B" };
    if (num < 5000000)
      return { position: 75, label: "Luxury", color: "#EF4444" };
    if (num < 10000000)
      return { position: 85, label: "Premium+", color: "#8B5CF6" };
    return { position: 95, label: "Exclusive", color: "#EC4899" };
  };

  const priceInfo = getPricePosition();

  const handleContinue = () => {
    const priceData = {
      price: parseInt(price) || 0,
      isNegotiable,
      marketPosition: priceInfo.label,
    };

    console.log("Pricing data submitted:", priceData);

    if (updateVehicleData) {
      updateVehicleData({
        price: price,
        negotiable: isNegotiable,
      });
    }

    if (onContinue) {
      onContinue();
    }
  };

  const handlePriceChange = (text: string) => {
    // Remove commas and other non-numeric characters
    const cleanedText = text.replace(/[^0-9]/g, "");

    // Check if exceeds 100,000,000 (9 digits)
    if (cleanedText.length <= 9) {
      setPrice(cleanedText);

      // Show alert when approaching limit
      if (cleanedText.length === 9 && !hasPriceLimitAlert) {
        setHasPriceLimitAlert(true);
        Alert.alert("Maximum Reached", "Maximum price is 100,000,000 ETB", [
          { text: "OK" },
        ]);
      }
    }
  };

  const handleBackPress = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleQuickPrice = (amount: string) => {
    setPrice(amount);
    if (priceInputRef.current) {
      priceInputRef.current.blur();
    }
  };

  const handleClearPrice = () => {
    setPrice("");
    if (priceInputRef.current) {
      priceInputRef.current.focus();
    }
  };

  const handleSuggestPrice = () => {
    // Suggest a price based on market average
    const suggestedPrice = "650000";
    setPrice(suggestedPrice);
    Alert.alert(
      "Smart Suggestion",
      `Based on market data, we suggest ${formatPriceForDisplay(suggestedPrice)} ETB for optimal results.`,
      [{ text: "OK" }]
    );
  };

  const quickPrices = [
    { label: "300K", value: "300000", icon: "cash-outline" },
    { label: "500K", value: "500000", icon: "wallet-outline" },
    { label: "750K", value: "750000", icon: "diamond-outline" },
    { label: "1M", value: "1000000", icon: "trophy-outline" },
  ];

  const steps = [
    { number: 1, label: "Basics", completed: true },
    { number: 2, label: "Pricing", completed: false },
    { number: 3, label: "Details", completed: false },
    { number: 4, label: "Photos", completed: false },
    { number: 5, label: "Location", completed: false },
    { number: 6, label: "Review", completed: false },
    { number: 7, label: "Publish", completed: false },
  ];

  const currentStep = 2;

  // Features below the button
  const features = [
    {
      icon: "shield-checkmark",
      title: "Price Protection",
      description: "We'll notify you if similar cars sell for more",
      color: "#10B981",
    },
    {
      icon: "trending-up",
      title: "Market Analytics",
      description: "Real-time insights on price trends",
      color: "#3B82F6",
    },
    {
      icon: "people",
      title: "Buyer Matching",
      description: "We'll match you with serious buyers",
      color: "#8B5CF6",
    },
    {
      icon: "timer",
      title: "Quick Sale Guide",
      description: "Tips to sell 30% faster",
      color: "#F59E0B",
    },
  ];

  return (
    <View style={styles.fullScreen}>
      <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.elevation.level1}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons
            name="chevron-back"
            size={isTablet ? 28 : 24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text
            style={[styles.headerTitle, { color: theme.colors.onBackground }]}
          >
            Pricing
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Step {currentStep} of {steps.length}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSuggestPrice}
          style={styles.suggestButton}
        >
          <Text style={[styles.suggestText, { color: theme.colors.primary }]}>
            Suggest
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Step Indicator */}
        <View style={styles.stepContainer}>
          <View style={styles.stepProgress}>
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <View style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      step.completed
                        ? styles.completedCircle
                        : currentStep === step.number
                          ? styles.activeCircle
                          : styles.inactiveCircle,
                    ]}
                  >
                    {step.completed ? (
                      <Ionicons name="checkmark" size={16} color="white" />
                    ) : (
                      <Text style={styles.stepNumber}>{step.number}</Text>
                    )}
                  </View>
                </View>
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.stepConnector,
                      {
                        backgroundColor: step.completed
                          ? theme.colors.primary
                          : theme.colors.surfaceVariant,
                      },
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
          <Text
            style={[styles.stepText, { color: theme.colors.onSurfaceVariant }]}
          >
            Set your price • Next: Vehicle Details
          </Text>
        </View>

        {/* Main Title */}
        <View style={styles.titleContainer}>
          <Text
            style={[styles.mainTitle, { color: theme.colors.onBackground }]}
          >
            Set Your Price
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Smart pricing = Faster sale
          </Text>
        </View>

        {/* Price Input Section */}
        <View style={styles.priceSection}>
          <View style={styles.priceHeader}>
            <Text
              style={[
                styles.priceLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Asking Price (ETB)
            </Text>
            {price && price !== "" && (
              <TouchableOpacity
                onPress={handleClearPrice}
                style={styles.clearButton}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            )}
          </View>

          <View
            style={[
              styles.priceInputContainer,
              isPriceInputFocused && styles.priceInputContainerFocused,
            ]}
          >
            <TextInput
              ref={priceInputRef}
              style={[styles.priceInput, { color: theme.colors.onBackground }]}
              value={formatFullPrice(price)}
              onChangeText={handlePriceChange}
              keyboardType="number-pad"
              maxLength={12} // Allow for commas in display
              selectTextOnFocus={false}
              placeholder="0"
              placeholderTextColor={theme.colors.onSurfaceVariant + "80"}
              onFocus={() => setIsPriceInputFocused(true)}
              onBlur={() => setIsPriceInputFocused(false)}
              returnKeyType="done"
              contextMenuHidden={false}
              autoCorrect={false}
              spellCheck={false}
            />
            <Text
              style={[
                styles.currencyLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              ETB
            </Text>
          </View>

          {price && parseInt(price) > 0 && (
            <Text
              style={[styles.formattedPrice, { color: theme.colors.primary }]}
            >
              {formatPriceForDisplay(price)} Ethiopian Birr
            </Text>
          )}

          {/* Quick Price Buttons */}
          <View style={styles.quickPriceContainer}>
            <Text
              style={[
                styles.quickPriceLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Quick select:
            </Text>
            <View style={styles.quickPriceButtons}>
              {quickPrices.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.quickPriceButton,
                    price === item.value && styles.quickPriceButtonActive,
                  ]}
                  onPress={() => handleQuickPrice(item.value)}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={
                      price === item.value ? "white" : theme.colors.primary
                    }
                  />
                  <Text
                    style={[
                      styles.quickPriceText,
                      {
                        color:
                          price === item.value
                            ? "white"
                            : theme.colors.onSurface,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Negotiable Toggle */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleContent}>
              <Text
                style={[styles.toggleLabel, { color: theme.colors.onSurface }]}
              >
                Open to offers
              </Text>
              <Text
                style={[
                  styles.toggleDescription,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {isNegotiable ? "Buyers can negotiate" : "Fixed price only"}
              </Text>
            </View>
            <Switch
              value={isNegotiable}
              onValueChange={setIsNegotiable}
              color={theme.colors.primary}
              trackColor={{
                false: theme.colors.surfaceVariant,
                true: theme.colors.primary + "40",
              }}
            />
          </View>
        </View>

        {/* Market Insight Card */}
        <View
          style={[
            styles.insightCard,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.insightHeader}>
            <Ionicons name="analytics" size={24} color={theme.colors.primary} />
            <Text
              style={[styles.insightTitle, { color: theme.colors.onSurface }]}
            >
              Market Position
            </Text>
            <View
              style={[
                styles.marketBadge,
                { backgroundColor: priceInfo.color + "20" },
              ]}
            >
              <Text
                style={[styles.marketBadgeText, { color: priceInfo.color }]}
              >
                {priceInfo.label}
              </Text>
            </View>
          </View>

          {/* Price Range Bar */}
          <View style={styles.rangeContainer}>
            <View style={styles.rangeBar}>
              <View
                style={[
                  styles.rangeBackground,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              />
              <View
                style={[
                  styles.rangeFill,
                  {
                    width: `${priceInfo.position}%`,
                    backgroundColor: priceInfo.color + "40",
                  },
                ]}
              />
              <View
                style={[
                  styles.priceIndicator,
                  {
                    left: `${priceInfo.position}%`,
                    backgroundColor: priceInfo.color,
                  },
                ]}
              >
                <View style={styles.indicatorDot} />
              </View>
            </View>

            <View style={styles.rangeLabels}>
              <Text
                style={[
                  styles.rangeLabelItem,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Low
              </Text>
              <Text
                style={[
                  styles.rangeLabelItem,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Fair
              </Text>
              <Text
                style={[
                  styles.rangeLabelItem,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                High
              </Text>
            </View>
          </View>

          {/* Market Tip */}
          <View style={styles.tipContainer}>
            <Ionicons
              name="bulb-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={[styles.tipText, { color: theme.colors.onSurface }]}>
              {marketTip}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text
                style={[styles.statValue, { color: theme.colors.onSurface }]}
              >
                {isNegotiable ? "47%" : "32%"}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Faster sale
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text
                style={[styles.statValue, { color: theme.colors.onSurface }]}
              >
                {parseInt(price) > 500000 ? "28%" : "42%"}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Buyer interest
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text
                style={[styles.statValue, { color: theme.colors.onSurface }]}
              >
                {priceInfo.position > 60 ? "High" : "Medium"}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Competition
              </Text>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text
            style={[styles.featuresTitle, { color: theme.colors.onBackground }]}
          >
            Pricing Features
          </Text>
          <Text
            style={[
              styles.featuresSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Get the most out of your listing
          </Text>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View
                key={index}
                style={[
                  styles.featureCard,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: feature.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={feature.icon as any}
                    size={24}
                    color={feature.color}
                  />
                </View>
                <Text
                  style={[
                    styles.featureTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {feature.title}
                </Text>
                <Text
                  style={[
                    styles.featureDescription,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <TouchableOpacity
            style={[
              styles.helpCard,
              { backgroundColor: theme.colors.primary + "10" },
            ]}
          >
            <Ionicons
              name="help-circle"
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.helpContent}>
              <Text
                style={[styles.helpTitle, { color: theme.colors.onSurface }]}
              >
                Need help pricing?
              </Text>
              <Text
                style={[
                  styles.helpText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Get a free valuation from our experts
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleContinue}
          style={[styles.nextButton, { backgroundColor: theme.colors.primary }]}
          labelStyle={[styles.buttonLabel, { color: theme.colors.onPrimary }]}
          contentStyle={styles.buttonContent}
          disabled={!price || parseInt(price) === 0}
        >
          Continue to Details
        </Button>

        {/* Features below button */}
        <View style={styles.buttonFeatures}>
          <View style={styles.buttonFeatureItem}>
            <Ionicons
              name="shield-checkmark"
              size={16}
              color={theme.colors.primary}
            />
            <Text
              style={[
                styles.buttonFeatureText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Price protected
            </Text>
          </View>
          <View style={styles.buttonFeatureDivider} />
          <View style={styles.buttonFeatureItem}>
            <Ionicons name="refresh" size={16} color={theme.colors.primary} />
            <Text
              style={[
                styles.buttonFeatureText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Editable anytime
            </Text>
          </View>
          <View style={styles.buttonFeatureDivider} />
          <View style={styles.buttonFeatureItem}>
            <Ionicons
              name="trending-up"
              size={16}
              color={theme.colors.primary}
            />
            <Text
              style={[
                styles.buttonFeatureText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Market insights
            </Text>
          </View>
        </View>

        <Text
          style={[styles.footerNote, { color: theme.colors.onSurfaceVariant }]}
        >
          Next: Add vehicle details, photos, and specifications
        </Text>
      </View>
    </View>
  );
}

const getDynamicStyles = (
  theme: any,
  screenWidth: number,
  screenHeight: number
) => {
  const isSmallScreen = screenWidth < 375;
  const isTablet = screenWidth > 768;

  return StyleSheet.create({
    fullScreen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: isSmallScreen ? 16 : 20,
      paddingTop: Platform.OS === "ios" ? 50 : 30,
      paddingBottom: 16,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline + "20",
    },
    backButton: {
      padding: 4,
    },
    headerCenter: {
      flex: 1,
      alignItems: "center",
    },
    headerTitle: {
      fontSize: isSmallScreen ? 18 : 20,
      fontWeight: "700",
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    suggestButton: {
      padding: 8,
    },
    suggestText: {
      fontSize: 14,
      fontWeight: "600",
    },
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: isSmallScreen ? 16 : 20,
      paddingTop: 16,
      paddingBottom: 180,
    },
    stepContainer: {
      marginBottom: 24,
    },
    stepProgress: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    stepItem: {
      alignItems: "center",
    },
    stepCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
    },
    inactiveCircle: {
      borderColor: theme.colors.surfaceVariant,
      backgroundColor: "transparent",
    },
    activeCircle: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    completedCircle: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    stepNumber: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.onSurfaceVariant,
    },
    stepConnector: {
      width: 30,
      height: 2,
      marginHorizontal: 4,
    },
    stepText: {
      fontSize: 12,
      textAlign: "center",
    },
    titleContainer: {
      marginBottom: 24,
    },
    mainTitle: {
      fontSize: isSmallScreen ? 24 : 28,
      fontWeight: "800",
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    priceSection: {
      marginBottom: 24,
    },
    priceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    priceLabel: {
      fontSize: 14,
      fontWeight: "600",
    },
    clearButton: {
      padding: 4,
    },
    priceInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.colors.outline,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      marginBottom: 8,
    },
    priceInputContainerFocused: {
      borderColor: theme.colors.primary,
    },
    priceInput: {
      fontSize: isSmallScreen ? 32 : 36,
      fontWeight: "700",
      flex: 1,
      padding: 0,
      margin: 0,
      includeFontPadding: false,
    },
    currencyLabel: {
      fontSize: 18,
      fontWeight: "600",
      marginLeft: 8,
    },
    formattedPrice: {
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 16,
    },
    quickPriceContainer: {
      marginTop: 8,
    },
    quickPriceLabel: {
      fontSize: 13,
      fontWeight: "500",
      marginBottom: 12,
    },
    quickPriceButtons: {
      flexDirection: "row",
      gap: 12,
    },
    quickPriceButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    quickPriceButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    quickPriceText: {
      fontSize: 14,
      fontWeight: "600",
    },
    toggleCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.outline + "20",
    },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    toggleContent: {
      flex: 1,
    },
    toggleLabel: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 2,
    },
    toggleDescription: {
      fontSize: 13,
    },
    insightCard: {
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.outline + "20",
    },
    insightHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    insightTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginLeft: 12,
      flex: 1,
    },
    marketBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    marketBadgeText: {
      fontSize: 12,
      fontWeight: "700",
    },
    rangeContainer: {
      marginBottom: 20,
    },
    rangeBar: {
      height: 12,
      position: "relative",
      marginBottom: 12,
      borderRadius: 6,
      overflow: "hidden",
    },
    rangeBackground: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 12,
      borderRadius: 6,
    },
    rangeFill: {
      position: "absolute",
      top: 0,
      left: 0,
      height: 12,
      borderRadius: 6,
    },
    priceIndicator: {
      position: "absolute",
      top: -4,
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 3,
      borderColor: theme.colors.background,
      justifyContent: "center",
      alignItems: "center",
      transform: [{ translateX: -10 }],
    },
    indicatorDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "white",
    },
    rangeLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    rangeLabelItem: {
      fontSize: 12,
      fontWeight: "500",
    },
    tipContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.primary + "08",
      marginBottom: 20,
    },
    tipText: {
      fontSize: 14,
      flex: 1,
      marginLeft: 12,
      lineHeight: 20,
    },
    statsGrid: {
      flexDirection: "row",
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 16,
    },
    statItem: {
      flex: 1,
      alignItems: "center",
    },
    statValue: {
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: "500",
      textAlign: "center",
    },
    statDivider: {
      width: 1,
      backgroundColor: theme.colors.outline + "40",
      marginHorizontal: 16,
    },
    featuresSection: {
      marginBottom: 24,
    },
    featuresTitle: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 4,
    },
    featuresSubtitle: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 16,
    },
    featuresGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    featureCard: {
      width: (screenWidth - 52) / 2,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.outline + "20",
    },
    featureIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    featureTitle: {
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 4,
    },
    featureDescription: {
      fontSize: 12,
      lineHeight: 16,
    },
    helpSection: {
      marginBottom: 24,
    },
    helpCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 16,
    },
    helpContent: {
      flex: 1,
      marginLeft: 12,
      marginRight: 8,
    },
    helpTitle: {
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 2,
    },
    helpText: {
      fontSize: 13,
    },
    spacer: {
      height: 20,
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: isSmallScreen ? 16 : 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline + "20",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 5,
    },
    nextButton: {
      borderRadius: 14,
      height: 50,
    },
    buttonContent: {
      height: "100%",
    },
    buttonLabel: {
      fontSize: 16,
      fontWeight: "600",
    },
    buttonFeatures: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 12,
      marginBottom: 8,
    },
    buttonFeatureItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    buttonFeatureText: {
      fontSize: 12,
      marginLeft: 4,
    },
    buttonFeatureDivider: {
      width: 1,
      height: 12,
      backgroundColor: theme.colors.outline + "40",
      marginHorizontal: 12,
    },
    footerNote: {
      fontSize: 11,
      textAlign: "center",
    },
  });
};
