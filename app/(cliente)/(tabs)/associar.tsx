import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../../../services/authService';
import { router } from 'expo-router';

interface EstablishmentDetails {
  association_id: string;
  vendor_id: string;
  establishment_name: string;
  owner_name: string;
  association_status: 'none' | 'this' | 'other';
}

export default function Associar() {
  const [association, setAssociation] = useState<EstablishmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [disassociating, setDisassociating] = useState(false);

  useEffect(() => {
    fetchAssociation();
  }, []);

  const fetchAssociation = async () => {
    try {
      // Tenta buscar associação do cliente
      const response = await authService.getClientAssociation();

      // authService.getClientAssociation retorna o axios response
      // Dados estão em response.data
      const data = response.data;

      if (data && data.vendor_id) {
        setAssociation(data);
      } else {
        setAssociation(null);
      }
    } catch (error: any) {
      // Se retornar 404, significa que não há associação
      if (error.response?.status === 404) {
        setAssociation(null);
      } else {
        console.error('Erro ao buscar associação:', error);
        // Mesmo com erro, não travar a tela
        setAssociation(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisassociate = () => {
    Alert.alert(
      'Desassociar',
      `Tem certeza que deseja se desassociar de ${association?.establishment_name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, desassociar',
          style: 'destructive',
          onPress: confirmDisassociate,
        },
      ]
    );
  };

  const confirmDisassociate = async () => {
    try {
      setDisassociating(true);
      await authService.deleteAssociation();
      Alert.alert('Sucesso', 'Você foi desassociado com sucesso.');
      setAssociation(null);
    } catch (error: any) {
      console.error('Erro ao desassociar:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.detail || 'Não foi possível desassociar. Tente novamente.'
      );
    } finally {
      setDisassociating(false);
    }
  };

  const handleGoToMap = () => {
    router.push('/(cliente)/(tabs)');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E95822" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Associação</Text>
        <Text style={styles.headerSubtitle}>
          {association
            ? 'Você está associado a um estabelecimento'
            : 'Você não está associado a nenhum estabelecimento'}
        </Text>
      </View>

      {association ? (
        /* Card de Associação Ativa */
        <View style={styles.associationCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="store" size={32} color="#E95822" />
            </View>
            <View style={styles.statusBadge}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.statusText}>Ativo</Text>
            </View>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.establishmentName}>{association.establishment_name}</Text>
            <View style={styles.ownerRow}>
              <MaterialCommunityIcons name="account-outline" size={16} color="#666" />
              <Text style={styles.ownerName}>{association.owner_name}</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#2196F3" />
            <Text style={styles.infoText}>
              Você pode conversar com este estabelecimento através do chat e fazer pedidos.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => router.push(`/(cliente)/chat/${association.association_id}`)}
            >
              <MaterialCommunityIcons name="chat" size={20} color="#FFF" />
              <Text style={styles.chatButtonText}>Abrir Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.disassociateButton, disassociating && styles.buttonDisabled]}
              onPress={handleDisassociate}
              disabled={disassociating}
            >
              {disassociating ? (
                <ActivityIndicator size="small" color="#F44336" />
              ) : (
                <>
                  <MaterialCommunityIcons name="link-off" size={20} color="#F44336" />
                  <Text style={styles.disassociateButtonText}>Desassociar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Estado vazio - Sem associação */
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <MaterialCommunityIcons name="store-search" size={80} color="#CCC" />
          </View>
          <Text style={styles.emptyTitle}>Nenhuma associação ativa</Text>
          <Text style={styles.emptyText}>
            Para se associar a um estabelecimento, vá até o mapa e toque em uma barraca.
            Você verá um botão "Se associar" no card de detalhes.
          </Text>

          <TouchableOpacity style={styles.mapButton} onPress={handleGoToMap}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#FFF" />
            <Text style={styles.mapButtonText}>Ir para o Mapa</Text>
          </TouchableOpacity>

          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>💡 Dica</Text>
            <Text style={styles.tipsText}>
              • Você só pode estar associado a um estabelecimento por vez{'\n'}
              • A associação permite fazer pedidos e conversar via chat{'\n'}
              • Para trocar de estabelecimento, desassocie-se primeiro
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  associationCard: {
    margin: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  cardContent: {
    marginBottom: 16,
  },
  establishmentName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownerName: {
    fontSize: 15,
    color: '#666',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 18,
  },
  buttonContainer: {
    gap: 12,
  },
  chatButton: {
    backgroundColor: '#E95822',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  disassociateButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#F44336',
  },
  disassociateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  mapButton: {
    backgroundColor: '#E95822',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  mapButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tipsBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
  },
});
