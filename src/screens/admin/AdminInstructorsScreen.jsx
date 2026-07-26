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

export function AdminInstructorsScreen() {
  const navigation = useNavigation();
  const showToast = useToast();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback(async () => {
    const data = await adminService.listInstructors();
    setInstructors(data);
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
    try {
      await adminService.deleteInstructor(pendingDelete.instructor_id);
      setInstructors((prev) =>
        prev.filter((i) => i.instructor_id !== pendingDelete.instructor_id)
      );
      showToast('Instructor deleted', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to delete instructor', 'error');
    } finally {
      setPendingDelete(null);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase() || '?'}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        {item.designation ? (
          <Text style={styles.designation} numberOfLines={1}>
            {item.designation}
          </Text>
        ) : null}
        {item.bio ? (
          <Text style={styles.bio} numberOfLines={2}>
            {item.bio}
          </Text>
        ) : null}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('AdminInstructorForm', { instructor: item })}
          >
            <Ionicons name="create-outline" size={15} color={Colors.primary} />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setPendingDelete(item)}>
            <Ionicons name="trash-outline" size={15} color={Colors.error} />
            <Text style={[styles.actionText, { color: Colors.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AdminHeader
        title="Instructors"
        subtitle={`${instructors.length} total`}
        onBack={() => navigation.goBack()}
        rightIcon="add"
        onRightPress={() => navigation.navigate('AdminInstructorForm', {})}
      />

      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={instructors}
          keyExtractor={(item) => String(item.instructor_id)}
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
              icon="people-outline"
              title="No Instructors Yet"
              description="Tap the + button to add your first instructor."
            />
          }
        />
      )}

      <ConfirmModal
        visible={!!pendingDelete}
        icon="trash-outline"
        iconColor={Colors.error}
        title="Delete Instructor"
        message={pendingDelete ? `Remove ${pendingDelete.name}? This cannot be undone.` : ''}
        confirmText="Delete"
        destructive
        onCancel={() => setPendingDelete(null)}
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
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  designation: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  bio: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    lineHeight: 17,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
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
