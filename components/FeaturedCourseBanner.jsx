import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { router } from '@/src/navigation/router';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40;
const CARD_SPACING = 16;

const FeaturedCourseBanner = ({ courses }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const slides = courses.slice(0, 4);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * (CARD_WIDTH + CARD_SPACING),
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeIndex, slides.length]);

  if (slides.length === 0) return null;

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_SPACING));
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
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        contentContainerStyle={styles.listContent}
      >
        {slides.map((course) => (
          <TouchableOpacity
            key={course.$id}
            style={styles.card}
            activeOpacity={0.92}
            onPress={() => router.push(`/course/${course.$id}`)}
          >
            <Image source={course.thumbnail} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            <LinearGradient
              colors={['rgba(0,40,38,0.45)', 'rgba(0,40,38,0.92)']}
              style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={13} color={Colors.white} />
              <Text style={styles.badgeText}>Certified Program</Text>
            </View>

            <View style={styles.bottomContent}>
              <Text style={styles.title} numberOfLines={2}>
                {course.title}
              </Text>
              {course.description && (
                <Text style={styles.subtitle} numberOfLines={2}>
                  {course.description}
                </Text>
              )}

              {(course.rating > 0 || course.enrolledCount > 0) && (
                <View style={styles.metaRow}>
                  {course.rating > 0 && (
                    <View style={styles.metaItem}>
                      <Ionicons name="star" size={14} color="#fbbf24" />
                      <Text style={styles.metaText}>{course.rating.toFixed(1)}</Text>
                    </View>
                  )}
                  {course.enrolledCount > 0 && (
                    <Text style={styles.metaText}>{course.enrolledCount}+ Students</Text>
                  )}
                </View>
              )}

              <View style={styles.ctaButton}>
                <Text style={styles.ctaButtonText}>Explore Course</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.text} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {slides.length > 1 && (
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View key={index} style={[styles.dot, activeIndex === index && styles.activeDot]} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: 300,
    marginRight: CARD_SPACING,
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
    justifyContent: 'space-between',
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  bottomContent: {
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 11,
    marginTop: 4,
  },
  ctaButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 18,
  },
});

export default FeaturedCourseBanner;
