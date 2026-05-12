import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { BottomSheetCategorias } from './BottomSheetCategorias';
import { ModalAguardandoConfirmacao } from './ModalAguardandoConfirmacao';
import { Toast } from './Toast';
import { api } from '../services/api';
import { useRealtimePedidoCliente } from '../hooks/useRealtimePedidoCliente';

interface Ambulante {
  id: string;
  nome: string;
  foto?: string;
  categorias: Array<{ id: string; nome_categoria: string }>;
}

interface FluxoPedidoClienteProps {
  clienteId: string;
  ambulante: Ambulante;
  onPedidoAceito?: () => void;
}

/**
 * Componente que integra todo o fluxo de pedido do cliente:
 * 1. Botão "Pedir"
 * 2. BottomSheet de seleção de categorias
 * 3. Modal "Aguardando confirmação"
 * 4. Tratamento de eventos Realtime
 * 5. Toasts de erro
 */
export const FluxoPedidoCliente: React.FC<FluxoPedidoClienteProps> = ({
  clienteId,
  ambulante,
  onPedidoAceito,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [pedidoAtivo, setPedidoAtivo] = useState<any>(null);
  const [showModalAguardando, setShowModalAguardando] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'error' | 'success' | 'info' }>({
    visible: false,
    message: '',
    type: 'error'
  });

  // Realtime
  const { evento } = useRealtimePedidoCliente(clienteId);

  // Verificar se já tem pedido ativo (ALT01)
  const temPedidoAtivo = pedidoAtivo !== null;

  // Verificar se ambulante tem produtos (ALT02)
  const ambulanteSemProdutos = !ambulante.categorias || ambulante.categorias.length === 0;

  // Escutar eventos Realtime
  useEffect(() => {
    if (!evento) return;

    switch (evento.tipo) {
      case 'pedido_aceito':
        setShowModalAguardando(false);
        setPedidoAtivo(null);
        showToast('Pedido aceito! O ambulante está indo até você.', 'success');
        onPedidoAceito?.();
        break;

      case 'pedido_negado':
        setShowModalAguardando(false);
        setPedidoAtivo(null);
        showToast(
          `${evento.payload.ambulante_nome} recusou o atendimento.`,
          'error'
        );
        break;

      case 'pedido_expirado':
        setShowModalAguardando(false);
        setPedidoAtivo(null);
        showToast('Tempo esgotado. O ambulante não respondeu.', 'error');
        break;

      case 'avanco_fila':
        setShowModalAguardando(false);
        setPedidoAtivo(null);
        showToast(
          `${evento.payload.ambulante_nome} aceitou outro pedido. Você pode tentar novamente.`,
          'info'
        );
        break;
    }
  }, [evento]);

  const handlePressarPedir = () => {
    if (ambulanteSemProdutos) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.expand();
    }
  };

  const handleConfirmarPedido = async (categoriasSelecionadas: string[]) => {
    try {
      // Fechar bottom sheet
      bottomSheetRef.current?.close();

      // Criar pedido
      const response = await api.criarPedido(ambulante.id, categoriasSelecionadas);

      // Salvar pedido ativo
      setPedidoAtivo(response);

      // Mostrar modal aguardando
      setShowModalAguardando(true);
    } catch (error: any) {
      // EX01: Falha de conexão
      const mensagem =
        error.response?.data?.detail ||
        'Não foi possível enviar seu pedido. Verifique sua conexão e tente novamente.';
      showToast(mensagem, 'error');
    }
  };

  const handleCancelarPedido = async () => {
    if (!pedidoAtivo) return;

    try {
      await api.cancelarPedido(pedidoAtivo.id);
      setPedidoAtivo(null);
      setShowModalAguardando(false);
      showToast('Pedido cancelado', 'info');
    } catch (error) {
      showToast('Erro ao cancelar pedido', 'error');
    }
  };

  const showToast = (message: string, type: 'error' | 'success' | 'info') => {
    setToast({ visible: true, message, type });
  };

  return (
    <View style={styles.container}>
      {/* Botão Pedir */}
      <TouchableOpacity
        style={[styles.buttonPedir, temPedidoAtivo && styles.buttonPedirDisabled]}
        onPress={handlePressarPedir}
        disabled={temPedidoAtivo}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonPedirText}>
          {temPedidoAtivo ? 'Pedido em andamento...' : 'Pedir'}
        </Text>
      </TouchableOpacity>

      {/* Bottom Sheet de Categorias */}
      <BottomSheetCategorias
        ref={bottomSheetRef}
        categorias={ambulante.categorias}
        onConfirmar={handleConfirmarPedido}
        onClose={() => bottomSheetRef.current?.close()}
        ambulanteNome={ambulante.nome}
        semProdutos={ambulanteSemProdutos}
      />

      {/* Modal Aguardando Confirmação */}
      {pedidoAtivo && (
        <ModalAguardandoConfirmacao
          visible={showModalAguardando}
          ambulanteNome={ambulante.nome}
          ambulanteFoto={ambulante.foto}
          posicaoFila={pedidoAtivo.posicao_fila || 1}
          onCancelar={handleCancelarPedido}
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
  buttonPedir: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPedirDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonPedirText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
