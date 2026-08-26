import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { router } from '@/src/navigation/router';

const PRIMARY_PHONE_TEL = '+917011733779';
const PRIMARY_PHONE_DISPLAY = '+91 70117 33779';
const PRIMARY_EMAIL = 'hello@esaarbeauty.com';

const HELP_CATEGORIES = [
  { key: 'Courses & Enrollments', icon: 'school-outline' },
  { key: 'Learning & Lessons', icon: 'play-circle-outline' },
  { key: 'Certificates', icon: 'ribbon-outline' },
  { key: 'Payments & Refunds', icon: 'card-outline' },
  { key: 'Account & Profile', icon: 'person-circle-outline' },
  { key: 'Other Issues', icon: 'ellipsis-horizontal-circle-outline' },
];

const FAQS = [
  {
    question: 'How does enrollment work?',
    answer: 'Tap "Request Info" on any course to send an enrollment request — our team will follow up regarding payment and onboarding.',
  },
  {
    question: 'How can I access my course lessons?',
    answer: 'Enrolled courses appear under My Learning. Lessons unlock once you’re enrolled in that course.',
  },
  {
    question: 'How do I get my certificate?',
    answer: 'Courses that include a certificate show it under "What’s Included" on the course page. Certificates are issued after successful completion.',
  },
  {
    question: 'What are the admission requirements?',
    answer: 'Our programs are designed for medical and aesthetic professionals. Specific requirements vary by course — check the course description for details.',
  },
  {
    question: 'Do you offer both online and offline courses?',
    answer: 'Yes — each course page shows its mode (Online, Offline, or Hybrid) under "What’s Included".',
  },
  {
    question: 'Do you provide placement assistance?',
    answer: 'Yes, our placement support team assists eligible graduates with career guidance and industry connections.',
  },
];

const LOCATIONS = [
  {
    name: 'International (Head Office – Bangladesh)',
    address: 'Road 137, House (SE) 4, Gulshan 1, Dhaka, Bangladesh',
    phone: '+880 1621-444411',
    tel: '+8801621444411',
    email: 'hello@esaarbeauty.com',
  },
  {
    name: 'Delhi (Head Office – India)',
    address:
      'Bharat Aarogya Academy, Shop No. 272, Khureji Khas, Near Khureji Petrol Pump, Delhi-51 (Nearest metro: Nirman Vihar)',
    phone: '+91 70117 33779',
    tel: '+917011733779',
    email: 'aarogyabharat17@gmail.com',
  },
  {
    name: 'Canada',
    address: 'University Avenue, Waterloo, Ontario, Canada',
    phone: '+1 (416) 953-7808',
    tel: '+14169537808',
    email: 'aarogyabharat17@gmail.com',
  },
  {
    name: 'International (South Africa)',
    address: 'Bharat Aarogya Academy, Al Ansaar Building, Bell Rd, Jarman, Gqeberha (Port Elizabeth) 6020',
    phone: '+27 74950 6138',
    tel: '+27749506138',
    email: 'aarogyabharat17@gmail.com',
  },
  {
    name: 'Gujarat',
    address: 'Bharat Aarogya Academy (Near Darulshifa Unani Dawakhana), Abad Nagar, Bharuch, Gujarat 392001',
    phone: '+91 99240 50973',
    tel: '+919924050973',
    email: 'aarogyabharat17@gmail.com',
  },
];

function emailWithSubject(subject) {
  return `mailto:${PRIMARY_EMAIL}?subject=${encodeURIComponent(`Support: ${subject}`)}`;
}

