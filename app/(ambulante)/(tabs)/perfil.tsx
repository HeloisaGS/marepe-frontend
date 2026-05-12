import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import LogoMaré from '../../../assets/images/logo.png';
import { authService } from '../../../services/authService';
import { profileService } from '../../../services/profileService'; // ✅ service dedicado

// Espelha exatamente o ProfileResponse do backend
type VendedorResponse = {
  cpf: string;
  telefone: string;
  foto_url: string | null;
  nome_barraca: string | null;
};

type ProfileResponse = {
  id: string;
  nome: string;
  role: string;
  vendedor: VendedorResponse | null;
};

export default function PerfilAmbulante() {
  const [perfil, setPerfil] = useState<ProfileResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function carregarPerfil() {
    try {
      setCarregando(true);
      const response = await profileService.getMeuPerfil(); // ✅ via service
      setPerfil(response.data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setErro('Não foi possível carregar o perfil.');
    } finally {
      setCarregando(false);
    }
  }

  const handleLogout = async () => {
    try {
      if (authService?.logout) await authService.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      router.replace('/(auth)');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <MaterialCommunityIcons
        key={i}
        name={i < rating ? 'star' : 'star-outline'}
        size={24}
        color="#E95822"
      />
    ));
  };

  // Estado de carregamento
  if (carregando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E95822" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  // Estado de erro
  if (erro || !perfil) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#E95822" />
        <Text style={styles.erroText}>{erro ?? 'Erro inesperado.'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={carregarPerfil}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fotoUrl = perfil.vendedor?.foto_url ?? null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>

      {/* Topo bege */}
      <View style={styles.header}>
        <Image source={LogoMaré} style={styles.logo} resizeMode="contain" />
      </View>

      {/* Boas-vindas */}
      <View style={styles.bemVindoContainer}>
        <Text style={styles.bemVindoTexto}>
          Bem vindo, <Text style={styles.nomeDestaque}>{perfil.nome}</Text>
        </Text>
      </View>

      {/* Título + voltar */}
      <View style={styles.tituloContainer}>
        <TouchableOpacity onPress={() => router.replace('/(ambulante)/(tabs)')}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.barraVertical} />
        <Text style={styles.tituloTexto}>Perfil</Text>
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {fotoUrl ? (
            <Image source={{ uri: fotoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="account" size={80} color="#000" />
            </View>
          )}
        </View>

        {/* Estrelas — fixas em 4 até o sistema de avaliações ser implementado */}
        <View style={styles.starsRow}>{renderStars(4)}</View>

        {/* Nome vindo da API */}
        <Text style={styles.vendedorNome}>{perfil.nome}</Text>

        {/* Alterar categorias */}
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

  // Carregamento / erro
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF5E6',
    padding: 24,
  },
  loadingText: { marginTop: 12, fontSize: 14, color: '#999' },
  erroText: { marginTop: 12, fontSize: 15, color: '#333', textAlign: 'center' },
  retryBtn: {
    marginTop: 16,
    backgroundColor: '#E95822',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: '#fff', fontWeight: 'bold' },

  // Layout
  header: {
    backgroundColor: '#FAD4B0',
    paddingTop: 40,
    alignItems: 'center',
  },
  logo: { width: 60, height: 60, marginBottom: 10 },
  bemVindoContainer: { backgroundColor: '#EDE0BB', padding: 20 },
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

  content: { flex: 1, alignItems: 'center', paddingBottom: 50 },
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
    backgroundColor: '#E6E6FA',
  },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starsRow: { flexDirection: 'row', marginTop: 15 },
  vendedorNome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E95822',
    marginTop: 5,
  },
  categoriaBtn: {
    backgroundColor: '#F4B084',
    width: 120,
    height: 120,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: 20,
  },
  categoriaIconBg: { marginBottom: 5 },
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