import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';
import { vitrineService } from '../../../services/vitrineService';

const ALL_CATEGORIAS = [
  "Camarão",
  "Milho",
  "Queijo",
  "Picolé",
  "Castanha",
  "Peixes"
];

const EMOJI: Record<string, string> = {
  Camarão: "🦐",
  Milho: "🌽",
  Queijo: "🧀",
  Picolé: "🍦",
  Castanha: "🥜",
  Peixes: "🐟"
};

export default function Vitrine() {
  const [selecionadas, setSelecionadas] = useState<string[]>([]);

  useEffect(() => {
    carregarCatalogo();
  }, []);

  async function carregarCatalogo() {
    try {
      const response = await vitrineService.getMeuCatalogo();
      const categoriasBackend = response.data.map((item: any) => item.categoria);
      setSelecionadas(categoriasBackend);
    } catch (error) {
      console.log("Erro ao carregar catálogo:", error);
    }
  }

  function toggleCategoria(categoria: string) {
    if (selecionadas.includes(categoria)) {
      setSelecionadas(selecionadas.filter(item => item !== categoria));
    } else {
      setSelecionadas([...selecionadas, categoria]);
    }
  }

  async function salvarCatalogo() {
    try {
      await vitrineService.salvarCatalogo(selecionadas);
      Alert.alert("Sucesso", "Catálogo atualizado!");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível salvar catálogo");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Meus produtos</Text>
      <Text style={styles.subtitle}>
        Toque para ativar ou desativar cada categoria.
      </Text>

      <View style={styles.grid}>
        {ALL_CATEGORIAS.map((categoria) => {
          const ativo = selecionadas.includes(categoria);
          return (
            <TouchableOpacity
              key={categoria}
              onPress={() => toggleCategoria(categoria)}
              style={[styles.card, ativo && styles.cardAtivo]}
            >
              {ativo && (
                <View style={styles.checkContainer}>
                  <MaterialIcons name="check" size={16} color="#E95822" />
                </View>
              )}

              {/* ✅ Emoji adicionado — estava definido mas nunca renderizado */}
              <Text style={styles.emoji}>{EMOJI[categoria]}</Text>

              <Text style={[styles.cardText, ativo && styles.cardTextAtivo]}>
                {categoria}
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