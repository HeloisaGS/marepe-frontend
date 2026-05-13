import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { ModalPedidoAmbulante } from './ModalPedidoAmbulante';
import { Toast } from './Toast';
import { api } from '../services/api';
import { useRealtimePedidoAmbulante } from '../hooks/useRealtimePedidoAmbulante';

interface FluxoPedidoAmbulanteProps {
  ambulanteId: string;
  onPedidoAceito?: (pedidoId: string) => void; // Navegar para MAREPE-173
}

/**
 * Componente que integra todo o fluxo de gerenciamento de pedidos do ambulante:
 * 1. Badge de notificação com contador de pedidos
 * 2. Fila FIFO de pedidos
 * 3. Modal de pedido com Aceitar/Negar
 * 4. Tratamento de eventos Realtime
 * 5. Toasts de erro
 */
export const FluxoPedidoAmbulante: React.FC<FluxoPedidoAmbulanteProps> = ({
  ambulanteId,
  onPedidoAceito,
}) => {
  const [fila, setFila] = useState<any[]>([]);
  const [pedidoAtual, setPedidoAtual] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'error' | 'success' | 'info' }>({
    visible: false,
    message: '',
    type: 'error'
  });

  // Realtime
  const { evento } = useRealtimePedidoAmbulante(ambulanteId);

  // Carregar fila inicial
  useEffect(() => {
    carregarFila();
  }, []);

  // Escutar eventos Realtime
  useEffect(() => {
    if (!evento) return;

    switch (evento.tipo) {
      case 'novo_pedido':
        carregarFila();
        break;

      case 'pedido_cancelado':
        carregarFila();
        break;
    }
  }, [evento]);

  // Atualizar pedido atual quando a fila mudar
  useEffect(() => {
    if (fila.length > 0 && !showModal) {
      const primeiro = fila[0];
      setPedidoAtual({
        ...primeiro,
        total_na_fila: fila.length,
      });
      setShowModal(true);
    } else if (fila.length === 0) {
      setPedidoAtual(null);
      setShowModal(false);
    }
  }, [fila]);

  const carregarFila = async () => {
    try {
      const response = await api.listarFilaPedidos();
      setFila(response);
    } catch (error) {
      console.error('Erro ao carregar fila:', error);
    }
  };

  const handleAceitar = async (pedidoId: string) => {
    try {
      await api.aceitarPedido(pedidoId);
      showToast('Pedido aceito!', 'success');

      // Remover da fila
      setFila((prev) => prev.filter((p) => p.id !== pedidoId));
      setShowModal(false);

      // Navegar para tela de acompanhamento (MAREPE-173)
      onPedidoAceito?.(pedidoId);
    } catch (error: any) {
      // EX01: Erro ao aceitar
      const mensagem =
        error.response?.data?.detail ||
        'Não foi possível aceitar o pedido. Verifique sua conexão.';
      showToast(mensagem, 'error');
    }
  };

  const handleNegar = async (pedidoId: string) => {
    try {
      const response = await api.negarPedido(pedidoId);

      // Remover da fila
      setFila((prev) => prev.filter((p) => p.id !== pedidoId));

      // Se houver próximo pedido, mostrar
      if (response.proximo_pedido) {
        setTimeout(() => {
          setPedidoAtual({
            ...response.proximo_pedido,
            total_na_fila: fila.length - 1,
          });
          setShowModal(true);
        }, 2000);
      } else {
        setShowModal(false);
        setPedidoAtual(null);
      }
    } catch (error: any) {
      const mensagem = error.response?.data?.detail || 'Erro ao negar pedido';
      showToast(mensagem, 'error');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Após fechar, se houver mais pedidos, mostrar o próximo
    setTimeout(() => {
      if (fila.length > 0) {
        const proximo = fila[0];
        setPedidoAtual({
          ...proximo,
          total_na_fila: fila.length,
        });
        setShowModal(true);
      }
    }, 300);
  };

  const showToast = (message: string, type: 'error' | 'success' | 'info') => {
    setToast({ visible: true, message, type });
  };

  return (
    <View style={styles.container}>
      {/* Badge de notificação */}
      {fila.length > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{fila.length}</Text>
        </View>
      )}

      {/* Botão para abrir fila manualmente (opcional) */}
      {fila.length > 0 && !showModal && (
        <TouchableOpacity
          style={styles.buttonVerFila}
          onPress={() => setShowModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonVerFilaText}>Ver pedidos ({fila.length})</Text>
        </TouchableOpacity>
      )}

      {/* Modal de Pedido */}
      {pedidoAtual && (
        <ModalPedidoAmbulante
          visible={showModal}
          pedido={pedidoAtual}
          onAceitar={handleAceitar}
          onNegar={handleNegar}
          onClose={handleCloseModal}
        />
      )}

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  badge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#EF4444',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonVerFila: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonVerFilaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
