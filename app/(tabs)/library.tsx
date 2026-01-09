import { EmptyState } from '@/components/ui/EmptyState';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CourseCard } from '../../components/CourseCard';
import { Loader } from '../../components/ui/Loader';
import { Colors } from '../../constants/Colors';
import { coursesService } from '../../services/courses';
import { Course } from '../../types';
import { getAuthData } from '../../utils/storage';

export default function LibraryScreen() {
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    try {
      const authData = await getAuthData();
      if (!authData) return;

      const enrollments = await coursesService.getMyEnrollments(authData.user.$id);
      
      const coursesPromises = enrollments.map((enrollment) =>
        coursesService.getCourseById(enrollment.courseId)
      );
      
      const courses = await Promise.all(coursesPromises);
      setMyCourses(courses);
    } catch (error) {
      console.error('Load my courses error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Courses</Text>
        <Text style={styles.subtitle}>{myCourses.length} course(s) enrolled</Text>
      </View>

      <FlatList
        data={myCourses}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={styles.coursesList}
        renderItem={({ item }) => <CourseCard course={item} />}
        ListEmptyComponent={
          <EmptyState
            icon="library-outline"
            title="No Courses Yet"
            description="Start learning by enrolling in courses"
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
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  coursesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
