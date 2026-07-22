import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CourseDetailsScreen } from '@/src/screens/CourseDetailsScreen';
import { OnboardingScreen } from '@/src/screens/OnboardingScreen';
import { PlayerScreen } from '@/src/screens/PlayerScreen';
import { SplashScreen } from '@/src/screens/SplashScreen';
import { SupportScreen } from '@/src/screens/SupportScreen';
import { LoginScreen } from '@/src/screens/auth/LoginScreen';
import { RegisterScreen } from '@/src/screens/auth/RegisterScreen';
import { MainTabs } from './MainTabs';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#163B3C',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false, animation: 'fade' }}
      />

      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false, animation: 'fade' }}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Login',
          headerShown: true,
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'Register',
          headerShown: true,
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="CourseDetails"
        component={CourseDetailsScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Player"
        component={PlayerScreen}
        options={{ title: 'Player', headerShown: true }}
      />

      <Stack.Screen
        name="Support"
        component={SupportScreen}
        options={{ title: 'Support', headerShown: true }}
      />
    </Stack.Navigator>
  );
}
