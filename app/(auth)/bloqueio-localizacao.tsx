import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  BackHandler,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import LogoMaré from '../../assets/images/logo.png';

export default function BloqueioLocalizacao() {
  const { role, motivo } = useLocalSearchParams();

  const perfil = Array.isArray(role) ? role[0] : role || '';
  const motivoTratado = Array.isArray(motivo) ? motivo[0] : motivo || '';

  useEffect(() => {
    const backSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true
    );

    return () => {
      backSubscription.remove();
    };
  }, []);

  const tentarNovamente = () => {
    router.replace({
      pathname: '/(auth)/sucesso',
      params: { role: perfil },
    });
  };

  const abrirConfiguracoes = () => {
    Linking.openSettings();
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={LogoMaré} style={styles.logo} resizeMode="contain" />
        <Text style={styles.tituloLogo}>MaréPE</Text>
      </View>

      <View style={styles.cardErro}>
        <Text style={styles.titulo}>Erro de localização</Text>

        <Text style={styles.mensagem}>
          O MaréPE precisa acessar sua localização para funcionar.
        </Text>

        <Text style={styles.info}>
          {motivoTratado === 'configuracoes'
            ? 'Vá em Configurações e permita o acesso à localização.'
            : 'Permissão negada. Toque em tentar novamente para solicitar a localização outra vez.'}
        </Text>
      </View>

      {motivoTratado === 'configuracoes' ? (
        <TouchableOpacity style={styles.botao} onPress={abrirConfiguracoes}>
          <Text style={styles.textoBotao}>Abrir configurações</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.botao} onPress={tentarNovamente}>
          <Text style={styles.textoBotao}>Tentar novamente</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 50,
    paddingHorizontal: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 35,
  },
  logo: {
    width: 250,
    height: 180,
  },
  tituloLogo: {
    fontSize: 38,
    fontWeight: 'bold',
    marginTop: 1,
    color: '#000000',
  },
  cardErro: {
    borderWidth: 1,
    borderColor: '#49454F',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#221A15',
    textAlign: 'center',
    marginBottom: 18,
  },
  mensagem: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 14,
  },
  info: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
  },
  botao: {
    backgroundColor: '#221A15',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignSelf: 'center',
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});