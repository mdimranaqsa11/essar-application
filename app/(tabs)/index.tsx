import CarouselBanner from '@/components/CarouselBanner';
import PopularCoursesCard from '@/components/PopularCoursesCard';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BookOpenText, ChevronRight } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CourseCard } from '../../components/CourseCard';
import { Loader } from '../../components/ui/Loader';
import { Colors } from '../../constants/Colors';
import { DUMMY_COURSES } from '../../constants/Dummy';
import { coursesService } from '../../services/courses';
import { Course } from '../../types';
import { getAuthData } from '../../utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = SCREEN_WIDTH * 0.75;

export default function HomeScreen() {
  const [userName, setUserName] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  // const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-MENU_WIDTH));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const authData = await getAuthData();
      if (authData) {
        setUserName(authData.user.name);
      }

      const fetchedCourses = await coursesService.getAllCourses();
      // const fetchedCategories = await coursesService.getCategories();

      if (fetchedCourses.length === 0) {
        console.log('Using dummy courses');
        setCourses(DUMMY_COURSES);
      } else {
        setCourses(fetchedCourses);
      }

      // if (fetchedCategories.length === 0) {
      //   console.log('Using dummy categories');
      //   // setCategories(DUMMY_CATEGORIES);
      // } else {
      //   // setCategories(fetchedCategories);
      // }
    } catch (error) {
      console.error('Load data error:', error);
      setCourses(DUMMY_COURSES);
      // setCategories(DUMMY_CATEGORIES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -MENU_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible(false);
    });
  };

  const handleSocialMedia = (platform: string) => {
    const urls: any = {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
    };
    Linking.openURL(urls[platform]);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={24} color="#00766C" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#00766C" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Slide Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeMenu}
        >
          <Animated.View
            style={[
              styles.slideMenu,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.menuHeader}>
                <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                  <Ionicons name="close" size={28} color="#000" />
                </TouchableOpacity>
              </View>

              <View style={styles.menuContent}>
                <TouchableOpacity style={styles.menuItem}>
                  <Text style={styles.menuText}>About Us</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />

                <TouchableOpacity style={styles.menuItem}>
                  <Text style={styles.menuText}>Privacy Policy</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />

                <TouchableOpacity style={styles.menuItem}>
                  <Text style={styles.menuText}>Terms & Conditions</Text>
                </TouchableOpacity>
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
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => handleSocialMedia('twitter')}
                    >
                      <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => handleSocialMedia('instagram')}
                    >
                      <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => handleSocialMedia('linkedin')}
                    >
                      <Ionicons name="logo-linkedin" size={24} color="#0A66C2" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userNameText}>{userName || 'Tiger Shroff'}</Text>
        </View>

        {/* Banner */}
        <CarouselBanner />

        <PopularCoursesCard />

        {/* Popular Courses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              <BookOpenText /> Popular Courses
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/courses')}>
              <Text style={styles.seeAll}>
                <ChevronRight color={''} />
              </Text>
            </TouchableOpacity>
          </View>
          {courses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>No courses available</Text>
            </View>
          ) : (
            courses.slice(0, 3).map((course) => (
              <CourseCard key={course.$id} course={course} />
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/library')}
            >
              <Ionicons name="library" size={32} color={Colors.primary} />
              <Text style={styles.actionText}>My Courses</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/support')}
            >
              <Ionicons name="help-circle" size={32} color={Colors.primary} />
              <Text style={styles.actionText}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
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
  logo: {
    width: 120,
    height: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
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
  menuHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'flex-end',
  },
  closeButton: {
    padding: 4,
  },
  menuContent: {
    padding: 20,
  },
  menuItem: {
    paddingVertical: 16,
  },
  menuText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
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
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '400',
  },
  userNameText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
  },
});