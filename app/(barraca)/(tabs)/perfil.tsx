import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogoMaré from '../../../assets/images/logo.png';
import { authService } from '../../../services/authService';
import api from '../../../services/api';

export default function Perfil() {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [associatedCustomers, setAssociatedCustomers] = useState<any[]>([]);

  useEffect(() => {
    loadProfileData();
    loadAssociatedCustomers();
  }, []);

  const loadProfileData = async () => {
    try {
      // Buscar userId - pode estar em diferentes keys
      let userId = await AsyncStorage.getItem('userId');

      // Fallback: tentar buscar do userToken decodificado
      if (!userId) {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          // Token JWT tem 3 partes separadas por '.'
          try {
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            userId = decoded.sub || decoded.user_id;
          } catch (e) {
            console.log('Não foi possível decodificar token');
          }
        }
      }

      const userName = await AsyncStorage.getItem('userName');

      if (!userId) {
        // Se não tem userId, usa dados de fallback
        console.warn('UserId não encontrado no AsyncStorage');
        setProfileData({
          nome: userName || 'Usuário',
          nome_barraca: 'Minha Barraca',
          foto_url: null,
        });
        setLoading(false);
        return;
      }

      // Buscar dados do vendedor
      const response = await api.get(`/barraca/${userId}`);

      setProfileData({
        nome: userName || response.data.owner_name || 'Usuário',
        nome_barraca: response.data.establishment_name || 'Minha Barraca',
        foto_url: response.data.establishment_photos?.[0] || null,
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      // Dados de fallback
      const userName = await AsyncStorage.getItem('userName');
      setProfileData({
        nome: userName || 'Usuário',
        nome_barraca: 'Minha Barraca',
        foto_url: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAssociatedCustomers = async () => {
    try {
      const response = await authService.getBarracaAssociations();
      setAssociatedCustomers(response.data.customers || []);
    } catch (error) {
      console.error('Erro ao carregar associados:', error);
      setAssociatedCustomers([]);
    }
  };

  const handleLogout = async () => {
    try {
      if (authService?.logout) await authService.logout();
    } catch (error) {
      console.error("Erro no logout:", error);
    } finally {
      router.replace('/(auth)');
    }
  };
  
    // Função para renderizar estrelas baseado na nota
    const renderStars = (rating: number) => {
      let stars = [];
      for (let i = 1; i <= 5; i++) {
        stars.push(
          <MaterialCommunityIcons 
            key={i} 
            name={i <= rating ? "star" : "star-outline"} 
            size={24} 
            color="#E95822" 
          />
        );
      }
      return stars;
    };
  
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#E95822" />
        <Text style={{ marginTop: 10, color: '#666' }}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* Topo Bege */}
      <View style={styles.header}>
        <Image source={LogoMaré} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.bemVindoContainer}>
        <Text style={styles.bemVindoTexto}>
          Bem vindo, <Text style={styles.nomeDestaque}>{profileData?.nome?.split(' ')[0] || 'Usuário'}</Text>
        </Text>
      </View>

      {/* Título Perfil */}
      <View style={styles.tituloContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.barraVertical} />
        <Text style={styles.tituloTexto}>Perfil</Text>
      </View>

      {/* Conteúdo Central */}
      <View style={styles.content}>
        
        {/* Avatar Circular com Fallback */}
        <View style={styles.avatarContainer}>
          {profileData?.foto_url ? (
            <Image source={{ uri: profileData.foto_url }} style={styles.avatar} />
          ) : (
            <MaterialCommunityIcons name="account" size={100} color="#000" />
          )}
        </View>

        {/* Seção: Seu estabelecimento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seu estabelecimento</Text>
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardMainText}>{profileData?.nome_barraca}</Text>
              <Text style={styles.cardSubText}>Barraca fixa</Text>
            </View>
            <MaterialCommunityIcons name="store" size={32} color="#E95822" />
          </View>
        </View>

        {/* Seção: Clientes associados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Clientes associados ({associatedCustomers.length})
          </Text>

          {associatedCustomers.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="account-off-outline" size={40} color="#CCC" />
              <Text style={styles.emptyText}>Nenhum cliente associado</Text>
            </View>
          ) : (
            associatedCustomers.map((customer) => (
              <TouchableOpacity
                key={customer.association_id}
                style={styles.card}
                onPress={() => router.push(`/(barraca)/chat/${customer.association_id}`)}
              >
                <View style={styles.cardInfo}>
                  <Text style={styles.cardMainText}>{customer.nome}</Text>
                  <Text style={styles.cardSubText}>
                    {new Date(customer.horario_associacao).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                <MaterialCommunityIcons name="chat" size={24} color="#E95822" />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Rodapé Logout */}
        <View style={styles.footer}>
          <Text style={styles.versao}>Versão 1.0.0</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="history" size={28} color="#E95822" />
            <Text style={styles.logoutText}>Finalizar sessão</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF5E6' },
  header: {
    backgroundColor: '#FAD4B0',
    paddingTop: 40,
    alignItems: 'center',
  },
  logo: { width: 60, height: 60, marginBottom: 10 },
  bemVindoContainer: { 
    backgroundColor: '#EDE0BB',
    padding: 20,
  },
  bemVindoTexto: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  nomeDestaque: { color: '#E95822' },
  tituloContainer: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  barraVertical: {
    width: 4,
    height: 25,
    backgroundColor: '#8B9A70',
    marginHorizontal: 10,
  },
  tituloTexto: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  content: { flex: 1, paddingHorizontal: 20, alignItems: 'center' },
  avatarContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#E6E6FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E95822',
    marginBottom: 20,
    overflow: 'hidden'
  },
  avatar: { width: '100%', height: '100%' },
  section: { width: '100%', marginBottom: 20 },
  sectionTitle: { color: '#E95822', fontSize: 16, fontWeight: '600', marginBottom: 10 },
  card: {
    backgroundColor: '#F2F2F2',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardInfo: { flex: 1 },
  cardMainText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardSubText: { fontSize: 14, color: '#666' },
  emptyCard: {
    backgroundColor: '#F2F2F2',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  footer: { alignItems: 'center', marginTop: 20, paddingBottom: 40 },
  versao: { fontSize: 14, color: '#999', marginBottom: 10 },
  logoutButton: { flexDirection: 'row', alignItems: 'center' },
  logoutText: { fontSize: 22, fontWeight: 'bold', color: '#E95822', marginLeft: 10 },
});