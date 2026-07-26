import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '@/constants/Colors';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.62;
const CARD_MARGIN = 8;

const TRAINING_HIGHLIGHTS = [
  {
    id: 1,
    image: {
      uri: 'https://img.magnific.com/free-photo/older-man-wheelchair-smiles-nurse-assistant-she-hands-him-glass-water_496169-2835.jpg?t=st=1764001139~exp=1764004739~hmac=b2633cffe0e2edf4ed66d4e3aa29ceab00342a089c6596a82b3ce19c24d97ff2&w=740',
    },
    title: 'Patient Care',
    subtitle: 'Compassionate hands-on care',
    badge: 'Live Training',
  },
  {
    id: 2,
    image: {
      uri: 'https://img.magnific.com/free-photo/young-beautiful-girl-lies-beautician-s-table-receives-procedures_343596-4234.jpg?t=st=1764001007~exp=1764004607~hmac=767eab0b761419f2130a7c889bc91a3d5c52056069ef2a1f62df099ee0a86cab&w=740',
    },
    title: 'Facial Treatment',
    subtitle: 'Modern skincare techniques',
  },
  {
    id: 3,
    image: {
      uri: 'https://img.magnific.com/free-photo/close-up-woman-lip-filler-procedure_23-2149315542.jpg?t=st=1764001422~exp=1764005022~hmac=640d38ad3e471433afec7799a6806b2664ef09596360e2819a876523bbe46364&w=740',
    },
    title: 'Dermal Fillers',
    subtitle: 'Precision injection training',
  },
  {
    id: 4,
    image: { uri: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=2070' },
    title: 'Aesthetic Procedures',
    subtitle: 'Advanced clinical practice',
  },
  {
    id: 5,
    image: { uri: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080' },
    title: 'Clinical Training',
    subtitle: 'Real-world case studies',
  },
];

const TrainingHighlights = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Professional Training</Text>
      <Text style={styles.subheading}>
        Experience world-class hands-on training with state-of-the-art equipment and expert guidance
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
      >
        {TRAINING_HIGHLIGHTS.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image source={item.image} style={styles.image} resizeMode="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.75)']}
              style={styles.gradientOverlay}
            />

            {item.badge && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>{item.badge}</Text>
              </View>
            )}

            <View style={styles.cardContent}>
              <View style={styles.eyebrowRow}>
                <View style={styles.eyebrowDash} />
                <Text style={styles.eyebrowText}>PROFESSIONAL TRAINING</Text>
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {item.subtitle}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingVertical: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  subheading: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 18,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  card: {
    width: CARD_WIDTH,
    height: 220,
    marginHorizontal: CARD_MARGIN,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  cardContent: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  eyebrowDash: {
    width: 16,
    height: 2,
    backgroundColor: Colors.primaryLight,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryLight,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  cardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
});

export default TrainingHighlights;
