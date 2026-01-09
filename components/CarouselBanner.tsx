import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

interface Banner {
  id: number;
  image: string;
  title: string;
}

const CarouselBanner: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Sample banner data - replace with your own images
  const banners: Banner[] = [
    {
      id: 1,
      image: require('@/assets/images/banner1.png'),
      title: "Banner 1",
    },
    {
      id: 2,
      image: require('@/assets/images/banner2.png'),
      title: "Banner 2",
    },
    {
      id: 3,
      image: require('@/assets/images/banner3.png'),
      title: "Banner 3",
    }
  ];

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % banners.length;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [activeIndex, banners.length]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / screenWidth);
    setActiveIndex(index);
  };

  const goToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {banners.map((banner) => (
          <View key={banner.id} style={styles.slide}>
            <Image
              source={banner.image}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {banners.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.dot, activeIndex === index && styles.activeDot]}
            onPress={() => goToSlide(index)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: screenWidth,
    position: "relative",
  },
  slide: {
    width: screenWidth,
    height: 200,
    paddingHorizontal: 18, 
  },
  image: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    borderRadius: 14,
    resizeMode: "cover",
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activeDot: {
    backgroundColor: "#fff",
    width: 24,
  },
});

export default CarouselBanner;
