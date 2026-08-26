import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import { Colors } from "@/constants/Colors";
import { router } from "../src/navigation/router";
import { coursesService } from "../services/courses";
import { getAuthData } from "../utils/storage";

export const CourseCard = ({ course, isEnrolled = false, isAdmin = false }) => {
  const [enrolling, setEnrolling] = useState(false);
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);
  const showToast = useToast();

  const handlePress = () => {
    router.push(`/course/${course.$id}`);
  };

  const handleEnroll = async () => {
    const authData = await getAuthData();
    if (!authData) {
      setLoginPromptVisible(true);
      return;
    }

    setEnrolling(true);
    try {
      await coursesService.enrollInCourse(authData.user.$id, course.$id);
      showToast("Request submitted! Our team will contact you shortly.", "success");
    } catch (error) {
      showToast(error.message || "Enrollment failed. Please try again", "error");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <>
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
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>

        {course.instructor && (
          <Text style={styles.author}>by {course.instructor}</Text>
        )}

        <View style={styles.footerRow}>
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
                  {enrolling ? "Requesting..." : "Request Info"}
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
        router.push("/(auth)/login");
      }}
    />
    </>
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
    justifyContent: "flex-end",
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
