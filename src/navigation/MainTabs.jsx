import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { CustomTabBar } from '@/components/CustomTabBar';
import { AdminPanelScreen } from '@/src/screens/admin/AdminPanelScreen';
import { CoursesScreen } from '@/src/screens/tabs/CoursesScreen';
import { HomeScreen } from '@/src/screens/tabs/HomeScreen';
import { LibraryScreen } from '@/src/screens/tabs/LibraryScreen';
import { ProfileScreen } from '@/src/screens/tabs/ProfileScreen';
import { getAuthData } from '@/utils/storage';

const Tab = createBottomTabNavigator();

export function MainTabs() {
  const [isAdmin, setIsAdmin] = useState(false);

  // Re-check the role each time the tabs regain focus so Admin access appears/disappears
  // right after login, logout or a role change without needing a full app restart.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getAuthData().then((authData) => {
        if (active) setIsAdmin(authData?.user?.role === 'admin');
      });
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 16,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home', headerTitle: 'Home', headerShown: false }}
      />

      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{ title: 'My Learning', headerTitle: 'My Learning', headerShown: false }}
      />

      <Tab.Screen
        name="Courses"
        component={CoursesScreen}
        options={{ title: 'Courses', headerTitle: 'All Courses', headerShown: false }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile', headerTitle: 'My Profile', headerShown: false }}
      />

      {/* Admin-only tab — takes its own place in the footer, shown only when the
          logged-in user's role is `admin`. */}
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminPanelScreen}
          options={{ title: 'Admin', headerTitle: 'Admin Panel', headerShown: false }}
        />
      )}
    </Tab.Navigator>
  );
}
