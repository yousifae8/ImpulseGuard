import { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import theme from './theme';

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface PickerColumnProps {
  items: { label: string; value: number }[];
  selectedValue: number;
  onSelect: (value: number) => void;
}

const PickerColumn: React.FC<PickerColumnProps> = ({ items, selectedValue, onSelect }) => {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = items.findIndex(i => i.value === selectedValue);

  const handleScroll = (e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < items.length) {
      onSelect(items[index].value);
    }
  };

  useEffect(() => {
    const idx = Math.max(0, selectedIndex);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: false });
    }, 50);
  }, []);

  return (
    <View style={pickerStyles.column}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        onScrollEndDrag={handleScroll}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        style={{ height: PICKER_HEIGHT }}
      >
        {items.map((item) => {
          const isSelected = item.value === selectedValue;
          return (
            <TouchableOpacity
              key={item.value}
              style={[pickerStyles.item, isSelected && pickerStyles.selectedItem]}
              onPress={() => {
                onSelect(item.value);
                const idx = items.findIndex(i => i.value === item.value);
                scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
              }}
            >
              <Text style={[pickerStyles.itemText, isSelected && pickerStyles.selectedText]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View pointerEvents="none" style={pickerStyles.selectionOverlay} />
    </View>
  );
};

const pickerStyles = StyleSheet.create({
  column: {
    flex: 1,
    position: 'relative',
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedItem: {},
  itemText: {
    fontSize: theme.fontSize.medium,
    color: theme.text.textSecondary,
    fontFamily: theme.fonts.body,
  },
  selectedText: {
    color: theme.brand.primary,
    fontWeight: '700',
    fontSize: theme.fontSize.large,
  },
  selectionOverlay: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.brand.primary + '55',
    backgroundColor: theme.brand.primary + '10',
    borderRadius: 8,
  },
});


const pad = (n: number) => String(n).padStart(2, '0');

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function daysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

function buildDayItems(month: number, year: number) {
  const total = daysInMonth(month, year);
  return Array.from({ length: total }, (_, i) => ({ label: pad(i + 1), value: i + 1 }));
}

function buildMonthItems() {
  return MONTHS.map((m, i) => ({ label: m, value: i }));
}

function buildYearItems() {
  const now = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => ({ label: String(now + i), value: now + i }));
}

function buildHourItems() {
  return Array.from({ length: 12 }, (_, i) => ({ label: pad(i + 1), value: i + 1 }));
}

function buildMinuteItems() {
  return Array.from({ length: 60 }, (_, i) => ({ label: pad(i), value: i }));
}

function buildAmPmItems() {
  return [{ label: 'AM', value: 0 }, { label: 'PM', value: 1 }];
}


interface DatePickerModalProps {
  visible: boolean;
  value: Date;
  minimumDate?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  value,
  onConfirm,
  onCancel,
}) => {
  const hours12 = value.getHours() % 12 || 12;
  const ampm = value.getHours() >= 12 ? 1 : 0;

  const [day, setDay] = useState(value.getDate());
  const [month, setMonth] = useState(value.getMonth());
  const [year, setYear] = useState(value.getFullYear());
  const [hour, setHour] = useState(hours12);
  const [minute, setMinute] = useState(value.getMinutes());
  const [meridiem, setMeridiem] = useState(ampm);

  const dayItems = buildDayItems(month, year);
  const monthItems = buildMonthItems();
  const yearItems = buildYearItems();
  const hourItems = buildHourItems();
  const minuteItems = buildMinuteItems();
  const ampmItems = buildAmPmItems();

  const handleConfirm = () => {
    const clampedDay = Math.min(day, daysInMonth(month, year));
    const hour24 = meridiem === 1 ? (hour % 12) + 12 : hour % 12;
    const result = new Date(year, month, clampedDay, hour24, minute, 0, 0);
    onConfirm(result);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onCancel} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.headerCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Set Reminder</Text>
          <TouchableOpacity onPress={handleConfirm}>
            <Text style={styles.headerConfirm}>Confirm</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>DATE</Text>
        <View style={styles.row}>
          <PickerColumn items={monthItems} selectedValue={month} onSelect={setMonth} />
          <PickerColumn items={dayItems}   selectedValue={day}   onSelect={setDay}   />
          <PickerColumn items={yearItems}  selectedValue={year}  onSelect={setYear}  />
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>TIME</Text>
        <View style={styles.row}>
          <PickerColumn items={hourItems}   selectedValue={hour}     onSelect={setHour}     />
          <PickerColumn items={minuteItems} selectedValue={minute}   onSelect={setMinute}   />
          <PickerColumn items={ampmItems}   selectedValue={meridiem} onSelect={setMeridiem} />
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    backgroundColor: theme.background.bgElevated,
    borderTopLeftRadius: theme.radius.xlarge,
    borderTopRightRadius: theme.radius.xlarge,
    paddingBottom: 36,
    paddingHorizontal: 16,
    width,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.background.bgSurface,
    marginBottom: 8,
  },
  headerTitle: {
    color: theme.text.textPrimary,
    fontSize: theme.fontSize.medium,
    fontWeight: '700',
    fontFamily: theme.fonts.heading,
  },
  headerCancel: {
    color: theme.text.textSecondary,
    fontSize: theme.fontSize.medium,
  },
  headerConfirm: {
    color: theme.brand.primary,
    fontSize: theme.fontSize.medium,
    fontWeight: '700',
  },
  sectionLabel: {
    color: theme.text.textTertiary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: theme.background.bgSurface,
    marginVertical: 8,
  },
});

export default DatePickerModal;
