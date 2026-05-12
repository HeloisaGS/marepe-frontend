import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';

interface ModalAguardandoConfirmacaoProps {
  visible: boolean;
  ambulanteNome: string;
  ambulanteFoto?: string;
  posicaoFila: number;
  onCancelar: () => void;
  // Eventos de status
  onPedidoAceito?: () => void;
  onPedidoNegado?: (mensagem: string) => void;
  onPedidoExpirado?: () => void;
  onAvancoFila?: (mensagem: string) => void;
}

export const ModalAguardandoConfirmacao: React.FC<ModalAguardandoConfirmacaoProps> = ({
  visible,
  ambulanteNome,
  ambulanteFoto,
  posicaoFila,
  onCancelar,
}) => {
  const [timer, setTimer] = useState(60);
  const [mensagemStatus, setMensagemStatus] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setTimer(60);
      setMensagemStatus(null);

      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // Timer zerado - expirado
            setMensagemStatus('Tempo esgotado. O ambulante não respondeu.');
            setTimeout(() => {
              onCancelar();
            }, 3000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [visible]);

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Foto e nome do ambulante */}
          {ambulanteFoto ? (
            <Image source={{ uri: ambulanteFoto }} style={styles.foto} />
          ) : (
            <View style={[styles.foto, styles.fotoPlaceholder]}>
              <Text style={styles.fotoPlaceholderText}>
                {ambulanteNome.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <Text style={styles.nome}>{ambulanteNome}</Text>

          {/* Mensagem de status ou aguardando */}
          {mensagemStatus ? (
            <Text style={styles.mensagemStatus}>{mensagemStatus}</Text>
          ) : (
            <>
              <Text style={styles.aguardando}>Aguardando confirmação de {ambulanteNome}</Text>

              {/* Timer */}
              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>{formatarTempo(timer)}</Text>
              </View>

              {/* Posição na fila */}
              <Text style={styles.posicaoFila}>Você é o Nº {posicaoFila} na fila</Text>

              {/* Botão cancelar */}
              <TouchableOpacity
                style={styles.buttonCancelar}
                onPress={onCancelar}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonCancelarText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  foto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  fotoPlaceholder: {
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fotoPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  nome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  aguardando: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  timerContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#3B82F6',
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  posicaoFila: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    marginBottom: 24,
  },
  buttonCancelar: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  buttonCancelarText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  mensagemStatus: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
});
