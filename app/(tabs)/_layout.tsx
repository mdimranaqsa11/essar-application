import { Tabs } from "expo-router";
import { Book, BookOpen, Home, User } from "lucide-react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#163B3C",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          height: 70 + (insets.bottom || 0),
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: "#fff",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: "#000",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 16,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Home
              color={color}
              size={size}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          headerTitle: "Home",
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, size, focused }) => (
            <Book
              color={color}
              size={size}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          headerTitle: "Library",
          headerShown: false,
        }}
      />
      
      <Tabs.Screen
        name="courses"
        options={{
          title: "Courses",
          tabBarIcon: ({ color, size, focused }) => (
            <BookOpen
              color={color}
              size={size}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          headerTitle: "All Courses",
          headerShown: false,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <User
              color={color}
              size={size}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          headerTitle: "My Profile",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}