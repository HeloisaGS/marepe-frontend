import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';

interface PedidoData {
  id: string;
  cliente_id: string;
  cliente_nome?: string;
  cliente_foto?: string;
  categorias_nomes?: string[];
  distancia_metros?: number;
  tempo_restante_segundos: number;
  posicao: number;
  total_na_fila: number;
}

interface ModalPedidoAmbulanteProps {
  visible: boolean;
  pedido: PedidoData | null;
  onAceitar: (pedidoId: string) => void;
  onNegar: (pedidoId: string) => void;
  onClose: () => void;
}

export const ModalPedidoAmbulante: React.FC<ModalPedidoAmbulanteProps> = ({
  visible,
  pedido,
  onAceitar,
  onNegar,
  onClose,
}) => {
  const [timer, setTimer] = useState(60);
  const [mostrarMensagemNegado, setMostrarMensagemNegado] = useState(false);

  useEffect(() => {
    if (visible && pedido) {
      setTimer(pedido.tempo_restante_segundos);
      setMostrarMensagemNegado(false);

      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // Auto-remover ao expirar
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [visible, pedido]);

  const handleNegar = () => {
    if (pedido) {
      onNegar(pedido.id);
      setMostrarMensagemNegado(true);

      // Mostrar mensagem por 2s e fechar
      setTimeout(() => {
        setMostrarMensagemNegado(false);
        onClose();
      }, 2000);
    }
  };

  const handleAceitar = () => {
    if (pedido) {
      onAceitar(pedido.id);
      onClose();
    }
  };

  if (!pedido) return null;

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatarDistancia = (metros?: number) => {
    if (!metros) return 'Distância desconhecida';
    if (metros < 1000) return `${Math.round(metros)}m`;
    return `${(metros / 1000).toFixed(1)}km`;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {mostrarMensagemNegado ? (
            <View style={styles.mensagemContainer}>
              <Text style={styles.mensagemNegado}>Pedido negado.</Text>
            </View>
          ) : (
            <>
              {/* Foto e nome do cliente */}
              {pedido.cliente_foto ? (
                <Image source={{ uri: pedido.cliente_foto }} style={styles.foto} />
              ) : (
                <View style={[styles.foto, styles.fotoPlaceholder]}>
                  <Text style={styles.fotoPlaceholderText}>
                    {pedido.cliente_nome?.charAt(0).toUpperCase() || 'C'}
                  </Text>
                </View>
              )}

              <Text style={styles.nome}>{pedido.cliente_nome || 'Cliente'}</Text>

              {/* Categorias solicitadas */}
              <View style={styles.infoSection}>
                <Text style={styles.labelInfo}>Categorias solicitadas:</Text>
                {pedido.categorias_nomes?.map((cat, idx) => (
                  <Text key={idx} style={styles.categoria}>
                    • {cat}
                  </Text>
                ))}
              </View>

              {/* Distância */}
              <Text style={styles.distancia}>{formatarDistancia(pedido.distancia_metros)}</Text>

              {/* Timer */}
              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>{formatarTempo(timer)}</Text>
              </View>

              {/* Posição na fila */}
              <Text style={styles.posicaoFila}>
                Pedido {pedido.posicao} de {pedido.total_na_fila}
              </Text>

              {/* Botões */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonNegar]}
                  onPress={handleNegar}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonNegarText}>Negar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.buttonAceitar]}
                  onPress={handleAceitar}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonAceitarText}>Aceitar</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#F59E0B',
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
    marginBottom: 16,
  },
  infoSection: {
    width: '100%',
    marginBottom: 12,
  },
  labelInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '600',
  },
  categoria: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
    marginBottom: 4,
  },
  distancia: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    marginBottom: 16,
  },
  timerContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#F59E0B',
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D97706',
  },
  posicaoFila: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
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
  buttonNegar: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  buttonNegarText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonAceitar: {
    backgroundColor: '#10B981',
  },
  buttonAceitarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mensagemContainer: {
    paddingVertical: 40,
  },
  mensagemNegado: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '600',
    textAlign: 'center',
  },
});
