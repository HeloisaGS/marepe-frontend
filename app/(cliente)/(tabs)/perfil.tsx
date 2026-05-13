import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import LogoMaré from '../../../assets/images/logo.png';
import { authService } from '../../../services/authService';
import { profileService } from '../../../services/profileService';

type ClienteResponse = {
  cpf: string;
  telefone: string;
  foto_url: string | null;
};

type ProfileResponse = {
  id: string;
  nome: string;
  role: string;
  cliente?: ClienteResponse | null;
};

export default function Perfil() {
  const [perfil, setPerfil] = useState<ProfileResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

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
      await authService.logout();
      router.replace('/(auth)');
    } catch (error) {
      console.error('Erro no logout:', error);
      Alert.alert('Sessão encerrada');
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

  if (carregando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E95822" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

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
        <TouchableOpacity onPress={() => router.replace('/(cliente)/(tabs)')}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.barraVertical} />
        <Text style={styles.tituloTexto}>Perfil</Text>
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        {/* Avatar do Cliente */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={selecionarFoto}
          disabled={salvando}
        >
          {perfil.cliente?.foto_url ? (
            <Image source={{ uri: perfil.cliente.foto_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="account" size={60} color="#999" />
            </View>
          )}
          <View style={styles.editIconContainer}>
            {salvando ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <MaterialCommunityIcons name="camera" size={18} color="#FFF" />
            )}
          </View>
        </TouchableOpacity>

        <Text style={styles.versao}>Versão 1.0.0</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={28} color="#E95822" />
          <Text style={styles.logoutText}>Finalizar sessão</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF5E6' },

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

  header: { backgroundColor: '#FAD4B0', paddingTop: 40, alignItems: 'center' },
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  avatarContainer: {
    marginTop: 20,
    marginBottom: 20,
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#FAD4B0',
    overflow: 'visible',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E95822',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FDF5E6',
  },
  versao: { fontSize: 14, color: '#999', marginBottom: 15, marginTop: 10 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  logoutText: { fontSize: 22, fontWeight: 'bold', color: '#E95822', marginLeft: 10 },
});