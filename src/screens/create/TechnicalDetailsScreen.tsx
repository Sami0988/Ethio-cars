import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, useTheme } from "react-native-paper";
import { VehicleData } from "../../types/vehicle";

interface TechnicalDetailsScreenProps {
  onContinue?: () => void;
  onBack?: () => void;
  vehicleData?: VehicleData;
  updateVehicleData?: (updates: Partial<VehicleData>) => void;
}

export default function TechnicalDetailsScreen({
  onContinue,
  onBack,
  vehicleData,
  updateVehicleData,
}: TechnicalDetailsScreenProps) {
  const theme = useTheme();
  const { width } = Dimensions.get("window");
  const styles = getDynamicStyles(theme, width);

  const [selectedFuel, setSelectedFuel] = useState(
    vehicleData?.fuel || "Gasoline"
  );
  const [selectedTransmission, setSelectedTransmission] = useState(
    vehicleData?.transmission || "Automatic"
  );
  const [selectedBodyType, setSelectedBodyType] = useState(
    vehicleData?.body_type || "Sedan"
  );
  const [selectedEngine, setSelectedEngine] = useState("1.8L");
  const [selectedDrive, setSelectedDrive] = useState(
    vehicleData?.drive_type || "FWD"
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  const fuelTypes = [
    {
      name: "Gasoline",
      icon: "water",
      color: "#3B82F6",
      description: "Most common, widely available",
    },
    {
      name: "Diesel",
      icon: "flame",
      color: "#F59E0B",
      description: "Better fuel economy, more torque",
    },
    {
      name: "Electric",
      icon: "flash",
      color: "#10B981",
      description: "Zero emissions, low running cost",
    },
    {
      name: "Hybrid",
      icon: "sync",
      color: "#8B5CF6",
      description: "Combines gas and electric power",
    },
    {
      name: "Plug-in Hybrid",
      icon: "battery-charging",
      color: "#EC4899",
      description: "Electric with gas backup",
    },
    {
      name: "Hydrogen",
      icon: "water",
      color: "#06B6D4",
      description: "Zero emissions, future technology",
    },
    {
      name: "Natural Gas",
      icon: "flame",
      color: "#F97316",
      description: "Clean burning fuel",
    },
    {
      name: "Flex Fuel",
      icon: "gas-station",
      color: "#8B5CF6",
      description: "Multiple fuel compatibility",
    },
  ];

  const transmissionTypes = [
    {
      name: "Automatic",
      icon: "settings",
      color: "#3B82F6",
      description: "Easy to drive, smooth shifts",
    },
    {
      name: "Manual",
      icon: "git-merge",
      color: "#EF4444",
      description: "Full control, better engagement",
    },
    {
      name: "CVT",
      icon: "infinite",
      color: "#10B981",
      description: "Smooth, efficient, no gears",
    },
    {
      name: "Semi-Automatic",
      icon: "settings",
      color: "#8B5CF6",
      description: "Combines automatic and manual control",
    },
    {
      name: "Dual-Clutch",
      icon: "git-merge",
      color: "#8B5CF6",
      description: "Fast shifts, sporty feel",
    },
  ];

  const bodyTypes = [
    {
      name: "Sedan",
      icon: "car",
      color: "#3B82F6",
      description: "4 doors, comfortable ride",
    },
    {
      name: "SUV",
      icon: "car-sport",
      color: "#10B981",
      description: "Spacious, versatile, higher ride",
    },
    {
      name: "Truck",
      icon: "car",
      color: "#6B7280",
      description: "Powerful, utilitarian, heavy-duty",
    },
    {
      name: "Coupe",
      icon: "car-sport",
      color: "#EF4444",
      description: "Sporty, 2 doors, stylish",
    },
    {
      name: "Hatchback",
      icon: "car",
      color: "#F59E0B",
      description: "Compact, practical, good cargo",
    },
    {
      name: "Van",
      icon: "car",
      color: "#6B7280",
      description: "Cargo space, family-friendly",
    },
    {
      name: "Convertible",
      icon: "car",
      color: "#8B5CF6",
      description: "Open top, fun driving",
    },
    {
      name: "Wagon",
      icon: "car",
      color: "#06B6D4",
      description: "Long roof, extra cargo space",
    },
    {
      name: "Minivan",
      icon: "car",
      color: "#EC4899",
      description: "Family-friendly, spacious",
    },
    {
      name: "Crossover",
      icon: "car-sport",
      color: "#10B981",
      description: "Best of SUV and hatchback",
    },
  ];

  const engineSizes = [
    "1.0L",
    "1.2L",
    "1.4L",
    "1.6L",
    "1.8L",
    "2.0L",
    "2.2L",
    "2.5L",
    "3.0L",
    "3.5L",
    "4.0L+",
  ];

  const driveTypes = [
    {
      name: "FWD",
      icon: "arrow-forward",
      description: "Front Wheel Drive",
      color: "#3B82F6",
    },
    {
      name: "RWD",
      icon: "arrow-back",
      description: "Rear Wheel Drive",
      color: "#EF4444",
    },
    {
      name: "AWD",
      icon: "git-branch",
      description: "All Wheel Drive",
      color: "#10B981",
    },
    {
      name: "4WD",
      icon: "git-merge",
      description: "Four Wheel Drive",
      color: "#F59E0B",
    },
  ];

  const steps = [
    { number: 1, label: "Basics", completed: true },
    { number: 2, label: "Pricing", completed: true },
    { number: 3, label: "Technical", completed: false },
    { number: 4, label: "Photos", completed: false },
    { number: 5, label: "Location", completed: false },
    { number: 6, label: "Review", completed: false },
    { number: 7, label: "Publish", completed: false },
  ];

  const currentStep = 3;

  const handleContinue = () => {
    console.log("Technical details submitted:", {
      fuel: selectedFuel,
      transmission: selectedTransmission,
      bodyType: selectedBodyType,
      engine: selectedEngine,
      drive: selectedDrive,
    });

    if (updateVehicleData) {
      updateVehicleData({
        fuel: selectedFuel,
        transmission: selectedTransmission,
        body_type: selectedBodyType,
        drive_type: selectedDrive,
      });
    }

    if (onContinue) {
      onContinue();
    }
  };

  const handleBackPress = () => {
    if (onBack) {
      onBack();
    }
  };

  const renderBodyTypes = () => {
    const isSmallScreen = width < 375;
    const cardWidth = (width - 40) / 3 - 10; // 3 columns with padding

    return (
      <View style={styles.bodyGrid}>
        {bodyTypes.map((body) => {
          const isSelected = selectedBodyType === body.name;
          return (
            <TouchableOpacity
              key={body.name}
              style={[
                styles.bodyOptionCard,
                isSelected && [
                  styles.selectedBodyCard,
                  { borderColor: body.color },
                ],
              ]}
              onPress={() => setSelectedBodyType(body.name)}
            >
              <View
                style={[
                  styles.bodyIconContainer,
                  isSelected && { backgroundColor: body.color + "20" },
                ]}
              >
                <Ionicons
                  name={body.icon as any}
                  size={24}
                  color={
                    isSelected ? body.color : theme.colors.onSurfaceVariant
                  }
                />
              </View>

              <Text
                style={[
                  styles.bodyOptionText,
                  isSelected && [
                    styles.selectedBodyText,
                    { color: body.color },
                  ],
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {body.name}
              </Text>

              {isSelected && (
                <View
                  style={[
                    styles.bodySelectedIndicator,
                    { backgroundColor: body.color },
                  ]}
                >
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        {/* Add empty placeholder to fill the last row if needed */}
        {bodyTypes.length % 3 === 2 && (
          <View style={[styles.bodyOptionCard, { opacity: 0 }]} />
        )}
      </View>
    );
  };

  const renderOptionGrid = (
    options: Array<{
      name: string;
      icon?: string;
      color?: string;
      description?: string;
    }>,
    selected: string,
    onSelect: (value: string) => void,
    type: "fuel" | "transmission" | "drive"
  ) => {
    const isDriveType = type === "drive";

    return (
      <View style={styles.grid}>
        {options.map((option) => {
          const isSelected = selected === option.name;
          return (
            <TouchableOpacity
              key={option.name}
              style={[
                styles.optionCard,
                isSelected && [
                  styles.selectedOptionCard,
                  { borderColor: option.color || theme.colors.primary },
                ],
              ]}
              onPress={() => onSelect(option.name)}
            >
              <View
                style={[
                  styles.iconContainer,
                  isSelected && { backgroundColor: option.color + "20" },
                ]}
              >
                {option.icon ? (
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color={
                      isSelected ? option.color : theme.colors.onSurfaceVariant
                    }
                  />
                ) : null}
                {isDriveType && (
                  <Text
                    style={[
                      styles.driveIcon,
                      {
                        color: isSelected
                          ? option.color
                          : theme.colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {option.name}
                  </Text>
                )}
              </View>

              <Text
                style={[
                  styles.optionText,
                  isSelected && [
                    styles.selectedOptionText,
                    { color: option.color || theme.colors.primary },
                  ],
                ]}
              >
                {option.name}
              </Text>

              {option.description && (
                <Text
                  style={[
                    styles.optionDescription,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {option.description}
                </Text>
              )}

              {isSelected && (
                <View
                  style={[
                    styles.selectedIndicator,
                    { backgroundColor: option.color || theme.colors.primary },
                  ]}
                >
                  <Ionicons name="checkmark" size={14} color="white" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.fullScreen}>
      <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
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
            Technical Details
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Step {currentStep} • Performance Specs
          </Text>
        </View>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons
            name="help-circle"
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
                      <Text
                        style={[
                          styles.stepNumber,
                          {
                            color:
                              currentStep === step.number
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
                          step.completed || currentStep === step.number
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
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
        </View>

        <Animated.View
          style={[
            styles.titleContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.titleRow}>
            <Ionicons name="settings" size={32} color={theme.colors.primary} />
            <View style={styles.titleContent}>
              <Text
                style={[styles.mainTitle, { color: theme.colors.onBackground }]}
              >
                Technical Specifications
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Tell buyers what's under the hood
              </Text>
            </View>
          </View>
        </Animated.View>

        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.colors.primary + "08" },
          ]}
        >
          <Ionicons
            name="information-circle"
            size={24}
            color={theme.colors.primary}
          />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: theme.colors.onSurface }]}>
              Complete specs = Better matches
            </Text>
            <Text
              style={[
                styles.infoText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Buyers filter by these details. More accurate info means more
              qualified leads.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[styles.sectionIcon, { backgroundColor: "#3B82F620" }]}
            >
              <Ionicons name="water" size={20} color="#3B82F6" />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.onBackground },
                ]}
              >
                Fuel Type
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                What powers your vehicle?
              </Text>
            </View>
          </View>
          {renderOptionGrid(fuelTypes, selectedFuel, setSelectedFuel, "fuel")}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[styles.sectionIcon, { backgroundColor: "#EF444420" }]}
            >
              <Ionicons name="speedometer" size={20} color="#EF4444" />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.onBackground },
                ]}
              >
                Engine Size
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Displacement in liters
              </Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.engineScroll}
          >
            <View style={styles.engineGrid}>
              {engineSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.engineOption,
                    selectedEngine === size && [
                      styles.selectedEngineOption,
                      { borderColor: theme.colors.primary },
                    ],
                  ]}
                  onPress={() => setSelectedEngine(size)}
                >
                  <Text
                    style={[
                      styles.engineText,
                      {
                        color:
                          selectedEngine === size
                            ? theme.colors.primary
                            : theme.colors.onSurface,
                      },
                    ]}
                  >
                    {size}
                  </Text>
                  {selectedEngine === size && (
                    <View
                      style={[
                        styles.engineIndicator,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[styles.sectionIcon, { backgroundColor: "#10B98120" }]}
            >
              <Ionicons name="git-merge" size={20} color="#10B981" />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.onBackground },
                ]}
              >
                Transmission
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                How gears are shifted
              </Text>
            </View>
          </View>
          {renderOptionGrid(
            transmissionTypes,
            selectedTransmission,
            setSelectedTransmission,
            "transmission"
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[styles.sectionIcon, { backgroundColor: "#F59E0B20" }]}
            >
              <Ionicons name="car" size={20} color="#F59E0B" />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.onBackground },
                ]}
              >
                Drive Type
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Which wheels get power?
              </Text>
            </View>
          </View>
          {renderOptionGrid(
            driveTypes,
            selectedDrive,
            setSelectedDrive,
            "drive"
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[styles.sectionIcon, { backgroundColor: "#8B5CF620" }]}
            >
              <Ionicons name="car-sport" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.onBackground },
                ]}
              >
                Body Type
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Vehicle shape and style
              </Text>
            </View>
          </View>
          {renderBodyTypes()}
        </View>

        <View
          style={[
            styles.summaryCard,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text
            style={[styles.summaryTitle, { color: theme.colors.onBackground }]}
          >
            Your Vehicle Profile
          </Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Fuel
              </Text>
              <Text
                style={[styles.summaryValue, { color: theme.colors.onSurface }]}
              >
                {selectedFuel}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Engine
              </Text>
              <Text
                style={[styles.summaryValue, { color: theme.colors.onSurface }]}
              >
                {selectedEngine}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Transmission
              </Text>
              <Text
                style={[styles.summaryValue, { color: theme.colors.onSurface }]}
              >
                {selectedTransmission}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Drive
              </Text>
              <Text
                style={[styles.summaryValue, { color: theme.colors.onSurface }]}
              >
                {selectedDrive}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleContinue}
          style={[
            styles.continueButton,
            { backgroundColor: theme.colors.primary },
          ]}
          labelStyle={[styles.buttonLabel, { color: theme.colors.onPrimary }]}
          contentStyle={styles.buttonContent}
        >
          Continue to Photos
        </Button>

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
              Verified Specs
            </Text>
          </View>
          <View style={styles.featureDivider} />
          <View style={styles.featureItem}>
            <Ionicons name="search" size={16} color={theme.colors.primary} />
            <Text
              style={[
                styles.featureText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Better Search Results
            </Text>
          </View>
          <View style={styles.featureDivider} />
          <View style={styles.featureItem}>
            <Ionicons
              name="trending-up"
              size={16}
              color={theme.colors.primary}
            />
            <Text
              style={[
                styles.featureText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              40% More Views
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const getDynamicStyles = (theme: any, screenWidth: number) => {
  const isSmallScreen = screenWidth < 375;

  // Calculate card width for body types - perfect 3-column layout
  const bodyCardWidth = (screenWidth - 40 - 20) / 3; // screenWidth - padding - total gap

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
    helpButton: {
      padding: 4,
    },
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: isSmallScreen ? 16 : 20,
      paddingTop: 16,
      paddingBottom: 160,
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
      marginBottom: 24,
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
    infoCard: {
      flexDirection: "row",
      padding: 16,
      borderRadius: 16,
      marginBottom: 24,
      alignItems: "flex-start",
    },
    infoContent: {
      flex: 1,
      marginLeft: 12,
    },
    infoTitle: {
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 4,
    },
    infoText: {
      fontSize: 13,
      lineHeight: 18,
    },
    section: {
      marginBottom: 28,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    sectionTitleContainer: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 2,
    },
    sectionSubtitle: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    bodyGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      justifyContent: "space-between", // This will distribute evenly
    },
    optionCard: {
      width: (screenWidth - 40) / 2 - 5, // 2 columns with padding
      padding: 16,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
    },
    selectedOptionCard: {
      borderWidth: 2,
      backgroundColor: theme.colors.primary + "08",
    },
    bodyOptionCard: {
      width: bodyCardWidth,
      padding: 12,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      marginBottom: 10,
    },
    selectedBodyCard: {
      borderWidth: 2,
      backgroundColor: theme.colors.primary + "08",
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
      backgroundColor: theme.colors.surfaceVariant,
    },
    bodyIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
      backgroundColor: theme.colors.surfaceVariant,
    },
    driveIcon: {
      fontSize: 20,
      fontWeight: "800",
    },
    optionText: {
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 4,
    },
    selectedOptionText: {
      fontWeight: "700",
    },
    bodyOptionText: {
      fontSize: 12,
      fontWeight: "600",
      textAlign: "center",
    },
    selectedBodyText: {
      fontWeight: "700",
    },
    optionDescription: {
      fontSize: 11,
      textAlign: "center",
      lineHeight: 14,
    },
    selectedIndicator: {
      position: "absolute",
      top: -8,
      right: -8,
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    bodySelectedIndicator: {
      position: "absolute",
      top: -6,
      right: -6,
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    engineScroll: {
      marginHorizontal: -4,
    },
    engineGrid: {
      flexDirection: "row",
      paddingHorizontal: 4,
      gap: 10,
    },
    engineOption: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      minWidth: 65,
    },
    selectedEngineOption: {
      borderWidth: 2,
      backgroundColor: theme.colors.primary + "08",
    },
    engineText: {
      fontSize: 14,
      fontWeight: "600",
    },
    engineIndicator: {
      position: "absolute",
      bottom: -4,
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    summaryCard: {
      padding: 20,
      borderRadius: 20,
      marginTop: 8,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.colors.outline + "20",
    },
    summaryTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 16,
      textAlign: "center",
    },
    summaryGrid: {
      flexDirection: "row",
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 16,
    },
    summaryItem: {
      flex: 1,
      alignItems: "center",
    },
    summaryLabel: {
      fontSize: 11,
      fontWeight: "500",
      marginBottom: 4,
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: "700",
    },
    summaryDivider: {
      width: 1,
      backgroundColor: theme.colors.outline + "40",
      marginHorizontal: 12,
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
    continueButton: {
      borderRadius: 16,
      height: 56,
    },
    buttonContent: {
      height: "100%",
    },
    buttonLabel: {
      fontSize: 16,
      fontWeight: "600",
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
