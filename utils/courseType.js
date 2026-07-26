// Course "type" isn't a field the backend returns — it's derived from the title so
// the UI can group Diploma/Fellowship/Certificate/Workshop programs consistently.
export const COURSE_TYPES = [
  { key: 'Diploma', label: 'Diploma', icon: 'school-outline', color: '#0F766E', tint: 'rgba(15, 118, 110, 0.1)' },
  { key: 'Fellowship', label: 'Fellowship', icon: 'ribbon-outline', color: '#7C3AED', tint: 'rgba(124, 58, 237, 0.1)' },
  { key: 'Certificate', label: 'Certificate', icon: 'document-text-outline', color: '#2563EB', tint: 'rgba(37, 99, 235, 0.1)' },
  { key: 'Workshop', label: 'Workshop', icon: 'construct-outline', color: '#B45309', tint: 'rgba(180, 83, 9, 0.1)' },
  { key: 'Masterclass', label: 'Masterclass', icon: 'trophy-outline', color: '#BE123C', tint: 'rgba(190, 18, 60, 0.1)' },
];

export function deriveCourseType(title = '') {
  const lower = title.toLowerCase();
  if (lower.includes('diploma')) return COURSE_TYPES[0];
  if (lower.includes('fellowship')) return COURSE_TYPES[1];
  if (lower.includes('certificate') || lower.includes('certification')) return COURSE_TYPES[2];
  if (lower.includes('workshop')) return COURSE_TYPES[3];
  if (lower.includes('master')) return COURSE_TYPES[4];
  return null;
}
