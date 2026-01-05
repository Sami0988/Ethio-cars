import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Switch, useTheme } from "react-native-paper";
import { useCreateCar } from "../../features/cars/car.hooks";
import { VehicleData } from "../../types/vehicle";

interface ReviewAndSubmitScreenProps {
  onContinue?: () => void;
  onBack?: () => void;
  vehicleData?: VehicleData;
  jumpToStep?: (step: number) => void;
}

export default function ReviewAndSubmitScreen({
  onContinue,
  onBack,
  vehicleData,
  jumpToStep,
}: ReviewAndSubmitScreenProps) {
  const theme = useTheme();
  const { width } = Dimensions.get("window");
  const styles = getDynamicStyles(theme, width);

  // Debug: Log the received vehicleData
  console.log("ReviewAndSubmitScreen - vehicleData received:", vehicleData);

  // API mutation for creating car listing
  const createCarMutation = useCreateCar();

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [publishOption, setPublishOption] = useState("now");
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateSuccess = () => {
    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(successAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleEditSection = (step: number) => {
    if (jumpToStep) {
      jumpToStep(step);
    }
  };

  const handlePublish = async () => {
    if (!termsAccepted) {
      Alert.alert(
        "Terms Required",
        "Please accept the Terms of Service to publish your listing."
      );
      return;
    }

    setIsPublishing(true);

    try {
      // Transform vehicle data to API format
      const apiData = {
        make_id: 1294,
        model_id: 48,
        year: parseInt(vehicleData?.year || "2020"),
        price: parseInt(vehicleData?.price?.replace(/,/g, "") || "0"),
        negotiable: vehicleData?.negotiable || false,
        mileage: parseInt(vehicleData?.mileage?.replace(/,/g, "") || "0"),
        fuel_type: vehicleData?.fuel || "Gasoline",
        transmission: vehicleData?.transmission || "Manual",
        body_type: vehicleData?.body_type || "Sedan",
        drive_type: vehicleData?.drive_type || "FWD",
        condition: vehicleData?.condition || "Good",
        exterior_color: vehicleData?.color || "Silver",
        interior_color: vehicleData?.interior_color || "Black",
        doors: vehicleData?.doors || 4,
        seats: vehicleData?.seats || 5,
        description: vehicleData?.description || "",
        region_id: 1,
        features: vehicleData?.features?.slice(0, 5) || [1, 2, 3, 4, 5],
        images:
          vehicleData?.photos?.slice(0, 4).map((photo, index) => ({
            data: "base64-encoded-image-data-here...",
            type: index === 0 ? "exterior" : "interior",
          })) || [],
      };

      console.log("Publishing listing with API data:", apiData);

      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = await createCarMutation.mutateAsync(apiData);

      console.log("Car listing created successfully:", result);

      // Animate success
      animateSuccess();

      Alert.alert(
        "🎉 Success!",
        "Your car listing has been published successfully.",
        [
          {
            text: "View Listing",
            onPress: onContinue,
            style: "default",
          },
          {
            text: "Share",
            onPress: () => {
              // Share functionality here
              console.log("Share listing");
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Error creating car listing:", error);

      Alert.alert(
        "Publish Failed",
        "There was an error publishing your listing. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = () => {
    console.log("Saving draft...");
    Alert.alert("📁 Draft Saved", "Your listing has been saved as a draft.", [
      { text: "OK" },
    ]);
  };

  const handlePreview = () => {
    console.log("Preview listing...");
    Alert.alert("Preview Mode", "Listing preview would open here", [
      { text: "OK" },
    ]);
  };

  // Calculate listing quality score (mock)
  const calculateListingScore = () => {
    let score = 0;
    if (vehicleData?.make) score += 15;
    if (vehicleData?.model) score += 15;
    if (vehicleData?.year) score += 10;
    if (vehicleData?.price) score += 15;
    if (vehicleData?.photos?.length! >= 3) score += 25;
    if (vehicleData?.features?.length! >= 5) score += 10;
    if (vehicleData?.condition) score += 5;
    if (vehicleData?.color) score += 5;
    return Math.min(score, 100);
  };

  const listingScore = calculateListingScore();
  const getScoreColor = (score: number) => {
    if (score >= 90) return "#10B981";
    if (score >= 70) return "#F59E0B";
    return "#EF4444";
  };
  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    return "Needs Work";
  };

  // Step indicator data
  const steps = [
    { number: 1, label: "Basics", completed: true },
    { number: 2, label: "Pricing", completed: true },
    { number: 3, label: "Technical", completed: true },
    { number: 4, label: "Features", completed: true },
    { number: 5, label: "Photos", completed: true },
    { number: 6, label: "Location", completed: true },
    { number: 7, label: "Review", completed: false },
  ];

  const currentStepIndex = 7;
  const photoCount = vehicleData?.photos?.length || 0;

  const renderSection = (
    title: string,
    step: number,
    children: React.ReactNode
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            {title}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditSection(step)}
        >
          <View
            style={[
              styles.editIcon,
              { backgroundColor: theme.colors.primary + "10" },
            ]}
          >
            <Ionicons name="create" size={16} color={theme.colors.primary} />
          </View>
          <Text style={[styles.editText, { color: theme.colors.primary }]}>
            Edit
          </Text>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );

  return (
    <View style={styles.fullScreen}>
      <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {/* Enhanced Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons
            name="chevron-back"
            size={28}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text
            style={[styles.headerTitle, { color: theme.colors.onBackground }]}
          >
            Review & Publish
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Step {currentStepIndex} • Final Review
          </Text>
        </View>
        <TouchableOpacity onPress={handlePreview} style={styles.previewButton}>
          <Ionicons name="eye" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
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
                        : currentStepIndex === step.number
                          ? styles.activeCircle
                          : styles.inactiveCircle,
                    ]}
                  >
                    {step.completed ? (
                      <Ionicons name="checkmark" size={16} color="white" />
                    ) : (
                      <Text
                        style={[
                          styles.stepNumber,
                          {
                            color:
                              currentStepIndex === step.number
                                ? "white"
                                : theme.colors.onSurfaceVariant,
                          },
                        ]}
                      >
                        {step.number}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      {
                        color:
                          step.completed || currentStepIndex === step.number
                            ? theme.colors.primary
                            : theme.colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {step.label}
                  </Text>
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
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentStepIndex - 1) / (steps.length - 1)) * 100}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* Main Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.titleRow}>
            <Ionicons
              name="checkmark-circle"
              size={32}
              color={theme.colors.primary}
            />
            <View style={styles.titleContent}>
              <Text
                style={[styles.mainTitle, { color: theme.colors.onBackground }]}
              >
                Final Review
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Review your listing before publishing
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Quality Score Card */}
        <View
          style={[styles.scoreCard, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.scoreHeader}>
            <View style={styles.scoreLeft}>
              <Text
                style={[
                  styles.scoreTitle,
                  { color: theme.colors.onBackground },
                ]}
              >
                Listing Quality
              </Text>
              <Text
                style={[
                  styles.scoreLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {getScoreLabel(listingScore)} • Ready to publish
              </Text>
            </View>
            <View
              style={[
                styles.scoreValue,
                { backgroundColor: getScoreColor(listingScore) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.scoreNumber,
                  { color: getScoreColor(listingScore) },
                ]}
              >
                {listingScore}%
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBackground,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <View
                style={[
                  styles.progressFillBar,
                  {
                    width: `${listingScore}%`,
                    backgroundColor: getScoreColor(listingScore),
                  },
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text
                style={[
                  styles.progressLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Needs Work
              </Text>
              <Text
                style={[
                  styles.progressLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Good
              </Text>
              <Text
                style={[
                  styles.progressLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Excellent
              </Text>
            </View>
          </View>

          <View style={styles.qualityTips}>
            <Ionicons name="bulb" size={20} color="#F59E0B" />
            <Text
              style={[styles.qualityTipText, { color: theme.colors.onSurface }]}
            >
              {listingScore >= 90
                ? "🎯 Perfect! Your listing is ready to attract buyers"
                : listingScore >= 70
                  ? "💡 Good job! Consider adding more photos to reach 90%"
                  : "📝 Add more details and photos to improve listing quality"}
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View
            style={[styles.statItem, { backgroundColor: theme.colors.surface }]}
          >
            <View style={[styles.statIcon, { backgroundColor: "#3B82F620" }]}>
              <Ionicons name="images" size={20} color="#3B82F6" />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
              {photoCount}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Photos
            </Text>
          </View>
          <View
            style={[styles.statItem, { backgroundColor: theme.colors.surface }]}
          >
            <View style={[styles.statIcon, { backgroundColor: "#10B98120" }]}>
              <Ionicons name="star" size={20} color="#10B981" />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
              {vehicleData?.features?.length || 0}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Features
            </Text>
          </View>
          <View
            style={[styles.statItem, { backgroundColor: theme.colors.surface }]}
          >
            <View style={[styles.statIcon, { backgroundColor: "#8B5CF620" }]}>
              <Ionicons name="trending-up" size={20} color="#8B5CF6" />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
              {vehicleData?.negotiable ? "Flexible" : "Fixed"}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Price
            </Text>
          </View>
        </View>

        {/* Vehicle Preview Card */}
        <View
          style={[
            styles.previewCard,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.previewHeader}>
            <Text
              style={[
                styles.previewTitle,
                { color: theme.colors.onBackground },
              ]}
            >
              Listing Preview
            </Text>
            <View
              style={[styles.statusBadge, { backgroundColor: "#10B98120" }]}
            >
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={[styles.statusText, { color: "#10B981" }]}>
                Ready
              </Text>
            </View>
          </View>

          {vehicleData?.photos?.[0] ? (
            <Image
              source={{ uri: vehicleData.photos[0] }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.previewImage,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Ionicons
                name="car"
                size={48}
                color={theme.colors.onSurfaceVariant}
              />
            </View>
          )}

          <View style={styles.previewContent}>
            <View style={styles.previewHeaderRow}>
              <Text
                style={[styles.carTitle, { color: theme.colors.onBackground }]}
              >
                {vehicleData?.year} {vehicleData?.make} {vehicleData?.model}
              </Text>
              <View
                style={[
                  styles.conditionBadge,
                  { backgroundColor: theme.colors.primary + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.conditionText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {vehicleData?.condition?.toUpperCase() || "USED"}
                </Text>
              </View>
            </View>

            <Text
              style={[styles.carPrice, { color: theme.colors.onBackground }]}
            >
              {vehicleData?.price
                ? `${parseInt(vehicleData.price).toLocaleString()} ETB`
                : "Price not set"}
            </Text>

            <View style={styles.carSpecs}>
              <View style={styles.specRow}>
                <Ionicons
                  name="speedometer"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.specText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {vehicleData?.mileage
                    ? `${parseInt(vehicleData.mileage).toLocaleString()} km`
                    : "Mileage"}
                </Text>
              </View>
              <View style={styles.specRow}>
                <Ionicons
                  name="git-merge"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.specText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {vehicleData?.transmission || "Transmission"}
                </Text>
              </View>
              <View style={styles.specRow}>
                <Ionicons
                  name="water"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.specText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {vehicleData?.fuel || "Fuel"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Basic Information */}
        {renderSection(
          "Basic Information",
          1,
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Make & Model
              </Text>
              <Text
                style={[styles.detailValue, { color: theme.colors.onSurface }]}
              >
                {vehicleData?.make} {vehicleData?.model}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Year
              </Text>
              <Text
                style={[styles.detailValue, { color: theme.colors.onSurface }]}
              >
                {vehicleData?.year}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Color
              </Text>
              <Text
                style={[styles.detailValue, { color: theme.colors.onSurface }]}
              >
                {vehicleData?.color || "Not specified"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Condition
              </Text>
              <Text
                style={[styles.detailValue, { color: theme.colors.onSurface }]}
              >
                {vehicleData?.condition || "Not specified"}
              </Text>
            </View>
          </View>
        )}

        {/* Technical Details */}
        {renderSection(
          "Technical Details",
          3,
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Transmission
              </Text>
              <Text
                style={[styles.detailValue, { color: theme.colors.onSurface }]}
              >
                {vehicleData?.transmission || "Not specified"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Fuel Type
              </Text>
              <Text
                style={[styles.detailValue, { color: theme.colors.onSurface }]}
              >
                {vehicleData?.fuel || "Not specified"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Body Type
              </Text>
              <Text
                style={[styles.detailValue, { color: theme.colors.onSurface }]}
              >
                {vehicleData?.body_type || "Not specified"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Drive Type
              </Text>
              <Text
                style={[styles.detailValue, { color: theme.colors.onSurface }]}
              >
                {vehicleData?.drive_type || "Not specified"}
              </Text>
            </View>
          </View>
        )}

        {/* Photos */}
        {renderSection(
          "Photos",
          5,
          <View style={styles.photoSection}>
            <Text
              style={[styles.photoCountText, { color: theme.colors.onSurface }]}
            >
              {photoCount} photos uploaded
            </Text>
            {photoCount > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.photoScroll}>
                  {vehicleData?.photos?.map((photo, index) => (
                    <Image
                      key={index}
                      source={{ uri: photo }}
                      style={styles.thumbnail}
                    />
                  ))}
                </View>
              </ScrollView>
            ) : (
              <View style={styles.noPhotos}>
                <Ionicons
                  name="images"
                  size={40}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.noPhotosText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  No photos added
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Publish Settings */}
        <View
          style={[
            styles.settingsCard,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text
            style={[styles.settingsTitle, { color: theme.colors.onBackground }]}
          >
            Publish Settings
          </Text>

          <View style={styles.publishOptions}>
            <TouchableOpacity
              style={[
                styles.publishOption,
                publishOption === "now" && styles.publishOptionSelected,
                publishOption === "now" && {
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => setPublishOption("now")}
            >
              <View style={styles.optionHeader}>
                <Ionicons
                  name={
                    publishOption === "now"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={24}
                  color={
                    publishOption === "now"
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant
                  }
                />
                <Text
                  style={[
                    styles.optionTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Publish Now
                </Text>
              </View>
              <Text
                style={[
                  styles.optionDescription,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                List your vehicle immediately
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.publishOption,
                publishOption === "later" && styles.publishOptionSelected,
                publishOption === "later" && {
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => setPublishOption("later")}
            >
              <View style={styles.optionHeader}>
                <Ionicons
                  name={
                    publishOption === "later"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={24}
                  color={
                    publishOption === "later"
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant
                  }
                />
                <Text
                  style={[
                    styles.optionTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Schedule for Later
                </Text>
              </View>
              <Text
                style={[
                  styles.optionDescription,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Choose a specific date and time
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchContent}>
              <View style={styles.switchHeader}>
                <Ionicons name="notifications" size={20} color="#3B82F6" />
                <Text
                  style={[
                    styles.switchTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Price Alerts
                </Text>
              </View>
              <Text
                style={[
                  styles.switchDescription,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Get notified when similar cars are listed
              </Text>
            </View>
            <Switch
              value={priceAlerts}
              onValueChange={setPriceAlerts}
              color={theme.colors.primary}
              trackColor={{
                false: theme.colors.surfaceVariant,
                true: theme.colors.primary + "40",
              }}
            />
          </View>
        </View>

        {/* Terms & Conditions */}
        <View
          style={[styles.termsCard, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.termsHeader}>
            <Ionicons
              name="shield-checkmark"
              size={24}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.termsTitle, { color: theme.colors.onBackground }]}
            >
              Terms & Conditions
            </Text>
          </View>

          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setTermsAccepted(!termsAccepted)}
          >
            <View
              style={[
                styles.checkbox,
                termsAccepted && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              {termsAccepted && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
            <View style={styles.termsTextContainer}>
              <Text
                style={[styles.termsText, { color: theme.colors.onSurface }]}
              >
                I confirm that all information is accurate and agree to the{" "}
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
          </TouchableOpacity>

          {!termsAccepted && (
            <Text style={[styles.termsWarning, { color: "#EF4444" }]}>
              You must accept the terms to publish your listing
            </Text>
          )}
        </View>

        {/* Success Animation Overlay */}
        <Animated.View
          style={[
            styles.successOverlay,
            {
              opacity: successAnim,
              transform: [
                {
                  scale: successAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <View style={styles.successContainer}>
            <View
              style={[
                styles.successCircle,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Ionicons name="checkmark" size={48} color="white" />
            </View>
          </View>
        </Animated.View>

        {/* Spacer */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        {/* <Button
          mode="outlined"
          onPress={handleSaveDraft}
          style={[styles.draftButton, { borderColor: theme.colors.outline }]}
          labelStyle={[
            styles.draftButtonLabel,
            { color: theme.colors.onSurface },
          ]}
          contentStyle={styles.buttonContent}
          disabled={isPublishing}
        >
          Save as Draft
        </Button> */}
        <Button
          mode="contained"
          onPress={handlePublish}
          style={[
            styles.publishButton,
            {
              backgroundColor: termsAccepted
                ? theme.colors.primary
                : theme.colors.surfaceVariant,
              opacity: termsAccepted ? 1 : 0.6,
            },
          ]}
          labelStyle={[
            styles.publishButtonLabel,
            {
              color: termsAccepted
                ? theme.colors.onPrimary
                : theme.colors.onSurfaceVariant,
            },
          ]}
          contentStyle={styles.buttonContent}
          disabled={!termsAccepted || isPublishing}
        >
          {isPublishing ? (
            <>
              <ActivityIndicator
                size="small"
                color="white"
                style={{ marginRight: 8 }}
              />
              Publishing...
            </>
          ) : (
            <>
              <Ionicons
                name="rocket"
                size={20}
                color={termsAccepted ? "white" : theme.colors.onSurfaceVariant}
                style={{ marginRight: 8 }}
              />
              Publish Listing
            </>
          )}
        </Button>

        {/* Features below button */}
        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <Ionicons
              name="shield-checkmark"
              size={16}
              color={theme.colors.primary}
            />
            <Text
              style={[
                styles.featureText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Protected Listing
            </Text>
          </View>
          <View style={styles.featureDivider} />
          <View style={styles.featureItem}>
            <Ionicons name="sync" size={16} color={theme.colors.primary} />
            <Text
              style={[
                styles.featureText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Editable Anytime
            </Text>
          </View>
          <View style={styles.featureDivider} />
          <View style={styles.featureItem}>
            <Ionicons name="analytics" size={16} color={theme.colors.primary} />
            <Text
              style={[
                styles.featureText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Performance Stats
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const getDynamicStyles = (theme: any, screenWidth: number) => {
  const isSmallScreen = screenWidth < 375;

  return StyleSheet.create({
    fullScreen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: isSmallScreen ? 16 : 20,
      paddingTop: 60,
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
    previewButton: {
      padding: 4,
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
      justifyContent: "space-between",
      marginBottom: 12,
    },
    stepItem: {
      alignItems: "center",
      minWidth: 50,
    },
    stepCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 6,
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
      fontSize: 14,
      fontWeight: "600",
    },
    stepLabel: {
      fontSize: 11,
      fontWeight: "500",
      textAlign: "center",
    },
    stepConnector: {
      flex: 1,
      height: 2,
      maxWidth: 40,
      marginHorizontal: 4,
      marginTop: -20,
    },
    progressBar: {
      height: 4,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 2,
    },
    titleContainer: {
      marginBottom: 20,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    titleContent: {
      flex: 1,
      marginLeft: 12,
    },
    mainTitle: {
      fontSize: isSmallScreen ? 26 : 30,
      fontWeight: "800",
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    scoreCard: {
      padding: 20,
      borderRadius: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.outline + "20",
    },
    scoreHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    scoreLeft: {
      flex: 1,
    },
    scoreTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 4,
    },
    scoreLabel: {
      fontSize: 13,
    },
    scoreValue: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    scoreNumber: {
      fontSize: 18,
      fontWeight: "800",
    },
    progressContainer: {
      marginBottom: 16,
    },
    progressBackground: {
      height: 8,
      borderRadius: 4,
      overflow: "hidden",
      marginBottom: 8,
    },
    progressFillBar: {
      height: "100%",
      borderRadius: 4,
    },
    progressLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    progressLabel: {
      fontSize: 11,
      fontWeight: "500",
    },
    qualityTips: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.primary + "08",
    },
    qualityTipText: {
      fontSize: 13,
      flex: 1,
      marginLeft: 12,
      lineHeight: 18,
    },
    statsGrid: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 24,
    },
    statItem: {
      flex: 1,
      padding: 16,
      borderRadius: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.outline + "20",
    },
    statIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "800",
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: "500",
    },
    previewCard: {
      borderRadius: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.colors.outline + "20",
      overflow: "hidden",
    },
    previewHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      paddingBottom: 0,
    },
    previewTitle: {
      fontSize: 18,
      fontWeight: "700",
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 6,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "600",
    },
    previewImage: {
      width: "100%",
      height: 200,
      marginVertical: 20,
    },
    previewContent: {
      padding: 20,
      paddingTop: 0,
    },
    previewHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    carTitle: {
      fontSize: 22,
      fontWeight: "800",
      flex: 1,
    },
    conditionBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    conditionText: {
      fontSize: 12,
      fontWeight: "700",
    },
    carPrice: {
      fontSize: 28,
      fontWeight: "800",
      marginBottom: 16,
    },
    carSpecs: {
      flexDirection: "row",
      gap: 16,
    },
    specRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    specText: {
      fontSize: 13,
      fontWeight: "500",
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitleContainer: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
    },
    editButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceVariant,
      gap: 6,
    },
    editIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    editText: {
      fontSize: 13,
      fontWeight: "600",
    },
    detailsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    detailItem: {
      width: (screenWidth - 64) / 2,
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.colors.surfaceVariant,
    },
    detailLabel: {
      fontSize: 11,
      fontWeight: "500",
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: "600",
    },
    photoSection: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 16,
      padding: 16,
    },
    photoCountText: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 12,
    },
    photoScroll: {
      flexDirection: "row",
      gap: 8,
    },
    thumbnail: {
      width: 80,
      height: 60,
      borderRadius: 8,
    },
    noPhotos: {
      alignItems: "center",
      paddingVertical: 20,
    },
    noPhotosText: {
      fontSize: 14,
      marginTop: 8,
    },
    settingsCard: {
      padding: 20,
      borderRadius: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.colors.outline + "20",
    },
    settingsTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 20,
    },
    publishOptions: {
      gap: 12,
      marginBottom: 24,
    },
    publishOption: {
      padding: 16,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surfaceVariant,
    },
    publishOptionSelected: {
      borderWidth: 2,
      backgroundColor: theme.colors.primary + "08",
    },
    optionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 12,
      flex: 1,
    },
    optionDescription: {
      fontSize: 13,
      marginLeft: 36,
    },
    switchRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    switchContent: {
      flex: 1,
    },
    switchHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    switchTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 12,
    },
    switchDescription: {
      fontSize: 13,
      marginLeft: 36,
    },
    termsCard: {
      padding: 20,
      borderRadius: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.colors.outline + "20",
      backgroundColor: theme.colors.surface,
    },
    termsHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    termsTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginLeft: 12,
    },
    termsRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      marginTop: 2,
    },
    termsTextContainer: {
      flex: 1,
    },
    termsText: {
      fontSize: 14,
      lineHeight: 20,
    },
    termsLink: {
      fontWeight: "600",
      textDecorationLine: "underline",
    },
    termsWarning: {
      fontSize: 12,
      fontWeight: "600",
      marginTop: 8,
      marginLeft: 36,
    },
    successOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    successContainer: {
      backgroundColor: "rgba(0,0,0,0.7)",
      padding: 40,
      borderRadius: 40,
    },
    successCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    spacer: {
      height: 40,
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: isSmallScreen ? 16 : 20,
      paddingVertical: 20,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline + "20",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 5,
    },
    draftButton: {
      borderRadius: 16,
      borderWidth: 1.5,
      marginBottom: 12,
    },
    draftButtonLabel: {
      fontSize: 15,
      fontWeight: "600",
    },
    publishButton: {
      borderRadius: 16,
      height: 56,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    publishButtonLabel: {
      fontSize: 16,
      fontWeight: "700",
    },
    buttonContent: {
      height: "100%",
    },
    featuresRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 12,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    featureText: {
      fontSize: 12,
      marginLeft: 4,
    },
    featureDivider: {
      width: 1,
      height: 12,
      backgroundColor: theme.colors.outline + "40",
      marginHorizontal: 12,
    },
  });
};
