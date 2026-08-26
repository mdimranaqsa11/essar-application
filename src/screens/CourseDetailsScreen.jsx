import { useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Image,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Loader } from '@/components/ui/Loader';
import { useToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Colors';
import { router } from '@/src/navigation/router';
import { coursesService } from '@/services/courses';
import { deriveCourseType } from '@/utils/courseType';
import { getAuthData } from '@/utils/storage';
// import { getBookmarkedCourseIds, toggleBookmarkedCourse } from '@/utils/storage';

const LEARN_ICONS = ['people-outline', 'construct-outline', 'ribbon-outline', 'trending-up-outline'];

export function CourseDetailsScreen() {
  const { id } = useRoute().params;
  const [course, setCourse] = useState(null);
  const [contents, setContents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  // const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);
  const showToast = useToast();

  useEffect(() => {
    loadCourseDetails();
    // getBookmarkedCourseIds().then((ids) => setBookmarked(ids.includes(id)));
  }, [id]);

  const loadCourseDetails = async () => {
    try {
      // Try to load from backend
      const courseData = await coursesService.getCourseById(id);
      const courseContents = await coursesService.getCourseContents(id);
      const courseInstructors = await coursesService.getCourseInstructors(id);

      const authData = await getAuthData();
      if (authData) {
        setIsAdmin(authData.user.role === 'admin');
        const enrolled = await coursesService.isEnrolled(
          authData.user.$id,
          id
        );
        setIsEnrolled(enrolled);
      }

      setCourse(courseData);
      setContents(courseContents);
      setInstructors(courseInstructors);
    } catch (error) {
      console.error('Load course details error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    const authData = await getAuthData();
    if (!authData) {
      setLoginPromptVisible(true);
      return;
    }

    setEnrolling(true);
    try {
      await coursesService.enrollInCourse(authData.user.$id, id);
      setIsEnrolled(true);
      showToast("Request submitted! Our team will contact you shortly.", "success");
    } catch (error) {
      showToast(error.message || "Request failed. Please try again", "error");
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    if (contents.length > 0) {
      router.push(`/player/${contents[0].$id}`, { courseId: id });
    }
  };

  // const handleBookmark = async () => {
  //   const next = await toggleBookmarkedCourse(id);
  //   setBookmarked(next.includes(id));
  // };

  const handleShare = async () => {
    try {
      await Share.share({
        message: course?.title ? `Check out this course: ${course.title}` : 'Check out this course',
      });
    } catch (error) {
      // user dismissed the share sheet — nothing to do
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={Colors.textLight}
          />
          <Text style={styles.errorText}>Course not found</Text>
          <TouchableOpacity style={styles.goBackButton} onPress={() => router.back()}>
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const type = deriveCourseType(course.title);
  // Admins get full access to preview a course without needing to enroll in it.
  const unlocked = isEnrolled || isAdmin;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.imageContainer}>
          <Image source={course.thumbnail} style={styles.image} />
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={[styles.iconCircle, styles.iconCircleLight]} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color={Colors.text} />
            </TouchableOpacity>
            {/* <TouchableOpacity style={[styles.iconCircle, styles.iconCircleLight]} onPress={handleBookmark}>
              <Ionicons
                name={bookmarked ? 'heart' : 'heart-outline'}
                size={20}
                color={bookmarked ? '#e11d48' : Colors.text}
              />
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Course Info */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleColumn}>
              {type && (
                <View style={[styles.typeBadge, { backgroundColor: type.tint }]}>
                  <Ionicons name={type.icon} size={13} color={type.color} />
                  <Text style={[styles.typeBadgeText, { color: type.color }]}>
                    {type.label.toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.title}>{course.title}</Text>
            </View>
            {course.rating > 0 && (
              <View style={styles.ratingColumn}>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={16} color="#fbbf24" />
                  <Text style={styles.ratingText}>{course.rating.toFixed(1)}</Text>
                </View>
                {course.total_reviews > 0 && (
                  <Text style={styles.reviewsText}>({course.total_reviews} Reviews)</Text>
                )}
              </View>
            )}
          </View>

          {instructors.length > 0 && (
            <View style={styles.instructorRow}>
              <View style={styles.avatarStack}>
                {instructors.slice(0, 3).map((instructor, index) => (
                  <View
                    key={instructor.$id}
                    style={[
                      styles.avatarStackItem,
                      { marginLeft: index === 0 ? 0 : -12, zIndex: instructors.length - index },
                    ]}
                  >
                    {instructor.image ? (
                      <Image source={instructor.image} style={styles.avatarStackImage} />
                    ) : (
                      <Ionicons name="person" size={16} color={Colors.primary} />
                    )}
                  </View>
                ))}
              </View>
              <Text style={styles.instructorNames} numberOfLines={1}>
                by {instructors.map((i) => i.name).join(', ')}
              </Text>
            </View>
          )}

          <View style={styles.metaContainer}>
            {course.duration && (
              <View style={styles.metaCol}>
                <Ionicons name="time-outline" size={18} color={Colors.primary} />
                <Text style={styles.metaValue}>{course.duration}</Text>
                <Text style={styles.metaLabel}>Duration</Text>
              </View>
            )}
            <View style={styles.metaCol}>
              <Ionicons name="videocam-outline" size={18} color={Colors.primary} />
              <Text style={styles.metaValue}>{contents.length}</Text>
              <Text style={styles.metaLabel}>Total Lessons</Text>
            </View>
            {course.enrolledCount > 0 && (
              <View style={styles.metaCol}>
                <Ionicons name="people-outline" size={18} color={Colors.primary} />
                <Text style={styles.metaValue}>{course.enrolledCount}+</Text>
                <Text style={styles.metaLabel}>Students Enrolled</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Course</Text>
            <Text style={styles.description}>{course.description}</Text>
          </View>

          {/* What You'll Learn */}
          {course.features && course.features.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{"What You'll Learn"}</Text>
              <View style={styles.learnGrid}>
                {course.features.map((feature, index) => (
                  <View key={index} style={styles.learnCard}>
                    <View style={styles.learnIconCircle}>
                      <Ionicons
                        name={LEARN_ICONS[index % LEARN_ICONS.length]}
                        size={18}
                        color={Colors.primary}
                      />
                    </View>
                    <Text style={styles.learnCardText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* What's Included */}
          {(course.mode || course.certificate_name) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{"What's Included"}</Text>
              <View style={styles.includedRow}>
                {course.mode && (
                  <View style={styles.includedItem}>
                    <Ionicons
                      name={course.mode === 'Online' ? 'laptop-outline' : 'videocam-outline'}
                      size={20}
                      color={Colors.primary}
                    />
                    <Text style={styles.includedLabel}>{course.mode}</Text>
                    <View style={styles.includedTagPill}>
                      <Text style={styles.includedTag}>Format</Text>
                    </View>
                  </View>
                )}
                {course.certificate_name && (
                  <View style={styles.includedItem}>
                    <Ionicons name="ribbon-outline" size={20} color={Colors.primary} />
                    <Text style={styles.includedLabel} numberOfLines={1}>
                      Certificate
                    </Text>
                    <View style={styles.includedTagPill}>
                      <Text style={styles.includedTag}>Included</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Brochure */}
          {course.brochure && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Brochure</Text>
              <TouchableOpacity
                style={styles.brochureButton}
                onPress={() => Linking.openURL(course.brochure)}
              >
                <Ionicons name="document-attach-outline" size={20} color={Colors.primary} />
                <Text style={styles.brochureButtonText}>Download Brochure</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Course Content */}
          {contents.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Course Content</Text>
              <Text style={styles.contentSubtitle}>
                {contents.length} lessons
              </Text>
              {contents.map((content, index) => (
                <View key={content.$id} style={styles.contentItem}>
                  <View style={styles.contentLeft}>
                    <View style={styles.contentIcon}>
                      <Ionicons
                        name={
                          content.type === "video"
                            ? "play-circle"
                            : "document-text"
                        }
                        size={24}
                        color={Colors.primary}
                      />
                    </View>
                    <View style={styles.contentInfo}>
                      <Text style={styles.contentTitle}>
                        {index + 1}. {content.title}
                      </Text>
                      {content.duration && (
                        <Text style={styles.contentDuration}>
                          {content.duration}
                        </Text>
                      )}
                    </View>
                  </View>
                  {unlocked && (
                    <TouchableOpacity
                      onPress={() => router.push(`/player/${content.$id}`, { courseId: id })}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={Colors.textLight}
                      />
                    </TouchableOpacity>
                  )}
                  {!unlocked && (
                    <Ionicons
                      name="lock-closed"
                      size={20}
                      color={Colors.textLight}
                    />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.footer}>
        {unlocked ? (
          <TouchableOpacity style={styles.enrollButton} onPress={handleStartLearning}>
            <Text style={styles.enrollButtonText}>Start Learning</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.enrollButton}
            onPress={handleEnroll}
            disabled={enrolling}
          >
            <Text style={styles.enrollButtonText}>
              {enrolling ? 'Requesting...' : 'Request Info'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>

      <ConfirmModal
        visible={loginPromptVisible}
        icon="log-in-outline"
        title="Login Required"
        message="Please login to request info about this course"
        cancelText="Cancel"
        confirmText="Login"
        onCancel={() => setLoginPromptVisible(false)}
        onConfirm={() => {
          setLoginPromptVisible(false);
          router.push("/(auth)/login");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  imageContainer: {
    width: "100%",
    height: 260,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.surface,
  },
  iconCircle: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircleLight: {
    position: "relative",
    top: 0,
    left: 0,
    backgroundColor: Colors.white,
  },
  headerRightIcons: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    gap: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleColumn: {
    flex: 1,
    marginRight: 12,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    lineHeight: 28,
  },
  ratingColumn: {
    alignItems: "flex-end",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400e",
  },
  reviewsText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  instructorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarStack: {
    flexDirection: "row",
    marginRight: 10,
  },
  avatarStackItem: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarStackImage: {
    width: "100%",
    height: "100%",
  },
  instructorNames: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  metaContainer: {
    flexDirection: "row",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 20,
  },
  metaCol: {
    alignItems: "flex-start",
    gap: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  contentSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  learnGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  learnCard: {
    width: "47%",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 14,
  },
  learnIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 150, 137, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  learnCardText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    lineHeight: 18,
  },
  includedRow: {
    flexDirection: "row",
    gap: 12,
  },
  includedItem: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  includedLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  includedTagPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 150, 137, 0.1)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  includedTag: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.primary,
  },
  contentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  contentIcon: {
    marginRight: 12,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  contentDuration: {
    fontSize: 14,
    color: Colors.textLight,
  },
  brochureButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    gap: 8,
  },
  brochureButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  enrollButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  enrollButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.textLight,
    marginVertical: 20,
  },
  goBackButton: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  goBackButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.white,
  },
});
