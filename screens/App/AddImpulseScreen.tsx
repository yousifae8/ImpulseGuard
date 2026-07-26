import { useState } from 'react'
import type { ImpulseItem } from '../../store/slices/impulseSlice'
import { View, Text, ActivityIndicator, Alert, Image, ScrollView, StyleSheet } from 'react-native'
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

type AddImpulseScreenNavigationProp = BottomTabNavigationProp<AppTabParamList, 'AddImpulse'>;

const AddImpulseScreen = () => {
  const [itemName, setItemName] = useState('')
  const [price, setPrice] = useState('')
  const [reason, setReason] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const dispatch = useDispatch<AppDispatch>()
  const { error } = useSelector<RootState, ImpulseState>((state) => state.impulses)
  const userUid = useSelector((state: RootState) => state.user.uid)

  const navigation = useNavigation<AddImpulseScreenNavigationProp>();

  const pickImage = async () => {
    try {
      const imageResult = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        mediaType: 'photo',
        includeBase64: true,
        compressImageQuality: 0.5,
      })

      setImage(imageResult.data || null)
    } catch (e: any) {
      if (e.code === 'E_PICKER_CANCELLED') {
        console.log('Image selection cancelled')
      } else {
        Alert.alert('Image Picker Error', e.message)
        console.error(e)
      }
    }
  }

  const handleAddImpulse = async () => {
    if (!userUid) {
      Alert.alert('Error', 'You must be logged in to add an impulse.')
      return
    }
    if (!itemName || !price || !reason) {
      Alert.alert('Error', 'Please fill all required fields.')
      return
    }

    setIsSubmitting(true)
    dispatch(setLoading())
    try {
      const loggedAt = new Date()
      const releaseAt = new Date(loggedAt.getTime() + 48 * 60 * 60 * 1000)

      const newImpulse: Omit<ImpulseItem, 'id'> = {
        userId: userUid,
        itemName,
        price: parseFloat(price),
        reason,
        loggedAt: loggedAt.toISOString(),
        releaseAt: releaseAt.toISOString(),
        status: 'pending',
        ...(image ? { imageUrl: image } : {}),
      }

      await addDoc(collection(db, 'impulses'), newImpulse as ImpulseItem)
      dispatch(setSuccess())
      Alert.alert('Success', 'Impulse logged successfully! It will be ready for review in 48 hours.')
      setItemName('')
      setPrice('')
      setReason('')
      setImage(null);
    } catch (e: any) {
      dispatch(setError(e.message))
      Alert.alert('Error logging impulse', e.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Log a New Item</Text>
      <Text style={styles.subtitle}>Record your item and revisit in 48 hours</Text>

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
            onChangeText={setPrice}
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
          <Text style={styles.label}>Photo (Optional)</Text>
          <Button onPress={pickImage} buttonWidth={'100%'}>
            {image ? 'Change Image' : 'Pick an Image'}
          </Button>
          {image && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: `data:image/jpeg;base64,${image}` }} style={styles.previewImage} />
            </View>
          )}
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
  imagePreview: {
    marginTop: 12,
    borderRadius: theme.radius.medium,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '100%',
    height: 100
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: theme.radius.medium,
  },
  error: {
    color: theme.semantic.danger,
    fontSize: theme.fontSize.small,
    marginTop: 10,
    textAlign: 'center',
  },
});