import { Colors } from '@/constants/Colors';
import { router } from '@/src/navigation/router';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const STATS = [
  { icon: 'ribbon-outline', value: '5+', label: 'Years of Excellence' },
  { icon: 'school-outline', value: '500+', label: 'Successful Graduates' },
  { icon: 'people-outline', value: '50+', label: 'Expert Faculty' },
  { icon: 'stats-chart-outline', value: '95%', label: 'Success Rate' },
];

const MILESTONES = [
  {
    year: '2020',
    title: 'Foundation',
    description: 'Established with a vision to transform aesthetic education',
  },
  {
    year: '2022',
    title: 'International Recognition',
    description: 'Received global accreditation for excellence',
  },
  {
    year: '2024',
    title: '500+ Student Milestone',
    description: 'Trained and empowered 500+ healthcare professionals',
  },
  {
    year: '2025',
    title: 'Expansion',
    description: 'Launched advanced fellowship programs and new courses',
  },
];

const FACULTY = [
  {
    name: 'Dr. Muzaffar Ali',
    role: 'International Trainer',
    qualification: 'MBBS, MS, MCH',
    gender: 'male',
    image: {
      uri: 'https://www.bharataarogyaacademy.com/images/man-after.jpg',
    },
  },
  {
    name: 'Dr. Almas Khan',
    role: 'Course Expert & Team Head',
    qualification: 'MBBS, MS',
    image: {
      uri: 'https://www.bharataarogyaacademy.com/images/WhatsApp%20Image%202025-10-05%20at%2006.14.37_53aa6df0.jpg',
    },
  },
  {
    name: 'Dr. Mariam Zaman',
    role: 'Chairperson',
    qualification: 'MBBS (UAE), MPH (IUB)',
    image: {
      uri: 'https://www.bharataarogyaacademy.com/images/WhatsApp%20Image%202025-10-06%20at%2007.56.41_c1310c19.jpg',
    },
  },
  {
    name: 'Dr. M.I. Ansari',
    role: 'Managing Director',
    qualification: '',
    image: {
      uri: 'https://www.bharataarogyaacademy.com/images/WhatsApp%20Image%202025.jpg',
    },
  },
  {
    name: 'Dr. Mohamed Khalid',
    role: 'International Coordinator (South Africa)',
    qualification: '',
    image: {
      uri: 'https://www.bharataarogyaacademy.com/images/WhatsApp%20Image%202025-10-05%20at%2006.02.57_4c65b24a.jpg',
    },
  },
  {
    name: 'Dr. Shifa',
    role: 'International Coordinator (Canada)',
    qualification: '',
    image: {
      uri: 'https://www.bharataarogyaacademy.com/images/WhatsApp%20Image%202025-10-16%20at%2014.01.19_d619ae20.jpg',
    },
  },
  {
    name: 'Dr. Sadia Sharmin',
    role: 'Course Coordinator',
    qualification: '',
    image: {
      uri: 'https://www.bharataarogyaacademy.com/images/WhatsApp%20Image%202025-10-16%20at%2014.00.16_f4281f36.jpg',
    },
  },
  {
    name: 'Dr. Ramisha Rajput',
    role: 'Course Expert',
    qualification: '',
    gender: 'female',
    image: {
      uri: 'https://www.bharataarogyaacademy.com/images/Screenshot%20(276).png',
    },
  },
];

const VALUES = [
  {
    icon: 'shield-checkmark-outline',
    title: 'Excellence',
    description: 'Commitment to the highest standards in education and training',
  },
  {
    icon: 'bulb-outline',
    title: 'Innovation',
    description: 'Embracing cutting-edge techniques and technologies',
  },
  {
    icon: 'people-outline',
    title: 'Community',
    description: 'Building a network of dedicated healthcare professionals',
  },
  {
    icon: 'flash-outline',
    title: 'Integrity',
    description: 'Upholding ethical practices in all our endeavors',
  },
];

