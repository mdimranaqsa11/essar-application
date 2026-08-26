import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/Colors';
import { router } from '@/src/navigation/router';
import { coursesService } from '@/services/courses';
import { deriveCourseType } from '@/utils/courseType';
import { getAuthData } from '@/utils/storage';
// import { getBookmarkedCourseIds, toggleBookmarkedCourse } from '@/utils/storage';

export function CourseListCard({ course, isEnrolled = false, isAdmin = false }) {
  // const [bookmarked, setBookmarked] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);
  const showToast = useToast();
  const type = deriveCourseType(course.title);

  // useEffect(() => {
  //   getBookmarkedCourseIds().then((ids) => setBookmarked(ids.includes(course.$id)));
  // }, [course.$id]);

  // const handleBookmark = async () => {
  //   const next = await toggleBookmarkedCourse(course.$id);
  //   setBookmarked(next.includes(course.$id));
  // };

  const handlePress = () => router.push(`/course/${course.$id}`);

  const handleEnroll = async () => {
    const authData = await getAuthData();
    if (!authData) {
      setLoginPromptVisible(true);
      return;
    }

    setEnrolling(true);
    try {
      await coursesService.enrollInCourse(authData.user.$id, course.$id);
      showToast('Request submitted! Our team will contact you shortly.', 'success');
    } catch (error) {
      showToast(error.message || 'Enrollment failed. Please try again', 'error');
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <>
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={handlePress}>
      <View style={styles.imageContainer}>
        <Image source={course.thumbnail} style={styles.image} resizeMode="cover" />
        {course.badge && (
          <View style={styles.popularBadge}>
            <Ionicons name="flame" size={11} color={Colors.white} />
            <Text style={styles.popularBadgeText}>{course.badge.toUpperCase()}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          {type ? (
            <View style={[styles.typeBadge, { backgroundColor: type.tint }]}>
              <Text style={[styles.typeBadgeText, { color: type.color }]}>
                {type.label.toUpperCase()}
              </Text>
            </View>
          ) : (
            <View />
          )}
          {/* <TouchableOpacity onPress={handleBookmark} hitSlop={8}>
            <Ionicons
              name={bookmarked ? 'heart' : 'heart-outline'}
              size={20}
              color={bookmarked ? '#e11d48' : Colors.textLight}
            />
          </TouchableOpacity> */}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>

        {course.description && (
          <Text style={styles.description} numberOfLines={2}>
            {course.description}
          </Text>
        )}

        <View style={styles.statsRow}>
          {course.rating > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="star" size={13} color="#fbbf24" />
              <Text style={styles.statText}>{course.rating.toFixed(1)}</Text>
              {course.total_reviews > 0 && (
                <Text style={styles.statTextLight}>({course.total_reviews} Reviews)</Text>
              )}
            </View>
          )}
          {course.enrolledCount > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={13} color={Colors.textLight} />
              <Text style={styles.statTextLight}>{course.enrolledCount}+ Students</Text>
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          {course.duration && (
            <View style={styles.metaChip}>
              <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
              <Text style={styles.metaChipText}>{course.duration}</Text>
            </View>
          )}
          {course.mode && (
            <View style={styles.metaChip}>
              <Ionicons
                name={course.mode === 'Online' ? 'laptop-outline' : 'videocam-outline'}
                size={12}
                color={Colors.textSecondary}
              />
              <Text style={styles.metaChipText}>{course.mode}</Text>
            </View>
          )}
        </View>

        <View style={styles.footerRow}>
          {!isAdmin &&
            (isEnrolled ? (
              <View style={styles.enrolledBadge}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
                <Text style={styles.enrolledBadgeText}>Enrolled</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.enrollButton}
                onPress={handleEnroll}
                disabled={enrolling}
                activeOpacity={0.85}
              >
                <Text style={styles.enrollButtonText}>
                  {enrolling ? 'Requesting...' : 'Request Info'}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      </View>
    </TouchableOpacity>
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
        router.push('/(auth)/login');
      }}
    />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  imageContainer: {
    width: 130,
    height: 230,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  popularBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  popularBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.white,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  statTextLight: {
    fontSize: 12,
    color: Colors.textLight,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaChipText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  enrollButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
  },
  enrollButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  enrolledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 18,
  },
  enrolledBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
});
