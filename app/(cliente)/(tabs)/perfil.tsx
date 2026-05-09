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
      await authService.logout();
      router.replace('/(auth)');
    } catch (error) {
      console.error("Erro no logout:", error);
      Alert.alert("Sessão encerrada");
      router.replace('/(auth)');
    }
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
        <TouchableOpacity onPress={() => router.replace('/(cliente)/(tabs)')}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.barraVertical} />
        <Text style={styles.tituloTexto}>Perfil</Text>
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>        
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
  container: { 
    flex: 1, backgroundColor: '#FDF5E6' 
  },
  header: {
    backgroundColor: '#FAD4B0',
    paddingTop: 40,
    alignItems: 'center',
    
  },

  logo: { 
    width: 60, 
    height: 60, 
    marginBottom: 10 
  },

  bemVindoContainer: { 
    backgroundColor: '#EDE0BB',
    padding: 20,
  },
  bemVindoTexto: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  nomeDestaque: { 
    color: '#E95822' 
  },
  tituloContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20
  },
  barraVertical: {
    width: 4,
    height: 25,
    backgroundColor: '#8B9A70',
    marginHorizontal: 10,
  },
  tituloTexto: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  content: { 
    flex: 1,
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingBottom: 50,
  },
  versao: { 
    fontSize: 14, 
    color: '#999', 
    marginBottom: 15 
  },
  logoutButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 20 
  },
  logoutText: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#E95822', 
    marginLeft: 10 
  },
});