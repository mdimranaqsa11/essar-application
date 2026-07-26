import { apiRequest } from './api';
import { getAccessToken } from '../utils/storage';

// Admin CRUD service.
//
// Endpoints follow the same REST + `{ status, message, response }` envelope convention as
// the rest of the backend (see services/api.js). Every call is sent with the admin's bearer
// token. Read helpers swallow errors and return [] so the admin lists degrade gracefully when
// an endpoint is missing or offline; mutations let ApiError bubble up so the screen can toast
// the backend's message.

async function authedRequest(path, options = {}) {
  const token = await getAccessToken();
  return apiRequest(path, { ...options, token });
}

// Wraps a list fetch so a failing/absent endpoint yields [] instead of crashing the screen.
async function safeList(path) {
  try {
    const res = await authedRequest(path);
    return Array.isArray(res) ? res : [];
  } catch (error) {
    console.error(`admin list ${path}:`, error.message);
    return [];
  }
}

// POST/PUT /api/courses are multipart/form-data (so a thumbnail/brochure file can be
// uploaded directly) — build a FormData body instead of sending JSON. Only fields the
// caller actually set are appended, so partial updates don't blank out other fields.
// `thumbnail_file` / `brochure_file` (image-picker assets) win over their `thumbnail` /
// `brochure` URL-text counterparts, mirroring the backend's "file wins over URL" rule.
function buildCourseFormData(data) {
  const form = new FormData();
  const appendIfSet = (key, value) => {
    if (value !== undefined && value !== null) form.append(key, String(value));
  };

  appendIfSet('title', data.title);
  appendIfSet('description', data.description);
  appendIfSet('category_id', data.category_id);
  appendIfSet('fee', data.fee);
  appendIfSet('original_price', data.original_price);
  appendIfSet('duration', data.duration);
  appendIfSet('level', data.level);
  appendIfSet('language', data.language);
  appendIfSet('mode', data.mode);
  appendIfSet('start_date', data.start_date);
  appendIfSet('certificate_name', data.certificate_name);
  appendIfSet('badge', data.badge);
  appendIfSet('course_status', data.course_status);
  if (data.features !== undefined) form.append('features', JSON.stringify(data.features || []));
  if (data.status !== undefined) form.append('status', String(data.status));

  // react-native-image-picker exposes the filename as `fileName`, while
  // @react-native-documents/picker uses `name` — accept either.
  if (data.thumbnail_file) {
    form.append('thumbnail_file', {
      uri: data.thumbnail_file.uri,
      type: data.thumbnail_file.type || 'image/jpeg',
      name: data.thumbnail_file.fileName || data.thumbnail_file.name || 'thumbnail.jpg',
    });
  } else {
    appendIfSet('thumbnail', data.thumbnail);
  }

  if (data.brochure_file) {
    form.append('brochure_file', {
      uri: data.brochure_file.uri,
      type: data.brochure_file.type || 'application/pdf',
      name: data.brochure_file.name || data.brochure_file.fileName || 'brochure.pdf',
    });
  } else {
    appendIfSet('brochure', data.brochure);
  }

  return form;
}

