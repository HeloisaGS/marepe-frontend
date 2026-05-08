import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { MOCK_PERFIL } from '../../../constants/mock'; 
import LogoMaré from '../../../assets/images/logo.png';
import { authService } from '../../../services/authService';

export default function PerfilAmbulante() {
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
          Bem vindo, <Text style={styles.nomeDestaque}>{MOCK_PERFIL.nome}</Text>
        </Text>
      </View>

      {/* Título Perfil */}
      <View style={styles.tituloContainer}>
        <TouchableOpacity onPress={() => router.replace('/(vendedor)/(tabs)')}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.barraVertical} />
        <Text style={styles.tituloTexto}>Perfil</Text>
      </View>

      {/* Conteúdo Ambulante */}
      <View style={styles.content}>
        
        {/* Avatar com fallback */}
        <View style={styles.avatarContainer}>
          {MOCK_PERFIL.foto_url ? (
            <Image source={{ uri: MOCK_PERFIL.foto_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="account" size={80} color="#000" />
            </View>
          )}
        </View>

        {/* Estrelas */}
        <View style={styles.starsRow}>
          {renderStars(4)} 
        </View>

        {/* Nome e Local */}
        <Text style={styles.vendedorNome}>{MOCK_PERFIL.nome}</Text>
        <Text style={styles.vendedorLocal}>{MOCK_PERFIL.local_atual}</Text>

        {/* Botão Alterar Categorias */}
        <TouchableOpacity style={styles.categoriaBtn}>
          <View style={styles.categoriaIconBg}>
             <MaterialCommunityIcons name="folder" size={30} color="#FFF" />
          </View>
          <Text style={styles.categoriaTexto}>Alterar categorias</Text>
        </TouchableOpacity>

        {/* Rodapé */}
        <Text style={styles.versao}>Versão 1.0.0</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="history" size={28} color="#E95822" />
          <Text style={styles.logoutText}>Finalizar sessão</Text>
        </TouchableOpacity>
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
  
  // Estilos novos do Ambulante
  content: { 
    flex: 1,
    alignItems: 'center', 
    paddingBottom: 50,
  },
  avatarContainer: {
    marginTop: 20,
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#FAD4B0',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6E6FA', // Cor lilás do círculo do protótipo
  },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 15,
  },
  vendedorNome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E95822',
    marginTop: 5,
  },
  vendedorLocal: {
    fontSize: 16,
    color: '#E95822',
    marginBottom: 20,
  },
  categoriaBtn: {
    backgroundColor: '#F4B084', // Cor salmão do botão
    width: 120,
    height: 120,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: 20,
  },
  categoriaIconBg: {
    marginBottom: 5,
  },
  categoriaTexto: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  versao: { fontSize: 14, color: '#999', marginTop: 40, marginBottom: 10 },
  logoutButton: { flexDirection: 'row', alignItems: 'center' },
  logoutText: { fontSize: 22, fontWeight: 'bold', color: '#E95822', marginLeft: 10 },
});