import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { adminService } from '@/services/admin';
import { getAuthData } from '@/utils/storage';

const MANAGE_SECTIONS = [
  {
    key: 'AdminCourses',
    title: 'Courses',
    subtitle: 'Add, edit & remove courses',
    icon: 'book',
  },
  {
    key: 'AdminCategories',
    title: 'Categories',
    subtitle: 'Organise courses by category',
    icon: 'pricetags',
  },
  {
    key: 'AdminInstructors',
    title: 'Instructors',
    subtitle: 'Manage teaching staff',
    icon: 'people',
  },
  {
    key: 'AdminUsers',
    title: 'Users',
    subtitle: 'View all registered learners',
    icon: 'person-circle',
  },
];

export function AdminPanelScreen() {
  const navigation = useNavigation();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({ courses: 0, users: 0, instructors: 0, categories: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    const [authData, courses, users, instructors, categories] = await Promise.all([
      getAuthData(),
      adminService.listCourses(),
      adminService.listUsers(),
      adminService.listInstructors(),
      adminService.listCategories(),
    ]);
    if (authData) setAdmin(authData.user);
    setStats({
      courses: courses.length,
      users: users.length,
      instructors: instructors.length,
      categories: categories.length,
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const statCards = [
    { label: 'Courses', value: stats.courses, icon: 'book-outline', color: Colors.primary },
    { label: 'Users', value: stats.users, icon: 'people-outline', color: Colors.info },
    { label: 'Instructors', value: stats.instructors, icon: 'school-outline', color: Colors.warning },
    { label: 'Categories', value: stats.categories, icon: 'pricetags-outline', color: Colors.success },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.white} />
            <Text style={styles.heroBadgeText}>Admin</Text>
          </View>
          <Text style={styles.heroTitle}>Admin Panel</Text>
          <Text style={styles.heroSubtitle}>
            Welcome{admin?.name ? `, ${admin.name}` : ''}. Manage everything in one place.
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {statCards.map((card) => (
            <View key={card.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${card.color}1A` }]}>
                <Ionicons name={card.icon} size={20} color={card.color} />
              </View>
              <Text style={styles.statValue}>{card.value}</Text>
              <Text style={styles.statLabel}>{card.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick action */}
        <TouchableOpacity
          style={styles.primaryAction}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('AdminCourseForm', {})}
        >
          <View style={styles.primaryActionIcon}>
            <Ionicons name="add" size={22} color={Colors.primary} />
          </View>
          <View style={styles.primaryActionText}>
            <Text style={styles.primaryActionTitle}>Add New Course</Text>
            <Text style={styles.primaryActionSubtitle}>Create a course and publish it instantly</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>

        {/* Manage sections */}
        <Text style={styles.sectionHeading}>Manage</Text>
        <View style={styles.menuCard}>
          {MANAGE_SECTIONS.map((section, index) => (
            <TouchableOpacity
              key={section.key}
              style={[styles.menuItem, index === MANAGE_SECTIONS.length - 1 && styles.menuItemLast]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(section.key)}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={section.icon} size={20} color={Colors.primary} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{section.title}</Text>
                <Text style={styles.menuSubtitle}>{section.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
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
    // Clears the floating tab bar, same as the other tab screens.
    paddingBottom: 120,
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
  },
  primaryActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionText: {
    flex: 1,
  },
  primaryActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  primaryActionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  menuCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
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
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
});
