import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';

const LOCATIONS = [
  { id: 1, name: 'Bangladesh (Head Office)' },
  { id: 2, name: 'Delhi' },
  { id: 3, name: 'Canada' },
  { id: 4, name: 'South Africa' },
];

const OurPresence = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Our <Text style={styles.headingAccent}>Presence</Text>
      </Text>
      <Text style={styles.subheading}>
        Expanding excellence across borders with world-class medical and aesthetic education
      </Text>

      <View style={styles.globeWrapper}>
        <View style={styles.globeRingOuter}>
          <View style={styles.globeRingInner}>
            <Ionicons name="earth" size={64} color={Colors.primary} />
          </View>
        </View>
        <View style={[styles.floatingDot, styles.floatingDot1]} />
        <View style={[styles.floatingDot, styles.floatingDot2]} />
        <View style={[styles.floatingDot, styles.floatingDot3]} />
      </View>

      <View style={styles.locationsCard}>
        <Text style={styles.locationsTitle}>International Locations</Text>
        {LOCATIONS.map((location) => (
          <View key={location.id} style={styles.locationRow}>
            <View style={styles.locationPin}>
              <Ionicons name="location" size={14} color={Colors.white} />
            </View>
            <Text style={styles.locationText}>{location.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  headingAccent: {
    color: Colors.primary,
  },
  subheading: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
    paddingHorizontal: 12,
    lineHeight: 18,
  },
  globeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    height: 140,
  },
  globeRingOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 150, 137, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  globeRingInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 150, 137, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  floatingDot1: {
    top: 8,
    right: 30,
  },
  floatingDot2: {
    bottom: 16,
    left: 20,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.primaryLight,
  },
  floatingDot3: {
    top: 30,
    left: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryLight,
  },
  locationsCard: {
    backgroundColor: '#161B1E',
    borderRadius: 18,
    padding: 20,
  },
  locationsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  locationPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
});

export default OurPresence;
