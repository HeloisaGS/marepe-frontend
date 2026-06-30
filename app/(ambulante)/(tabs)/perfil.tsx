import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import LogoMaré from '../../../assets/images/logo.png';
import { authService } from '../../../services/authService';
import { profileService } from '../../../services/profileService'; // ✅ service dedicado

// Espelha exatamente o ProfileResponse do backend
type VendedorResponse = {
  cpf: string;
  telefone: string;
  foto_url: string | null;
  nome_barraca: string | null;
  alcance_km: number | null;
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
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [modalAlcance, setModalAlcance] = useState(false);
  const [alcanceInput, setAlcanceInput] = useState('2');

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function carregarPerfil() {
    try {
      setCarregando(true);
      setErro(null);
      const response = await profileService.getMeuPerfil();

      if (response && response.data) {
        setPerfil(response.data);
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);

      let mensagemErro = 'Não foi possível carregar o perfil.';

      if (error.response) {
        // Erro de resposta do servidor
        mensagemErro = `Erro ${error.response.status}: ${error.response.data?.message || 'Erro no servidor'}`;
      } else if (error.request) {
        // Sem resposta do servidor
        mensagemErro = 'Sem resposta do servidor. Verifique sua conexão.';
      } else if (error.message) {
        mensagemErro = error.message;
      }

      setErro(mensagemErro);
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

  const selecionarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de acesso às suas fotos para continuar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadFoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Erro ao selecionar foto:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a foto');
    }
  };

  const uploadFoto = async (foto: any) => {
    try {
      setSalvando(true);

      const fotoData = {
        uri: foto.uri,
        type: foto.type || 'image/jpeg',
        name: foto.fileName || 'profile.jpg',
      };

      await profileService.atualizarPerfil({ foto: fotoData });

      Alert.alert('Sucesso', 'Foto atualizada com sucesso!');

      // Recarregar perfil
      await carregarPerfil();
    } catch (error: any) {
      console.error('Erro ao fazer upload da foto:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a foto');
    } finally {
      setSalvando(false);
    }
  };

  const salvarAlcance = async () => {
    const km = parseInt(alcanceInput, 10);
    if (isNaN(km) || km < 1 || km > 50) {
      Alert.alert('Valor inválido', 'Digite um valor entre 1 e 50 km.');
      return;
    }
    try {
      setSalvando(true);
      await profileService.atualizarPerfil({ alcance_km: km });
      await carregarPerfil();
      setModalAlcance(false);
      Alert.alert('Sucesso', `Raio de atendimento atualizado para ${km} km.`);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível atualizar o alcance.');
    } finally {
      setSalvando(false);
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

  console.log("📸 URL da foto do perfil:", fotoUrl);
  console.log("📋 Dados do perfil completo:", perfil);

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
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={selecionarFoto}
          disabled={salvando}
        >
          {fotoUrl ? (
            <Image source={{ uri: fotoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="account" size={80} color="#000" />
            </View>
          )}
          <View style={styles.editIconContainer}>
            {salvando ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <MaterialCommunityIcons name="camera" size={20} color="#FFF" />
            )}
          </View>
        </TouchableOpacity>

        {/* Estrelas — fixas em 4 até o sistema de avaliações ser implementado */}
        <View style={styles.starsRow}>{renderStars(4)}</View>

        {/* Nome vindo da API */}
        <Text style={styles.vendedorNome}>{perfil.nome}</Text>

        {/* Raio de atendimento */}
        <Text style={styles.alcanceLabel}>
          Raio de atendimento: {perfil.vendedor?.alcance_km ?? 2} km
        </Text>
        <TouchableOpacity
          style={styles.categoriaBtn}
          onPress={() => {
            setAlcanceInput(String(perfil.vendedor?.alcance_km ?? 2));
            setModalAlcance(true);
          }}
        >
          <View style={styles.categoriaIconBg}>
            <MaterialCommunityIcons name="map-marker-radius" size={30} color="#FFF" />
          </View>
          <Text style={styles.categoriaTexto}>Alterar alcance</Text>
        </TouchableOpacity>

        {/* Alterar categorias */}
        <TouchableOpacity
          style={styles.categoriaBtn}
          onPress={() => router.push('/(ambulante)/(tabs)/vitrine')}
        >
          <View style={styles.categoriaIconBg}>
            <MaterialCommunityIcons name="folder" size={30} color="#FFF" />
          </View>
          <Text style={styles.categoriaTexto}>Alterar categorias</Text>
        </TouchableOpacity>

        {/* Modal de alcance */}
        <Modal visible={modalAlcance} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialCommunityIcons name="map-marker-radius" size={48} color="#E95822" />
              <Text style={styles.modalTitle}>Raio de Atendimento</Text>
              <Text style={styles.modalSubtitle}>
                Defina a distância máxima (em km) que você pode atender os clientes.
              </Text>
              <TextInput
                style={styles.alcanceInput}
                keyboardType="numeric"
                value={alcanceInput}
                onChangeText={setAlcanceInput}
                placeholder="2"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButtonNo}
                  onPress={() => setModalAlcance(false)}
                >
                  <Text style={styles.modalButtonTextNo}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButtonYes}
                  onPress={salvarAlcance}
                >
                  <Text style={styles.modalButtonTextYes}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
    overflow: 'visible',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6E6FA',
    position: 'relative',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E95822',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FDF5E6',
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  avatarPlaceholder: {
    width: 130,
    height: 130,
    borderRadius: 65,
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
  alcanceLabel: { fontSize: 16, color: '#333', marginTop: 20, marginBottom: 10 },
  alcanceInput: {
    width: '100%', borderWidth: 1, borderColor: '#DDD', borderRadius: 10,
    padding: 15, fontSize: 18, textAlign: 'center', marginVertical: 15,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#FFF', padding: 25, borderRadius: 16, alignItems: 'center', elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginVertical: 15, textAlign: 'center' },
  modalSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 10 },
  modalButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 10 },
  modalButtonNo: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 12, borderRadius: 8, marginRight: 8, alignItems: 'center' },
  modalButtonYes: { flex: 1, backgroundColor: '#E95822', paddingVertical: 12, borderRadius: 8, marginLeft: 8, alignItems: 'center' },
  modalButtonTextNo: { color: '#4B5563', fontWeight: 'bold', fontSize: 16 },
  modalButtonTextYes: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});