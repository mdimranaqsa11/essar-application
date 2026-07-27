import { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CourseListCard } from '@/components/CourseListCard';
import { MenuButton, SideMenu, useSideMenu } from '@/components/SideMenu';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loader } from '@/components/ui/Loader';
import { Colors } from '@/constants/Colors';
import { router } from '@/src/navigation/router';
import { coursesService } from '@/services/courses';
import { getAuthData } from '@/utils/storage';

export function CoursesScreen() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('All');
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const menu = useSideMenu();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchQuery, selectedCategoryId, courses]);

  const loadData = async () => {
    try {
      const [fetchedCourses, fetchedCategories] = await Promise.all([
        coursesService.getAllCourses(),
        coursesService.getCategories(),
      ]);

      setCourses(fetchedCourses);
      setCategories(fetchedCategories);

      const authData = await getAuthData();
      if (authData) {
        setIsAdmin(authData.user.role === 'admin');
        const enrollments = await coursesService.getMyEnrollments(authData.user.$id);
        setEnrolledIds(enrollments.map((enrollment) => enrollment.courseId));
      }
    } catch (error) {
      console.error('Load data error:', error);
      setCourses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filterCourses = () => {
    let filtered = [...courses];

    if (searchQuery.trim()) {
      filtered = filtered.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategoryId !== 'All') {
      filtered = filtered.filter((course) => course.categoryId === selectedCategoryId);
    }

    setFilteredCourses(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId('All');
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.menuButtonWrap}>
          <MenuButton onPress={menu.open} />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>
            All <Text style={styles.titleAccent}>Courses</Text>
          </Text>
          <View style={styles.countBadge}>
            <Ionicons name="book-outline" size={12} color={Colors.primary} />
            <Text style={styles.countBadgeText}>
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
            </Text>
          </View>
        </View>
      </View>

      <SideMenu {...menu} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for courses, skills or topics..."
          placeholderTextColor={Colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ $id: 'All', name: 'All' }, ...categories]}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const active = selectedCategoryId === item.$id;
            return (
              <TouchableOpacity
                style={[styles.categoryChip, active && styles.categoryChipActive]}
                onPress={() => setSelectedCategoryId(item.$id)}
              >
                <Ionicons
                  name={item.$id === 'All' ? 'school-outline' : 'pricetag-outline'}
                  size={15}
                  color={active ? Colors.white : Colors.text}
                />
                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Active Filters Indicator */}
      {(searchQuery || selectedCategoryId !== 'All') && (
        <View style={styles.activeFilters}>
          <Text style={styles.activeFiltersText}>
            Filters active
          </Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Courses List */}
      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={styles.coursesList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        renderItem={({ item }) => (
          <CourseListCard
            course={item}
            isEnrolled={enrolledIds.includes(item.$id)}
            isAdmin={isAdmin}
          />
        )}
        ListFooterComponent={
          filteredCourses.length > 0 ? (
            <TouchableOpacity
              style={styles.guidanceCard}
              activeOpacity={0.85}
              onPress={() => router.push('/support')}
            >
              <View style={styles.guidanceIcon}>
                <Ionicons name="school" size={22} color={Colors.white} />
              </View>
              <View style={styles.guidanceText}>
                <Text style={styles.guidanceTitle}>Not sure which course is right for you?</Text>
                <Text style={styles.guidanceSubtitle}>
                  Talk to our expert counsellors and get guidance.
                </Text>
              </View>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="book-outline"
            title="No Courses Found"
            description={
              searchQuery || selectedCategoryId !== 'All'
                ? "Try adjusting your search or filters"
                : "No courses available at the moment"
            }
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  menuButtonWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextWrap: {
    flex: 1,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryList: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  activeFilters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 8,
  },
  activeFiltersText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  clearFiltersText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  coursesList: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  guidanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(0, 150, 137, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
  },
  guidanceIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidanceText: {
    flex: 1,
  },
  guidanceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  guidanceSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
