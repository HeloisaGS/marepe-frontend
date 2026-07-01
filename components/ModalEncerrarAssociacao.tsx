import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import NumericKeypad from './NumericKeypad';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const POLL_INTERVAL = 3000;

interface ModalEncerrarAssociacaoProps {
  visible: boolean;
  associationId: string;
  customerName: string;
  onClose: () => void;
  onSuccess: () => void;
  onPaymentConfirmed?: () => void;
}

export default function ModalEncerrarAssociacao({
  visible,
  associationId,
  customerName,
  onClose,
  onSuccess,
  onPaymentConfirmed,
}: ModalEncerrarAssociacaoProps) {
  const [chargeAmountCents, setChargeAmountCents] = useState(0);
  const [chargePhoto, setChargePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!awaitingPayment) return;

    const checkPaymentStatus = async () => {
      try {
        const { authService } = await import('../services/authService');
        const response = await authService.getBarracaAssociations();
        const customers = response.data?.customers || response.data?.associations || [];
        const association = customers.find(
          (c: any) => c.association_id === associationId || c.id === associationId
        );
        const status = association?.status;
        if (
          status === 'closed' ||
          status === 'paid' ||
          status === 'confirmado' ||
          status === 'finalizado' ||
          status === 'encerrado' ||
          !association
        ) {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setAwaitingPayment(false);
          onPaymentConfirmed?.();
          onClose();
        }
      } catch {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    };

    checkPaymentStatus();
    pollRef.current = setInterval(checkPaymentStatus, POLL_INTERVAL);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [awaitingPayment]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de permissão para acessar suas fotos.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setChargePhoto(result.assets[0].uri);
    }
  };

  const handleConfirm = async () => {
    if (chargeAmountCents <= 0) {
      Alert.alert('Valor inválido', 'Informe um valor válido.');
      return;
    }

    if (!chargePhoto) {
      Alert.alert('Foto obrigatória', 'Anexe a foto da comanda.');
      return;
    }

    try {
      setLoading(true);

      const amount = chargeAmountCents / 100;
      const formData = new FormData();
      formData.append('charge_amount', amount.toString());
      formData.append('charge_photo', {
        uri: chargePhoto,
        type: 'image/jpeg',
        name: `charge_${Date.now()}.jpg`,
      } as any);

      await api.patch(`/api/associations/${associationId}/close`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAwaitingPayment(true);
    } catch (error: any) {
      console.error('Erro ao encerrar associação:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.detail || 'Não foi possível encerrar a associação.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNoCharge = async () => {
    Alert.alert(
      'Confirmar',
      'Encerrar sem cobrança?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim',
          onPress: async () => {
            try {
              setLoading(true);

              const formData = new FormData();
              formData.append('no_charge', 'true');

              await api.patch(`/api/associations/${associationId}/close`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              });

              Alert.alert('Sucesso', 'Associação encerrada com sucesso.');
              onSuccess();
              onClose();
            } catch (error: any) {
              console.error('Erro ao encerrar associação:', error);
              Alert.alert(
                'Erro',
                error.response?.data?.detail || 'Não foi possível encerrar a associação.'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setChargeAmountCents(0);
    setChargePhoto(null);
    setAwaitingPayment(false);
  };

  const handleClose = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    resetForm();
    onClose();
  };

  if (awaitingPayment) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="clock-outline" size={60} color="#F59E0B" />
            </View>
            <Text style={styles.title}>Aguardando pagamento do cliente</Text>
            <Text style={styles.subtitle}>
              O cliente está visualizando o valor e a chave PIX. Você será notificado quando o pagamento for confirmado.
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <Text style={styles.title}>Encerrar associação</Text>
            <Text style={styles.subtitle}>Cliente: {customerName}</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Valor do pedido (R$)</Text>
              <NumericKeypad
                amountCents={chargeAmountCents}
                onAmountChange={setChargeAmountCents}
              />
            </View>

            <View style={styles.photoContainer}>
              <Text style={styles.label}>Foto da comanda</Text>
              {chargePhoto ? (
                <TouchableOpacity onPress={pickImage}>
                  <Image source={{ uri: chargePhoto }} style={styles.photo} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                  <MaterialCommunityIcons name="camera" size={32} color="#E95822" />
                  <Text style={styles.photoButtonText}>Anexar foto</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handleNoCharge}
                disabled={loading}
              >
                <Text style={styles.buttonSecondaryText}>Não se aplica</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonPrimary,
                  (chargeAmountCents <= 0 || !chargePhoto || loading) && styles.buttonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={chargeAmountCents <= 0 || !chargePhoto || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.buttonPrimaryText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.cancelButton} onPress={handleClose} disabled={loading}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    alignSelf: 'center',
  },
  iconContainer: {
    alignSelf: 'center',
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
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  photoContainer: {
    marginBottom: 24,
  },
  photo: {
    width: '100%',
    height: 200,
    maxHeight: SCREEN_HEIGHT * 0.25,
    borderRadius: 12,
  },
  photoButton: {
    backgroundColor: '#FFF5F0',
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E95822',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    fontSize: 14,
    color: '#E95822',
    marginTop: 8,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#E95822',
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  buttonSecondary: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  buttonDisabled: {
    backgroundColor: '#FBBF9C',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#999',
  },
  closeButton: {
    backgroundColor: '#E95822',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
