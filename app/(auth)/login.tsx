import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LogoMaré from '../../assets/images/logo.png';
import { authService } from '../../services/authService';

export default function DefinirSenha() {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const { emailDigitado, token } = useLocalSearchParams();

  const senhaValida = senha.trim().length >= 8;
  const senhasIguais = senha === confirmarSenha;
  const senhasConferem = senhaValida && senhasIguais;

  const handleRedefinirSenha = async () => {
    if (!senhasConferem) {
      Alert.alert('Erro', 'As senhas não conferem ou são muito curtas.');
      return;
    }

    const email = Array.isArray(emailDigitado) ? emailDigitado[0] : emailDigitado;
    const userToken = Array.isArray(token) ? token[0] : token;

    if (!email || !userToken) {
      Alert.alert('Erro', 'Dados inválidos para redefinição de senha.');
      return;
    }

    setCarregando(true);

    try {
      const response = await authService.resetPassword(email, userToken, senha);

      console.log('Senha redefinida:', response.data);

      router.replace('/(auth)/sucesso');
    } catch (error: any) {
      console.log('Erro ao redefinir:', error.response?.data || error.message);

      Alert.alert(
        'Erro',
        error?.response?.data?.message || 'Não foi possível redefinir a senha.'
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.logoContainer}>
            <Image source={LogoMaré} style={styles.logo} resizeMode="contain" />
            <Text style={styles.tituloLogo}>MaréPE</Text>
          </View>

          <View style={styles.senhaWrapper}>
            <Text style={styles.labelSenha}>Nova Senha</Text>
            <View style={styles.senhaContainer}>
              <TextInput
                style={styles.inputSenha}
                secureTextEntry={!mostrarSenha}
                value={senha}
                onChangeText={setSenha}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
                <MaterialCommunityIcons
                  name={mostrarSenha ? 'eye' : 'eye-off'}
                  size={24}
                  color="#000"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.senhaWrapper}>
            <Text style={styles.labelSenha}>Confirmar Nova Senha</Text>
            <View style={styles.senhaContainer}>
              <TextInput
                style={styles.inputSenha}
                secureTextEntry={!mostrarConfirmarSenha}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}>
                <MaterialCommunityIcons
                  name={mostrarConfirmarSenha ? 'eye' : 'eye-off'}
                  size={24}
                  color="#000"
                />
              </TouchableOpacity>
            </View>
          </View>

          <Pressable
            disabled={!senhasConferem || carregando}
            onPress={handleRedefinirSenha}
            style={({ pressed }) => [
              styles.botaoContinuar,
              {
                backgroundColor: senhasConferem && !carregando ? '#79FF79' : '#EAEAEA'
              },
              pressed && senhasConferem && !carregando && { opacity: 0.7 }
            ]}
          >
            {carregando ? (
              <ActivityIndicator color="#100101" />
            ) : (
              <Text
                style={[
                  styles.textoBotaoContinuar,
                  { color: senhasConferem ? '#100101' : '#999' }
                ]}
              >
                Continuar
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 50,
    paddingHorizontal: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center'
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 15
  },
  logo: {
    width: 250,
    height: 180
  },
  tituloLogo: {
    fontSize: 38,
    fontWeight: 'bold',
    marginTop: 1,
    color: '#000000'
  },
  senhaWrapper: {
    position: 'relative',
    marginBottom: 25
  },
  labelSenha: {
    position: 'absolute',
    top: -10,
    left: 15,
    backgroundColor: '#fff',
    paddingHorizontal: 5,
    zIndex: 1,
    fontSize: 12,
    color: '#8D4F28'
  },
  senhaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8D4F28',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10
  },
  inputSenha: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 5
  },
  botaoContinuar: {
    backgroundColor: '#EAEAEA',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 30
  },
  textoBotaoContinuar: {
    color: '#999',
    fontSize: 16,
    fontWeight: 'bold'
  }
});