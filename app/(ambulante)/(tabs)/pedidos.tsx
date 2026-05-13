import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { pedidoService } from '../../../services/pedidoService';

interface Pedido {
  id: string;
  cliente_nome: string;
  status: string;
  created_at: string;
  posicao_fila?: number;
  valor_total?: number;
  itens?: Array<{
    nome: string;
    quantidade: number;
    preco_unitario: number;
  }>;
}

const STATUS_CONFIG = {
  pendente: { label: 'Pendente', color: '#FFA500', icon: 'clock-outline', nextStatus: null },
  aceito: { label: 'Aceito', color: '#4CAF50', icon: 'check-circle-outline', nextStatus: 'em_preparo' },
  em_preparo: { label: 'Em Preparo', color: '#2196F3', icon: 'chef-hat', nextStatus: 'pronto' },
  pronto: { label: 'Pronto', color: '#9C27B0', icon: 'food', nextStatus: 'entregue' },
  entregue: { label: 'Entregue', color: '#4CAF50', icon: 'check-circle', nextStatus: null },
  negado: { label: 'Negado', color: '#F44336', icon: 'close-circle-outline', nextStatus: null },
  cancelado: { label: 'Cancelado', color: '#999', icon: 'cancel', nextStatus: null },
  expirado: { label: 'Expirado', color: '#999', icon: 'timer-off-outline', nextStatus: null },
};

export default function PedidosAmbulante() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPedidos = async () => {
    try {
      const response = await pedidoService.listarPedidosAmbulante();
      console.log('📋 [AMBULANTE] Pedidos recebidos:', response.data?.length || 0);
      if (response.data && response.data.length > 0) {
        console.log('📋 [AMBULANTE] Primeiro pedido:', response.data[0]);
        console.log('📋 [AMBULANTE] Status:', response.data[0].status);
      }
      setPedidos(response.data || []);
    } catch (error) {
      console.error('❌ [AMBULANTE] Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPedidos();
  };

  const handleAvancarStatus = async (pedidoId: string, novoStatus: string) => {
    try {
      setUpdating(pedidoId);
      await pedidoService.atualizarStatusPedido(pedidoId, novoStatus);
      Alert.alert('Sucesso', 'Status atualizado');
      fetchPedidos();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', error.response?.data?.detail || 'Não foi possível atualizar o status');
    } finally {
      setUpdating(null);
    }
  };

  const handleAceitarPedido = async (pedidoId: string) => {
    try {
      setUpdating(pedidoId);
      await pedidoService.aceitarPedido(pedidoId);
      Alert.alert('Sucesso', 'Pedido aceito!');
      fetchPedidos();
    } catch (error: any) {
      console.error('Erro ao aceitar pedido:', error);
      Alert.alert('Erro', error.response?.data?.detail || 'Não foi possível aceitar o pedido');
    } finally {
      setUpdating(null);
    }
  };

  const handleNegarPedido = async (pedidoId: string) => {
    Alert.alert(
      'Negar Pedido',
      'Tem certeza que deseja negar este pedido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Negar',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(pedidoId);
              await pedidoService.negarPedido(pedidoId);
              Alert.alert('Pedido negado');
              fetchPedidos();
            } catch (error: any) {
              console.error('Erro ao negar pedido:', error);
              Alert.alert('Erro', error.response?.data?.detail || 'Não foi possível negar o pedido');
            } finally {
              setUpdating(null);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNextStatusLabel = (currentStatus: string) => {
    const map: any = {
      aceito: 'Iniciar Preparo',
      em_preparo: 'Marcar como Pronto',
      pronto: 'Entregar',
    };
    return map[currentStatus] || 'Avançar';
  };

  const renderPedido = ({ item }: { item: Pedido }) => {
    console.log('🎨 [RENDER] Pedido ID:', item.id, 'Status:', item.status);
    const config = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pendente;
    const nextStatus = config.nextStatus;
    console.log('🎨 [RENDER] Config:', config.label, 'NextStatus:', nextStatus);

    return (
      <View style={styles.pedidoCard}>
        <View style={styles.header}>
          <View style={styles.clientInfo}>
            <MaterialCommunityIcons name="account" size={20} color="#E95822" />
            <Text style={styles.clientName}>{item.cliente_nome}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
            <MaterialCommunityIcons name={config.icon as any} size={16} color="#FFF" />
            <Text style={styles.statusText}>{config.label}</Text>
          </View>
        </View>

        {item.itens && item.itens.length > 0 && (
          <View style={styles.itensContainer}>
            <Text style={styles.itensTitle}>Itens pedidos:</Text>
            {item.itens.map((it, idx) => (
              <Text key={idx} style={styles.itemText}>
                {it.quantidade}x {it.nome}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#999" />
            <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
          </View>
          {item.valor_total && (
            <Text style={styles.totalText}>R$ {item.valor_total.toFixed(2)}</Text>
          )}
        </View>

        {item.status === 'pendente' && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.negarButton, updating === item.id && styles.actionButtonDisabled]}
              onPress={() => handleNegarPedido(item.id)}
              disabled={updating === item.id}
            >
              {updating === item.id ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.actionButtonText}>Negar</Text>
              )}
            </TouchableOpacity>
            <View style={{ width: 12 }} />
            <TouchableOpacity
              style={[styles.aceitarButton, updating === item.id && styles.actionButtonDisabled]}
              onPress={() => handleAceitarPedido(item.id)}
              disabled={updating === item.id}
            >
              {updating === item.id ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.actionButtonText}>Aceitar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {item.status !== 'pendente' && nextStatus && (
          <TouchableOpacity
            style={[styles.actionButton, updating === item.id && styles.actionButtonDisabled]}
            onPress={() => handleAvancarStatus(item.id, nextStatus)}
            disabled={updating === item.id}
          >
            {updating === item.id ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.actionButtonText}>{getNextStatusLabel(item.status)}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E95822" />
        <Text style={styles.loadingText}>Carregando pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Pedidos Recebidos</Text>
      </View>

      {pedidos.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="clipboard-list-outline" size={80} color="#DDD" />
          <Text style={styles.emptyText}>Nenhum pedido recebido</Text>
          <Text style={styles.emptySubtext}>
            Aguarde clientes solicitarem seus produtos!
          </Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          renderItem={renderPedido}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  titleContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  list: {
    padding: 16,
  },
  pedidoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 4,
  },
  itensContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  itensTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  itemText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E95822',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#E95822',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#CCC',
  },
  aceitarButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  negarButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});
