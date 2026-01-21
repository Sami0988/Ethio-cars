import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuthStore } from "../../features/auth/auth.store";
import { VehicleData } from "../../types/vehicle";
import AddPhotosScreen from "./AddPhotosScreen";
import FeaturesAndExtrasScreen from "./FeaturesAndExtrasScreen";
import LocationAndDetailsScreen from "./LocationAndDetailsScreen";
import PricingScreen from "./PricingScreen";
import ReviewAndSubmitScreen from "./ReviewAndSubmitScreen";
import TechnicalDetailsScreen from "./TechnicalDetailsScreen";
import VehicleBasicsScreen from "./VehicleBasicsScreen";

const CreateListingScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const insets = useSafeAreaInsets();

  // Step management - move to top before any conditional returns
  const [currentStep, setCurrentStep] = useState(1);

  // Shared data state - move to top before any conditional returns
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    make: "Toyota",
    model: "Corolla",
    year: "2018",
    color: "Silver",
    condition: "Excellent",
    price: "1,500,000",
    negotiable: true,
    mileage: "45000",
    transmission: "Automatic",
    fuel: "Petrol",
    photos: [
      "https://picsum.photos/seed/car1/80/60.jpg",
      "https://picsum.photos/seed/car2/80/60.jpg",
      "https://picsum.photos/seed/car3/80/60.jpg",
      "https://picsum.photos/seed/car4/80/60.jpg",
    ],
    location: {
      region: "Addis Ababa",
      zone: "Bole Sub-city",
      city: "Woreda 03",
      address: "Bole Sub-city, Woreda 03, Addis Ababa, Ethiopia",
    },
    description:
      "Well-maintained Toyota Corolla in excellent condition. Regular service history, clean interior, and great fuel economy.",
    features: [], // Initialize as empty number array
  });

  // Early return if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={[styles.signInPrompt, { paddingTop: insets.top + 40 }]}>
          <MaterialCommunityIcons
            name="account-circle-outline"
            size={80}
            color={theme.colors.onBackground}
          />
          <Text
            style={[styles.signInTitle, { color: theme.colors.onBackground }]}
          >
            Please signup or login first
          </Text>
          <Text
            style={[
              styles.signInSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Sign in to post your car listing and reach thousands of buyers
          </Text>
          <Button
            mode="contained"
            style={[
              styles.signInButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => router.push("/(auth)/login")}
            textColor={theme.colors.onPrimary}
          >
            Sign In
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const jumpToStep = (step: number) => {
    if (step >= 1 && step <= 7) {
      setCurrentStep(step);
    }
  };

  const updateVehicleData = (updates: Partial<VehicleData>) => {
    setVehicleData((prev) => {
      const newData = { ...prev, ...updates };
      return newData;
    });
  };

  const resetVehicleData = () => {
    setVehicleData({
      make: "",
      model: "",
      year: "",
      color: "",
      condition: "",
      price: "",
      negotiable: false,
      mileage: "",
      transmission: "",
      fuel: "",
      photos: [],
      location: {
        region: "",
        zone: "",
        city: "",
        address: "",
      },
      description: "",
      features: [],
    });
    setCurrentStep(1);
  };

  const renderScreen = () => {
    switch (currentStep) {
      case 1:
        return (
          <VehicleBasicsScreen
            onContinue={() => setCurrentStep(2)}
            onBack={handleBack}
            vehicleData={vehicleData}
            updateVehicleData={updateVehicleData}
          />
        );
      case 2:
        return (
          <PricingScreen
            onContinue={() => setCurrentStep(3)}
            onBack={handleBack}
            vehicleData={vehicleData}
            updateVehicleData={updateVehicleData}
          />
        );
      case 3:
        return (
          <TechnicalDetailsScreen
            onContinue={() => setCurrentStep(4)}
            onBack={handleBack}
            vehicleData={vehicleData}
            updateVehicleData={updateVehicleData}
          />
        );
      case 4:
        return (
          <FeaturesAndExtrasScreen
            onContinue={() => setCurrentStep(5)}
            onBack={handleBack}
            vehicleData={vehicleData}
            updateVehicleData={updateVehicleData}
          />
        );
      case 5:
        return (
          <AddPhotosScreen
            onContinue={() => setCurrentStep(6)}
            onBack={handleBack}
            vehicleData={vehicleData}
            updateVehicleData={updateVehicleData}
          />
        );
      case 6:
        return (
          <LocationAndDetailsScreen
            onContinue={() => setCurrentStep(7)}
            onBack={handleBack}
            vehicleData={vehicleData}
            updateVehicleData={updateVehicleData}
          />
        );
      case 7:
        return (
          <ReviewAndSubmitScreen
            onContinue={() => {
              // Reset all form data and navigate to home screen
              resetVehicleData();
              router.replace("/(tabs)");
            }}
            onBack={handleBack}
            vehicleData={vehicleData}
            jumpToStep={jumpToStep}
            resetVehicleData={resetVehicleData}
          />
        );
      default:
        return (
          <VehicleBasicsScreen
            onContinue={() => setCurrentStep(2)}
            onBack={handleBack}
            vehicleData={vehicleData}
            updateVehicleData={updateVehicleData}
          />
        );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {renderScreen()}
    </View>
  );
};

export default CreateListingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    textAlign: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  signInSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  signInButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
});
