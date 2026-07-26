import { Loader } from '@/components/ui/Loader';
import { Colors } from '@/constants/Colors';
import { coursesService } from '@/services/courses';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|bmp)(\?.*)?$/i;

function isImageMaterial(material) {
  return IMAGE_EXTENSIONS.test(material.url || material.name || '');
}

function fileKindLabel(material) {
  const match = /\.([a-z0-9]+)(\?.*)?$/i.exec(material.url || material.name || '');
  return match ? match[1].toUpperCase() : 'FILE';
}

function fileSizeLabel(material) {
  if (material.size == null) return null;
  const mb = material.size / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(material.size / 1024))} KB`;
}

export function PlayerScreen() {
  const navigation = useNavigation();
  const { id, courseId } = useRoute().params || {};

  const [course, setCourse] = useState(null);
  const [contents, setContents] = useState([]);
  const [activeId, setActiveId] = useState(id);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    setActiveId(id);
  }, [id]);

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }
    (async () => {
      const [courseData, courseContents] = await Promise.all([
        coursesService.getCourseById(courseId),
        coursesService.getCourseContents(courseId),
      ]);
      setCourse(courseData);
      setContents(courseContents);
      setLoading(false);
    })();
  }, [courseId]);

  const activeIndex = useMemo(
    () => contents.findIndex((c) => c.$id === activeId),
    [contents, activeId]
  );
  const activeContent = activeIndex >= 0 ? contents[activeIndex] : null;

  const goTo = (index) => {
    if (index < 0 || index >= contents.length) return;
    setActiveId(contents[index].$id);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {course?.title || 'Course Player'}
          </Text>
          {contents.length > 0 && (
            <Text style={styles.headerSubtitle}>
              Lesson {activeIndex + 1} of {contents.length}
            </Text>
          )}
        </View>
      </View>

      {contents.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews={false}
          contentContainerStyle={styles.chapterRow}
          style={styles.chapterScroll}
        >
          {contents.map((content, index) => {
            const active = content.$id === activeId;
            const materialCount = content.materials?.length || 0;
            return (
              <TouchableOpacity
                key={content.$id}
                style={[styles.chapterCard, active && styles.chapterCardActive]}
                onPress={() => setActiveId(content.$id)}
                activeOpacity={0.8}
              >
                <View style={[styles.chapterBadge, active && styles.chapterBadgeActive]}>
                  <Text style={[styles.chapterBadgeText, active && styles.chapterBadgeTextActive]}>
                    {index + 1}
                  </Text>
                </View>
                <View style={[styles.chapterIconCircle, active && styles.chapterIconCircleActive]}>
                  <Ionicons
                    name="book-outline"
                    size={14}
                    color={active ? Colors.primary : Colors.textLight}
                  />
                </View>
                <View style={styles.chapterCardTextWrap}>
                  <Text
                    style={[styles.chapterCardTitle, active && styles.chapterCardTitleActive]}
                    numberOfLines={2}
                  >
                    {content.title}
                  </Text>
                  <Text style={styles.chapterCardMeta}>
                    {materialCount} material{materialCount === 1 ? '' : 's'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <ScrollView
        style={styles.bodyScroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {!activeContent ? (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={40} color={Colors.textLight} />
            <Text style={styles.emptyStateText}>This lesson could not be loaded.</Text>
          </View>
        ) : (
          <>
            <View style={styles.lessonMetaRow}>
              <View style={styles.lessonBadge}>
                <Text style={styles.lessonBadgeText}>LESSON {activeIndex + 1}</Text>
              </View>
              {!!activeContent.duration && (
                <View style={styles.durationPill}>
                  <Ionicons name="time-outline" size={13} color={Colors.textLight} />
                  <Text style={styles.durationPillText}>{activeContent.duration}</Text>
                </View>
              )}
            </View>
            <Text style={styles.lessonTitle}>
              {activeIndex + 1}. {activeContent.title}
            </Text>

            {activeContent.materials?.length > 0 ? (
              <View style={styles.materialList}>
                {activeContent.materials.map((material) =>
                  isImageMaterial(material) ? (
                    <TouchableOpacity
                      key={material.$id}
                      style={styles.fileCard}
                      activeOpacity={0.75}
                      onPress={() => material.url && setPreviewImage(material)}
                    >
                      <Image
                        source={{ uri: material.url }}
                        style={styles.imageThumb}
                        resizeMode="cover"
                      />
                      <View style={styles.fileTextWrap}>
                        <Text style={styles.fileName} numberOfLines={2}>
                          {material.name}
                        </Text>
                        <Text style={styles.fileMeta}>Image</Text>
                      </View>
                      <Ionicons name="expand-outline" size={22} color={Colors.primary} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      key={material.$id}
                      style={styles.fileCard}
                      activeOpacity={0.75}
                      onPress={() => material.url && Linking.openURL(material.url)}
                    >
                      <View style={styles.fileIconSquare}>
                        <Ionicons name="document-text" size={22} color={Colors.primary} />
                      </View>
                      <View style={styles.fileTextWrap}>
                        <Text style={styles.fileName} numberOfLines={2}>
                          {material.name}
                        </Text>
                        <Text style={styles.fileMeta}>
                          {fileKindLabel(material)}
                          {fileSizeLabel(material) ? ` • ${fileSizeLabel(material)}` : ''}
                        </Text>
                      </View>
                      <Ionicons name="download-outline" size={22} color={Colors.primary} />
                    </TouchableOpacity>
                  )
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={40} color={Colors.textLight} />
                <Text style={styles.emptyStateText}>No materials added for this lesson yet.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {contents.length > 1 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.navButtonOutline,
              activeIndex <= 0 && styles.navButtonOutlineDisabled,
            ]}
            onPress={() => goTo(activeIndex - 1)}
            disabled={activeIndex <= 0}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-back"
              size={16}
              color={activeIndex <= 0 ? Colors.textLight : Colors.primary}
            />
            <Text
              style={[styles.navButtonText, activeIndex <= 0 && styles.navButtonTextDisabled]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.navButtonFilled,
              activeIndex >= contents.length - 1 && styles.navButtonFilledDisabled,
            ]}
            onPress={() => goTo(activeIndex + 1)}
            disabled={activeIndex >= contents.length - 1}
            activeOpacity={0.85}
          >
            <Text style={styles.navButtonFilledText}>Next Topic</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={!!previewImage}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <View style={styles.previewBackdrop}>
          <TouchableOpacity
            style={styles.previewCloseButton}
            onPress={() => setPreviewImage(null)}
            hitSlop={12}
          >
            <Ionicons name="close" size={26} color={Colors.white} />
          </TouchableOpacity>
          {!!previewImage && (
            <Image
              source={{ uri: previewImage.url }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
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
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  chapterScroll: {
    height: 106,
    flexGrow: 0,
    flexShrink: 0,
  },
  chapterRow: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
    gap: 10,
    alignItems: 'flex-start',
  },
  chapterCard: {
    position: 'relative',
    width: 150,
    height: 74,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    overflow: 'visible',
  },
  chapterCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 150, 137, 0.08)',
  },
  chapterBadge: {
    position: 'absolute',
    top: -10,
    left: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  chapterBadgeActive: {
    backgroundColor: Colors.primary,
  },
  chapterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textLight,
  },
  chapterBadgeTextActive: {
    color: Colors.white,
  },
  chapterIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterIconCircleActive: {
    backgroundColor: 'rgba(0, 150, 137, 0.14)',
  },
  chapterCardTextWrap: {
    flex: 1,
  },
  chapterCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 15,
  },
  chapterCardTitleActive: {
    color: Colors.primary,
  },
  chapterCardMeta: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  bodyScroll: {
    flex: 1,
  },
  body: {
    padding: 20,
    paddingBottom: 24,
    flexGrow: 1,
  },
  lessonMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  lessonBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lessonBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  durationPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  materialList: {
    gap: 12,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 14,
  },
  fileIconSquare: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileTextWrap: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  fileMeta: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  imageThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '80%',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 24,
    paddingVertical: 14,
  },
  navButtonOutline: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  navButtonOutlineDisabled: {
    borderColor: Colors.border,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  navButtonTextDisabled: {
    color: Colors.textLight,
  },
  navButtonFilled: {
    backgroundColor: Colors.primary,
  },
  navButtonFilledDisabled: {
    backgroundColor: Colors.border,
  },
  navButtonFilledText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
