import { InstructorPickerModal } from '@/components/admin/InstructorPickerModal';
import { SelectField } from '@/components/admin/SelectField';
import { PhotoPickerModal } from '@/components/ui/PhotoPickerModal';
import { useToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Colors';
import { adminService } from '@/services/admin';
import { errorCodes, isErrorWithCode, pick, types } from '@react-native-documents/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const MODES = ['Online', 'Offline', 'Hybrid'];
const COURSE_STATUSES = ['Active', 'Inactive', 'Upcoming'];
const DURATIONS = [
  '1 Month',
  '3 Months',
  '6 Months',
  '9 Months',
  '12 Months',
  '2 Weeks',
  '4 Weeks',
  '6 Weeks',
];
const BADGES = [
  { value: 'Bestseller', icon: 'star', color: '#F5A524' },
  { value: 'Trending', icon: 'flame', color: '#EF4444' },
  { value: 'Popular', icon: 'ribbon', color: '#8B5CF6' },
];
const DESCRIPTION_LIMIT = 500;

const toOptions = (values) => values.map((v) => ({ label: v, value: v }));

// Card wrapper matching the admin form design: tinted icon chip + accent title, then content.
function SectionCard({ icon, title, hint, children, style }) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Ionicons name={icon} size={18} color={Colors.primary} />
        </View>
        <Text style={styles.cardTitle}>
          {title}
          {!!hint && <Text style={styles.cardHint}> {hint}</Text>}
        </Text>
      </View>
      {children}
    </View>
  );
}

