import { Category, Content, Course, Enrollment } from '../types';
import { APPWRITE_CONFIG, databases, ID, Query } from './appwrite';

export const coursesService = {
  // Get all published courses
  async getAllCourses() {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.coursesCollectionId,
        [Query.equal('status', 'published'), Query.limit(100)]
      );
      return response.documents as unknown as Course[];
    } catch (error) {
      console.error('Get courses error:', error);
      return [];
    }
  },

  // Get course by ID
  async getCourseById(courseId: string) {
    try {
      const course = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.coursesCollectionId,
        courseId
      );
      return course as unknown as Course;
    } catch (error) {
      console.error('Get course by ID error:', error);
      throw new Error('Course not found');
    }
  },

  // Get course contents
  async getCourseContents(courseId: string) {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.contentsCollectionId,
        [
          Query.equal('courseId', courseId),
          Query.orderAsc('order'),
          Query.limit(100)
        ]
      );
      return response.documents as unknown as Content[];
    } catch (error) {
      console.error('Get contents error:', error);
      return [];
    }
  },

  // Get all categories
  async getCategories() {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.categoriesCollectionId,
        [Query.limit(50)]
      );
      return response.documents as unknown as Category[];
    } catch (error) {
      console.error('Get categories error:', error);
      return [];
    }
  },

  // Check if student enrolled
  async isEnrolled(studentId: string, courseId: string) {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.enrollmentsCollectionId,
        [
          Query.equal('studentId', studentId),
          Query.equal('courseId', courseId),
        ]
      );
      return response.documents.length > 0;
    } catch (error) {
      console.error('Check enrollment error:', error);
      return false;
    }
  },

  // Get student enrollments
  async getMyEnrollments(studentId: string) {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.enrollmentsCollectionId,
        [Query.equal('studentId', studentId), Query.limit(100)]
      );
      return response.documents as unknown as Enrollment[];
    } catch (error) {
      console.error('Get enrollments error:', error);
      return [];
    }
  },

  // Manual enrollment (for testing - in production this happens after payment)
  async enrollInCourse(studentId: string, courseId: string) {
    try {
      const now = new Date().toISOString();
      const enrollment = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.enrollmentsCollectionId,
        ID.unique(),
        {
          studentId,
          courseId,
          progress: 0,
          enrolledAt: now,
          createdAt: now,
          updatedAt: now,
        }
      );
      return enrollment as unknown as Enrollment;
    } catch (error: any) {
      console.error('Enrollment error:', error);
      throw new Error(error.message || 'Enrollment failed');
    }
  },

  // Update progress
  async updateProgress(enrollmentId: string, progress: number) {
    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.enrollmentsCollectionId,
        enrollmentId,
        {
          progress,
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Update progress error:', error);
    }
  },

  // Get enrollment by student and course
  async getEnrollment(studentId: string, courseId: string) {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.enrollmentsCollectionId,
        [
          Query.equal('studentId', studentId),
          Query.equal('courseId', courseId),
        ]
      );
      
      if (response.documents.length > 0) {
        return response.documents[0] as unknown as Enrollment;
      }
      return null;
    } catch (error) {
      console.error('Get enrollment error:', error);
      return null;
    }
  },

  // Submit support ticket
  async submitSupport(studentId: string, subject: string, message: string) {
    try {
      const now = new Date().toISOString();
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.supportCollectionId,
        ID.unique(),
        {
          studentId,
          subject,
          message,
          status: 'open',
          createdAt: now,
          updatedAt: now,
        }
      );
    } catch (error: any) {
      console.error('Submit support error:', error);
      throw new Error(error.message || 'Failed to submit ticket');
    }
  },

  // Search courses
  async searchCourses(query: string) {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.coursesCollectionId,
        [
          Query.equal('status', 'published'),
          Query.search('title', query),
          Query.limit(50)
        ]
      );
      return response.documents as unknown as Course[];
    } catch (error) {
      console.error('Search courses error:', error);
      return [];
    }
  },

  // Get courses by category
  async getCoursesByCategory(categoryId: string) {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.coursesCollectionId,
        [
          Query.equal('status', 'published'),
          Query.equal('categoryId', categoryId),
          Query.limit(100)
        ]
      );
      return response.documents as unknown as Course[];
    } catch (error) {
      console.error('Get courses by category error:', error);
      return [];
    }
  },
};