export function SupportScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>{"We're here to help you"}</Text>
        </View>
        <TouchableOpacity
          style={styles.headsetButton}
          onPress={() => Linking.openURL(`tel:${PRIMARY_PHONE_TEL}`)}
        >
          <Ionicons name="headset" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconCircle}>
            <Ionicons name="headset" size={28} color={Colors.white} />
          </View>
          <Text style={styles.heroTitle}>{"We're Here for You!"}</Text>
          <Text style={styles.heroSubtitle}>
            Our support team is ready to assist you with anything you need.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => Linking.openURL(`https://wa.me/${PRIMARY_PHONE_TEL.replace('+', '')}`)}
          >
            <Ionicons name="logo-whatsapp" size={18} color={Colors.white} />
            <Text style={styles.primaryButtonText}>Chat with Us</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => Linking.openURL(emailWithSubject('General Inquiry'))}
          >
            <Ionicons name="mail-outline" size={18} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>Email Support</Text>
          </TouchableOpacity>
        </View>

        {/* Help Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How can we help you?</Text>
          <View style={styles.categoryGrid}>
            {HELP_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={styles.categoryCard}
                onPress={() => Linking.openURL(emailWithSubject(category.key))}
              >
                <View style={styles.categoryIconCircle}>
                  <Ionicons name={category.icon} size={22} color={Colors.primary} />
                </View>
                <Text style={styles.categoryTitle}>{category.key}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.textLight}
                  style={styles.categoryChevron}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Help</Text>
          {FAQS.map((faq) => (
            <View key={faq.question} style={styles.faqCard}>
              <View style={styles.faqHeader}>
                <View style={styles.faqBadge}>
                  <Text style={styles.faqBadgeText}>Q</Text>
                </View>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
              </View>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </View>
          ))}
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactRow}>
            <TouchableOpacity
              style={styles.contactColumn}
              onPress={() => Linking.openURL(`tel:${PRIMARY_PHONE_TEL}`)}
            >
              <View style={styles.contactColumnIcon}>
                <Ionicons name="call-outline" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.contactColumnTitle}>Call Us</Text>
              <Text style={styles.contactColumnText} numberOfLines={1} ellipsizeMode="tail">
                {PRIMARY_PHONE_DISPLAY}
              </Text>
              <Text style={styles.contactColumnHint} numberOfLines={2}>
                Mon - Sat{'\n'}9AM - 8PM
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactColumn}
              onPress={() => Linking.openURL(`mailto:${PRIMARY_EMAIL}`)}
            >
              <View style={styles.contactColumnIcon}>
                <Ionicons name="mail-outline" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.contactColumnTitle}>Email Us</Text>
              <Text style={styles.contactColumnText} numberOfLines={1}>
                Send Email
              </Text>
              <Text style={styles.contactColumnHint} numberOfLines={2}>
                Reply within{'\n'}24 hrs
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactColumn}
              onPress={() => Linking.openURL(`https://wa.me/${PRIMARY_PHONE_TEL.replace('+', '')}`)}
            >
              <View style={styles.contactColumnIcon}>
                <Ionicons name="logo-whatsapp" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.contactColumnTitle}>WhatsApp</Text>
              <Text style={styles.contactColumnText} numberOfLines={1}>
                Chat Now
              </Text>
              <Text style={styles.contactColumnHint} numberOfLines={2}>
                Mon - Sat{'\n'}9AM - 8PM
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Find Us Nationwide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Find Us Nationwide</Text>
          {LOCATIONS.map((location) => (
            <View key={location.name} style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <View style={styles.locationPinCircle}>
                  <Ionicons name="location" size={14} color={Colors.white} />
                </View>
                <Text style={styles.locationName}>{location.name}</Text>
              </View>
              <Text style={styles.locationAddress}>{location.address}</Text>
              <TouchableOpacity
                style={styles.locationRow}
                onPress={() => Linking.openURL(`tel:${location.tel}`)}
              >
                <Ionicons name="call-outline" size={14} color={Colors.primary} />
                <Text style={styles.locationLink}>{location.phone}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.locationRow}
                onPress={() => Linking.openURL(`mailto:${location.email}`)}
              >
                <Ionicons name="mail-outline" size={14} color={Colors.primary} />
                <Text style={styles.locationLink}>{location.email}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  headerTextGroup: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headsetButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(0, 150, 137, 0.08)',
    borderRadius: 20,
    padding: 22,
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  heroIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 18,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 13,
    width: '100%',
    marginBottom: 10,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingVertical: 13,
    width: '100%',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  categoryChevron: {
    position: 'absolute',
    top: 14,
    right: 12,
  },
  faqCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  faqBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  faqBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  faqAnswer: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginLeft: 32,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contactColumn: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contactColumnIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactColumnTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  contactColumnText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactColumnHint: {
    fontSize: 10,
    color: Colors.textLight,
  },
  locationCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  locationPinCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  locationAddress: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  locationLink: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
});
