import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  BackHandler,
  Platform,
} from 'react-native';
import LogoMaré from '../../assets/images/logo.png';

export default function BloqueioLocalizacao() {
  useEffect(() => {
    const backSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true
    );

    const timer = setTimeout(() => {
      if (Platform.OS === 'android') {
        BackHandler.exitApp();
      }
    }, 4000);

    return () => {
      backSubscription.remove();
      clearTimeout(timer);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={LogoMaré} style={styles.logo} resizeMode="contain" />
        <Text style={styles.tituloLogo}>MaréPE</Text>
      </View>

      <View style={styles.cardErro}>
        <Text style={styles.titulo}>Erro de localização</Text>

        <Text style={styles.mensagem}>
          O MaréPE precisa acessar sua localização para funcionar. Acesso negado.
        </Text>

        <Text style={styles.info}>
          Feche o aplicativo e permita a localização para continuar.
        </Text>
      </View>

      <View style={styles.botaoFake}>
        <Text style={styles.textoBotao}>Encerrando...</Text>
      </View>
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
  botaoFake: {
    backgroundColor: '#EAEAEA',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignSelf: 'center',
  },
  textoBotao: {
    color: '#999',
    fontSize: 16,
    fontWeight: 'bold',
  },
});