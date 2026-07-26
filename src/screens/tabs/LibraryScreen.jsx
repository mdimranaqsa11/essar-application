import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CourseCard } from '@/components/CourseCard';
import { MenuButton, SideMenu, useSideMenu } from '@/components/SideMenu';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loader } from '@/components/ui/Loader';
import { Colors } from '@/constants/Colors';
import { coursesService } from '@/services/courses';
import { getAuthData } from '@/utils/storage';

export function LibraryScreen() {
  const [myCourses, setMyCourses] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const menu = useSideMenu();

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    try {
      const authData = await getAuthData();
      if (!authData) {
        setMyCourses([]);
        return;
      }

      setIsAdmin(authData.user.role === 'admin');
      const enrollments = await coursesService.getMyEnrollments(authData.user.$id);
      setMyCourses(enrollments.map((enrollment) => enrollment.course).filter(Boolean));
    } catch (error) {
      console.error('Load my courses error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMyCourses();
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.menuButtonWrap}>
            <MenuButton onPress={menu.open} />
          </View>
          <View>
            <Text style={styles.title}>
              My <Text style={styles.titleAccent}>Learning</Text>
            </Text>
            <View style={styles.countBadge}>
              <Ionicons name="school-outline" size={12} color={Colors.primary} />
              <Text style={styles.countBadgeText}>
                {myCourses.length} course{myCourses.length !== 1 ? 's' : ''} enrolled
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.reloadButton} onPress={onRefresh} disabled={refreshing}>
          <Ionicons name="refresh" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <SideMenu {...menu} />

      <FlatList
        data={myCourses}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={[
          styles.coursesList,
          myCourses.length === 0 && styles.coursesListEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        renderItem={({ item }) => <CourseCard course={item} isEnrolled isAdmin={isAdmin} />}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  reloadButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coursesList: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    flexGrow: 1,
  },
  coursesListEmpty: {
    justifyContent: 'center',
  },
});
