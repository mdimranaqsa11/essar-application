import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    // b9b98420-6d82-433e-83b3-25f297d12fcf
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#163B3C",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          animation: "slide_from_right",
          contentStyle: {
            backgroundColor: "#FFFFFF",
          },
          headerShown: false,
        }}
      >
        {/* Welcome/Splash/Onboarding Screen */}
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />

        {/* Main Tabs Navigation */}
        <Stack.Screen
          name="(tabs)"
          options={{
            animation: "fade",
          }}
        />

        {/* Auth Screens (Optional) */}
        <Stack.Screen
          name="login"
          options={{
            title: "Login",
            headerShown: true,
            presentation: "modal",
          }}
        />

        <Stack.Screen
          name="register"
          options={{
            title: "Register",
            headerShown: true,
            presentation: "modal",
          }}
        />

        {/* Course Detail Screen (Optional) */}
        <Stack.Screen
          name="course-detail"
          options={{
            title: "Course Details",
            headerShown: true,
          }}
        />
      </Stack>
    </>
  );
}
