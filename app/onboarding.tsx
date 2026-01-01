import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// Fallback for web platform
const webStorage = {
  setItem: async (key: string, value: string) => {
    if (Platform.OS === "web") {
      return localStorage.setItem(key, value);
    }
    return await SecureStore.setItem(key, value);
  },
};

const slides = [
  {
    id: "1",
    title: "Find Cars Near You",
    description:
      "Browse listings from Addis Ababa, Bahir Dar, Hawassa, and all regions.",
    image: require("../assets/images/onboard1.png"),
  },
  {
    id: "2",
    title: "Post Your Listing",
    description: "Sell your car quickly with photos and detailed information.",
    image: require("../assets/images/onboard2.png"),
  },
  {
    id: "3",
    title: "Chat with Buyers",
    description: "Manage everything inside the app with secure messaging.",
    image: require("../assets/images/onboard3.png"),
  },
];

const Slide = ({ item }: { item: (typeof slides)[0] }) => {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
        paddingHorizontal: 24,
      }}
    >
      <Image
        source={item.image}
        style={{
          width: 300,
          height: 300,
          resizeMode: "contain",
          marginBottom: 40,
        }}
      />
      <Text
        style={{
          fontSize: 28,
          fontWeight: "800",
          color: "#1f2937",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        {item.title}
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: "#6b7280",
          textAlign: "center",
          lineHeight: 24,
        }}
      >
        {item.description}
      </Text>
    </View>
  );
};

export default function OnboardingScreen() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const ref = useRef<FlatList>(null);
  const router = useRouter();

  const updateCurrentSlideIndex = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex < slides.length) {
      const offset = nextSlideIndex * width;
      ref?.current?.scrollToOffset({ offset });
      setCurrentSlideIndex(nextSlideIndex);
    } else {
      // Last slide, navigate to login
      handleGetStarted();
    }
  };

  const skip = async () => {
    await webStorage.setItem("seen_onboarding", "yes");
    router.replace("/(auth)/login");
  };

  const handleGetStarted = async () => {
    await webStorage.setItem("seen_onboarding", "yes");
    router.replace("/(auth)/login");
  };

  const handleResetApp = async () => {
    try {
      // Clear all storage keys
      const keys = [
        "seen_onboarding",
        "auth_token",
        "refresh_token",
        "user_data",
        "auth-storage", // Zustand persist key
      ];

      if (Platform.OS === "web") {
        // Clear localStorage on web
        keys.forEach((key) => localStorage.removeItem(key));
      } else {
        // Clear SecureStore on native
        for (const key of keys) {
          try {
            await SecureStore.deleteItemAsync(key);
          } catch (error) {
            // Key might not exist, that's okay
            console.log(`Key ${key} not found or already cleared`);
          }
        }
      }

      console.log("App storage cleared successfully");
      // The app will automatically restart from onboarding due to the logic in _layout.tsx
    } catch (error) {
      console.error("Error clearing app storage:", error);
    }
  };

  const Pagination = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              {
                height: 8,
                width: currentSlideIndex === index ? 24 : 8,
                borderRadius: 4,
                backgroundColor:
                  currentSlideIndex === index ? "#dc2626" : "#fca5a5",
                marginHorizontal: 4,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      {/* Skip button */}
      <View style={{ position: "absolute", top: 60, right: 24, zIndex: 1 }}>
        <Pressable onPress={skip}>
          <Text style={{ fontSize: 16, color: "#374151", fontWeight: "500" }}>
            Skip
          </Text>
        </Pressable>
      </View>

      {/* Slides */}
      <FlatList
        ref={ref}
        data={slides}
        renderItem={({ item }) => <Slide item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        keyExtractor={(item) => item.id}
      />

      {/* Bottom controls */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: 40,
          backgroundColor: "#f8f9fa",
        }}
      >
        <Pagination />

        <Pressable
          onPress={goToNextSlide}
          style={{
            backgroundColor: "#dc2626",
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 12,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontWeight: "600",
              marginRight: 8,
            }}
          >
            {currentSlideIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
          {currentSlideIndex < slides.length - 1 && (
            <Text style={{ color: "white", fontSize: 16 }}>→</Text>
          )}
        </Pressable>

        {/* Reset App Button - for development/testing */}
        <Pressable
          onPress={handleResetApp}
          style={{
            marginTop: 16,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#dc2626",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#dc2626", fontSize: 12 }}>Reset App</Text>
        </Pressable>
      </View>
    </View>
  );
}
