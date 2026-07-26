import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

const ICONS = {
  Home: { active: 'home', inactive: 'home-outline' },
  Library: { active: 'school', inactive: 'school-outline' },
  Courses: { active: 'book', inactive: 'book-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
  Admin: { active: 'shield-checkmark', inactive: 'shield-checkmark-outline' },
};

const LABELS = {
  Home: 'Home',
  Library: 'My Learning',
  Courses: 'Courses',
  Profile: 'Profile',
  Admin: 'Admin',
};

export function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const visibleRoutes = state.routes;

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.bar}>
        {visibleRoutes.map((route) => {
          const routeIndexInState = state.routes.findIndex((r) => r.key === route.key);
          const isFocused = state.index === routeIndexInState;
          const icons = ICONS[route.name] || ICONS.Home;
          const label = LABELS[route.name] || route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isFocused) {
            return (
              <TouchableOpacity
                key={route.key}
                style={styles.centerTab}
                onPress={onPress}
                activeOpacity={0.85}
              >
                <View style={styles.centerCircle}>
                  <Ionicons name={icons.active} size={24} color={Colors.white} />
                </View>
                <Text style={[styles.label, styles.activeLabel]}>{label}</Text>
                <View style={styles.activeUnderline} />
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Ionicons name={icons.inactive} size={24} color="#9CA3AF" />
              <Text style={styles.label} numberOfLines={1}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: 28,
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 6,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeLabel: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  activeUnderline: {
    marginTop: 2,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primaryDark,
  },
  centerTab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    marginTop: -28,
  },
  centerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
