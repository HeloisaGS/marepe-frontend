import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';

export default function Index() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Pequeno delay para garantir que o AsyncStorage está pronto
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const role = await AsyncStorage.getItem('userRole');

      console.log('🔍 Verificando autenticação...');
      console.log('Token:', token ? `Existe (${token.substring(0, 20)}...)` : 'Não existe');
      console.log('Role:', role);

      if (!token || !role) {
        console.log('❌ Sem credenciais, indo para tela inicial');
        router.replace('/(auth)'); // Vai para (auth)/index.tsx - tela de email
        return;
      }

      // Se tem token, redireciona para a tela do perfil
      const roleNormalizado = role.toUpperCase();

      switch (roleNormalizado) {
        case 'CLIENTE':
          console.log('✅ Redirecionando para cliente');
          router.replace('/(cliente)/(tabs)');
          break;
        case 'AMBULANTE':
          console.log('✅ Redirecionando para ambulante');
          router.replace('/(ambulante)/(tabs)');
          break;
        case 'BARRAQUEIRO':
          console.log('✅ Redirecionando para barraqueiro');
          router.replace('/(barraca)/(tabs)');
          break;
        default:
          console.log('⚠️ Role não reconhecido:', role, '- indo para auth');
          // Limpar credenciais inválidas
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userRole');
          router.replace('/(auth)');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar auth:', error);
      router.replace('/(auth)');
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#E95822" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});
