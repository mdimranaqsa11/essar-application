import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AboutScreen } from '@/src/screens/AboutScreen';
import { CourseDetailsScreen } from '@/src/screens/CourseDetailsScreen';
import { OnboardingScreen } from '@/src/screens/OnboardingScreen';
import { PlayerScreen } from '@/src/screens/PlayerScreen';
import { SplashScreen } from '@/src/screens/SplashScreen';
import { SupportScreen } from '@/src/screens/SupportScreen';
import { AdminCategoriesScreen } from '@/src/screens/admin/AdminCategoriesScreen';
import { AdminCourseFormScreen } from '@/src/screens/admin/AdminCourseFormScreen';
import { AdminCoursesScreen } from '@/src/screens/admin/AdminCoursesScreen';
import { AdminCurriculumScreen } from '@/src/screens/admin/AdminCurriculumScreen';
import { AdminInstructorFormScreen } from '@/src/screens/admin/AdminInstructorFormScreen';
import { AdminInstructorsScreen } from '@/src/screens/admin/AdminInstructorsScreen';
import { AdminUserEnrollmentsScreen } from '@/src/screens/admin/AdminUserEnrollmentsScreen';
import { AdminUsersScreen } from '@/src/screens/admin/AdminUsersScreen';
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
          headerShown: false,
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
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Support"
        component={SupportScreen}
        options={{ title: 'Support', headerShown: false }}
      />

      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'About', headerShown: false }}
      />

      {/* Admin management screens — reached from the admin-only tab (AdminPanelScreen). */}
      <Stack.Screen name="AdminCourses" component={AdminCoursesScreen} />
      <Stack.Screen name="AdminCourseForm" component={AdminCourseFormScreen} />
      <Stack.Screen name="AdminCategories" component={AdminCategoriesScreen} />
      <Stack.Screen name="AdminInstructors" component={AdminInstructorsScreen} />
      <Stack.Screen name="AdminInstructorForm" component={AdminInstructorFormScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminUserEnrollments" component={AdminUserEnrollmentsScreen} />
      <Stack.Screen name="AdminCurriculum" component={AdminCurriculumScreen} />
    </Stack.Navigator>
  );
}
