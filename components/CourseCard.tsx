import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Course } from "../types";

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const handlePress = () => {
    router.push(`/course/${course.$id}`);
  };

  const discountPercentage = course.originalPrice 
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress} 
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={course.thumbnail}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        {course.rating && (
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
        
        <Text style={styles.author}>by {course.instructor || "Team Clinical Guruji"}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{course.price}</Text>
          {course.originalPrice && (
            <>
              <Text style={styles.originalPrice}>₹{course.originalPrice}</Text>
              <Text style={styles.discount}>{discountPercentage}% off</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    marginBottom: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1
  },
  imageContainer: {
    width: "100%",
    height: 190,
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D3D3D3",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
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
    paddingVertical: 12,
    paddingHorizontal: 8
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0000",
    marginBottom: 4,
    lineHeight: 20,
  },
  author: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
  },
  originalPrice: {
    fontSize: 13,
    color: "#999999",
    textDecorationLine: "line-through",
  },
  discount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4CAF50",
  },
});