export const adminService = {
  // ---------------------------------------------------------------- Courses
  listCourses() {
    return safeList('/api/courses');
  },
  getCourse(id) {
    return authedRequest(`/api/courses/${id}`);
  },
  createCourse(data) {
    return authedRequest('/api/courses', { method: 'POST', body: buildCourseFormData(data) });
  },
  updateCourse(id, data) {
    return authedRequest(`/api/courses/${id}`, {
      method: 'PUT',
      body: buildCourseFormData(data),
    });
  },
  deleteCourse(id) {
    return authedRequest(`/api/courses/${id}`, { method: 'DELETE' });
  },

  // ------------------------------------------------------------- Categories
  listCategories() {
    return safeList('/api/categories');
  },
  createCategory(data) {
    return authedRequest('/api/categories', { method: 'POST', body: data });
  },
  updateCategory(id, data) {
    return authedRequest(`/api/categories/${id}`, { method: 'PUT', body: data });
  },
  deleteCategory(id) {
    return authedRequest(`/api/categories/${id}`, { method: 'DELETE' });
  },

  // ---------------------------------------------------------------- Uploads
  // POST /api/uploads (multipart) -> { url, public_id, ... }. Used for endpoints that only
  // accept an image URL (e.g. instructors), so the admin can still pick a file: upload it
  // here first, then send the returned URL. `file` is a react-native-image-picker asset.
  async uploadFile(file, folder) {
    const form = new FormData();
    form.append('file', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.fileName || 'upload.jpg',
    });

    const res = await authedRequest('/api/uploads', {
      method: 'POST',
      body: form,
      query: folder ? { folder } : undefined,
    });
    return res?.url || null;
  },

  // ------------------------------------------------------------ Instructors
  listInstructors() {
    return safeList('/api/instructors');
  },
  createInstructor(data) {
    return authedRequest('/api/instructors', { method: 'POST', body: data });
  },
  updateInstructor(id, data) {
    return authedRequest(`/api/instructors/${id}`, { method: 'PUT', body: data });
  },
  deleteInstructor(id) {
    return authedRequest(`/api/instructors/${id}`, { method: 'DELETE' });
  },

  // Linking instructors to a course. The join is managed one instructor at a time, so
  // saving a course diffs the selection and issues an assign/remove per change.
  listCourseInstructors(courseId) {
    return safeList(`/api/courses/${courseId}/instructors`);
  },
  assignInstructor(courseId, instructorId) {
    return authedRequest(`/api/courses/${courseId}/instructors`, {
      method: 'POST',
      body: { instructor_id: instructorId },
    });
  },
  removeCourseInstructor(courseId, instructorId) {
    return authedRequest(`/api/courses/${courseId}/instructors/${instructorId}`, {
      method: 'DELETE',
    });
  },

  // ------------------------------------------------------------- Curriculum
  // Curriculum topics are scoped to a course for reads/creates; updates & deletes act on the
  // topic's own id.
  listCurriculum(courseId) {
    return safeList(`/api/courses/${courseId}/curriculum`);
  },
  createCurriculum(courseId, data) {
    return authedRequest(`/api/courses/${courseId}/curriculum`, {
      method: 'POST',
      body: data,
    });
  },
  updateCurriculum(curriculumId, data) {
    return authedRequest(`/api/curriculum/${curriculumId}`, { method: 'PUT', body: data });
  },
  deleteCurriculum(curriculumId) {
    return authedRequest(`/api/curriculum/${curriculumId}`, { method: 'DELETE' });
  },

  // Study materials attached to a curriculum topic. `files` is an array of
  // @react-native-documents/picker results (max 10, ≤10MB each per the backend).
  uploadMaterials(curriculumId, files) {
    const form = new FormData();
    files.forEach((file) => {
      form.append('files', {
        uri: file.uri,
        type: file.type || 'application/octet-stream',
        name: file.name || file.fileName || 'material',
      });
    });
    return authedRequest(`/api/curriculum/${curriculumId}/materials`, {
      method: 'POST',
      body: form,
    });
  },
  deleteMaterial(materialId) {
    return authedRequest(`/api/materials/${materialId}`, { method: 'DELETE' });
  },

  // ------------------------------------------------------------------ Users
  listUsers() {
    return safeList('/api/users');
  },
  updateUser(id, data) {
    return authedRequest(`/api/users/${id}`, { method: 'PUT', body: data });
  },
  deleteUser(id) {
    return authedRequest(`/api/users/${id}`, { method: 'DELETE' });
  },

  // ------------------------------------------------------------ Enrollments
  listEnrollments() {
    return safeList('/api/enrollments');
  },
  listUserEnrollments(userId) {
    return safeList(`/api/enrollments/user/${userId}`);
  },
  updateEnrollmentStatus(enrollmentId, status) {
    return authedRequest(`/api/enrollments/${enrollmentId}/status`, {
      method: 'PATCH',
      body: { enrollment_status: status },
    });
  },
  cancelEnrollment(enrollmentId) {
    return authedRequest(`/api/enrollments/${enrollmentId}`, { method: 'DELETE' });
  },
};
