import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { getAuthData, isOnboardingDone } from '@/utils/storage';

export function SplashScreen() {
  // useEffect(() => {
  //   checkAuth();
  // }, []);

  // const checkAuth = async () => {
  //   setTimeout(async () => {
  //     const authData = await getAuthData();
  //     const onboardingDone = await isOnboardingDone();

  //     if (authData) {
  //       router.replace('/(tabs)');
  //     } else if (onboardingDone) {
  //       router.replace('/(auth)/login');
  //     } else {
  //       router.replace('/onboarding');
  //     }
  //   }, 2000);
  // };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.title}>Essar</Text>
        <Text style={styles.tagline}>Esaar Global Institute</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
});
