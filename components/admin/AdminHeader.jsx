import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';

// Shared header for every admin screen: back chevron, title/subtitle and an optional
// right-hand action (e.g. an "add" button). Mirrors the header pattern used in SupportScreen.
export function AdminHeader({ title, subtitle, onBack, rightIcon, onRightPress }) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} hitSlop={8} style={styles.side}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.side} />
      )}

      <View style={styles.textGroup}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress} hitSlop={8} style={styles.rightButton}>
          <Ionicons name={rightIcon} size={20} color={Colors.white} />
        </TouchableOpacity>
      ) : (
        <View style={styles.side} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  side: {
    width: 38,
    height: 38,
    justifyContent: 'center',
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rightButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
