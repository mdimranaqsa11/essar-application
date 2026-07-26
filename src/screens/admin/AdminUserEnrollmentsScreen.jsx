import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loader } from '@/components/ui/Loader';
import { useToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Colors';
import { adminService } from '@/services/admin';

const STATUS_COLORS = {
  Pending: Colors.warning,
  Enrolled: Colors.primary,
  Completed: Colors.success,
  Cancelled: Colors.textLight,
};

export function AdminUserEnrollmentsScreen() {
  const navigation = useNavigation();
  const showToast = useToast();
  const { user } = useRoute().params || {};

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingCancel, setPendingCancel] = useState(null);

  const load = useCallback(async () => {
    if (!user?.user_id) return;
    const data = await adminService.listUserEnrollments(user.user_id);
    setEnrollments(data);
    setLoading(false);
  }, [user?.user_id]);

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

  const confirmCancel = async () => {
    if (!pendingCancel) return;
    try {
      await adminService.cancelEnrollment(pendingCancel.enrollment_id);
      setEnrollments((prev) =>
        prev.map((e) =>
          e.enrollment_id === pendingCancel.enrollment_id
            ? { ...e, enrollment_status: 'Cancelled' }
            : e
        )
      );
      showToast('Enrollment cancelled', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to cancel enrollment', 'error');
    } finally {
      setPendingCancel(null);
    }
  };

  const renderItem = ({ item }) => {
    const course = item.course || {};
    const isCancelled = item.enrollment_status === 'Cancelled';
    const statusColor = STATUS_COLORS[item.enrollment_status] || Colors.textLight;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          course.course_id != null &&
          navigation.navigate('CourseDetails', { id: String(course.course_id) })
        }
      >
        {course.thumbnail ? (
          <Image source={{ uri: course.thumbnail }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbFallback]}>
            <Ionicons name="book-outline" size={22} color={Colors.primary} />
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {course.title || 'Untitled course'}
          </Text>

          <View style={styles.metaRow}>
            {course.fee != null && (
              <View style={styles.metaItem}>
                <Ionicons name="pricetag-outline" size={12} color={Colors.textLight} />
                <Text style={styles.metaText}>
                  {Number(course.fee) > 0 ? `₹${course.fee}` : 'Free'}
                </Text>
              </View>
            )}
            {course.duration && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={12} color={Colors.textLight} />
                <Text style={styles.metaText}>{course.duration}</Text>
              </View>
            )}
            {course.mode && (
              <View style={styles.metaItem}>
                <Ionicons name="laptop-outline" size={12} color={Colors.textLight} />
                <Text style={styles.metaText}>{course.mode}</Text>
              </View>
            )}
          </View>

          <View style={styles.footerRow}>
            {!!item.enrollment_status && (
              <View style={[styles.statusPill, { backgroundColor: `${statusColor}1A` }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {item.enrollment_status}
                </Text>
              </View>
            )}
            {!isCancelled && (
              <TouchableOpacity
                style={styles.cancelBtn}
                hitSlop={8}
                onPress={() => setPendingCancel(item)}
              >
                <Ionicons name="close-circle-outline" size={16} color={Colors.error} />
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AdminHeader
        title={user?.name || 'Enrolled Courses'}
        subtitle={`${enrollments.length} course${enrollments.length === 1 ? '' : 's'} enrolled`}
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={enrollments}
          keyExtractor={(item) => String(item.enrollment_id)}
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
              title="No Courses Enrolled"
              description={`${user?.name || 'This user'} hasn't enrolled in any course yet.`}
            />
          }
        />
      )}

      <ConfirmModal
        visible={!!pendingCancel}
        icon="close-circle-outline"
        iconColor={Colors.error}
        title="Cancel Enrollment"
        message={
          pendingCancel
            ? `Cancel enrollment in "${pendingCancel.course?.title || 'this course'}"?`
            : ''
        }
        confirmText="Cancel Enrollment"
        destructive
        onCancel={() => setPendingCancel(null)}
        onConfirm={confirmCancel}
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
  thumbFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.error,
  },
});
