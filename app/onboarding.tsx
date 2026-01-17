import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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
    title: "Find Your Perfect Car",
    description:
      "Browse thousands of verified listings from across Ethiopia. Find exactly what you're looking for.",
    image: require("../assets/images/onboard1.png"),
    gradientColors: ["#667eea", "#764ba2"], // Purple gradient
  },
  {
    id: "2",
    title: "Sell Your Car Fast",
    description:
      "List your car in minutes with our easy process. Reach serious buyers and get the best price.",
    image: require("../assets/images/onboard2.png"),
    gradientColors: ["#f093fb", "#f5576c"], // Pink gradient
  },
  {
    id: "3",
    title: "Connect & Negotiate",
    description:
      "Chat securely with buyers and sellers. Make deals confidently with our trusted platform.",
    image: require("../assets/images/onboard3.png"),
    gradientColors: ["#4facfe", "#00f2fe"], // Blue gradient
  },
] as const;

const Slide = ({
  item,
  screenWidth,
  screenHeight,
}: {
  item: (typeof slides)[0];
  screenWidth: number;
  screenHeight: number;
}) => {
  return (
    <View
      style={[
        styles.slideContainer,
        { width: screenWidth, height: screenHeight * 0.85 },
      ]}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={item.gradientColors}
        style={[styles.gradientBackground, { height: screenHeight * 0.45 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Content */}
      <View style={styles.slideContent}>
        {/* Image with container */}
        <View style={styles.imageContainer}>
          <View
            style={[
              styles.imageWrapper,
              {
                width: screenWidth * 0.65,
                height: screenWidth * 0.65,
                borderRadius: screenWidth * 0.35,
                padding: screenWidth * 0.04,
              },
            ]}
          >
            <Image
              source={item.image}
              style={[
                styles.slideImage,
                {
                  borderRadius: screenWidth * 0.3,
                },
              ]}
            />
          </View>
        </View>

        {/* Text Content */}
        <View
          style={[
            styles.textContainer,
            {
              paddingHorizontal: screenWidth * 0.05,
              marginTop: -screenHeight * 0.02,
            },
          ]}
        >
          <Text
            style={[
              styles.slideTitle,
              {
                fontSize: screenWidth * 0.08,
                lineHeight: screenWidth * 0.095,
                marginBottom: screenHeight * 0.02,
              },
            ]}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.slideDescription,
              {
                fontSize: screenWidth * 0.042,
                lineHeight: screenHeight * 0.032,
                paddingHorizontal: screenWidth * 0.025,
              },
            ]}
          >
            {item.description}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function OnboardingScreen() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get("window"),
  );
  const ref = useRef<FlatList>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const onChange = (result: any) => {
      setScreenDimensions(result.window);
    };

    const subscription = Dimensions.addEventListener("change", onChange);
    return () => subscription?.remove();
  }, []);

  const { width: screenWidth, height: screenHeight } = screenDimensions;

  const updateCurrentSlideIndex = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / screenWidth);
    setCurrentSlideIndex(currentIndex);
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex < slides.length) {
      const offset = nextSlideIndex * screenWidth;
      ref?.current?.scrollToOffset({ offset });
      setCurrentSlideIndex(nextSlideIndex);
    } else {
      handleGetStarted();
    }
  };

  const skip = async () => {
    await webStorage.setItem("seen_onboarding", "yes");
    router.replace("/(tabs)");
  };

  const handleGetStarted = async () => {
    await webStorage.setItem("seen_onboarding", "yes");
    router.replace("/(tabs)");
  };

  const Pagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentSlideIndex === index && styles.paginationDotActive,
            ]}
          >
            {currentSlideIndex === index && (
              <View style={styles.paginationDotInner} />
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        {/* Skip button */}
        <Pressable
          style={[
            styles.skipButton,
            { top: insets.top + 12, right: screenWidth * 0.06 },
          ]}
          onPress={skip}
        >
          <Text style={[styles.skipText, { fontSize: screenWidth * 0.037 }]}>
            Skip
          </Text>
        </Pressable>

        {/* Slides */}
        <FlatList
          ref={ref}
          data={slides}
          renderItem={({ item }) => (
            <Slide
              item={item}
              screenWidth={screenWidth}
              screenHeight={screenHeight}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          onMomentumScrollEnd={updateCurrentSlideIndex}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.flatListContent,
            { width: screenWidth * slides.length },
          ]}
        />

        {/* Bottom controls */}
        <View
          style={[
            styles.bottomContainer,
            {
              paddingBottom: 20 + insets.bottom,
              paddingHorizontal: screenWidth * 0.08,
            },
          ]}
        >
          <Pagination />

          <Pressable
            onPress={goToNextSlide}
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.nextButtonPressed,
            ]}
          >
            <LinearGradient
              colors={["#5A67D8", "#4C51BF"]}
              style={[
                styles.buttonGradient,
                {
                  paddingVertical: screenHeight * 0.025,
                  paddingHorizontal: screenWidth * 0.08,
                },
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text
                style={[styles.buttonText, { fontSize: screenWidth * 0.045 }]}
              >
                {currentSlideIndex === slides.length - 1
                  ? "Get Started"
                  : "Next"}
              </Text>
              {currentSlideIndex < slides.length - 1 && (
                <Text
                  style={[
                    styles.buttonArrow,
                    {
                      fontSize: screenWidth * 0.05,
                      marginLeft: screenWidth * 0.02,
                    },
                  ]}
                >
                  →
                </Text>
              )}
            </LinearGradient>
          </Pressable>

          {/* Progress indicator */}
          <View
            style={[
              styles.progressContainer,
              { marginTop: screenHeight * 0.037 },
            ]}
          >
            <Text
              style={[
                styles.progressText,
                {
                  fontSize: screenWidth * 0.035,
                  marginBottom: screenHeight * 0.02,
                },
              ]}
            >
              {currentSlideIndex + 1} / {slides.length}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((currentSlideIndex + 1) / slides.length) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  skipButton: {
    position: "absolute",
    top: 60,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  skipText: {
    fontWeight: "500",
    color: "rgba(0, 0, 0, 0.7)",
  },
  flatListContent: {
    flexGrow: 1,
  },
  slideContainer: {
    position: "relative",
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  slideContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center", // Adjusted to center text vertically
    paddingTop: 50, // Reduced padding to move text up
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
    transform: [{ translateY: -20 }],
    alignItems: "center",
    justifyContent: "center",
  },
  slideImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  slideTitle: {
    fontWeight: "800",
    color: "#1A202C",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  slideDescription: {
    color: "#4A5568",
    textAlign: "center",
    fontWeight: "400",
    opacity: 0.85,
  },
  bottomContainer: {
    paddingBottom: 50,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  paginationDotActive: {
    width: 30,
    backgroundColor: "#5A67D8",
  },
  paginationDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  nextButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#5A67D8",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  nextButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonGradient: {
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  buttonArrow: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  progressContainer: {
    alignItems: "center",
  },
  progressText: {
    color: "#718096",
    fontWeight: "500",
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#EDF2F7",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#5A67D8",
    borderRadius: 2,
  },
});
