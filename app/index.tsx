import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export default function Index() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const role = await AsyncStorage.getItem('userRole');

      console.log('🔍 Verificando autenticação...');
      console.log('Token:', token ? 'Existe' : 'Não existe');
      console.log('Role:', role);

      if (!token) {
        console.log('❌ Sem token, indo para auth');
        router.replace('/(auth)');
        return;
      }

      // Se tem token, redireciona para a tela do perfil
      const roleNormalizado = role?.toUpperCase() || '';

      if (roleNormalizado === 'CLIENTE') {
        console.log('✅ Redirecionando para cliente');
        router.replace('/(cliente)/(tabs)');
      } else if (roleNormalizado === 'AMBULANTE') {
        console.log('✅ Redirecionando para ambulante');
        router.replace('/(ambulante)/(tabs)');
      } else if (roleNormalizado === 'BARRAQUEIRO') {
        console.log('✅ Redirecionando para barraqueiro');
        router.replace('/(barraca)/(tabs)');
      } else {
        console.log('⚠️ Role não reconhecido, indo para auth');
        router.replace('/(auth)');
      }
    } catch (error) {
      console.error('Erro ao verificar auth:', error);
      router.replace('/(auth)');
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#E95822" />
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
});
