import { useEffect, useState } from 'react';
import { router, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const segments = useSegments();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const role = await AsyncStorage.getItem('userRole');

      console.log('🔒 ProtectedRoute - Token:', token ? 'Sim' : 'Não');
      console.log('🔒 ProtectedRoute - Role:', role);

      if (!token || !role) {
        console.log('❌ Sem autenticação, redirecionando para login');
        router.replace('/(auth)');
        return;
      }

      if (requiredRole) {
        const roleNormalizado = role.toUpperCase();
        const requiredNormalizado = requiredRole.toUpperCase();

        if (roleNormalizado !== requiredNormalizado) {
          console.log(`❌ Role incorreta. Esperado: ${requiredRole}, Recebido: ${role}`);
          router.replace('/(auth)');
          return;
        }
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
      router.replace('/(auth)');
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#E95822" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
});
