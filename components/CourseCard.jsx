import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { router } from "../src/navigation/router";
import { coursesService } from "../services/courses";
import { getAuthData } from "../utils/storage";

export const CourseCard = ({ course, isEnrolled = false, isAdmin = false }) => {
  const [enrolling, setEnrolling] = useState(false);

  const handlePress = () => {
    router.push(`/course/${course.$id}`);
  };

  const handleEnroll = async () => {
    const authData = await getAuthData();
    if (!authData) {
      Alert.alert(
        "Login Required",
        "Please login to enroll in this course",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => router.push("/(auth)/login") },
        ]
      );
      return;
    }

    setEnrolling(true);
    try {
      await coursesService.enrollInCourse(authData.user.$id, course.$id);
      Alert.alert("Success", "You are now enrolled in this course!");
    } catch (error) {
      Alert.alert("Enrollment Failed", error.message || "Please try again");
    } finally {
      setEnrolling(false);
    }
  };

  const discountPercentage = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={course.thumbnail}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        {course.rating > 0 && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingIcon}>★</Text>
            <Text style={styles.ratingText}>{course.rating.toFixed(1)}</Text>
          </View>
        )}
        {discountPercentage > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{discountPercentage}% OFF</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>

        {course.instructor && (
          <Text style={styles.author}>by {course.instructor}</Text>
        )}

        <View style={styles.footerRow}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{course.price}</Text>
            {course.originalPrice && (
              <Text style={styles.originalPrice}>₹{course.originalPrice}</Text>
            )}
          </View>

          {!isAdmin &&
            (isEnrolled ? (
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handlePress}
                activeOpacity={0.85}
              >
                <Text style={styles.continueButtonText}>Continue Learning</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.enrollButton}
                onPress={handleEnroll}
                disabled={enrolling}
                activeOpacity={0.85}
              >
                <Text style={styles.enrollButtonText}>
                  {enrolling ? "Enrolling..." : "Enroll Now"}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: 190,
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  ratingBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingIcon: {
    fontSize: 14,
    color: "#FFD700",
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  discountBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  discountBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.white,
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  author: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  price: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
  },
  originalPrice: {
    fontSize: 13,
    color: "#999999",
    textDecorationLine: "line-through",
  },
  enrollButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  enrollButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.white,
  },
  continueButton: {
    backgroundColor: "rgba(0, 150, 137, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  continueButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },
});
