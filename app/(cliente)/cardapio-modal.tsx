import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cardapioService } from '../../services/cardapioService';
import { pedidoService } from '../../services/pedidoService';

interface CardapioItem {
  id: string;
  nome: string;
  preco: number;
  descricao: string;
  disponivel: boolean;
}

interface CardapioModalProps {
  visible: boolean;
  vendorId: string;
  vendorName: string;
  vendorCategories: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CardapioModal({
  visible,
  vendorId,
  vendorName,
  vendorCategories,
  onClose,
  onSuccess,
}: CardapioModalProps) {
  const [cardapio, setCardapio] = useState<CardapioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (visible && vendorId) {
      fetchCardapio();
    }
  }, [visible, vendorId]);

  const fetchCardapio = async () => {
    try {
      setLoading(true);
      const response = await cardapioService.getCardapio(vendorId);
      setCardapio(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar cardápio:', error);
      Alert.alert('Erro', 'Não foi possível carregar o cardápio');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    const newSelected = new Map(selectedItems);
    const current = newSelected.get(itemId) || 0;
    const newQty = Math.max(0, current + delta);

    if (newQty === 0) {
      newSelected.delete(itemId);
    } else {
      newSelected.set(itemId, newQty);
    }

    setSelectedItems(newSelected);
  };

  const getTotal = () => {
    let total = 0;
    selectedItems.forEach((qty, itemId) => {
      const item = cardapio.find((i) => i.id === itemId);
      if (item) {
        total += item.preco * qty;
      }
    });
    return total;
  };

  const handleConfirm = async () => {
    if (selectedItems.size === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um item');
      return;
    }

    try {
      setCreating(true);

      const itens = Array.from(selectedItems.entries()).map(([itemId, qty]) => {
        const item = cardapio.find((i) => i.id === itemId)!;
        return {
          item_id: itemId,
          nome: item.nome,
          quantidade: qty,
          preco_unitario: item.preco,
        };
      });

      await pedidoService.criarPedido(vendorId, [], itens);

      Alert.alert(
        'Pedido Criado!',
        `Seu pedido foi enviado para ${vendorName}. Aguarde a resposta.`,
        [{ text: 'OK', onPress: onSuccess }]
      );
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      const errorMsg =
        error.response?.data?.detail ||
        'Não foi possível criar o pedido. Tente novamente.';
      Alert.alert('Erro', errorMsg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{vendorName}</Text>
              <Text style={styles.subtitle}>Cardápio</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E95822" />
            </View>
          ) : (
            <>
              <ScrollView style={styles.itemsList}>
                {cardapio.map((item) => {
                  const qty = selectedItems.get(item.id) || 0;
                  return (
                    <View key={item.id} style={styles.itemCard}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.nome}</Text>
                        {item.descricao && (
                          <Text style={styles.itemDesc}>{item.descricao}</Text>
                        )}
                        <Text style={styles.itemPrice}>
                          R$ {item.preco.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.quantityControl}>
                        <TouchableOpacity
                          style={styles.qtyButton}
                          onPress={() => handleQuantityChange(item.id, -1)}
                        >
                          <MaterialCommunityIcons
                            name="minus"
                            size={20}
                            color="#E95822"
                          />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{qty}</Text>
                        <TouchableOpacity
                          style={styles.qtyButton}
                          onPress={() => handleQuantityChange(item.id, 1)}
                        >
                          <MaterialCommunityIcons
                            name="plus"
                            size={20}
                            color="#E95822"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              <View style={styles.footer}>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>R$ {getTotal().toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    (creating || selectedItems.size === 0) &&
                      styles.confirmButtonDisabled,
                  ]}
                  onPress={handleConfirm}
                  disabled={creating || selectedItems.size === 0}
                >
                  {creating ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Fazer Pedido</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  itemsList: {
    maxHeight: 400,
  },
  itemCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  itemDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E95822',
    marginTop: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E95822',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    paddingTop: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E95822',
  },
  confirmButton: {
    backgroundColor: '#E95822',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCC',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
