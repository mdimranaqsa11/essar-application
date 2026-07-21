import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { setOnboardingDone } from "../utils/storage";

const { width, height } = Dimensions.get("window");

const ONBOARDING_DATA = [
  {
    id: "1",
    title: "Advance Your Skills with Top Dermatologists",
    image: require("@/assets/images/onbording-male-photo.png"),
  },
  {
    id: "2",
    title: "Flexible Learning for Busy Medical Professionals",
    image: require("@/assets/images/onbording-female-photo.png"),
  },
  {
    id: "3",
    title: "Earn Globally-Recognized Medical Certificates",
    image: require("@/assets/images/onbording-female-photo-certificate.png"),
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = async () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      await setOnboardingDone();
      // router.replace('/(auth)/login');
    }
  };

  const handleSkip = async () => {
    await setOnboardingDone();
    // router.replace('/(auth)/login');
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.slide}>
      {/* Doctor Image */}
      <View style={styles.imageContainer}>
        <Image
          source={item.image}
          style={styles.doctorImage}
          resizeMode="cover"
        />
        {/* White overlay gradient at bottom */}
        <LinearGradient
          colors={[
            "transparent",
            "rgba(255,255,255,0.3)",
            "rgba(255,255,255,0.9)",
          ]}
          style={styles.imageGradient}
        />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Skip Button */}
      {currentIndex < ONBOARDING_DATA.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEnabled={false}
      />

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {ONBOARDING_DATA.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === ONBOARDING_DATA.length - 1
                ? "Get Started"
                : "Next"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
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
    top: 50,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  slide: {
    width,
    height: height,
    backgroundColor: "#FFFFFF",
  },
  imageContainer: {
    width: width,
    height: height * 0.6,
    position: "relative",
    backgroundColor: "#F8F8F8",
    overflow: "hidden",
  },
  doctorImage: {
    width: "100%",
    height: "100%",
    marginTop: 10,
  },
  imageGradient: {
    position: "absolute",
    bottom: -10,
    left: 0,
    right: 0,
    height: 10,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 30,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingBottom: 100,
    backgroundColor: "transparent",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 32,
    backgroundColor: Colors.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: "#E0E0E0",
  },
  nextButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
