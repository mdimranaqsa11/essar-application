import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';

export function PhotoPickerModal({ visible, onCancel, onTakePhoto, onChooseFromGallery }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onCancel}
        />
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="camera" size={26} color={Colors.white} />
          </View>
          <Text style={styles.title}>Update Profile Photo</Text>
          <Text style={styles.subtitle}>{"Choose how you'd like to add your photo"}</Text>

          <TouchableOpacity style={styles.optionRow} onPress={onTakePhoto} activeOpacity={0.8}>
            <View style={styles.optionIconCircle}>
              <Ionicons name="camera-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.optionText}>Take Photo</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={onChooseFromGallery}
            activeOpacity={0.8}
          >
            <View style={styles.optionIconCircle}>
              <Ionicons name="image-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.optionText}>Choose from Gallery</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.85}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 18,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  optionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 150, 137, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  cancelButton: {
    marginTop: 6,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
