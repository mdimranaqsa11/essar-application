import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';

// Compact dropdown-style picker used across the admin forms. Renders as a bordered field
// showing the current value; tapping it opens a sheet listing the options.
// `options` is an array of { label, value }.
export function SelectField({ label, icon, value, options, placeholder = 'Select', onChange }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.wrap}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity style={styles.field} onPress={() => setOpen(true)} activeOpacity={0.75}>
        {!!icon && <Ionicons name={icon} size={17} color={Colors.primary} />}
        <Text style={[styles.value, !selected && styles.placeholder]} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={Colors.textLight} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setOpen(false)}
          />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label || placeholder}</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetScroll}>
              {options.map((opt) => {
                const active = opt.value === value;
                return (
                  <TouchableOpacity
                    key={String(opt.value)}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {opt.label}
                    </Text>
                    {active && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 46,
  },
  value: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  placeholder: {
    color: Colors.textLight,
    fontWeight: '500',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '70%',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  sheetScroll: {
    flexGrow: 0,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  optionActive: {
    backgroundColor: 'rgba(0, 150, 137, 0.08)',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  optionTextActive: {
    color: Colors.primary,
  },
});
