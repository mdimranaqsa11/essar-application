import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { Loader } from "../../components/ui/Loader";
import { Colors } from "../../constants/Colors";
import {
  getDummyCourseContents,
  getDummyCourseDetails,
} from "../../constants/Dummy";
import { coursesService } from "../../services/courses";
import { Content, Course } from "../../types";
import { getAuthData } from "../../utils/storage";

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadCourseDetails();
  }, [id]);

  const loadCourseDetails = async () => {
    try {
      // Try to load from backend
      const courseData = await coursesService.getCourseById(id as string);
      const courseContents = await coursesService.getCourseContents(
        id as string
      );

      const authData = await getAuthData();
      if (authData) {
        const enrolled = await coursesService.isEnrolled(
          authData.user.$id,
          id as string
        );
        setIsEnrolled(enrolled);
      }

      setCourse(courseData);
      setContents(courseContents);
    } catch (error) {
      console.log("Backend failed, using dummy data");

      // Fallback to dummy data
      const dummyCourse = getDummyCourseDetails(id as string);
      const dummyContents = getDummyCourseContents(id as string);

      if (dummyCourse) {
        setCourse(dummyCourse);
        setContents(dummyContents);
      } else {
        Alert.alert("Error", "Course not found");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    const authData = await getAuthData();
    if (!authData) {
      Alert.alert("Login Required", "Please login to enroll in this course");
      return;
    }

    setEnrolling(true);
    try {
      await coursesService.enrollInCourse(authData.user.$id, id as string);
      setIsEnrolled(true);
      Alert.alert("Success", "You are now enrolled in this course!");
    } catch (error: any) {
      // For demo, allow enrollment even if backend fails
      setIsEnrolled(true);
      Alert.alert("Demo Mode", "Enrollment simulated successfully!");
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    if (contents.length > 0) {
      router.push(`/player/${contents[0].$id}`);
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
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.imageContainer}>
          <Image source={course.thumbnail} style={styles.image} />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Course Info */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{course.title}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text style={styles.ratingText}>{course.rating}</Text>
            </View>
          </View>

          <Text style={styles.instructor}>by {course.instructor}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={20} color={Colors.primary} />
              <Text style={styles.metaText}>{course.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons
                name="videocam-outline"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.metaText}>{contents.length} lessons</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons
                name="people-outline"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.metaText}>
                {course.enrolledCount} students
              </Text>
            </View>
          </View>

          {/* Price */}
          {course.price > 0 ? (
            <View style={styles.priceContainer}>
              <View>
                <Text style={styles.price}>₹{course.price}</Text>
                {course.originalPrice && (
                  <Text style={styles.originalPrice}>
                    ₹{course.originalPrice}
                  </Text>
                )}
              </View>
              <Text style={styles.priceLabel}>One-time payment</Text>
            </View>
          ) : (
            <View style={styles.freeContainer}>
              <Text style={styles.freeText}>FREE COURSE</Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Course</Text>
            <Text style={styles.description}>{course.description}</Text>
          </View>

          {/* What You'll Learn */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{"What You'll Learn"}</Text>
            <View style={styles.bulletPoint}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.bulletText}>
                Comprehensive understanding of core concepts
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.bulletText}>
                Practical skills through hands-on practice
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.bulletText}>
                Real-world applications and case studies
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.bulletText}>Certificate upon completion</Text>
            </View>
          </View>

          {/* Course Content */}
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
                {isEnrolled && (
                  <TouchableOpacity
                    onPress={() => router.push(`/player/${content.$id}`)}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color={Colors.textLight}
                    />
                  </TouchableOpacity>
                )}
                {!isEnrolled && (
                  <Ionicons
                    name="lock-closed"
                    size={20}
                    color={Colors.textLight}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Instructor Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Instructor</Text>
            <View style={styles.instructorCard}>
              <View style={styles.instructorAvatar}>
                <Ionicons name="person" size={32} color={Colors.primary} />
              </View>
              <View style={styles.instructorInfo}>
                <Text style={styles.instructorName}>{course.instructor}</Text>
                <Text style={styles.instructorBio}>
                  Expert Medical Practitioner
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.footer}>
        {isEnrolled ? (
          <Button
            title="Start Learning"
            onPress={handleStartLearning}
            fullWidth
          />
        ) : (
          <Button
            title={
              course.price > 0
                ? `Enroll Now - ₹${course.price}`
                : "Enroll Now - FREE"
            }
            onPress={handleEnroll}
            loading={enrolling}
            fullWidth
          />
        )}
      </View>
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
    height: 250,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.surface,
  },
  backButton: {
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
  content: {
    flex: 1,
    padding: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginRight: 12,
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
  instructor: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: "row",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  priceContainer: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 16,
    color: Colors.textLight,
    textDecorationLine: "line-through",
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  freeContainer: {
    backgroundColor: "#dcfce7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: "center",
  },
  freeText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#166534",
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
  bulletPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    marginLeft: 10,
    lineHeight: 22,
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
  instructorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
  },
  instructorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  instructorBio: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
});
