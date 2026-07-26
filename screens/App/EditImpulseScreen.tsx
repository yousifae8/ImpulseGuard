import { useState } from 'react'
import type { ImpulseItem } from '../../store/slices/impulseSlice';
import { View, ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TouchableOpacity, Platform, PermissionsAndroid } from 'react-native'
import Input from '../../components/common/Input'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import { updateImpulse, setLoading, setError } from '../../store/slices/impulseSlice'
import { db } from '../../utils/firebaseConfig'
import { doc, updateDoc } from 'firebase/firestore'
import ImagePicker from 'react-native-image-crop-picker'
import theme from '../../components/common/theme'
import Button from '../../components/common/Button'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/AppTabs';



type EditImpulseScreenProp = RouteProp<HomeStackParamList, 'EditImpulse'>;

const EditImpulseScreen = () => {
    const route = useRoute<EditImpulseScreenProp>();
    const navigation = useNavigation();
    const {impulse} = route.params;
    
    const [itemName, setItemName] = useState(impulse.itemName);
    const [price, setPrice] = useState(impulse.price.toString());
    const [reason, setReason] = useState(impulse.reason);
    const [imageUrl, setImageUrl] = useState<string | undefined>(impulse.imageUrl);
    const [newImageSelected, setNewImageSelected] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const userId = useSelector((state: RootState) => state.user.uid);

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
                mediaType: 'photo',
                cropping: true,
                width: 300,
                height: 400,
                includeBase64: true,
                compressImageQuality: 0.5,
            });
            if (imageResult.data) {
                setImageUrl(imageResult.data);
                setNewImageSelected(true);
            }
        } catch (e: any) {
            if (e.code !== 'E_PICKER_CANCELLED') {
                Alert.alert('Camera Error', e.message);
            }
        }
    };

    const openGallery = async () => {
        try {
            const imageResult = await ImagePicker.openPicker({
                mediaType: 'photo',
                cropping: true,
                width: 300,
                height: 400,
                includeBase64: true,
                compressImageQuality: 0.5,
            });
            if (imageResult.data) {
                setImageUrl(imageResult.data);
                setNewImageSelected(true);
            }
        } catch (e: any) {
            if (e.code !== 'E_PICKER_CANCELLED') {
                Alert.alert('Gallery Error', e.message);
            }
        }
    };

    const pickImage = () => {
        Alert.alert(
            'Item Photo',
            'Choose how you want to update the photo:',
            [
                { text: '📷 Take Photo with Camera', onPress: openCamera },
                { text: '🖼️ Choose from Gallery', onPress: openGallery },
                { text: 'Cancel', style: 'cancel' },
            ],
            { cancelable: true }
        );
    };

    const placeholderImage = 'https://via.placeholder.com/150';

    const getImageUri = (uri?: string) => {
        if (!uri) return placeholderImage;
        if (uri.startsWith('http') || uri.startsWith('data:') || uri.startsWith('file:')) {
            return uri;
        }
        return `data:image/jpeg;base64,${uri}`;
    };

    const handleUpdateImpulse = async () => {
        if (!userId) {
            Alert.alert('Error', 'You must be logged in to update an impulse.');
            return;
        }
        if (!impulse?.id) {
            Alert.alert('Error', 'Invalid impulse ID.');
            return;
        }
        if (!itemName || !price || !reason) {
            Alert.alert('Error', 'Please fill all required fields.');
            return;
        }

        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            Alert.alert('Error', 'Please enter a valid price.');
            return;
        }

        setIsUpdating(true);
        dispatch(setLoading());

        try {
            let imageUrlToUpdate: string | undefined = impulse.imageUrl;
            if (newImageSelected && imageUrl) {
                imageUrlToUpdate = imageUrl;
            }

            const updateData = {
                itemName,
                price: numericPrice,
                reason,
                ...(imageUrlToUpdate !== undefined ? { imageUrl: imageUrlToUpdate } : {}),
            };

            const updatedImpulse: ImpulseItem = {
                ...impulse,
                ...updateData,
            };

            const impulseRef = doc(db, 'impulses', impulse.id);
            await updateDoc(impulseRef, updateData);

            dispatch(updateImpulse(updatedImpulse));
            Alert.alert('Success', 'Impulse updated successfully');
            navigation.goBack();
        } catch (e: any) {
            dispatch(setError(e.message));
            Alert.alert('Error', 'Failed to update impulse: ' + e.message);
        } finally {
            setIsUpdating(false);
            navigation.goBack();
        }
    };

    return (
        <View>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.imageContainer}>
                    <TouchableOpacity
                        onPress={pickImage}
                        style={styles.imageWrapper}
                    >
                        <Image
                            source={{ uri: getImageUri(imageUrl) }}
                            style={styles.image}
                        />
                    </TouchableOpacity>
                </View>

                <Input
                    label="Item Name"
                    value={itemName}
                    onChangeText={setItemName}
                    placeholder="e.g., New Gaming Console"
                />

                <Input
                    label="Price (USD)"
                    value={price}
                    onChangeText={setPrice}
                    placeholder="e.g., 500"
                    keyboardType="numeric"
                />

                <Input
                    label="Why do you want this?"
                    value={reason}
                    onChangeText={setReason}
                    placeholder="e.g., It will help me relax"
                    multiline
                    numberOfLines={3}
                />

                {isUpdating ? (
                    <ActivityIndicator size="large" color={theme.brand.primary} style={{ marginTop: theme.spacing.large }} />
                ) : (
                    <Button onPress={handleUpdateImpulse}>
                        Update Impulse
                    </Button>
                )}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: theme.spacing.large,
        paddingBottom: 100,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.large,
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
    image: {
        width: '100%',
        height: '100%',
    },
});

export default EditImpulseScreen;