export function AdminCourseFormScreen() {
  const navigation = useNavigation();
  const showToast = useToast();
  const course = useRoute().params?.course;
  const isEdit = !!course;

  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [fee, setFee] = useState(course?.fee != null ? String(course.fee) : '');
  const [originalPrice, setOriginalPrice] = useState(
    course?.original_price != null ? String(course.original_price) : ''
  );
  const [duration, setDuration] = useState(course?.duration || '');
  const [level, setLevel] = useState(course?.level || '');
  const [mode, setMode] = useState(course?.mode || '');
  const [language, setLanguage] = useState(course?.language || '');
  const [certificateName, setCertificateName] = useState(course?.certificate_name || '');
  const [startDate, setStartDate] = useState(course?.start_date || '');
  const [courseStatus, setCourseStatus] = useState(course?.course_status || 'Active');
  const [features, setFeatures] = useState(
    Array.isArray(course?.features) ? course.features.join(', ') : ''
  );
  const [badge, setBadge] = useState(course?.badge || '');
  const [thumbnail, setThumbnail] = useState(course?.thumbnail || '');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [brochure, setBrochure] = useState(course?.brochure || '');
  const [brochureFile, setBrochureFile] = useState(null);
  const [categoryId, setCategoryId] = useState(
    course?.category_id != null ? String(course.category_id) : ''
  );
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructorIds, setSelectedInstructorIds] = useState([]);
  // What the course started with, so saving only sends the actual add/remove diff.
  const [initialInstructorIds, setInitialInstructorIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [photoPickerVisible, setPhotoPickerVisible] = useState(false);
  const [instructorPickerVisible, setInstructorPickerVisible] = useState(false);

  useEffect(() => {
    adminService.listCategories().then(setCategories);
    adminService.listInstructors().then(setInstructors);
  }, []);

  useEffect(() => {
    if (!course?.course_id) return;
    adminService.listCourseInstructors(course.course_id).then((assigned) => {
      const ids = assigned.map((i) => i.instructor_id);
      setSelectedInstructorIds(ids);
      setInitialInstructorIds(ids);
    });
  }, [course?.course_id]);

  const toggleInstructor = (id) => {
    setSelectedInstructorIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Applies the instructor selection to a course by diffing against what it had before.
  const syncInstructors = async (courseId) => {
    const toAdd = selectedInstructorIds.filter((id) => !initialInstructorIds.includes(id));
    const toRemove = initialInstructorIds.filter((id) => !selectedInstructorIds.includes(id));

    await Promise.all([
      ...toAdd.map((id) => adminService.assignInstructor(courseId, id)),
      ...toRemove.map((id) => adminService.removeCourseInstructor(courseId, id)),
    ]);
  };

  const handleSave = async () => {
    // The backend requires title, category_id, fee, level and mode on create — validate
    // here so the admin gets a clear message instead of a raw 422 from the API.
    if (!title.trim()) {
      showToast('Course title is required', 'error');
      return;
    }
    if (!categoryId) {
      showToast('Please select a category', 'error');
      return;
    }
    if (!fee.trim()) {
      showToast('Price is required', 'error');
      return;
    }
    if (!level) {
      showToast('Please select a level', 'error');
      return;
    }
    if (!mode) {
      showToast('Please select a mode', 'error');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      fee: Number(fee),
      original_price: originalPrice ? Number(originalPrice) : null,
      duration: duration.trim() || null,
      level,
      mode,
      language: language.trim() || null,
      certificate_name: certificateName.trim() || null,
      start_date: startDate.trim() || null,
      course_status: courseStatus || null,
      // Backend accepts a JSON array — split the comma-separated input into one.
      features: features.trim()
        ? features.split(',').map((f) => f.trim()).filter(Boolean)
        : undefined,
      badge: badge.trim() || null,
      thumbnail: thumbnail.trim() || null,
      thumbnail_file: thumbnailFile,
      brochure: brochure.trim() || null,
      brochure_file: brochureFile,
      category_id: Number(categoryId),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await adminService.updateCourse(course.course_id, payload);
        await syncInstructors(course.course_id);
        showToast('Course updated', 'success');
      } else {
        // Instructors can only be linked once the course exists, so assign them using the
        // id the create call returns.
        const created = await adminService.createCourse(payload);
        if (created?.course_id && selectedInstructorIds.length) {
          await syncInstructors(created.course_id);
        }
        showToast('Course created', 'success');
      }
      navigation.goBack();
    } catch (error) {
      showToast(error.message || 'Failed to save course', 'error');
    } finally {
      setSaving(false);
    }
  };

  const pickFromCamera = async () => {
    setPhotoPickerVisible(false);
    const result = await launchCamera({ mediaType: 'photo', quality: 0.8 });
    if (result.didCancel || !result.assets?.length) return;
    setThumbnailFile(result.assets[0]);
  };

  const pickFromLibrary = async () => {
    setPhotoPickerVisible(false);
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.didCancel || !result.assets?.length) return;
    setThumbnailFile(result.assets[0]);
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnail('');
  };

  // The picked content:// (Android) / file:// (iOS) uri can be handed straight to FormData —
  // RN's fetch reads it without needing a local copy first.
  const pickBrochure = async () => {
    try {
      const [file] = await pick({ type: [types.pdf] });
      if (file) setBrochureFile(file);
    } catch (error) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) return;
      showToast('Could not open the file picker', 'error');
    }
  };

  const removeBrochure = () => {
    setBrochureFile(null);
    setBrochure('');
  };

  const thumbnailPreviewUri = thumbnailFile?.uri || thumbnail || null;
  const brochureDisplayName = brochureFile?.name || (brochure ? brochure.split('/').pop() : null);

  // Keep whatever duration the course already has selectable even if it isn't a preset.
  const durationOptions = toOptions(
    duration && !DURATIONS.includes(duration) ? [duration, ...DURATIONS] : DURATIONS
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {isEdit ? 'Edit Course' : 'New Course'}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {isEdit ? course.title : 'Fill in the course details'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleSave} hitSlop={8} disabled={saving}>
          <Ionicons name="save-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Course Information */}
          <SectionCard icon="book-outline" title="Course Information">
            <Text style={styles.fieldLabel}>Course Title</Text>
            <View style={styles.inputRow}>
              <Ionicons name="book-outline" size={18} color={Colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Advanced Facial Aesthetics"
                placeholderTextColor={Colors.textLight}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <Text style={styles.fieldLabel}>Description</Text>
            <View style={styles.textAreaWrap}>
              <TextInput
                style={styles.textArea}
                placeholder="What will students learn?"
                placeholderTextColor={Colors.textLight}
                value={description}
                onChangeText={(t) => setDescription(t.slice(0, DESCRIPTION_LIMIT))}
                multiline
                textAlignVertical="top"
              />
              <Text style={styles.counter}>
                {description.length}/{DESCRIPTION_LIMIT}
              </Text>
            </View>
          </SectionCard>

          {/* Course Details */}
          <SectionCard icon="pricetag-outline" title="Course Details">
            {/* Two rows — at 1/3 width the values truncate ("Fello…", "Begin…"). */}
            <View style={styles.selectRow}>
              <SelectField
                label="Category"
                icon="school-outline"
                value={categoryId}
                placeholder="Select a category"
                options={categories.map((c) => ({
                  label: c.category_name,
                  value: String(c.category_id),
                }))}
                onChange={setCategoryId}
              />
            </View>

            <View style={[styles.selectRow, styles.selectRowSpaced]}>
              <SelectField
                label="Level"
                icon="stats-chart-outline"
                value={level}
                placeholder="Select"
                options={toOptions(LEVELS)}
                onChange={setLevel}
              />
              <SelectField
                label="Mode"
                icon="desktop-outline"
                value={mode}
                placeholder="Select"
                options={toOptions(MODES)}
                onChange={setMode}
              />
            </View>
          </SectionCard>

          {/* Pricing */}
          <SectionCard icon="cash-outline" title="Pricing">
            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={styles.fieldLabel}>Price (₹)</Text>
                <View style={styles.inputRow}>
                  <Text style={styles.rupee}>₹</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={Colors.textLight}
                    value={fee}
                    onChangeText={setFee}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.rowItem}>
                <Text style={styles.fieldLabel}>Original Price (₹)</Text>
                <View style={styles.inputRow}>
                  <Text style={styles.rupee}>₹</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={Colors.textLight}
                    value={originalPrice}
                    onChangeText={setOriginalPrice}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </SectionCard>

          {/* Duration + Badge */}
          <View style={styles.row}>
            <SectionCard icon="time-outline" title="Duration" style={styles.halfCard}>
              <SelectField
                icon="calendar-outline"
                value={duration}
                placeholder="Select"
                options={durationOptions}
                onChange={setDuration}
              />
            </SectionCard>

            <SectionCard
              icon="ribbon-outline"
              title="Badge"
              hint="(optional)"
              style={styles.halfCard}
            >
              <View style={styles.badgeWrap}>
                {BADGES.map((b) => {
                  const active = badge === b.value;
                  return (
                    <TouchableOpacity
                      key={b.value}
                      style={[styles.badgeChip, active && styles.badgeChipActive]}
                      onPress={() => setBadge(active ? '' : b.value)}
                      activeOpacity={0.75}
                    >
                      <Ionicons
                        name={b.icon}
                        size={14}
                        color={active ? Colors.white : b.color}
                      />
                      <Text style={[styles.badgeText, active && styles.badgeTextActive]}>
                        {b.value}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </SectionCard>
          </View>

          {/* Instructors */}
          <SectionCard icon="people-outline" title="Instructors">
            {instructors.length === 0 ? (
              <Text style={styles.emptyText}>
                No instructors yet — add them under Manage → Instructors.
              </Text>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.instructorPickerButton}
                  onPress={() => setInstructorPickerVisible(true)}
                  activeOpacity={0.75}
                >
                  <Ionicons name="people-outline" size={17} color={Colors.primary} />
                  <Text style={styles.instructorPickerButtonText}>
                    {selectedInstructorIds.length
                      ? `${selectedInstructorIds.length} instructor${
                          selectedInstructorIds.length > 1 ? 's' : ''
                        } selected`
                      : 'Select instructors'}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
                </TouchableOpacity>

                {selectedInstructorIds.length > 0 && (
                  <View style={styles.instructorChipRow}>
                    {instructors
                      .filter((ins) => selectedInstructorIds.includes(ins.instructor_id))
                      .map((ins) => (
                        <View key={ins.instructor_id} style={styles.instructorChip}>
                          {ins.image ? (
                            <Image source={{ uri: ins.image }} style={styles.instructorChipAvatar} />
                          ) : (
                            <View style={[styles.instructorChipAvatar, styles.instructorChipAvatarFallback]}>
                              <Text style={styles.instructorChipInitial}>
                                {(ins.name || '?').charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          )}
                          <Text style={styles.instructorChipText} numberOfLines={1}>
                            {ins.name}
                          </Text>
                          <TouchableOpacity
                            onPress={() => toggleInstructor(ins.instructor_id)}
                            hitSlop={6}
                          >
                            <Ionicons name="close" size={14} color={Colors.textLight} />
                          </TouchableOpacity>
                        </View>
                      ))}
                  </View>
                )}

                <InstructorPickerModal
                  visible={instructorPickerVisible}
                  instructors={instructors}
                  selectedIds={selectedInstructorIds}
                  onToggle={toggleInstructor}
                  onClose={() => setInstructorPickerVisible(false)}
                />
              </>
            )}
          </SectionCard>

          {/* Media */}
          <SectionCard icon="image-outline" title="Media">
            <Text style={styles.fieldLabel}>Thumbnail</Text>
            {thumbnailPreviewUri ? (
              <View style={styles.thumbnailPreviewWrap}>
                <Image source={{ uri: thumbnailPreviewUri }} style={styles.thumbnailPreview} />
                <TouchableOpacity
                  style={styles.thumbnailRemoveButton}
                  onPress={removeThumbnail}
                  hitSlop={8}
                >
                  <Ionicons name="close" size={16} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.pickButton}
                onPress={() => setPhotoPickerVisible(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="image-outline" size={22} color={Colors.primary} />
                <Text style={styles.pickButtonText}>Upload a thumbnail image</Text>
              </TouchableOpacity>
            )}

            {/* {!thumbnailFile && (
              <View style={styles.inputRow}>
                <Ionicons name="link-outline" size={18} color={Colors.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="Or paste a thumbnail URL"
                  placeholderTextColor={Colors.textLight}
                  value={thumbnail}
                  onChangeText={setThumbnail}
                  autoCapitalize="none"
                />
              </View>
            )} */}

            <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>Brochure</Text>
            {brochureDisplayName ? (
              <TouchableOpacity
                style={styles.brochureCard}
                onPress={pickBrochure}
                activeOpacity={0.75}
              >
                <View style={styles.brochureIcon}>
                  <Ionicons name="document-text" size={20} color={Colors.primary} />
                </View>
                <View style={styles.brochureTextWrap}>
                  <Text style={styles.brochureName} numberOfLines={1}>
                    {brochureDisplayName}
                  </Text>
                  <Text style={styles.brochureSize}>
                    {brochureFile?.size != null
                      ? `${(brochureFile.size / 1024 / 1024).toFixed(2)} MB`
                      : 'Tap to replace'}
                  </Text>
                </View>
                <TouchableOpacity onPress={removeBrochure} hitSlop={8}>
                  <Ionicons name="close-circle" size={22} color={Colors.textLight} />
                </TouchableOpacity>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.pickButton} onPress={pickBrochure} activeOpacity={0.8}>
                <Ionicons name="document-attach-outline" size={22} color={Colors.primary} />
                <Text style={styles.pickButtonText}>Upload a brochure PDF</Text>
              </TouchableOpacity>
            )}

            {/* {!brochureFile && (
              <View style={styles.inputRow}>
                <Ionicons name="link-outline" size={18} color={Colors.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="Or paste a brochure PDF URL"
                  placeholderTextColor={Colors.textLight}
                  value={brochure}
                  onChangeText={setBrochure}
                  autoCapitalize="none"
                />
              </View>
            )} */}
          </SectionCard>

          {/* Additional details */}
          <SectionCard icon="options-outline" title="Additional Details">
            <View style={styles.selectRow}>
              <SelectField
                label="Status"
                icon="pulse-outline"
                value={courseStatus}
                options={toOptions(COURSE_STATUSES)}
                onChange={setCourseStatus}
              />
            </View>

            <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>Language</Text>
            <View style={styles.inputRow}>
              <Ionicons name="language-outline" size={18} color={Colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="e.g. English"
                placeholderTextColor={Colors.textLight}
                value={language}
                onChangeText={setLanguage}
              />
            </View>

            <Text style={styles.fieldLabel}>Start Date</Text>
            <View style={styles.inputRow}>
              <Ionicons name="calendar-outline" size={18} color={Colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textLight}
                value={startDate}
                onChangeText={setStartDate}
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.fieldLabel}>Certificate Name</Text>
            <View style={styles.inputRow}>
              <Ionicons name="ribbon-outline" size={18} color={Colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Certified Aesthetic Practitioner"
                placeholderTextColor={Colors.textLight}
                value={certificateName}
                onChangeText={setCertificateName}
              />
            </View>

            <Text style={styles.fieldLabel}>Features</Text>
            <View style={styles.inputRow}>
              <Ionicons name="list-outline" size={18} color={Colors.textLight} />
              <TextInput
                style={styles.input}
                placeholder="Live classes, Certificate"
                placeholderTextColor={Colors.textLight}
                value={features}
                onChangeText={setFeatures}
              />
            </View>
            <Text style={styles.helperText}>Separate each feature with a comma.</Text>
          </SectionCard>
        </ScrollView>

        {/* Sticky actions */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
            disabled={saving}
          >
            <Ionicons name="close-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving}
          >
            <Ionicons name="checkmark" size={18} color={Colors.white} />
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Course'}
            </Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: Colors.surface,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: {
    width: 34,
    height: 34,
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  content: {
    padding: 14,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
    padding: 16,
    marginBottom: 14,
  },
  halfCard: {
    flex: 1,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  cardHint: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textLight,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  fieldLabelSpaced: {
    marginTop: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    padding: 0,
  },
  rupee: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textLight,
  },
  textAreaWrap: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
  },
  textArea: {
    fontSize: 14,
    color: Colors.text,
    minHeight: 96,
    padding: 0,
  },
  counter: {
    alignSelf: 'flex-end',
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 4,
  },
  selectRow: {
    flexDirection: 'row',
    gap: 10,
  },
  selectRowSpaced: {
    marginTop: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  badgeTextActive: {
    color: Colors.white,
  },
  instructorPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  instructorPickerButtonText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  instructorChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  instructorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 150, 137, 0.08)',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingLeft: 4,
    paddingRight: 8,
    paddingVertical: 4,
    maxWidth: '100%',
  },
  instructorChipAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.border,
  },
  instructorChipAvatarFallback: {
    backgroundColor: 'rgba(0, 150, 137, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructorChipInitial: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  instructorChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    maxWidth: 120,
  },
  pickButton: {
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
    marginBottom: 14,
  },
  pickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  thumbnailPreviewWrap: {
    position: 'relative',
    marginBottom: 14,
  },
  thumbnailPreview: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  thumbnailRemoveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brochureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  brochureIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brochureTextWrap: {
    flex: 1,
  },
  brochureName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  brochureSize: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 19,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: -8,
  },
  actionBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  saveButton: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});
