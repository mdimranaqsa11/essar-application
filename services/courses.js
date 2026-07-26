import { apiRequest } from './api';
import { getAccessToken } from '../utils/storage';

const PLACEHOLDER_THUMBNAIL = require('../assets/images/one.png');

// Backend ids are numeric; UI still keys off `$id`/`categoryId` (carried over from Appwrite)
// so we alias fields here instead of touching every screen that reads course.$id.
function normalizeCourse(course) {
  return {
    ...course,
    $id: String(course.course_id),
    categoryId: course.category_id != null ? String(course.category_id) : null,
    price: course.fee,
    originalPrice: course.original_price ?? undefined,
    badge: course.badge ?? undefined,
    enrolledCount: course.students_count,
    thumbnail: course.thumbnail ? { uri: course.thumbnail } : PLACEHOLDER_THUMBNAIL,
  };
}

function nameFromUrl(url) {
  if (!url) return null;
  const clean = url.split('?')[0].split('#')[0];
  const last = clean.substring(clean.lastIndexOf('/') + 1);
  try {
    return last ? decodeURIComponent(last) : null;
  } catch {
    return last || null;
  }
}

function normalizeMaterial(material) {
  const url = material.file_url || material.url;
  return {
    ...material,
    $id: String(material.material_id ?? material.id),
    url,
    name: material.file_name || material.name || nameFromUrl(url) || 'Material',
    size: material.file_size ?? material.size ?? null,
  };
}

function normalizeTopic(topic) {
  return {
    ...topic,
    $id: String(topic.curriculum_id),
    courseId: String(topic.course_id),
    title: topic.topic_name,
    order: topic.topic_order,
    type: 'document', // backend doesn't model lesson video/type yet
    materials: Array.isArray(topic.materials) ? topic.materials.map(normalizeMaterial) : [],
  };
}

function normalizeInstructor(instructor) {
  return {
    ...instructor,
    $id: String(instructor.instructor_id),
    image: instructor.image ? { uri: instructor.image } : null,
  };
}

function normalizeEnrollment(enrollment) {
  return {
    ...enrollment,
    $id: String(enrollment.enrollment_id),
    studentId: String(enrollment.user_id),
    courseId: String(enrollment.course_id),
    course: enrollment.course ? normalizeCourse(enrollment.course) : undefined,
  };
}

export const coursesService = {
  // GET /api/courses
  async getAllCourses() {
    try {
      const courses = await apiRequest('/api/courses');
      return courses.map(normalizeCourse);
    } catch (error) {
      console.error('Get courses error:', error);
      return [];
    }
  },

  // GET /api/courses/{courseId}
  async getCourseById(courseId) {
    try {
      const course = await apiRequest(`/api/courses/${courseId}`);
      return normalizeCourse(course);
    } catch (error) {
      console.error('Get course by ID error:', error);
      throw new Error('Course not found');
    }
  },

  // GET /api/courses/{courseId}/curriculum
  async getCourseContents(courseId) {
    try {
      const topics = await apiRequest(`/api/courses/${courseId}/curriculum`);
      return topics.map(normalizeTopic);
    } catch (error) {
      console.error('Get contents error:', error);
      return [];
    }
  },

  // GET /api/courses/{courseId}/instructors
  async getCourseInstructors(courseId) {
    try {
      const instructors = await apiRequest(`/api/courses/${courseId}/instructors`);
      return instructors.map(normalizeInstructor);
    } catch (error) {
      console.error('Get course instructors error:', error);
      return [];
    }
  },

  // GET /api/categories
  async getCategories() {
    try {
      const categories = await apiRequest('/api/categories');
      return categories.map((c) => ({ ...c, $id: String(c.category_id), name: c.category_name }));
    } catch (error) {
      console.error('Get categories error:', error);
      return [];
    }
  },

  // No dedicated "is enrolled" endpoint — derive it from the user's own enrollment list.
  async isEnrolled(studentId, courseId) {
    const enrollments = await coursesService.getMyEnrollments(studentId);
    return enrollments.some((e) => e.courseId === String(courseId));
  },

  // GET /api/enrollments/my (studentId param kept for call-site compatibility; the
  // backend infers the user from the bearer token, so it's not sent explicitly)
  async getMyEnrollments(studentId) {
    try {
      const token = await getAccessToken();
      if (!token) return [];
      const enrollments = await apiRequest('/api/enrollments/my', { token });
      return enrollments.map(normalizeEnrollment);
    } catch (error) {
      console.error('Get enrollments error:', error);
      return [];
    }
  },

  // POST /api/enrollments { course_id }
  async enrollInCourse(studentId, courseId) {
    try {
      const token = await getAccessToken();
      const enrollment = await apiRequest('/api/enrollments', {
        method: 'POST',
        token,
        body: { course_id: Number(courseId) },
      });
      return normalizeEnrollment(enrollment);
    } catch (error) {
      console.error('Enrollment error:', error);
      throw new Error(error.message || 'Enrollment failed');
    }
  },

  // Not available on this backend — enrollment has a status (Pending/Enrolled/Completed/
  // Cancelled) set by admins, not a student-writable progress percentage.
  async updateProgress(enrollmentId, progress) {},

  async getEnrollment(studentId, courseId) {
    const enrollments = await coursesService.getMyEnrollments(studentId);
    return enrollments.find((e) => e.courseId === String(courseId)) || null;
  },

  // Not available on this backend yet — no support-ticket endpoint.
  async submitSupport(studentId, subject, message) {
    throw new Error('Support ticket submission is not available on this backend yet');
  },

  // GET /api/courses?search={query}
  async searchCourses(query) {
    try {
      const courses = await apiRequest('/api/courses', { query: { search: query } });
      return courses.map(normalizeCourse);
    } catch (error) {
      console.error('Search courses error:', error);
      return [];
    }
  },

  // GET /api/courses?category_id={categoryId}
  async getCoursesByCategory(categoryId) {
    try {
      const courses = await apiRequest('/api/courses', { query: { category_id: categoryId } });
      return courses.map(normalizeCourse);
    } catch (error) {
      console.error('Get courses by category error:', error);
      return [];
    }
  },
};
