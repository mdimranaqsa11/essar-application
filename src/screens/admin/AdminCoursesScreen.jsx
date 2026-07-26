import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loader } from '@/components/ui/Loader';
import { useToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Colors';
import { adminService } from '@/services/admin';

export function AdminCoursesScreen() {
  const navigation = useNavigation();
  const showToast = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const data = await adminService.listCourses();
    setCourses(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminService.deleteCourse(pendingDelete.course_id);
      setCourses((prev) => prev.filter((c) => c.course_id !== pendingDelete.course_id));
      showToast('Course deleted', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to delete course', 'error');
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <Ionicons name="book" size={22} color={Colors.primary} />
        </View>
      )}

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="pricetag-outline" size={13} color={Colors.textLight} />
          <Text style={styles.metaText}>
            {item.fee != null && Number(item.fee) > 0 ? `₹${item.fee}` : 'Free'}
          </Text>
          {item.students_count != null && (
            <>
              <Ionicons name="people-outline" size={13} color={Colors.textLight} style={styles.metaGap} />
              <Text style={styles.metaText}>{item.students_count} enrolled</Text>
            </>
          )}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('AdminCourseForm', { course: item })}
          >
            <Ionicons name="create-outline" size={16} color={Colors.primary} />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              navigation.navigate('AdminCurriculum', {
                courseId: item.course_id,
                courseTitle: item.title,
              })
            }
          >
            <Ionicons name="list-outline" size={16} color={Colors.info} />
            <Text style={[styles.actionText, { color: Colors.info }]}>Curriculum</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setPendingDelete(item)}
          >
            <Ionicons name="trash-outline" size={16} color={Colors.error} />
            <Text style={[styles.actionText, { color: Colors.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AdminHeader
        title="Courses"
        subtitle={`${courses.length} total`}
        onBack={() => navigation.goBack()}
        rightIcon="add"
        onRightPress={() => navigation.navigate('AdminCourseForm', {})}
      />

      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => String(item.course_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="book-outline"
              title="No Courses Yet"
              description="Tap the + button to add your first course."
            />
          }
        />
      )}

      <ConfirmModal
        visible={!!pendingDelete}
        icon="trash-outline"
        iconColor={Colors.error}
        title="Delete Course"
        message={
          pendingDelete
            ? `Are you sure you want to delete "${pendingDelete.title}"? This cannot be undone.`
            : ''
        }
        confirmText={deleting ? 'Deleting…' : 'Delete'}
        destructive
        onCancel={() => (deleting ? null : setPendingDelete(null))}
        onConfirm={confirmDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
    padding: 12,
    marginBottom: 12,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  thumbPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  metaGap: {
    marginLeft: 8,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
});
