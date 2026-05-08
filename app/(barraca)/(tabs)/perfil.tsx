import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { MOCK_PERFIL } from '../../../constants/mock'; 
import LogoMaré from '../../../assets/images/logo.png';
import { authService } from '../../../services/authService';

export default function Perfil() {
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
          Bem vindo, <Text style={styles.nomeDestaque}>{MOCK_PERFIL.nome.split(' ')[0]}</Text>
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
          {MOCK_PERFIL.foto_url ? (
            <Image source={{ uri: MOCK_PERFIL.foto_url }} style={styles.avatar} />
          ) : (
            <MaterialCommunityIcons name="account" size={100} color="#000" />
          )}
        </View>

        {/* Seção: Seus estabelecimentos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seus estabelecimentos</Text>
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardMainText}>{MOCK_PERFIL.nome_barraca}</Text>
              <Text style={styles.cardSubText}>{MOCK_PERFIL.local_atual}</Text>
            </View>
            <View style={styles.starsRow}>
              {renderStars(MOCK_PERFIL.avaliacao)}
            </View>
          </View>
        </View>

        {/* Seção: Usuários associados hoje (DINÂMICO COM MAP) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usuários associados hoje</Text>
          
          {MOCK_PERFIL.associados.map((associado) => (
            <View key={associado.id} style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardMainText}>{associado.nome}</Text>
                <Text style={styles.cardSubText}>{associado.email}</Text>
              </View>
              
              <TouchableOpacity style={styles.actionColumn}>
                <MaterialCommunityIcons 
                  name="map-marker" 
                  size={24} 
                  color={associado.status === "Ativo" ? "red" : "#FAD4B0"} 
                />
                <Text style={styles.actionText}>
                  {associado.status === "Ativo" ? "ver no mapa" : "deixar de ver"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
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
  starsRow: { flexDirection: 'row' },
  actionColumn: { alignItems: 'center', minWidth: 80 },
  actionText: { fontSize: 10, color: '#333', marginTop: 2, textAlign: 'center' },
  footer: { alignItems: 'center', marginTop: 20, paddingBottom: 40 },
  versao: { fontSize: 14, color: '#999', marginBottom: 10 },
  logoutButton: { flexDirection: 'row', alignItems: 'center' },
  logoutText: { fontSize: 22, fontWeight: 'bold', color: '#E95822', marginLeft: 10 },
});