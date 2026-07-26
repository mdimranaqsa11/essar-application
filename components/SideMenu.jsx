import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Colors } from '@/constants/Colors';
import { router } from '@/src/navigation/router';
import { authService } from '@/services/auth';
import { getAuthData } from '@/utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = SCREEN_WIDTH * 0.75;

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: 'home-outline', path: '/(tabs)/index' },
  { key: 'library', label: 'My Learning', icon: 'book-outline', path: '/(tabs)/library' },
  { key: 'courses', label: 'Courses', icon: 'school-outline', path: '/(tabs)/courses' },
  { key: 'profile', label: 'Profile', icon: 'person-outline', path: '/(tabs)/profile' },
  { key: 'about', label: 'About Us', icon: 'information-circle-outline', path: '/about' },
  { key: 'support', label: 'Help & Support', icon: 'help-buoy-outline', path: '/support' },
];

// Shared open/close state + animation for the slide-in menu, so each screen only needs
// to render <SideMenu {...menu} /> and hook a hamburger button to menu.open.
export function useSideMenu() {
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;

  const open = () => {
    setVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const close = (onClosed) => {
    Animated.timing(slideAnim, {
      toValue: -MENU_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      if (typeof onClosed === 'function') onClosed();
    });
  };

  return { visible, slideAnim, open, close };
}

export function MenuButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.menuButton} hitSlop={8}>
      <View style={styles.menuLine} />
      <View style={styles.menuLine} />
      <View style={styles.menuLine} />
    </TouchableOpacity>
  );
}

export function SideMenu({ visible, slideAnim, close }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Re-check auth each time the tab regains focus so Logout appears/disappears right
  // after a login or logout without needing a full app restart.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getAuthData().then((authData) => {
        if (active) setIsLoggedIn(!!authData);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const handleNavigate = (path) => {
    close(() => router.push(path));
  };

  const handleSocialMedia = (platform) => {
    const urls = {
      facebook: 'https://www.facebook.com/EsaarAesthetics',
    };
    Linking.openURL(urls[platform]);
  };

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await authService.logout();
    close(() => router.replace('/(auth)/login'));
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={() => close()}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => close()}>
        <Animated.View style={[styles.slideMenu, { transform: [{ translateX: slideAnim }] }]}>
          <TouchableOpacity activeOpacity={1} style={styles.menuInner}>
            <View style={styles.menuHeader}>
              <View style={styles.menuBrandRow}>
                <Image
                  source={require('@/assets/images/essar_logo.png')}
                  style={styles.menuLogo}
                  resizeMode="contain"
                />
                <View>
                  <Text style={styles.menuBrandTitle}>Essar</Text>
                  <Text style={styles.menuBrandSubtitle}>Esaar Global Institute</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => close()} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.menuContent}
              contentContainerStyle={styles.menuContentInner}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.menuSectionLabel}>Menu</Text>
              {NAV_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.navItem}
                  onPress={() => handleNavigate(item.path)}
                  activeOpacity={0.7}
                >
                  <View style={styles.navIconCircle}>
                    <Ionicons name={item.icon} size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.navLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
                </TouchableOpacity>
              ))}

              {isLoggedIn && (
                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => setLogoutModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.navIconCircle, styles.logoutIconCircle]}>
                    <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                  </View>
                  <Text style={[styles.navLabel, styles.logoutLabel]}>Logout</Text>
                </TouchableOpacity>
              )}

              <View style={styles.menuDivider} />

              <View style={styles.socialSection}>
                <Text style={styles.socialTitle}>Follow Us</Text>
                <View style={styles.socialIcons}>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialMedia('facebook')}
                  >
                    <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>

      <ConfirmModal
        visible={logoutModalVisible}
        icon="log-out-outline"
        iconColor={Colors.error}
        title="Logout"
        message="Are you sure you want to logout?"
        cancelText="Cancel"
        confirmText="Logout"
        destructive
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={handleLogout}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: 8,
    gap: 4,
  },
  menuLine: {
    width: 24,
    height: 3,
    backgroundColor: '#00766C',
    borderRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  slideMenu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuInner: {
    flex: 1,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuLogo: {
    width: 36,
    height: 36,
  },
  menuBrandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  menuBrandSubtitle: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 1,
  },
  closeButton: {
    padding: 4,
  },
  menuContent: {
    flex: 1,
  },
  menuContentInner: {
    padding: 20,
    paddingBottom: 40,
  },
  menuSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  navIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  logoutIconCircle: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  logoutLabel: {
    color: Colors.error,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  socialSection: {
    marginTop: 40,
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 16,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
