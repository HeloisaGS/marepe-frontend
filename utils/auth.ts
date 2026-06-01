import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

/**
 * Limpa as credenciais do usuário e redireciona para login
 */
export async function logout() {
  try {
    console.log('🚪 Fazendo logout...');
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userRole');
    await AsyncStorage.removeItem('gps_permitido');
    console.log('✅ Credenciais limpas');

    // Redirecionar para login
    router.replace('/(auth)');
  } catch (error) {
    console.error('❌ Erro ao fazer logout:', error);
  }
}

/**
 * Verifica se o usuário está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const role = await AsyncStorage.getItem('userRole');
    return !!(token && role);
  } catch (error) {
    console.error('❌ Erro ao verificar autenticação:', error);
    return false;
  }
}

/**
 * Obtém o token do usuário
 */
export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('❌ Erro ao obter token:', error);
    return null;
  }
}

/**
 * Obtém a role do usuário
 */
export async function getRole(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('userRole');
  } catch (error) {
    console.error('❌ Erro ao obter role:', error);
    return null;
  }
}
