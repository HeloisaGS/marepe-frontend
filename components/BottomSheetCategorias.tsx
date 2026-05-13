import React, { useState, useCallback, useMemo, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

interface Categoria {
  id: string;
  nome_categoria: string;
}

interface BottomSheetCategoriasProps {
  categorias: Categoria[];
  onConfirmar: (categoriasSelecionadas: string[]) => void;
  onClose: () => void;
  ambulanteNome?: string;
  semProdutos?: boolean;
}

export const BottomSheetCategorias = forwardRef<BottomSheet, BottomSheetCategoriasProps>(
  ({ categorias, onConfirmar, onClose, ambulanteNome, semProdutos }, ref) => {
    const [selecionadas, setSelecionadas] = useState<string[]>([]);
    const snapPoints = useMemo(() => ['50%', '75%'], []);

    const toggleCategoria = (id: string) => {
      setSelecionadas((prev) =>
        prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
      );
    };

    const handleConfirmar = () => {
      onConfirmar(selecionadas);
      setSelecionadas([]);
    };

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      ),
      []
    );

    const renderItem = ({ item }: { item: Categoria }) => {
      const isSelected = selecionadas.includes(item.id);

      return (
        <TouchableOpacity
          style={[styles.categoriaItem, isSelected && styles.categoriaItemSelected]}
          onPress={() => toggleCategoria(item.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.categoriaText, isSelected && styles.categoriaTextSelected]}>
            {item.nome_categoria}
          </Text>
        </TouchableOpacity>
      );
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backdropComponent={renderBackdrop}
      >
        <View style={styles.container}>
          <Text style={styles.title}>
            {semProdutos
              ? 'Vendedor sem produtos'
              : `Pedido para ${ambulanteNome || 'ambulante'}`}
          </Text>

          {semProdutos ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Este vendedor ainda não cadastrou seus produtos.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.subtitle}>Selecione as categorias desejadas:</Text>

              <FlatList
                data={categorias}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
              />

              <TouchableOpacity
                style={[styles.button, selecionadas.length === 0 && styles.buttonDisabled]}
                onPress={handleConfirmar}
                disabled={selecionadas.length === 0}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Confirmar pedido</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
  categoriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoriaItemSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoriaText: {
    fontSize: 16,
    color: '#1F2937',
  },
  categoriaTextSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
