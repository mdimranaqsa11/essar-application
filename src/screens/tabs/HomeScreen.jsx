import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeaturedCourseBanner from '@/components/FeaturedCourseBanner';
import OurPresence from '@/components/OurPresence';
import { PopularCourseCompactCard } from '@/components/PopularCourseCompactCard';
import { MenuButton, SideMenu, useSideMenu } from '@/components/SideMenu';
import TrainingHighlights from '@/components/TrainingHighlights';
import WhoWeAre from '@/components/WhoWeAre';
import { Loader } from '@/components/ui/Loader';
import { Colors } from '@/constants/Colors';
import { DUMMY_COURSES } from '@/constants/Dummy';
import { router } from '@/src/navigation/router';
import { coursesService } from '@/services/courses';
import { getAuthData } from '@/utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function HomeScreen() {
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const menu = useSideMenu();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const authData = await getAuthData();
      if (authData) {
        setUserName(authData.user.name);
        setUserImage(authData.user.image || null);
      }

      const fetchedCourses = await coursesService.getAllCourses();

      if (fetchedCourses.length === 0) {
        console.log('Using dummy courses');
        setCourses(DUMMY_COURSES);
      } else {
        setCourses(fetchedCourses);
      }
    } catch (error) {
      console.error('Load data error:', error);
      setCourses(DUMMY_COURSES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.topHeaderSide}>
          <View style={styles.menuButtonWrap}>
            <MenuButton onPress={menu.open} />
          </View>
        </View>

        <View style={styles.topHeaderCenter}>
          <Image
            source={require('@/assets/images/essar_logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerBrand}>Essar</Text>
        </View>

        <View style={[styles.topHeaderSide, styles.topHeaderRight]}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#00766C" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => router.push('/(tabs)/profile')}
          >
            {userImage ? (
              <Image source={{ uri: userImage }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{(userName || 'G').charAt(0).toUpperCase()}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <SideMenu {...menu} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>{getGreeting()},</Text>
          <Text style={styles.userNameText}>{userName || 'Guest'} 👋</Text>
          <Text style={styles.greetingSubtitle}>Keep learning, keep growing!</Text>
        </View>

        {/* Featured Course Banner */}
        <FeaturedCourseBanner courses={courses} />

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <Ionicons name="people" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Students Enrolled</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <Ionicons name="person" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Expert Faculty</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <Ionicons name="book" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statNumber}>{courses.length}+</Text>
            <Text style={styles.statLabel}>Courses Available</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconCircle}>
              <Ionicons name="trophy" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statNumber}>98%</Text>
            <Text style={styles.statLabel}>Placement Assistance</Text>
          </View>
        </View>

        {/* Popular Courses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Courses</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/courses')}>
              <Text style={styles.viewAll}>View All ›</Text>
            </TouchableOpacity>
          </View>
          {courses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>No courses available</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.popularScroll}
              contentContainerStyle={styles.popularList}
            >
              {courses.map((course) => (
                <PopularCourseCompactCard key={course.$id} course={course} />
              ))}
            </ScrollView>
          )}
        </View>

        <WhoWeAre />

        <OurPresence />

        <TrainingHighlights />

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/library')}
            >
              <Ionicons name="library" size={28} color={Colors.primary} />
              <Text style={styles.actionText}>My Courses</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/about')}
            >
              <Ionicons name="information-circle" size={28} color={Colors.primary} />
              <Text style={styles.actionText}>About Us</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/support')}
            >
              <Ionicons name="help-circle" size={28} color={Colors.primary} />
              <Text style={styles.actionText}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Us teaser */}
        <View style={styles.aboutTeaser}>
          <View style={styles.aboutTeaserHeaderRow}>
            <View style={styles.aboutTeaserIcon}>
              <Ionicons name="shield-checkmark" size={22} color={Colors.white} />
            </View>
            <Text style={styles.aboutTeaserTitle}>About Esaar Global Institute</Text>
          </View>

          <Text style={styles.aboutTeaserBlurb}>
            A leading institute for aesthetic medicine, laser & cosmetic science —
            trusted by 500+ healthcare professionals worldwide.
          </Text>

          <View style={styles.aboutTeaserStatsRow}>
            <View style={styles.aboutTeaserStat}>
              <Text style={styles.aboutTeaserStatValue}>5+</Text>
              <Text style={styles.aboutTeaserStatLabel}>Years</Text>
            </View>
            <View style={styles.aboutTeaserStatDivider} />
            <View style={styles.aboutTeaserStat}>
              <Text style={styles.aboutTeaserStatValue}>500+</Text>
              <Text style={styles.aboutTeaserStatLabel}>Graduates</Text>
            </View>
            <View style={styles.aboutTeaserStatDivider} />
            <View style={styles.aboutTeaserStat}>
              <Text style={styles.aboutTeaserStatValue}>50+</Text>
              <Text style={styles.aboutTeaserStatLabel}>Faculty</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.aboutTeaserButton}
            activeOpacity={0.85}
            onPress={() => router.push('/about')}
          >
            <Text style={styles.aboutTeaserButtonText}>Learn More About Us</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.white} />
          </TouchableOpacity>
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
  scrollContent: {
    paddingBottom: 120,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  topHeaderSide: {
    flex: 1,
    flexDirection: 'row',
  },
  menuButtonWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topHeaderCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 28,
    height: 28,
  },
  headerBrand: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  topHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  greetingSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  greetingText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '400',
  },
  userNameText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginTop: 2,
  },
  greetingSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 28,
    marginTop: 4,
  },
  statCard: {
    width: (SCREEN_WIDTH - 40 - 12) / 2,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
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
  viewAll: {
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
  popularScroll: {
    height: 236,
  },
  popularList: {
    paddingRight: 20,
    alignItems: 'flex-start',
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
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 10,
    textAlign: 'center',
  },
  aboutTeaser: {
    backgroundColor: '#0F2E2C',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 28,
    borderRadius: 20,
    padding: 20,
  },
  aboutTeaserHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  aboutTeaserIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutTeaserTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  aboutTeaserBlurb: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 18,
  },
  aboutTeaserStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  aboutTeaserStat: {
    flex: 1,
    alignItems: 'center',
  },
  aboutTeaserStatValue: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  aboutTeaserStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  aboutTeaserStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  aboutTeaserButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
  },
  aboutTeaserButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
