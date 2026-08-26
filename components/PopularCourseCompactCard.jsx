import { Colors } from '@/constants/Colors';
import { router } from '@/src/navigation/router';
import { deriveCourseType } from '@/utils/courseType';
// import { getBookmarkedCourseIds, toggleBookmarkedCourse } from '@/utils/storage';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export function PopularCourseCompactCard({ course }) {
  // const [bookmarked, setBookmarked] = useState(false);
  const type = deriveCourseType(course.title);

  // useEffect(() => {
  //   getBookmarkedCourseIds().then((ids) => setBookmarked(ids.includes(course.$id)));
  // }, [course.$id]);

  // const handleBookmark = async () => {
  //   const next = await toggleBookmarkedCourse(course.$id);
  //   setBookmarked(next.includes(course.$id));
  // };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push(`/course/${course.$id}`)}
    >
      <View style={styles.imageContainer}>
        <Image source={course.thumbnail} style={styles.image} resizeMode="cover" />
        {type && (
          <View style={[styles.tagBadge, { backgroundColor: type.color }]}>
            <Text style={styles.tagText}>{type.label.toUpperCase()}</Text>
          </View>
        )}
        {/* <TouchableOpacity style={styles.bookmarkButton} onPress={handleBookmark} hitSlop={8}>
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={16}
            color={bookmarked ? Colors.primary : Colors.text}
          />
        </TouchableOpacity> */}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>

        {course.rating > 0 && (
          <View style={styles.metaRow}>
            <Ionicons name="star" size={13} color="#fbbf24" />
            <Text style={styles.metaText}>{course.rating.toFixed(1)}</Text>
            {course.enrolledCount > 0 && (
              <Text style={styles.metaText}>· {course.enrolledCount}+ Students</Text>
            )}
          </View>
        )}

        {course.duration && (
          <View style={styles.durationRow}>
            <Ionicons name="time-outline" size={13} color={Colors.textLight} />
            <Text style={styles.durationText}>{course.duration}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const CARD_WIDTH = 190;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 14,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tagBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,45,42,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 17,
    marginBottom: 6,
    minHeight: 34,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  durationText: {
    fontSize: 11,
    color: Colors.textLight,
  },
});
