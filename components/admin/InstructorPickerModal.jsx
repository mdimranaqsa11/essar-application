import { useMemo, useState } from 'react';
import { FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';

// Searchable multi-select sheet for assigning instructors to a course. Keeps the
// course form itself compact even when there are many instructors to choose from.
export function InstructorPickerModal({ visible, instructors, selectedIds, onToggle, onClose }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return instructors;
    return instructors.filter(
      (ins) => ins.name?.toLowerCase().includes(q) || ins.designation?.toLowerCase().includes(q)
    );
  }, [instructors, query]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Select Instructors{selectedIds.length ? ` (${selectedIds.length})` : ''}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={Colors.textLight} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={16} color={Colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search instructors"
              placeholderTextColor={Colors.textLight}
              value={query}
              onChangeText={setQuery}
            />
            {!!query && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={Colors.textLight} />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(ins) => String(ins.instructor_id)}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.emptyText}>No instructors match “{query}”.</Text>
            }
            renderItem={({ item: ins }) => {
              const active = selectedIds.includes(ins.instructor_id);
              const initial = (ins.name || '?').charAt(0).toUpperCase();
              return (
                <TouchableOpacity
                  style={[styles.row, active && styles.rowActive]}
                  onPress={() => onToggle(ins.instructor_id)}
                  activeOpacity={0.75}
                >
                  {ins.image ? (
                    <Image source={{ uri: ins.image }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <Text style={styles.initial}>{initial}</Text>
                    </View>
                  )}
                  <View style={styles.textWrap}>
                    <Text style={styles.name} numberOfLines={1}>
                      {ins.name}
                    </Text>
                    {!!ins.designation && (
                      <Text style={styles.role} numberOfLines={1}>
                        {ins.designation}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.checkbox, active && styles.checkboxActive]}>
                    {active && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          <TouchableOpacity style={styles.doneButton} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 42,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    padding: 0,
  },
  list: {
    flexGrow: 0,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  rowActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 150, 137, 0.06)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
  },
  avatarFallback: {
    backgroundColor: 'rgba(0, 150, 137, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  textWrap: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  role: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  doneButton: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});
