import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/Colors';

export const Loader: React.FC = () => {
  return (
    <View style={loaderStyles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
};

const loaderStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
