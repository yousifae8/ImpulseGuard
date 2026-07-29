import { useState } from 'react'
import type { ImpulseItem } from '../../store/slices/impulseSlice'
import { View, Text, ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Platform, PermissionsAndroid, TouchableOpacity } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import { setLoading, setError, setSuccess } from '../../store/slices/impulseSlice'
import { db } from '../../utils/firebaseConfig'
import type { ImpulseState } from '../../store/slices/impulseSlice'
import { collection, addDoc } from 'firebase/firestore'
import ImagePicker from 'react-native-image-crop-picker'
import theme from '../../components/common/theme';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { AppTabParamList } from '../../navigation/AppTabs';
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { scheduleImpulseNotification } from '../../utils/notifications'
import DatePickerModal from '../../components/common/DatePickerModal'

type AddImpulseScreenNavigationProp = BottomTabNavigationProp<AppTabParamList, 'AddImpulse'>;

const defaultReminder = (): Date => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
};

const AddImpulseScreen = () => {
  const [itemName, setItemName] = useState('')
  const [price, setPrice] = useState('')
  const [reason, setReason] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reminderDate, setReminderDate] = useState<Date>(defaultReminder())
  const [showPicker, setShowPicker] = useState(false)

  const dispatch = useDispatch<AppDispatch>()
  const { error } = useSelector<RootState, ImpulseState>((state) => state.impulses)
  const userUid = useSelector((state: RootState) => state.user.uid)

  const navigation = useNavigation<AddImpulseScreenNavigationProp>();

  const handlePriceChange = (text: string) => {
    const sanitized = text.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    const formatted = parts.length > 2
      ? parts[0] + '.' + parts.slice(1).join('')
      : sanitized;
    setPrice(formatted);
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission Required',
            message: 'ImpulseGuard needs access to your camera to take a photo of your item.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Grant Permission',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
      return;
    }
    try {
      const imageResult = await ImagePicker.openCamera({
        width: 300,
        height: 400,
        cropping: true,
        mediaType: 'photo',
        includeBase64: true,
        compressImageQuality: 0.5,
      });
      setImage(imageResult.data || null);
    } catch (e: any) {
      if (e.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Camera Error', e.message);
      }
    }
  };

  const openGallery = async () => {
    try {
      const imageResult = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        mediaType: 'photo',
        includeBase64: true,
        compressImageQuality: 0.5,
      });
      setImage(imageResult.data || null);
    } catch (e: any) {
      if (e.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Gallery Error', e.message);
      }
    }
  };

  const pickImage = () => {
    Alert.alert(
      'Item Photo',
      'Choose how you want to add a photo:',
      [
        { text: '📷 Take Photo with Camera', onPress: openCamera },
        { text: '🖼️ Choose from Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const formatReminderDate = (date: Date): string => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleAddImpulse = async () => {
    if (!userUid) {
      Alert.alert('Error', 'You must be logged in to add an impulse.');
      return;
    }
    if (!itemName || !price || !reason) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price greater than 0.');
      return;
    }

    if (reminderDate <= new Date()) {
      Alert.alert('Invalid Reminder', 'Please choose a reminder date and time in the future.');
      return;
    }

    setIsSubmitting(true);
    dispatch(setLoading());
    try {
      const loggedAt = new Date();

      const newImpulse: Omit<ImpulseItem, 'id'> = {
        userId: userUid,
        itemName,
        price: parsedPrice,
        reason,
        loggedAt: loggedAt.toISOString(),
        releaseAt: reminderDate.toISOString(),
        status: 'pending',
        ...(image ? { imageUrl: image } : {}),
      };

      const docRef = await addDoc(collection(db, 'impulses'), newImpulse as ImpulseItem);

      await scheduleImpulseNotification(
        docRef.id,
        itemName,
        reminderDate.toISOString()
      );

      dispatch(setSuccess());
      Alert.alert(
        'Success',
        `Impulse logged! You'll be reminded on ${formatReminderDate(reminderDate)}.`
      );
      setItemName('');
      setPrice('');
      setReason('');
      setImage(null);
      setReminderDate(defaultReminder());
    } catch (e: any) {
      dispatch(setError(e.message));
      Alert.alert('Error logging item', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Log a New Item</Text>
      <Text style={styles.subtitle}>Record your item and choose when to revisit it</Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Item Name</Text>
          <Input
            placeholder="e.g., New Gaming Headset"
            value={itemName}
            onChangeText={setItemName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Price ($)</Text>
          <Input
            placeholder="e.g., 150.00"
            value={price}
            onChangeText={handlePriceChange}
            keyboardType='number-pad'
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Why do you want this?</Text>
          <Input
            placeholder="Encourage reflection..."
            value={reason}
            onChangeText={setReason}
            multiline
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Remind Me On</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dateButtonText}>{formatReminderDate(reminderDate)}</Text>
            <Text style={styles.dateButtonChevron}>›</Text>
          </TouchableOpacity>
          <Text style={styles.dateHint}>Tap to change the reminder date & time</Text>
        </View>

        <DatePickerModal
          visible={showPicker}
          value={reminderDate}
          minimumDate={new Date()}
          onConfirm={(date) => { setReminderDate(date); setShowPicker(false); }}
          onCancel={() => setShowPicker(false)}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Photo (Optional)</Text>
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.imageWrapper} activeOpacity={0.8}>
              {image ? (
                <Image source={{ uri: `data:image/jpeg;base64,${image}` }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {isSubmitting ? (
          <ActivityIndicator size="large" color={theme.brand.primary} style={{ marginVertical: 20 }} />
        ) : (
          <Button onPress={handleAddImpulse} buttonWidth={'100%'}>
            Add Item
          </Button>
        )}

        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </ScrollView>
  );
};

export default AddImpulseScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.bgBase,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: theme.fontSize.xxlarge,
    fontWeight: '700',
    color: theme.text.textPrimary,
    fontFamily: theme.fonts.heading,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.fontSize.small,
    color: theme.text.textSecondary,
    marginBottom: 30,
  },
  form: {
    gap: 4,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: theme.fontSize.small,
    color: theme.text.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background.bgInput,
    borderRadius: theme.radius.medium,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.background.bgElevated,
  },
  dateButtonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  dateButtonText: {
    flex: 1,
    fontSize: theme.fontSize.medium,
    color: theme.text.textPrimary,
    fontWeight: '500',
  },
  dateButtonChevron: {
    fontSize: 22,
    color: theme.text.textSecondary,
    fontWeight: '300',
  },
  dateHint: {
    fontSize: 11,
    color: theme.text.textTertiary,
    marginTop: 4,
    marginLeft: 2,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  imageWrapper: {
    width: 140,
    height: 140,
    borderRadius: theme.radius.xlarge,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: theme.brand.primary,
    backgroundColor: theme.background.bgSurface,
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  imagePlaceholderText: {
    fontSize: theme.fontSize.small,
    color: theme.text.textSecondary,
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  error: {
    color: theme.semantic.danger,
    fontSize: theme.fontSize.small,
    marginTop: 10,
    textAlign: 'center',
  },
});