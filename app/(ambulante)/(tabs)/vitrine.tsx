import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';
import { vitrineService } from '../../../services/vitrineService';

interface Categoria {
  id: string;
  nome_categoria: string;
}

const EMOJI: Record<string, string> = {
  "Camarão": "🦐",
  "Milho": "🌽",
  "Queijo": "🧀",
  "Picolé": "🍦",
  "Castanha": "🥜",
  "Peixes": "🐟"
};

export default function Vitrine() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);

      // Buscar todas categorias disponíveis
      const resCategorias = await vitrineService.getCategorias();
      console.log("📦 Categorias recebidas:", resCategorias.data);
      setCategorias(resCategorias.data || []);

      // Buscar catálogo atual do vendedor
      const resCatalogo = await vitrineService.getMeuCatalogo();
      console.log("📋 Catálogo atual do vendedor:", resCatalogo.data);

      // O backend retorna array de items com estrutura {id, nome_categoria, is_active}
      // Filtrar apenas os que estão ativos
      const idsSelec = (resCatalogo.data || [])
        .filter((item: any) => item.is_active)
        .map((item: any) => item.id);

      console.log("✅ IDs selecionados:", idsSelec);
      setSelecionadas(idsSelec);
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }

  function toggleCategoria(categoriaId: string) {
    if (selecionadas.includes(categoriaId)) {
      setSelecionadas(selecionadas.filter(id => id !== categoriaId));
    } else {
      setSelecionadas([...selecionadas, categoriaId]);
    }
  }

  async function salvarCatalogo() {
    try {
      console.log("💾 Salvando categorias:", selecionadas);
      const response = await vitrineService.salvarCatalogo(selecionadas);
      console.log("✅ Resposta do servidor:", response.data);
      Alert.alert("Sucesso", "Catálogo atualizado!");
    } catch (error: any) {
      console.error("❌ Erro ao salvar:", error);
      console.error("Detalhes do erro:", error.response?.data);
      Alert.alert("Erro", error.response?.data?.detail || "Não foi possível salvar catálogo");
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#E95822" />
        <Text style={{ marginTop: 12, color: '#666' }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Meus produtos</Text>
      <Text style={styles.subtitle}>
        Toque para ativar ou desativar cada categoria.
      </Text>

      <View style={styles.grid}>
        {categorias.map((categoria) => {
          const ativo = selecionadas.includes(categoria.id);
          return (
            <TouchableOpacity
              key={categoria.id}
              onPress={() => toggleCategoria(categoria.id)}
              style={[styles.card, ativo && styles.cardAtivo]}
            >
              {ativo && (
                <View style={styles.checkContainer}>
                  <MaterialIcons name="check" size={16} color="#E95822" />
                </View>
              )}

              <Text style={styles.emoji}>{EMOJI[categoria.nome_categoria] || "📦"}</Text>

              <Text style={[styles.cardText, ativo && styles.cardTextAtivo]}>
                {categoria.nome_categoria}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footerBox}>
        <Text style={styles.footerText}>
          {selecionadas.length === 0
            ? "Você ainda não selecionou nenhuma categoria."
            : `Você está oferecendo ${selecionadas.length} ${
                selecionadas.length === 1 ? "categoria" : "categorias"
              }.`}
        </Text>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={salvarCatalogo}>
        <Text style={styles.saveButtonText}>Salvar catálogo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000'
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 25
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  card: {
    width: '48%',
    minHeight: 140,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative'
  },
  cardAtivo: {
    backgroundColor: '#E95822'
  },
  checkContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emoji: {
    fontSize: 35
  },
  cardText: {
    marginTop: 10,
    fontWeight: '600',
    fontSize: 16,
    color: '#000'
  },
  cardTextAtivo: {
    color: '#fff'
  },
  footerBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 15,
    marginTop: 20
  },
  footerText: {
    fontSize: 13,
    color: '#333'
  },
  saveButton: {
    backgroundColor: '#E95822',
    padding: 16,
    borderRadius: 14,
    marginTop: 20
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});