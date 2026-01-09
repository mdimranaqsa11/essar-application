export interface User {
  $id: string;
  email: string;
  name: string;
  role: 'admin' | 'student';
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  $id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Course {
  $id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number; // For showing discount
  categoryId: string;
  duration: string;
  thumbnail: any; // ImageSourcePropType
  status: 'published' | 'draft';
  enrolledCount?: number;
  rating?: number; // Add rating (0-5)
  instructor?: string; // Instructor name
  createdAt: string;
}

export interface Content {
  $id: string;
  courseId: string;
  title: string;
  type: 'video' | 'pdf';
  url: string;
  duration?: string;
  order: number;
  completed?: boolean;
}

export interface Enrollment {
  $id: string;
  studentId: string;
  courseId: string;
  progress: number;
  enrolledAt: string;
  course?: Course;
}

export interface Payment {
  $id: string;
  studentId: string;
  courseId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  transactionId: string;
  date: string;
}

export interface SupportTicket {
  $id: string;
  studentId: string;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  createdAt: string;
}