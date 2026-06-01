import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cardapioService } from '../../../services/cardapioService';
import { vitrineService } from '../../../services/vitrineService';

interface Produto {
  id: string;
  nome: string;
  preco: number;
  descricao?: string;
  categoria_id: string;
  disponivel: boolean;
}

interface Categoria {
  id: string;
  nome_categoria: string;
}

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);

  // Form state
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);

      // Tentar carregar categorias
      try {
        const resCategorias = await vitrineService.getCategorias();
        console.log('📂 Categorias recebidas:', resCategorias.data);
        setCategorias(resCategorias.data || []);
      } catch (error) {
        console.warn('⚠️ Não foi possível carregar categorias:', error);
      }

      // Tentar carregar produtos
      try {
        const resProdutos = await cardapioService.getMeusProdutos();
        console.log('📦 Produtos recebidos:', resProdutos.data);
        setProdutos(resProdutos.data || []);
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.warn('⚠️ Endpoint /vendedor/produtos não implementado ainda');
          // Mostrar aviso para o usuário
          setTimeout(() => {
            Alert.alert(
              'Funcionalidade em Desenvolvimento',
              'O gerenciamento de produtos está temporariamente indisponível. Os endpoints do backend ainda não foram implementados.\n\nEnquanto isso, você pode gerenciar suas categorias na aba "Vitrine".',
              [{ text: 'Entendi' }]
            );
          }, 500);
        } else {
          console.error('❌ Erro ao carregar produtos:', error);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  const abrirModal = (produto?: Produto) => {
    if (produto) {
      setEditingProduct(produto);
      setNome(produto.nome);
      setPreco(produto.preco.toString());
      setDescricao(produto.descricao || '');
      setCategoriaId(produto.categoria_id);
    } else {
      setEditingProduct(null);
      setNome('');
      setPreco('');
      setDescricao('');
      setCategoriaId(categorias[0]?.id || '');
    }
    setModalVisible(true);
  };

  const fecharModal = () => {
    setModalVisible(false);
    setEditingProduct(null);
    setNome('');
    setPreco('');
    setDescricao('');
    setCategoriaId('');
  };

  const salvarProduto = async () => {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Digite o nome do produto');
      return;
    }

    const precoNum = parseFloat(preco);
    if (isNaN(precoNum) || precoNum <= 0) {
      Alert.alert('Atenção', 'Digite um preço válido');
      return;
    }

    try {
      setSaving(true);

      const produtoData: any = {
        nome: nome.trim(),
        preco: precoNum,
        descricao: descricao.trim(),
      };

      // Categoria é opcional
      if (categoriaId) {
        produtoData.categoria_id = categoriaId;
      }

      if (editingProduct) {
        await cardapioService.atualizarProduto(editingProduct.id, produtoData);
        Alert.alert('Sucesso', 'Produto atualizado!');
      } else {
        await cardapioService.criarProduto(produtoData);
        Alert.alert('Sucesso', 'Produto adicionado!');
      }

      fecharModal();
      carregarDados();
    } catch (error: any) {
      console.error('❌ Erro ao salvar produto:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.detail || 'Não foi possível salvar o produto.'
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleDisponibilidade = async (produtoId: string) => {
    try {
      await cardapioService.toggleDisponibilidade(produtoId);
      setProdutos((prev) =>
        prev.map((p) =>
          p.id === produtoId ? { ...p, disponivel: !p.disponivel } : p
        )
      );
    } catch (error) {
      console.error('❌ Erro ao alterar disponibilidade:', error);
      Alert.alert('Erro', 'Não foi possível alterar a disponibilidade.');
    }
  };

  const confirmarDeletar = (produto: Produto) => {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja realmente excluir "${produto.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deletarProduto(produto.id),
        },
      ]
    );
  };

  const deletarProduto = async (produtoId: string) => {
    try {
      await cardapioService.deletarProduto(produtoId);
      Alert.alert('Sucesso', 'Produto excluído!');
      carregarDados();
    } catch (error) {
      console.error('❌ Erro ao deletar produto:', error);
      Alert.alert('Erro', 'Não foi possível excluir o produto.');
    }
  };

  const getCategoriaNome = (categoriaId: string) => {
    if (!categoriaId) return 'Geral';
    return categorias.find((c) => c.id === categoriaId)?.nome_categoria || 'Geral';
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#E95822" />
        <Text style={{ marginTop: 12, color: '#666' }}>Carregando produtos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Meu Cardápio</Text>
          <Text style={styles.subtitle}>
            {produtos.length} {produtos.length === 1 ? 'produto' : 'produtos'}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => abrirModal()}>
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.productList} showsVerticalScrollIndicator={false}>
        {produtos.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="food-off" size={80} color="#CCC" />
            <Text style={styles.emptyTitle}>Nenhum produto cadastrado</Text>
            <Text style={styles.emptySubtitle}>
              Comece adicionando seus produtos ao cardápio
            </Text>
          </View>
        ) : (
          produtos.map((produto) => (
            <View
              key={produto.id}
              style={[styles.productCard, !produto.disponivel && styles.productCardInactive]}
            >
              <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                  <Text style={styles.productName}>{produto.nome}</Text>
                  <TouchableOpacity
                    onPress={() => toggleDisponibilidade(produto.id)}
                    style={styles.toggleButton}
                  >
                    <MaterialCommunityIcons
                      name={produto.disponivel ? 'eye' : 'eye-off'}
                      size={20}
                      color={produto.disponivel ? '#10B981' : '#999'}
                    />
                  </TouchableOpacity>
                </View>

                {produto.descricao && (
                  <Text style={styles.productDesc} numberOfLines={2}>
                    {produto.descricao}
                  </Text>
                )}

                <View style={styles.productFooter}>
                  <Text style={styles.categoryBadge}>{getCategoriaNome(produto.categoria_id)}</Text>
                  <Text style={styles.productPrice}>R$ {produto.preco.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.productActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => abrirModal(produto)}
                >
                  <MaterialCommunityIcons name="pencil" size={20} color="#E95822" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => confirmarDeletar(produto)}
                >
                  <MaterialCommunityIcons name="delete" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de Adicionar/Editar */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </Text>
              <TouchableOpacity onPress={fecharModal}>
                <MaterialCommunityIcons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.label}>Nome do Produto*</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Água de coco gelada"
                value={nome}
                onChangeText={setNome}
              />

              <Text style={styles.label}>Preço (R$)*</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="numeric"
                value={preco}
                onChangeText={setPreco}
              />

              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descrição opcional do produto"
                value={descricao}
                onChangeText={setDescricao}
                multiline
                numberOfLines={3}
              />

              {categorias.length > 0 && (
                <>
                  <Text style={styles.label}>Categoria (opcional)</Text>
                  <View style={styles.categoryPicker}>
                    {categorias.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryOption,
                          categoriaId === cat.id && styles.categoryOptionSelected,
                        ]}
                        onPress={() => setCategoriaId(cat.id)}
                      >
                        <Text
                          style={[
                            styles.categoryOptionText,
                            categoriaId === cat.id && styles.categoryOptionTextSelected,
                          ]}
                        >
                          {cat.nome_categoria}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={fecharModal}
                disabled={saving}
              >
                <Text style={styles.cancelModalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveModalButton, saving && styles.saveModalButtonDisabled]}
                onPress={salvarProduto}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.saveModalButtonText}>
                    {editingProduct ? 'Atualizar' : 'Adicionar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#E95822',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  productList: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  productCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productCardInactive: {
    opacity: 0.6,
    backgroundColor: '#F5F5F5',
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  toggleButton: {
    padding: 4,
    marginLeft: 8,
  },
  productDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E95822',
  },
  productActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
    marginVertical: 4,
  },
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  modalContent: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryOption: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryOptionSelected: {
    backgroundColor: '#E95822',
    borderColor: '#E95822',
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  categoryOptionTextSelected: {
    color: '#FFF',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelModalButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveModalButton: {
    flex: 1,
    backgroundColor: '#E95822',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveModalButtonDisabled: {
    backgroundColor: '#CCC',
  },
  saveModalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
