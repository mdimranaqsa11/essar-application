import { useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';

// Calendar picker used by the admin forms wherever a date is stored as a plain
// `YYYY-MM-DD` string. Kept dependency-free (no native date picker) so it behaves
// identically on both platforms and needs no pod install.

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const pad = (n) => String(n).padStart(2, '0');

// Local-time formatting on purpose: toISOString() shifts to UTC and can land on
// the previous day for users east of GMT.
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const parseISO = (value) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || '').trim());
  if (!m) return null;
  const [, y, mo, day] = m;
  const d = new Date(Number(y), Number(mo) - 1, Number(day));
  // Guards against overflow like 2026-02-31 rolling into March.
  if (d.getFullYear() !== Number(y) || d.getMonth() !== Number(mo) - 1 || d.getDate() !== Number(day)) {
    return null;
  }
  return d;
};

const formatDisplay = (value) => {
  const d = parseISO(value);
  return d ? `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}` : '';
};

const sameDay = (a, b) =>
  !!a && !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export function DateField({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  icon = 'calendar-outline',
  labelStyle,
  fieldStyle,
}) {
  const [open, setOpen] = useState(false);
  const today = useMemo(() => new Date(), []);
  const selected = parseISO(value);

  // Month currently shown in the grid; starts on the selected date, else today.
  const [cursor, setCursor] = useState(() => {
    const base = parseISO(value) || new Date();
    return { year: base.getFullYear(), month: base.getMonth() };
  });

  const openPicker = () => {
    const base = parseISO(value) || new Date();
    setCursor({ year: base.getFullYear(), month: base.getMonth() });
    setOpen(true);
  };

  const shiftMonth = (delta) => {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  // Leading blanks so the 1st lands under its weekday, then the month's days.
  const cells = useMemo(() => {
    const firstWeekday = new Date(cursor.year, cursor.month, 1).getDay();
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const out = new Array(firstWeekday).fill(null);
    for (let day = 1; day <= daysInMonth; day++) out.push(day);
    return out;
  }, [cursor]);

  const commit = (date) => {
    onChange(toISO(date));
    setOpen(false);
  };

  const display = formatDisplay(value);

  return (
    <View>
      {!!label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <TouchableOpacity
        style={[styles.field, fieldStyle]}
        onPress={openPicker}
        activeOpacity={0.75}
      >
        <Ionicons name={icon} size={18} color={Colors.textLight} />
        <Text style={[styles.value, !display && styles.placeholder]} numberOfLines={1}>
          {display || placeholder}
        </Text>
        {!!display && (
          <TouchableOpacity onPress={() => onChange('')} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setOpen(false)}
          />

          <View style={styles.sheet}>
            <View style={styles.monthRow}>
              <TouchableOpacity onPress={() => shiftMonth(-1)} style={styles.navButton} hitSlop={8}>
                <Ionicons name="chevron-back" size={20} color={Colors.text} />
              </TouchableOpacity>

              <Text style={styles.monthLabel}>
                {MONTHS[cursor.month]} {cursor.year}
              </Text>

              <TouchableOpacity onPress={() => shiftMonth(1)} style={styles.navButton} hitSlop={8}>
                <Ionicons name="chevron-forward" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((d, i) => (
                <Text key={`${d}-${i}`} style={styles.weekday}>
                  {d}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((day, i) => {
                if (day === null) {
                  return <View key={`blank-${i}`} style={styles.cell} />;
                }

                const date = new Date(cursor.year, cursor.month, day);
                const isToday = sameDay(date, today);
                const isSelected = sameDay(date, selected);

                return (
                  <TouchableOpacity
                    key={`day-${day}`}
                    style={styles.cell}
                    onPress={() => commit(date)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.dayPill,
                        isToday && styles.dayPillToday,
                        isSelected && styles.dayPillSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isToday && styles.dayTextToday,
                          isSelected && styles.dayTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionGhost}
                onPress={() => {
                  onChange('');
                  setOpen(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.actionGhostText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionPrimary}
                onPress={() => commit(new Date())}
                activeOpacity={0.85}
              >
                <Text style={styles.actionPrimaryText}>Today</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 14,
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  placeholder: {
    color: Colors.textLight,
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
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  navButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekday: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textLight,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
  },
  dayPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPillToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  dayPillSelected: {
    backgroundColor: Colors.primary,
    borderWidth: 0,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  dayTextToday: {
    color: Colors.primary,
    fontWeight: '700',
  },
  dayTextSelected: {
    color: Colors.white,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  actionGhost: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionGhostText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  actionPrimary: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  actionPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
