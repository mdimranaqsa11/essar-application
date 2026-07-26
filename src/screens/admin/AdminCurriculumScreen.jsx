import { errorCodes, isErrorWithCode, pick } from '@react-native-documents/picker';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Linking,
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

const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|bmp)(\?.*)?$/i;

function materialUrl(material) {
  return material.file_url || material.url;
}

function nameFromUrl(url) {
  if (!url) return null;
  const clean = url.split('?')[0].split('#')[0];
  const last = clean.substring(clean.lastIndexOf('/') + 1);
  try {
    return last ? decodeURIComponent(last) : null;
  } catch {
    return last || null;
  }
}

function materialName(material) {
  return (
    material.file_name || material.name || nameFromUrl(materialUrl(material)) || 'Material'
  );
}

function fileKindLabel(material) {
  const source = materialUrl(material) || materialName(material) || '';
  const match = /\.([a-z0-9]+)(\?.*)?$/i.exec(source);
  return match ? match[1].toUpperCase() : 'FILE';
}

function fileSizeLabel(material) {
  const size = material.file_size ?? material.size;
  if (size == null) return null;
  const mb = size / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(size / 1024))} KB`;
}

function isImageMaterial(material) {
  return IMAGE_EXTENSIONS.test(materialUrl(material) || materialName(material) || '');
}

export function AdminCurriculumScreen() {
  const navigation = useNavigation();
  const showToast = useToast();
  const { courseId, courseTitle } = useRoute().params || {};

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editing, setEditing] = useState(null); // null | {} (add) | topic (edit)
  const [nameValue, setNameValue] = useState('');
  const [orderValue, setOrderValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [uploadingTopicId, setUploadingTopicId] = useState(null);
  const [pendingDeleteMaterial, setPendingDeleteMaterial] = useState(null); // { topic, material }
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpanded = (curriculumId) => {
    setExpandedId((prev) => (prev === curriculumId ? null : curriculumId));
  };

  const load = useCallback(async () => {
    const data = await adminService.listCurriculum(courseId);
    // Keep topics ordered by their topic_order when present.
    data.sort((a, b) => (a.topic_order ?? 0) - (b.topic_order ?? 0));
    setTopics(data);
    setLoading(false);
  }, [courseId]);

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
    setOrderValue(String(topics.length + 1));
  };

  const openEdit = (topic) => {
    setEditing(topic);
    setNameValue(topic.topic_name || '');
    setOrderValue(topic.topic_order != null ? String(topic.topic_order) : '');
  };

  const closeModal = () => {
    if (saving) return;
    setEditing(null);
    setNameValue('');
    setOrderValue('');
  };

  const handleSave = async () => {
    if (!nameValue.trim()) {
      showToast('Topic name is required', 'error');
      return;
    }
    const isEdit = editing && editing.curriculum_id != null;
    const payload = {
      topic_name: nameValue.trim(),
      topic_order: orderValue ? Number(orderValue) : null,
    };
    setSaving(true);
    try {
      if (isEdit) {
        await adminService.updateCurriculum(editing.curriculum_id, payload);
        showToast('Topic updated', 'success');
      } else {
        await adminService.createCurriculum(courseId, payload);
        showToast('Topic added', 'success');
      }
      setEditing(null);
      setNameValue('');
      setOrderValue('');
      load();
    } catch (error) {
      showToast(error.message || 'Failed to save topic', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await adminService.deleteCurriculum(pendingDelete.curriculum_id);
      setTopics((prev) => prev.filter((t) => t.curriculum_id !== pendingDelete.curriculum_id));
      showToast('Topic deleted', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to delete topic', 'error');
    } finally {
      setPendingDelete(null);
    }
  };

  const pickMaterials = async (curriculumId) => {
    try {
      const files = await pick({ allowMultiSelection: true });
      if (!files?.length) return;
      if (files.length > 10) {
        showToast('You can upload up to 10 files at a time', 'error');
        return;
      }
      setUploadingTopicId(curriculumId);
      await adminService.uploadMaterials(curriculumId, files);
      showToast('Materials uploaded', 'success');
      load();
    } catch (error) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) return;
      showToast(error.message || 'Could not upload materials', 'error');
    } finally {
      setUploadingTopicId(null);
    }
  };

  const confirmDeleteMaterial = async () => {
    if (!pendingDeleteMaterial) return;
    const { material } = pendingDeleteMaterial;
    try {
      await adminService.deleteMaterial(material.material_id ?? material.id);
      showToast('Material removed', 'success');
      load();
    } catch (error) {
      showToast(error.message || 'Failed to remove material', 'error');
    } finally {
      setPendingDeleteMaterial(null);
    }
  };

  const renderItem = ({ item, index }) => {
    const materials = item.materials || [];
    const uploading = uploadingTopicId === item.curriculum_id;
    const expanded = expandedId === item.curriculum_id;
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          activeOpacity={0.75}
          onPress={() => toggleExpanded(item.curriculum_id)}
        >
          <View style={styles.orderCircle}>
            <Text style={styles.orderText}>{item.topic_order ?? index + 1}</Text>
          </View>
          <View style={styles.nameWrap}>
            <Text style={styles.name} numberOfLines={2}>
              {item.topic_name}
            </Text>
            <Text style={styles.materialCount}>
              {materials.length} material{materials.length === 1 ? '' : 's'}
            </Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} hitSlop={6} onPress={() => openEdit(item)}>
            <Ionicons name="create-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} hitSlop={6} onPress={() => setPendingDelete(item)}>
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={Colors.textLight}
          />
        </TouchableOpacity>

        {expanded && (
          <>
            {materials.length > 0 && (
              <View style={styles.materialGrid}>
                {materials.map((material) => {
                  const key = material.material_id ?? material.id;
                  const isImage = isImageMaterial(material);
                  const size = fileSizeLabel(material);
                  return (
                    <TouchableOpacity
                      key={key}
                      style={styles.materialCard}
                      activeOpacity={0.8}
                      onPress={() => {
                        const url = materialUrl(material);
                        if (url) Linking.openURL(url);
                      }}
                    >
                      <View style={styles.materialCardActions}>
                        <TouchableOpacity
                          hitSlop={8}
                          onPress={() => {
                            const url = materialUrl(material);
                            if (url) Linking.openURL(url);
                          }}
                        >
                          <Ionicons name="download-outline" size={14} color={Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          hitSlop={8}
                          onPress={() => setPendingDeleteMaterial({ topic: item, material })}
                        >
                          <Ionicons name="trash-outline" size={14} color={Colors.error} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.materialIconWrap}>
                        <Ionicons
                          name={isImage ? 'image' : 'document-text'}
                          size={16}
                          color={Colors.primary}
                        />
                        <View style={styles.materialKindBadge}>
                          <Text style={styles.materialKindText}>{fileKindLabel(material)}</Text>
                        </View>
                      </View>
                      <Text style={styles.materialCardName} numberOfLines={2}>
                        {materialName(material)}
                      </Text>
                      {!!size && <Text style={styles.materialCardSize}>{size}</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <TouchableOpacity
              style={styles.addMaterialButton}
              onPress={() => pickMaterials(item.curriculum_id)}
              disabled={uploading}
              activeOpacity={0.75}
            >
              <Ionicons name="attach-outline" size={15} color={Colors.primary} />
              <Text style={styles.addMaterialText}>
                {uploading ? 'Uploading…' : 'Add Study Materials'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AdminHeader
        title="Curriculum"
        subtitle={courseTitle || `${topics.length} topics`}
        onBack={() => navigation.goBack()}
        rightIcon="add"
        onRightPress={openAdd}
      />

      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={topics}
          keyExtractor={(item) => String(item.curriculum_id)}
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
              icon="list-outline"
              title="No Topics Yet"
              description="Tap the + button to add the first curriculum topic."
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
              {editing && editing.curriculum_id != null ? 'Edit Topic' : 'New Topic'}
            </Text>
            <Input
              label="Topic Name"
              placeholder="e.g. Introduction to Botox"
              value={nameValue}
              onChangeText={setNameValue}
              icon="document-text-outline"
            />
            <Input
              label="Order"
              placeholder="e.g. 1"
              value={orderValue}
              onChangeText={setOrderValue}
              keyboardType="numeric"
              icon="swap-vertical-outline"
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
        title="Delete Topic"
        message={pendingDelete ? `Delete "${pendingDelete.topic_name}"?` : ''}
        confirmText="Delete"
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />

      <ConfirmModal
        visible={!!pendingDeleteMaterial}
        icon="document-outline"
        iconColor={Colors.error}
        title="Remove Material"
        message={
          pendingDeleteMaterial
            ? `Remove "${
                pendingDeleteMaterial.material.file_name || pendingDeleteMaterial.material.name
              }"?`
            : ''
        }
        confirmText="Remove"
        destructive
        onCancel={() => setPendingDeleteMaterial(null)}
        onConfirm={confirmDeleteMaterial}
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
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  nameWrap: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  materialCount: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  iconBtn: {
    padding: 4,
  },
  materialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  materialCard: {
    width: '31%',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.divider,
    padding: 8,
  },
  materialCardActions: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    gap: 8,
    zIndex: 1,
  },
  materialIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 150, 137, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  materialKindBadge: {
    position: 'absolute',
    bottom: -5,
    right: -8,
    backgroundColor: Colors.primary,
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  materialKindText: {
    fontSize: 7,
    fontWeight: '700',
    color: Colors.white,
  },
  materialCardName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 14,
  },
  materialCardSize: {
    fontSize: 9,
    color: Colors.textLight,
    marginTop: 2,
  },
  addMaterialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 10,
  },
  addMaterialText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
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
