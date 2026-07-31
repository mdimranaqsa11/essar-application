import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { isOnboardingDone } from '@/utils/storage';

export function SplashScreen({ navigation }) {
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setTimeout(async () => {
      const onboardingDone = await isOnboardingDone();

      if (!onboardingDone) {
        // First app open ever — show onboarding, which ends on Login (with a Skip option).
        navigation.replace('Onboarding');
      } else {
        // Every other app open — go straight into the app. Guests can browse freely;
        // login is only prompted when they try something that needs an account (enroll).
        navigation.replace('MainTabs');
      }
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoBadge}>
          <Image
            source={require('@/assets/images/essar_logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>I.Esaar</Text>
        <Text style={styles.tagline}>
          Esaar Global Institute of{'\n'}Medical & Aesthetic Sciences
        </Text>
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
  logoBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  logoImage: {
    width: 120,
    height: 120,
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
    textAlign: 'center',
    lineHeight: 22,
  },
});
