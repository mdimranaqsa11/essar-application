import React from 'react';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { router } from '@/src/navigation/router';

const ABOUT_IMAGE = {
  uri: 'https://www.bharataarogyaacademy.com/images/bout-img.jpg',
};

const WhoWeAre = () => {
  return (
    <View style={styles.container}>
      <View style={styles.imageSection}>
        <View style={styles.decorativeBlob} />
        <View style={styles.dotGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <View key={i} style={styles.dot} />
          ))}
        </View>

        <View style={styles.imageCard}>
          <Image source={ABOUT_IMAGE} style={styles.image} resizeMode="cover" />
        </View>

        <View style={styles.studentsBadge}>
          <View style={styles.studentsIcon}>
            <Ionicons name="people" size={18} color={Colors.white} />
          </View>
          <View>
            <Text style={styles.studentsCount}>500+</Text>
            <Text style={styles.studentsLabel}>Students</Text>
          </View>
        </View>
      </View>

      <Text style={styles.heading}>
        <Text style={styles.headingAccent}>Who We Are </Text>
        Esaar Global Institute
      </Text>

      <Text style={styles.description}>
        Esaar Global Institute of Medical & Aesthetic Sciences is a leading institute dedicated to
        excellence in Aesthetic Medicine, Laser, and Cosmetic Science, offering advanced clinical
        treatments and specialized training programs including Hijama Training and Nutrition and
        Dietetics Course all under one roof.
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() => router.push('/about')}
        >
          <Text style={styles.primaryButtonText}>More about us</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.85}
          onPress={() => Linking.openURL('tel:+917011733779')}
        >
          <Text style={styles.secondaryButtonText}>Contact Us</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={14} color="#fbbf24" />
          <Text style={styles.statText}>4.9/5 Rating</Text>
        </View>
        <Text style={styles.statSeparator}>|</Text>
        <View style={styles.statItem}>
          <Text style={styles.statText}>500+ Students</Text>
        </View>
        <Text style={styles.statSeparator}>|</Text>
        <View style={styles.statItem}>
          <Text style={styles.statText}>ISO Certified</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  imageSection: {
    position: 'relative',
    paddingTop: 18,
    paddingLeft: 22,
    paddingRight: 8,
    paddingBottom: 22,
    marginBottom: 24,
  },
  decorativeBlob: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 0,
    bottom: 8,
    backgroundColor: 'rgba(0, 150, 137, 0.12)',
    borderRadius: 28,
    transform: [{ rotate: '-3deg' }],
  },
  dotGrid: {
    position: 'absolute',
    top: 4,
    left: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 42,
    zIndex: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primaryLight,
    margin: 3,
  },
  imageCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 6,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 6,
  },
  image: {
    width: '100%',
    height: 210,
    borderRadius: 13,
  },
  studentsBadge: {
    position: 'absolute',
    right: 0,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  studentsIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentsCount: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  studentsLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 34,
    marginBottom: 12,
  },
  headingAccent: {
    color: Colors.primary,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  secondaryButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  statSeparator: {
    color: Colors.border,
  },
});

export default WhoWeAre;
