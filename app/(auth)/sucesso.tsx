import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Sucesso() {
  const { role } = useLocalSearchParams();
  const perfil = Array.isArray(role) ? role[0] : role || '';

  const [mensagem, setMensagem] = useState('Preparando o aplicativo...');
  const [processando, setProcessando] = useState(true);

  const modalAbertoRef = useRef(false);
  const redirecionouRef = useRef(false);

  useEffect(() => {
    console.log('Role recebido pela rota:', role);
    console.log('Perfil tratado:', perfil);

    const salvarPermissao = async () => {
      await AsyncStorage.setItem('gps_permitido', 'true');
      console.log('Permissão salva: true');
    };

    const apagarPermissao = async () => {
      await AsyncStorage.removeItem('gps_permitido');
      console.log('Permissão removida');
    };

    const irParaBloqueio = async (motivo = 'negada') => {
      if (redirecionouRef.current) return;

      redirecionouRef.current = true;

      // NÃO salva false
      await apagarPermissao();

      router.replace({
        pathname: '/(auth)/bloqueio-localizacao',
        params: {
          role: perfil,
          motivo,
        },
      });
    };

    const liberarFluxo = async (roleRecebido: string) => {
      if (redirecionouRef.current) return;

      redirecionouRef.current = true;

      const roleNormalizado = roleRecebido.toUpperCase();

      console.log('[REDIRECT] Tentando redirecionar para role:', roleNormalizado);

      try {
        if (roleNormalizado === 'CLIENTE') {
          console.log('[REDIRECT] -> Cliente index');
          router.replace('/(cliente)/(tabs)');
          return;
        }

        if (roleNormalizado === 'AMBULANTE') {
          console.log('[REDIRECT] -> Ambulante index');
          router.replace('/(ambulante)/(tabs)');
          return;
        }

        if (roleNormalizado === 'BARRAQUEIRO') {
          console.log('[REDIRECT] -> Barraqueiro index');
          router.replace('/(barraca)/(tabs)');
          return;
        }

        console.log('[REDIRECT] -> Auth (fallback)');
        router.replace('/(auth)');
      } catch (error) {
        console.error('[REDIRECT ERROR]', error);
        Alert.alert('Erro', 'Não foi possível redirecionar. Tente novamente.');
        router.replace('/(auth)');
      }
    };

    const backSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (modalAbertoRef.current) {
          irParaBloqueio('negada');
          return true;
        }

        return false;
      }
    );

    const pedirPermissao = async () => {
      try {
        setMensagem('Verificando permissão de localização...');

        const permissaoAtual = await Location.getForegroundPermissionsAsync();
        console.log('Permissão atual:', permissaoAtual);

        const permissaoSalva = await AsyncStorage.getItem('gps_permitido');

        if (
          permissaoSalva === 'true' &&
          permissaoAtual.status === 'granted'
        ) {
          setProcessando(false);
          setMensagem('Permissão já concedida. Entrando...');
          await liberarFluxo(perfil);
          return;
        }

        if (permissaoAtual.status !== 'granted') {
          await apagarPermissao();
        }

        setMensagem('Solicitando permissão de localização...');
        modalAbertoRef.current = true;

        const resposta = await Location.requestForegroundPermissionsAsync();

        modalAbertoRef.current = false;
        setProcessando(false);

        console.log('Resposta da permissão:', resposta);

        if (resposta.status === 'granted') {
          await salvarPermissao();

          setMensagem('Permissão concedida. Entrando...');
          await liberarFluxo(perfil);
          return;
        }

        if (resposta.status === 'denied' && resposta.canAskAgain === false) {
          await irParaBloqueio('configuracoes');
          return;
        }

        await irParaBloqueio('negada');
      } catch (error) {
        console.log('Erro ao pedir localização:', error);

        modalAbertoRef.current = false;
        setProcessando(false);

        await irParaBloqueio('erro');
      }
    };

    pedirPermissao();

    return () => {
      backSubscription.remove();
    };
  }, [perfil, role]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#000" />

      <Text style={styles.titulo}>MaréPE</Text>

      <Text style={styles.texto}>{mensagem}</Text>

      {processando && (
        <Text style={styles.subtexto}>
          Aguarde enquanto verificamos sua permissão de localização.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
  },
  texto: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtexto: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});