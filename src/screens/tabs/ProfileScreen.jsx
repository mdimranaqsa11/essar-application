import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MenuButton, SideMenu, useSideMenu } from '@/components/SideMenu';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '@/components/ui/Input';
import { PhotoPickerModal } from '@/components/ui/PhotoPickerModal';
import { useToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Colors';
import { router } from '@/src/navigation/router';
import { authService } from '@/services/auth';
import { getAuthData } from '@/utils/storage';

export function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [photoPickerVisible, setPhotoPickerVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const showToast = useToast();
  const menu = useSideMenu();

  // Re-check auth every time the tab regains focus so the screen flips between the
  // guest view and the signed-in view right after a login or logout.
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    const authData = await getAuthData();
    if (authData) {
      setUser(authData.user);
      setName(authData.user.name);
      setPhone(authData.user.phone || '');
    } else {
      setUser(null);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const updated = await authService.updateProfile({ name, phone });
      setUser(updated);
      setEditing(false);
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await authService.logout();
    router.replace('/(auth)/login');
  };

  const uploadAvatar = async (asset) => {
    setUploadingAvatar(true);
    try {
      const updated = await authService.updateProfile({ imageFile: asset });
      setUser(updated);
      showToast('Profile photo updated', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to update photo', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const pickFromCamera = async () => {
    setPhotoPickerVisible(false);
    const result = await launchCamera({ mediaType: 'photo', quality: 0.8 });
    if (result.didCancel || !result.assets?.length) return;
    uploadAvatar(result.assets[0]);
  };

  const pickFromLibrary = async () => {
    setPhotoPickerVisible(false);
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.didCancel || !result.assets?.length) return;
    uploadAvatar(result.assets[0]);
  };

  // Account actions. Edit / Admin / Logout are only for signed-in users; guests just get
  // Help & Support here (they log in from the guest card above).
  const menuItems = [
    ...(user
      ? [
          {
            key: 'edit',
            title: 'Edit Profile',
            subtitle: 'Update your personal information',
            icon: 'person-outline',
            onPress: () => setEditing(true),
          },
        ]
      : []),
    {
      key: 'about',
      title: 'About Us',
      subtitle: 'Learn more about our institute',
      icon: 'information-circle-outline',
      onPress: () => router.push('/about'),
    },
    {
      key: 'support',
      title: 'Help & Support',
      subtitle: 'Get help and support',
      icon: 'help-buoy-outline',
      onPress: () => router.push('/support'),
    },
    ...(user
      ? [
          {
            key: 'logout',
            title: 'Logout',
            subtitle: 'Sign out from your account',
            icon: 'log-out-outline',
            danger: true,
            onPress: () => setLogoutModalVisible(true),
          },
        ]
      : []),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <SideMenu {...menu} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.menuButtonWrap}>
            <MenuButton onPress={menu.open} />
          </View>
          <View>
            <Text style={styles.title}>
              My <Text style={styles.titleAccent}>Profile</Text>
            </Text>
            <View style={styles.countBadge}>
              <Ionicons name="settings-outline" size={12} color={Colors.primary} />
              <Text style={styles.countBadgeText}>Account & preferences</Text>
            </View>
          </View>
        </View>

        {/* Profile Card — signed in */}
        {user ? (
          <View style={styles.profileCard}>
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={() => setPhotoPickerVisible(true)}
              activeOpacity={0.85}
              disabled={uploadingAvatar}
            >
              {user?.image ? (
                <Image source={{ uri: user.image }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {uploadingAvatar && (
                <View style={styles.avatarLoadingOverlay}>
                  <ActivityIndicator color={Colors.white} />
                </View>
              )}
              <View style={styles.avatarEditButton}>
                <Ionicons name="camera" size={13} color={Colors.white} />
              </View>
            </TouchableOpacity>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {user?.role && (
              <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark" size={13} color={Colors.primary} />
                <Text style={styles.roleBadgeText}>
                  {user.role === 'admin' ? 'Admin' : 'Learner'}
                </Text>
              </View>
            )}
          </View>
        ) : (
          /* Guest Card — not signed in */
          <View style={styles.guestCard}>
            <View style={styles.guestAvatar}>
              <Ionicons name="person-outline" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.guestTitle}>Welcome, Guest</Text>
            <Text style={styles.guestSubtitle}>
              Log in to enroll in courses, track your progress and manage your profile.
            </Text>
            <View style={styles.guestButtons}>
              <Button title="Login" onPress={() => router.push('/(auth)/login')} fullWidth />
            </View>
            <TouchableOpacity
              style={styles.guestSignupRow}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.guestSignupText}>New here? </Text>
              <Text style={styles.guestSignupLink}>Create an account</Text>
            </TouchableOpacity>
          </View>
        )}

        {user && editing ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconCircle}>
                <Ionicons name="person-outline" size={18} color={Colors.primary} />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Edit Profile</Text>
                <Text style={styles.sectionSubtitle}>Update your personal information</Text>
              </View>
            </View>

            <View style={styles.sectionDivider} />

            <Input
              label="Full Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              icon="person-outline"
            />
            <Input
              label="Phone"
              placeholder="Enter your phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              icon="call-outline"
            />
            <View style={styles.buttonGroup}>
              <Button
                title="Cancel"
                onPress={() => {
                  setEditing(false);
                  setName(user?.name || '');
                  setPhone(user?.phone || '');
                }}
                variant="outline"
              />
              <Button
                title="Save"
                onPress={handleSave}
                loading={loading}
              />
            </View>
          </View>
        ) : (
          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.menuItem, index === menuItems.length - 1 && styles.menuItemLast]}
                onPress={item.onPress}
              >
                <View style={[styles.menuIconCircle, item.danger && styles.logoutIconCircle]}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.danger ? Colors.error : Colors.primary}
                  />
                </View>
                <View style={styles.menuTextGroup}>
                  <Text style={[styles.menuTitle, item.danger && { color: Colors.error }]}>
                    {item.title}
                  </Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Need Help */}
        <View style={styles.needHelpCard}>
          <View style={styles.needHelpIconCircle}>
            <Ionicons name="headset" size={22} color={Colors.white} />
          </View>
          <Text style={styles.needHelpTitle}>Need Help?</Text>
          <Text style={styles.needHelpSubtitle}>
            Our support team is always here to assist you.
          </Text>
          <TouchableOpacity
            style={styles.contactSupportButton}
            onPress={() => router.push('/support')}
          >
            <Text style={styles.contactSupportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <PhotoPickerModal
        visible={photoPickerVisible}
        onCancel={() => setPhotoPickerVisible(false)}
        onTakePhoto={pickFromCamera}
        onChooseFromGallery={pickFromLibrary}
      />

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  menuButtonWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  titleAccent: {
    color: Colors.primary,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  guestCard: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(0, 150, 137, 0.06)',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  guestAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  guestSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  guestButtons: {
    width: '100%',
  },
  guestSignupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  guestSignupText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  guestSignupLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  profileCard: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(0, 150, 137, 0.06)',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
  },
  avatarImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  avatarLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 46,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryDark,
    borderWidth: 2,
    borderColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 18,
    padding: 18,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  menuSection: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIconCircle: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  menuTextGroup: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
  },
  needHelpCard: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 32,
    backgroundColor: 'rgba(0, 150, 137, 0.06)',
    borderRadius: 18,
    padding: 22,
  },
  needHelpIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  needHelpTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  needHelpSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  contactSupportButton: {
    backgroundColor: Colors.primary,
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  contactSupportButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
