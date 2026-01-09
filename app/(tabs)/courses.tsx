import { EmptyState } from '@/components/ui/EmptyState';
import { Loader } from '@/components/ui/Loader';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CourseCard } from '../../components/CourseCard';
import { Colors } from '../../constants/Colors';
import { DUMMY_COURSES } from '../../constants/Dummy';
import { coursesService } from '../../services/courses';
import { Course } from '../../types';

export default function CoursesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  // const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchQuery, selectedCategory, courses]);

  const loadData = async () => {
    try {
      // Try to fetch from Appwrite
      const fetchedCourses = await coursesService.getAllCourses();
      // const fetchedCategories = await coursesService.getCategories();

      // Use dummy data if nothing in database
      if (fetchedCourses.length === 0) {
        console.log('No courses in Appwrite, using dummy data');
        setCourses(DUMMY_COURSES);
        setFilteredCourses(DUMMY_COURSES);
      } else {
        setCourses(fetchedCourses);
        setFilteredCourses(fetchedCourses);
      }

      // if (fetchedCategories.length === 0) {
      //   console.log('No categories in Appwrite, using dummy data');
      //   setCategories(DUMMY_CATEGORIES);
      // } else {
      //   setCategories(fetchedCategories);
      // }
    } catch (error) {
      console.error('Load data error:', error);
      // Fallback to dummy data on error
      setCourses(DUMMY_COURSES);
      // setCategories(DUMMY_CATEGORIES);
      setFilteredCourses(DUMMY_COURSES);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((course) => course.categoryId === selectedCategory);
    }

    setFilteredCourses(filtered);
  };

  const handleCategoryPress = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      // Deselect if already selected
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>All Courses</Text>
        <Text style={styles.subtitle}>
          {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
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
      {/* {categories.length > 0 && (
        <View style={styles.categoryContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item.$id}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === item.$id && styles.categoryChipActive,
                ]}
                onPress={() => handleCategoryPress(item.$id)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === item.$id && styles.categoryTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )} */}

      {/* Active Filters Indicator */}
      {(searchQuery || selectedCategory) && (
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
        renderItem={({ item }) => <CourseCard course={item} />}
        ListEmptyComponent={
          <EmptyState
            icon="book-outline"
            title="No Courses Found"
            description={
              searchQuery || selectedCategory
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryList: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    paddingHorizontal: 20,
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
    paddingBottom: 20,
  },
});