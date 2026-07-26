import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhotoPickerModal } from '@/components/ui/PhotoPickerModal';
import { useToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Colors';
import { adminService } from '@/services/admin';

export function AdminInstructorFormScreen() {
  const navigation = useNavigation();
  const showToast = useToast();
  const instructor = useRoute().params?.instructor;
  const isEdit = !!instructor;

  const [name, setName] = useState(instructor?.name || '');
  const [designation, setDesignation] = useState(instructor?.designation || '');
  const [bio, setBio] = useState(instructor?.bio || '');
  const [image, setImage] = useState(instructor?.image || '');
  const [saving, setSaving] = useState(false);
  const [photoPickerVisible, setPhotoPickerVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  // The instructor endpoint only accepts an image URL, so a picked file is uploaded to
  // /api/uploads first and the URL it returns becomes the `image` value.
  const uploadPhoto = async (asset) => {
    setUploading(true);
    try {
      const url = await adminService.uploadFile(asset, 'essar/instructors');
      if (!url) throw new Error('Upload did not return a URL');
      setImage(url);
      showToast('Photo uploaded', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to upload photo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const pickFromCamera = async () => {
    setPhotoPickerVisible(false);
    const result = await launchCamera({ mediaType: 'photo', quality: 0.8 });
    if (result.didCancel || !result.assets?.length) return;
    uploadPhoto(result.assets[0]);
  };

  const pickFromLibrary = async () => {
    setPhotoPickerVisible(false);
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.didCancel || !result.assets?.length) return;
    uploadPhoto(result.assets[0]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Instructor name is required', 'error');
      return;
    }

    const payload = {
      name: name.trim(),
      designation: designation.trim() || null,
      bio: bio.trim() || null,
      image: image.trim() || null,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await adminService.updateInstructor(instructor.instructor_id, payload);
        showToast('Instructor updated', 'success');
      } else {
        await adminService.createInstructor(payload);
        showToast('Instructor added', 'success');
      }
      navigation.goBack();
    } catch (error) {
      showToast(error.message || 'Failed to save instructor', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AdminHeader
        title={isEdit ? 'Edit Instructor' : 'New Instructor'}
        subtitle={isEdit ? instructor.name : 'Add a member of the teaching staff'}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label="Full Name"
            placeholder="e.g. Dr. Aisha Khan"
            value={name}
            onChangeText={setName}
            icon="person-outline"
          />
          <Input
            label="Designation"
            placeholder="e.g. Senior Aesthetic Trainer"
            value={designation}
            onChangeText={setDesignation}
            icon="briefcase-outline"
          />
          <Input
            label="Bio"
            placeholder="Short professional bio"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
          />
          <Text style={styles.label}>Photo (optional)</Text>
          {image ? (
            <View style={styles.photoPreviewWrap}>
              <Image source={{ uri: image }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.photoRemoveButton}
                onPress={() => setImage('')}
                hitSlop={8}
              >
                <Ionicons name="close" size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.photoPickButton}
              onPress={() => setPhotoPickerVisible(true)}
              activeOpacity={0.8}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <Ionicons name="person-circle-outline" size={22} color={Colors.primary} />
                  <Text style={styles.photoPickText}>Upload a photo</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <View style={styles.saveButton}>
            <Button
              title={isEdit ? 'Save Changes' : 'Add Instructor'}
              onPress={handleSave}
              loading={saving}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PhotoPickerModal
        visible={photoPickerVisible}
        onCancel={() => setPhotoPickerVisible(false)}
        onTakePhoto={pickFromCamera}
        onChooseFromGallery={pickFromLibrary}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  photoPickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 16,
  },
  photoPickText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  photoPreviewWrap: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  photoPreview: {
    width: 110,
    height: 110,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  photoRemoveButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    marginTop: 8,
  },
});
