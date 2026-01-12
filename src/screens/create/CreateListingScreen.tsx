import React, { useState } from "react";
import { View } from "react-native";
import { useTheme } from "react-native-paper";
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

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Shared data state
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
    console.log("CreateListingScreen - updating vehicleData with:", updates);
    setVehicleData((prev) => {
      const newData = { ...prev, ...updates };
      console.log("CreateListingScreen - new vehicleData:", newData);
      return newData;
    });
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
            onContinue={() => console.log("Listing submitted!")}
            onBack={handleBack}
            vehicleData={vehicleData}
            jumpToStep={jumpToStep}
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
