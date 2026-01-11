import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useRef, useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

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

const Slide = ({ item }: { item: (typeof slides)[0] }) => {
  return (
    <View style={styles.slideContainer}>
      {/* Background Gradient */}
      <LinearGradient
        colors={item.gradientColors}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Content */}
      <View style={styles.slideContent}>
        {/* Image with container */}
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper}>
            <Image source={item.image} style={styles.slideImage} />
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideDescription}>{item.description}</Text>
        </View>
      </View>
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
    <View style={styles.container}>
      {/* Skip button */}
      <Pressable style={styles.skipButton} onPress={skip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

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
        contentContainerStyle={styles.flatListContent}
      />

      {/* Bottom controls */}
      <View style={styles.bottomContainer}>
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
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>
              {currentSlideIndex === slides.length - 1 ? "Get Started" : "Next"}
            </Text>
            {currentSlideIndex < slides.length - 1 && (
              <Text style={styles.buttonArrow}>→</Text>
            )}
          </LinearGradient>
        </Pressable>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
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
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  skipText: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(0, 0, 0, 0.7)",
  },
  flatListContent: {
    flexGrow: 1,
  },
  slideContainer: {
    width,
    height: height * 0.85,
    position: "relative",
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  slideContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrapper: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: width * 0.4,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
    transform: [{ translateY: -20 }],
  },
  slideImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    borderRadius: width * 0.35,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 60,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1A202C",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  slideDescription: {
    fontSize: 17,
    color: "#4A5568",
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "400",
    opacity: 0.85,
    paddingHorizontal: 10,
  },
  bottomContainer: {
    paddingHorizontal: 32,
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
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  buttonArrow: {
    color: "#FFFFFF",
    fontSize: 20,
    marginLeft: 8,
    fontWeight: "500",
  },
  progressContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  progressText: {
    fontSize: 14,
    color: "#718096",
    fontWeight: "500",
    marginBottom: 8,
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
