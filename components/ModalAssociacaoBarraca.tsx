import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ModalAssociacaoBarracaProps {
  visible: boolean;
  establishmentName: string;
  ownerName: string;
  vendorId: string;
  onClose: () => void;
  onSuccess: (associationId?: string) => void;
}

export default function ModalAssociacaoBarraca({
  visible,
  establishmentName,
  ownerName,
  vendorId,
  onClose,
  onSuccess,
}: ModalAssociacaoBarracaProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const { authService } = await import('../services/authService');
      const response = await authService.createAssociation(vendorId);
      const associationId = response.data?.association_id || response.data?.id || response.data?.data?.association_id;

      Alert.alert(
        'Associação realizada!',
        `Você agora está associado a ${establishmentName}. Você pode conversar com o estabelecimento através do chat.`,
        [
          {
            text: 'OK',
            onPress: () => {
              onClose();
              onSuccess(associationId);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Erro ao criar associação:', error);
      const errorMsg =
        error.response?.data?.detail ||
        'Não foi possível se associar ao estabelecimento. Tente novamente.';
      Alert.alert('Erro', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="store" size={40} color="#E95822" />
            </View>
            <Text style={styles.title}>Confirmar associação</Text>
            <Text style={styles.subtitle}>
              Deseja se associar ao estabelecimento:
            </Text>
          </View>

          {/* Establishment Info */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="store-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Estabelecimento:</Text>
            </View>
            <Text style={styles.infoValue}>{establishmentName}</Text>

            <View style={[styles.infoRow, styles.infoRowSpacing]}>
              <MaterialCommunityIcons name="account-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Proprietário:</Text>
            </View>
            <Text style={styles.infoValue}>{ownerName}</Text>
          </View>

          {/* Warning */}
          <View style={styles.warningContainer}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#F59E0B" />
            <Text style={styles.warningText}>
              Você só pode estar associado a um estabelecimento por vez. Esta ação criará um vínculo entre você e este estabelecimento.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.buttonCancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonConfirm, loading && styles.buttonDisabled]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                  <Text style={styles.buttonConfirmText}>Confirmar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoRowSpacing: {
    marginTop: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
    marginLeft: 28,
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    marginLeft: 8,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonCancel: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  buttonConfirm: {
    backgroundColor: '#E95822',
  },
  buttonConfirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 6,
  },
  buttonDisabled: {
    backgroundColor: '#FBBF9C',
  },
});
