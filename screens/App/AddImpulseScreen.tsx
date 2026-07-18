import React, { useState } from 'react'
import type { ImpulseItem } from '../../store/slices/impulseSlice'
import { View, Text, TextInput, Button, ActivityIndicator, Alert, Image, ScrollView, Platform } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import { addImpulse, setLoading, setError } from '../../store/slices/impulseSlice'
import { db, storage } from '../../utils/firebaseConfig'
import { collection, addDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import ImagePicker from 'react-native-image-crop-picker'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'

const AddImpulseScreen = () => {
  const [itemName, setItemName] = useState('')
  const [price, setPrice] = useState('')
  const [reason, setReason] = useState('')
  const [image, setImage] = useState<string | null>(null)

  const dispatch = useDispatch<AppDispatch>()
  const { status, error } = useSelector((state: RootState) => state.impulses)
  const userUid = useSelector((state: RootState) => state.user.uid)

  const pickImage = async () => {
    try {
      const imageResult = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        mediaType: 'photo',
        includeBase64: false,
      })

      setImage(imageResult.path)
    } catch (e: any) {
      if (e.code === 'E_PICKER_CANCELLED') {
        console.log('Image selection cancelled')
      } else {
        Alert.alert('Image Picker Error', e.message)
        console.error(e)
      }
    }
  }

  const uploadImage = async (uri: string) => {
    const response = await fetch(uri)
    const blob = await response.blob()
    const filename = uuidv4()
    const storageRef = ref(storage, `impulse_images/${userUid}/${filename}`)
    const uploadTask = await uploadBytes(storageRef, blob)
    const downloadURL = await getDownloadURL(uploadTask.ref)
    return downloadURL
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

    dispatch(setLoading())
    try {
      let imageUrl: string | undefined
      if (image) {
        imageUrl = await uploadImage(image)
      }

      const loggedAt = new Date()
      const releaseAt = new Date(loggedAt.getTime() + 48 * 60 * 60 * 1000)

      const newImpulse: ImpulseItem = {
        id: uuidv4(),
        itemName,
        price: parseFloat(price),
        reason,
        imageUrl: imageUrl || undefined,
        loggedAt: loggedAt.toISOString(),
        releaseAt: releaseAt.toISOString(),
        status: 'pending',
      }

      const docRef = await addDoc(collection(db, 'impulses'), newImpulse)
      dispatch(addImpulse({ ...newImpulse, id: docRef.id }))
      Alert.alert('Success', 'Impulse logged successfully! It will be ready for review in 48 hours.')
      setItemName('')
      setPrice('')
      setReason('')
      setImage(null)
    } catch (e: any) {
      dispatch(setError(e.message))
      Alert.alert('Error logging impulse', e.message)
    }
  }

  return (
    <ScrollView>
      <Text>Log a New Impulse</Text>
      <TextInput
        placeholder="Item Name (e.g., New Gaming Headset)"
        value={itemName}
        onChangeText={setItemName}
      />
      <TextInput
        placeholder="Price (e.g., 150.00)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TextInput
       
        placeholder="Why do you want this? (Encourage reflection)"
        value={reason}
        onChangeText={setReason}
        multiline
      />
      <Button title="Pick an image (Optional)" onPress={pickImage} />
      {image && <Image source={{ uri: image }} />}

      {status === 'loading' ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Log Impulse" onPress={handleAddImpulse} />
      )}
      {error && <Text>{error}</Text>}
    </ScrollView>
  );
};


export default AddImpulseScreen;