export function AboutScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
              <Ionicons name="chevron-back" size={22} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>About Us</Text>
          </View>

          <View style={styles.heroBadge}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.white} />
            <Text style={styles.heroBadgeText}>Esaar Global Institute of Medical & Aesthetic Sciences</Text>
          </View>
          <Text style={styles.heroTitle}>
            Transforming Lives Through{' '}
            <Text style={styles.heroTitleAccent}>Excellence in Education</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            For over 5 years, Esaar Global Institute of Medical & Aesthetic Sciences has been at
            the forefront of aesthetic medicine education, empowering healthcare professionals to
            excel in their careers.
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          {STATS.map((stat, index) => (
            <View key={stat.label} style={[styles.statItem, index % 2 === 0 && styles.statItemBorder]}>
              <View style={styles.statIcon}>
                <Ionicons name={stat.icon} size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Our Story */}
        <View style={styles.section}>
          <View style={styles.eyebrow}>
            <Ionicons name="book-outline" size={13} color={Colors.primary} />
            <Text style={styles.eyebrowText}>OUR STORY</Text>
          </View>
          <Text style={styles.sectionTitle}>
            A Legacy of <Text style={styles.sectionTitleAccent}>Excellence</Text>
          </Text>
          <Text style={styles.paragraph}>
            Founded in 2020, Esaar Global Institute of Medical & Aesthetic Sciences emerged from a
            vision to bridge the gap between traditional medical education and the rapidly
            evolving field of aesthetic medicine.
          </Text>
          <Text style={styles.paragraph}>
            What started as a small training center has grown into one of India&apos;s most
            respected institutions for aesthetic medicine education, offering programs from PG
            Diplomas to advanced fellowships.
          </Text>
          <Text style={styles.paragraph}>
            Our success is built on three pillars: world-class faculty, cutting-edge facilities,
            and a commitment to practical, patient-centered training.
          </Text>
        </View>

        {/* Milestones */}
        <View style={styles.section}>
          <View style={styles.eyebrow}>
            <Ionicons name="flag-outline" size={13} color={Colors.primary} />
            <Text style={styles.eyebrowText}>OUR JOURNEY</Text>
          </View>
          <Text style={styles.sectionTitle}>
            Milestones of <Text style={styles.sectionTitleAccent}>Success</Text>
          </Text>

          <View style={styles.timeline}>
            {MILESTONES.map((milestone, index) => (
              <View key={milestone.year} style={styles.timelineRow}>
                <View style={styles.timelineMarkerColumn}>
                  <View style={styles.timelineDot} />
                  {index !== MILESTONES.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineCard}>
                  <Text style={styles.timelineYear}>{milestone.year}</Text>
                  <Text style={styles.timelineTitle}>{milestone.title}</Text>
                  <Text style={styles.timelineDescription}>{milestone.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Faculty */}
        <View style={styles.section}>
          <View style={styles.eyebrow}>
            <Ionicons name="people-outline" size={13} color={Colors.primary} />
            <Text style={styles.eyebrowText}>OUR TEAM</Text>
          </View>
          <Text style={styles.sectionTitle}>
            Meet Our <Text style={styles.sectionTitleAccent}>Expert Faculty</Text>
          </Text>

          <View style={styles.facultyGrid}>
            {FACULTY.map((member) => (
              <View key={member.name} style={styles.facultyCard}>
                {member.image ? (
                  <View style={styles.facultyImageWrap}>
                    <Image
                      source={member.image}
                      style={[styles.facultyImage, member.gender && styles.facultyImageZoomed]}
                      resizeMode="cover"
                    />
                  </View>
                ) : (
                  <View style={styles.facultyAvatarPlaceholder}>
                    <Ionicons
                      name={member.gender === 'female' ? 'woman' : 'man'}
                      size={48}
                      color={Colors.primary}
                    />
                  </View>
                )}
                <Text style={styles.facultyName} numberOfLines={1}>
                  {member.name}
                </Text>
                {!!member.qualification && (
                  <Text style={styles.facultyQualification} numberOfLines={1}>
                    {member.qualification}
                  </Text>
                )}
                <Text style={styles.facultyRole} numberOfLines={2}>
                  {member.role}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Values */}
        <View style={styles.section}>
          <View style={styles.eyebrow}>
            <Ionicons name="star-outline" size={13} color={Colors.primary} />
            <Text style={styles.eyebrowText}>OUR VALUES</Text>
          </View>
          <Text style={styles.sectionTitle}>
            What Drives Us <Text style={styles.sectionTitleAccent}>Forward</Text>
          </Text>

          <View style={styles.valuesList}>
            {VALUES.map((value) => (
              <View key={value.title} style={styles.valueRow}>
                <View style={styles.valueIcon}>
                  <Ionicons name={value.icon} size={20} color={Colors.primary} />
                </View>
                <View style={styles.valueTextWrap}>
                  <Text style={styles.valueTitle}>{value.title}</Text>
                  <Text style={styles.valueDescription}>{value.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Contact CTA */}
        <View style={styles.ctaCard}>
          <View style={styles.ctaIcon}>
            <Ionicons name="headset-outline" size={22} color={Colors.white} />
          </View>
          <View style={styles.ctaTextWrap}>
            <Text style={styles.ctaTitle}>Have Questions?</Text>
            <Text style={styles.ctaSubtitle}>We&apos;re here to help you</Text>
          </View>
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.85}
            onPress={() => Linking.openURL('tel:+917011733779')}
          >
            <Text style={styles.ctaButtonText}>Contact Us</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom:20
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginRight: 36,
    marginBottom: 25
  },
  scrollContent: {
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: '#0F2E2C',
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    gap: 6,
    marginBottom: 16,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    lineHeight: 36,
    marginBottom: 12,
  },
  heroTitleAccent: {
    color: Colors.primaryLight,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 21,
  },
  statsCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: -22,
    borderRadius: 18,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  statItem: {
    width: '50%',
    paddingVertical: 10,
  },
  statItemBorder: {
    borderRightWidth: 0,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
    marginBottom: 10,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  sectionTitleAccent: {
    color: Colors.primary,
  },
  paragraph: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 12,
  },
  timeline: {
    marginTop: 8,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineMarkerColumn: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.divider,
    marginVertical: 2,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginLeft: 12,
    marginBottom: 16,
  },
  timelineYear: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  facultyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  facultyCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  facultyImageWrap: {
    width: '100%',
    height: 130,
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  facultyImage: {
    width: '100%',
    height: '100%',
  },
  facultyImageZoomed: {
    transform: [{ scale: 1.15 }],
  },
  facultyAvatarPlaceholder: {
    width: '100%',
    height: 130,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  facultyName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  facultyQualification: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  facultyRole: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  valuesList: {
    gap: 14,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  valueIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueTextWrap: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  valueDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2E2C',
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  ctaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaTextWrap: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  ctaSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  ctaButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
});

export default AboutScreen;
