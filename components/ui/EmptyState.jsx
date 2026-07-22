import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/Colors';

export const EmptyState = ({ icon, title, description }) => {
  return (
    <View style={emptyStyles.container}>
      <View style={emptyStyles.iconContainer}>
        <Ionicons name={icon} size={64} color={Colors.textLight} />
      </View>
      <Text style={emptyStyles.title}>{title}</Text>
      {description && <Text style={emptyStyles.description}>{description}</Text>}
    </View>
  );
};

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
