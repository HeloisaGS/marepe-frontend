import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Clipboard,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';

interface ModalEncerrarClienteProps {
  visible: boolean;
  associationId: string;
  establishmentName: string;
  onClose: () => void;
  onSuccess: () => void;
}

type ModalState = 'confirm' | 'waiting' | 'payment';

interface ChargeData {
  charge_amount: number;
  charge_photo_url: string;
  pix_key: string;
}

const POLL_INTERVAL = 3000;

const ModalEncerrarCliente = React.forwardRef<any, ModalEncerrarClienteProps>(({
  visible,
  associationId,
  establishmentName,
  onClose,
  onSuccess,
}, ref) => {
  const [state, setState] = useState<ModalState>('confirm');
  const [loading, setLoading] = useState(false);
  const [chargeData, setChargeData] = useState<ChargeData | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkAssociationStatus = async () => {
    try {
      const res = await api.get('/cliente/my-association');
      const data = res.data?.association || res.data?.data || res.data;
      console.log('📡 Polling associação:', JSON.stringify(data, null, 2));

      const chargeAmount = data?.charge_amount ?? data?.valor_cobranca;
      const chargePhotoUrl = data?.charge_photo_url ?? data?.foto_comanda;
      const pixKey = data?.pix_key ?? data?.chave_pix;
      const status = data?.status;
      const chargeAmountNumber = chargeAmount ? Number(chargeAmount) : 0;

      if ((status === 'pending_payment' || status === 'aguardando_pagamento') && pixKey) {
        setChargeData({
          charge_amount: chargeAmountNumber,
          charge_photo_url: chargePhotoUrl || '',
          pix_key: pixKey,
        });
        setState('payment');
        clearInterval(pollRef.current!);
        pollRef.current = null;
      } else if (status === 'closed' || status === 'encerrado') {
        clearInterval(pollRef.current!);
        pollRef.current = null;
        Alert.alert('Atendimento encerrado', 'O barraqueiro encerrou o atendimento.');
        handleClose();
      }
    } catch {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
  };

  // Verificar status atual quando o modal abre
  useEffect(() => {
    if (visible && state === 'confirm') {
      checkAssociationStatus();
    }
  }, [visible]);

  useEffect(() => {
    if (state === 'waiting') {
      checkAssociationStatus();
      pollRef.current = setInterval(checkAssociationStatus, POLL_INTERVAL);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [state]);

  const handleRequestClose = async () => {
    try {
      setLoading(true);
      await api.post(`/api/associations/${associationId}/request-close`);
      setState('waiting');
    } catch (error: any) {
      console.error('Erro ao solicitar encerramento:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.detail || 'Não foi possível solicitar o encerramento.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPixKey = () => {
    if (chargeData?.pix_key) {
      Clipboard.setString(chargeData.pix_key);
      Alert.alert('Chave Pix copiada!', 'Cole no seu aplicativo de pagamento.');
    }
  };

  const handleConfirmPayment = () => {
    Alert.alert(
      'Confirmar pagamento',
      `Você confirma que realizou o pagamento de R$ ${chargeData?.charge_amount.toFixed(2)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              setLoading(true);
              await api.post(`/api/associations/${associationId}/confirm-payment`);
              Alert.alert('Atendimento finalizado!', 'Obrigado!');
              setTimeout(() => {
                onSuccess();
                onClose();
                resetModal();
              }, 2000);
            } catch (error: any) {
              console.error('Erro ao confirmar pagamento:', error);
              Alert.alert(
                'Erro',
                error.response?.data?.detail || 'Não foi possível confirmar o pagamento. Tente novamente.'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const resetModal = () => {
    setState('confirm');
    setChargeData(null);
  };

  const handleClose = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    resetModal();
    onClose();
  };

  // Método para receber evento Realtime de cobrança
  const handleChargeSent = (data: any) => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    const chargeAmount = data?.charge_amount ?? data?.valor_cobranca ?? 0;
    const chargePhotoUrl = data?.charge_photo_url ?? data?.foto_comanda ?? '';
    const pixKey = data?.pix_key ?? data?.chave_pix ?? '';
    setChargeData({
      charge_amount: Number(chargeAmount),
      charge_photo_url: chargePhotoUrl,
      pix_key: pixKey,
    });
    setState('payment');
  };

  // Exportar método para ser chamado pelo componente pai
  React.useImperativeHandle(
    ref,
    () => ({
      handleChargeSent,
    }),
    []
  );

  if (state === 'confirm') {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.container}>
            <MaterialCommunityIcons name="help-circle-outline" size={60} color="#E95822" />
            <Text style={styles.title}>Deseja encerrar o atendimento?</Text>
            <Text style={styles.subtitle}>{establishmentName}</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.buttonSecondaryText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
                onPress={handleRequestClose}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.buttonPrimaryText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  if (state === 'waiting') {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.container}>
            <MaterialCommunityIcons name="clock-outline" size={60} color="#F59E0B" />
            <Text style={styles.title}>Aguardando o barraqueiro informar o valor do pedido.</Text>
            <ActivityIndicator size="large" color="#E95822" style={{ marginTop: 24 }} />
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  if (state === 'payment' && chargeData) {
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
              <Text style={styles.title}>Pagamento via Pix</Text>
              <Text style={styles.amount}>R$ {chargeData.charge_amount.toFixed(2)}</Text>

              <View style={styles.photoContainer}>
                <Text style={styles.label}>Comanda</Text>
                <TouchableOpacity onPress={() => setSelectedPhoto(chargeData.charge_photo_url)}>
                  <Image source={{ uri: chargeData.charge_photo_url }} style={styles.photo} />
                </TouchableOpacity>
              </View>

              <View style={styles.pixContainer}>
                <Text style={styles.label}>Chave Pix</Text>
                <View style={styles.pixRow}>
                  <Text style={styles.pixKey}>{chargeData.pix_key}</Text>
                  <TouchableOpacity style={styles.copyButton} onPress={handleCopyPixKey}>
                    <MaterialCommunityIcons name="content-copy" size={20} color="#E95822" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.confirmPaymentButton, loading && styles.buttonDisabled]}
                onPress={handleConfirmPayment}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.confirmPaymentText}>Confirmar pagamento</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Lightbox */}
        <Modal visible={!!selectedPhoto} transparent animationType="fade">
          <View style={styles.lightboxContainer}>
            <TouchableOpacity style={styles.lightboxClose} onPress={() => setSelectedPhoto(null)}>
              <MaterialCommunityIcons name="close" size={32} color="#FFF" />
            </TouchableOpacity>
            {selectedPhoto && (
              <Image source={{ uri: selectedPhoto }} style={styles.lightboxImage} resizeMode="contain" />
            )}
          </View>
        </Modal>
      </Modal>
    );
  }

  return null;
});

export default ModalEncerrarCliente;

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
    alignItems: 'center',
    alignSelf: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#E95822',
    marginBottom: 24,
  },
  photoContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  photo: {
    width: '100%',
    height: 150,
    maxHeight: SCREEN_HEIGHT * 0.2,
    borderRadius: 12,
  },
  pixContainer: {
    width: '100%',
    marginBottom: 24,
  },
  pixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pixKey: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
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
  confirmPaymentButton: {
    backgroundColor: '#E95822',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  confirmPaymentText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
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
    marginTop: 16,
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#999',
  },
  lightboxContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  lightboxImage: {
    width: '90%',
    height: '80%',
  },
});
