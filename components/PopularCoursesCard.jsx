import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { DUMMY_COURSES } from '../constants/Dummy';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.70;
const CARD_MARGIN = 8;

const PopularCoursesCard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_MARGIN * 2));
    setCurrentIndex(index);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity activeOpacity={0.8}>
        <View style={styles.imageContainer}>
          <Image source={item.thumbnail} style={styles.image} resizeMode="stretch" />

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradientOverlay}
          />

          <View style={styles.ratingBadge}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.instructor} numberOfLines={1}>
            by {item.instructor}
          </Text>
          <View style={styles.priceRow}>
            {item.price === 0 ? (
              <Text style={styles.freeText}>FREE</Text>
            ) : (
              <>
                <Text style={styles.price}>₹{item.price}</Text>
                <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>🔥</Text>
          <Text style={styles.headerTitle}>Popular courses</Text>
        </View>
        <TouchableOpacity style={styles.arrowButton}>
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={DUMMY_COURSES}
        renderItem={renderItem}
        keyExtractor={(item) => item.$id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={(data, index) => ({
          length: CARD_WIDTH + CARD_MARGIN * 2,
          offset: (CARD_WIDTH + CARD_MARGIN * 2) * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  arrowButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    borderRadius: 6,
  },
  arrowText: {
    fontSize: 20,
    color: '#3b82f6',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 12,
  },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 3,
  },
  star: {
    color: '#fff',
    fontSize: 14,
  },
  ratingText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  cardContent: {
    paddingTop: 12,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  instructor: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  freeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
  },
});

export default PopularCoursesCard;
