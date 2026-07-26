import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { useToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Colors';
import { adminService } from '@/services/admin';

export function AdminCategoriesScreen() {
  const navigation = useNavigation();
  const showToast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // editing === null → closed. editing === {} → add. editing === {..} → edit.
  const [editing, setEditing] = useState(null);
  const [nameValue, setNameValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback(async () => {
    const data = await adminService.listCategories();
    setCategories(data);
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

  const openAdd = () => {
    setEditing({});
    setNameValue('');
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setNameValue(cat.category_name || '');
  };

  const closeModal = () => {
    if (saving) return;
    setEditing(null);
    setNameValue('');
  };

  const handleSave = async () => {
    if (!nameValue.trim()) {
      showToast('Category name is required', 'error');
      return;
    }
    const isEdit = editing && editing.category_id != null;
    setSaving(true);
    try {
      if (isEdit) {
        await adminService.updateCategory(editing.category_id, {
          category_name: nameValue.trim(),
        });
        showToast('Category updated', 'success');
      } else {
        await adminService.createCategory({ category_name: nameValue.trim() });
        showToast('Category added', 'success');
      }
      setEditing(null);
      setNameValue('');
      load();
    } catch (error) {
      showToast(error.message || 'Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await adminService.deleteCategory(pendingDelete.category_id);
      setCategories((prev) => prev.filter((c) => c.category_id !== pendingDelete.category_id));
      showToast('Category deleted', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to delete category', 'error');
    } finally {
      setPendingDelete(null);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Ionicons name="pricetag" size={18} color={Colors.primary} />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {item.category_name}
      </Text>
      <TouchableOpacity style={styles.iconBtn} hitSlop={6} onPress={() => openEdit(item)}>
        <Ionicons name="create-outline" size={20} color={Colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconBtn} hitSlop={6} onPress={() => setPendingDelete(item)}>
        <Ionicons name="trash-outline" size={20} color={Colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AdminHeader
        title="Categories"
        subtitle={`${categories.length} total`}
        onBack={() => navigation.goBack()}
        rightIcon="add"
        onRightPress={openAdd}
      />

      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.category_id)}
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
              icon="pricetags-outline"
              title="No Categories Yet"
              description="Tap the + button to create your first category."
            />
          }
        />
      )}

      {/* Add / edit modal */}
      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={closeModal}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editing && editing.category_id != null ? 'Edit Category' : 'New Category'}
            </Text>
            <Input
              label="Category Name"
              placeholder="e.g. Aesthetics"
              value={nameValue}
              onChangeText={setNameValue}
              icon="pricetag-outline"
            />
            <View style={styles.modalButtons}>
              <View style={styles.modalButton}>
                <Button title="Cancel" variant="outline" onPress={closeModal} />
              </View>
              <View style={styles.modalButton}>
                <Button title="Save" onPress={handleSave} loading={saving} />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ConfirmModal
        visible={!!pendingDelete}
        icon="trash-outline"
        iconColor={Colors.error}
        title="Delete Category"
        message={
          pendingDelete
            ? `Delete "${pendingDelete.category_name}"? Courses in it will be uncategorised.`
            : ''
        }
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
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  iconBtn: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 22,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
