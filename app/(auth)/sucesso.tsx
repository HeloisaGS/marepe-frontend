import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

//tela de permissao
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
    const salvarPermissao = async (permitido: boolean) => {
      try {
        await AsyncStorage.setItem('gps_permitido', JSON.stringify(permitido));
        console.log('Permissão salva:', permitido);
      } catch (error) {
        console.log('Erro ao salvar permissão:', error);
      }
    };
    // Bloqueia 
    const irParaBloqueio = async () => {
      if (redirecionouRef.current) return;
      redirecionouRef.current = true;
      await salvarPermissao(false);

      router.replace('/(auth)/bloqueio-localizacao');
    };

    const liberarFluxo = async (roleRecebido: string) => {
      if (redirecionouRef.current) return;
      redirecionouRef.current = true;
      await salvarPermissao(true);

      const roleNormalizado = roleRecebido.toUpperCase();
      // Mudança nas rotas
      if (roleNormalizado === 'CLIENTE') {
        router.replace('/(cliente)/(tabs)');
        return;
      }
      if (roleNormalizado === 'AMBULANTE'){
        router.replace('/(ambulante)/(tabs)');
        return;
      }
      if (roleNormalizado === 'BARRAQUEIRO'){
        router.replace('/(barraca)/(tabs)');
        return;
      }
      // fallback TROCAR
      router.replace('/(auth)');
    };
    // botao voltar
    const backSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (modalAbertoRef.current) {
          irParaBloqueio();
          return true;
        }
        return false;
      }
    );

    const pedirPermissao = async () => {
      try {
        setMensagem('Verificando permissão de localização...');

        const permissaoAtual = await Location.getForegroundPermissionsAsync();

        if (permissaoAtual.status === 'granted') {
          setProcessando(false);
          setMensagem('Permissão já concedida. Entrando...');
          await liberarFluxo(perfil);
          return;
        }

        if (permissaoAtual.canAskAgain === false) {
          setProcessando(false);
          setMensagem('Permissão negada anteriormente.');
          await irParaBloqueio();
          return;
        }

        setMensagem('Solicitando permissão de localização...');
        modalAbertoRef.current = true;

        const { status } = await Location.requestForegroundPermissionsAsync();

        modalAbertoRef.current = false;
        setProcessando(false);

        if (status === 'granted') {
          setMensagem('Permissão concedida. Entrando...');
          await liberarFluxo(perfil);
          return;
        }

        await irParaBloqueio();
      } catch (error) {
        console.log('Erro ao pedir localização:', error);
        modalAbertoRef.current = false;
        setProcessando(false);
        await irParaBloqueio();
      }
    };

    pedirPermissao();

    return () => {
      backSubscription.remove();
    };
  }, [perfil]);

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