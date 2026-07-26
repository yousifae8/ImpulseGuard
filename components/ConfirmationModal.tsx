import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from './common/theme';
interface ConfirmationModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    visible,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = false,
    onConfirm,
    onCancel,
}) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>{cancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                isDanger ? styles.dangerButton : styles.confirmButton,
                            ]}
                            onPress={onConfirm}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.confirmButtonText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modalContainer: {
        width: '100%',
        backgroundColor: theme.background.bgSurface,
        borderRadius: theme.radius.medium,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.background.bgElevated,
    },
    title: {
        fontSize: theme.fontSize.large,
        fontWeight: '700',
        marginBottom: 8,
        color: theme.text.textPrimary,
        fontFamily: theme.fonts.heading,
    },
    message: {
        fontSize: theme.fontSize.medium,
        color: theme.text.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: theme.radius.small,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: theme.background.bgElevated,
        borderWidth: 1,
        borderColor: theme.text.textTertiary,
    },
    confirmButton: {
        backgroundColor: theme.brand.primary,
    },
    dangerButton: {
        backgroundColor: theme.semantic.danger,
    },
    cancelButtonText: {
        color: theme.text.textPrimary,
        fontWeight: '600',
        fontSize: theme.fontSize.medium,
    },
    confirmButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: theme.fontSize.medium,
    },
});
export default ConfirmationModal;