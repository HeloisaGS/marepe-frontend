import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Pressable, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ActivityIndicator, Alert,ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LogoMaré from '../../assets/images/logo.png';
import { authService } from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const { emailDigitado } = useLocalSearchParams();
  const email = Array.isArray(emailDigitado) ? emailDigitado[0] : emailDigitado || '';

  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const senhaValida = senha.trim().length >= 8;
  const validacao = email.trim().length > 0 && senhaValida && !carregando;


  const handleLogin = async () => {
    if (!validacao) return;
    setCarregando(true);

    try {
      const response = await authService.login(email.trim(), senha);
      console.log('Resposta do login:', response.data);

      // --- PARTE NOVA: SALVANDO O TOKEN ---
      // Verificamos onde o token está (pode ser access_token ou a própria data)
      const tokenBruto = response.data?.access_token || response.data?.session?.access_token || response.data;
      
      // Garantimos que o token seja uma STRING para o AsyncStorage não reclamar
      const tokenParaSalvar = typeof tokenBruto === 'string' ? tokenBruto : JSON.stringify(tokenBruto);
      
      await AsyncStorage.setItem('userToken', tokenParaSalvar);
      console.log('✅ Token salvo com sucesso!');
      // ------------------------------------

      // Pega o perfil real do usuário salvo no metadata
      const role =
        response?.data?.user?.user_metadata?.role ||
        response?.data?.session?.user?.user_metadata?.role ||
        '';

      console.log('Role extraído do login:', role);

      // Salvar o role também para verificação futura
      await AsyncStorage.setItem('userRole', role);
      console.log('✅ Role salvo:', role);

      router.push({
        pathname: '/(auth)/sucesso',
        params: { role },
      });

    } catch (error: any) {
      console.log('Erro ao logar:', error.response?.data || error.message);

      const mensagem =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.erro ||
        'Email ou senha inválidos.';
      Alert.alert('Erro', mensagem);
    } finally {
      setCarregando(false);
    }
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}        style={{ flex: 1 }}
      >
        <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>

          {/* logo */}
          <View style={styles.logoContainer}>
            <Image source={LogoMaré} style={styles.logo} resizeMode="contain" />
            <Text style={styles.tituloLogo}>MaréPE</Text>
          </View>
          {/* email */}
          <View style={styles.emailContainer}>
            <TextInput
              style={styles.emailTexto}
              placeholder="usuario_teste@gmail.com"
              value={email}
              editable={false}
            />
            <MaterialCommunityIcons name="check" size={24} color="#333" />
          </View>

          {/* senha */}
          <View style={styles.senhaWrapper}>
            <Text style={styles.labelSenha}>Senha MaréPE</Text>
            <View style={styles.senhaContainer}>
              <TextInput
                style={styles.inputSenha}
                secureTextEntry={!mostrarSenha}
                value={senha}
                onChangeText={setSenha}

              />
              <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
                <MaterialCommunityIcons
                  name={mostrarSenha ? "eye" : "eye-off"}
                  size={24}
                  color="#000"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Termos de Uso */}
          <Text style={styles.textoTermos}>
            Ao continuar, você concorda com as <Text style={styles.linkRoxo}>Condições de Uso</Text>
          </Text>

          {/* btn continuar */}
          <Pressable
            disabled={!validacao}
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.botaoContinuar,
              { backgroundColor: validacao ? '#79FF79' : '#EAEAEA' },
              pressed && validacao && { opacity: 0.7 }
            ]}
          >
            {carregando ? (
              <ActivityIndicator color="#100101" />
            ) : (
              <Text
                style={[
                  styles.textoBotaoContinuar,
                  { color: validacao ? '#100101' : '#999' }
                ]}
              >
                Continuar
              </Text>
            )}
          </Pressable>

          {/* link */}
          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={() =>
              router.push({
                pathname: '/(auth)/recuperacao-senha',
                params: { emailDigitado: email },
              })
            }>
              <Text style={styles.linkAzul}>Esqueci minha senha</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)')}>
              <Text style={styles.linkLaranja}>Alterar e-mail.</Text>
            </TouchableOpacity>
          </View>

        </View>
        </ScrollView>
      </KeyboardAvoidingView >
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 50,
    paddingHorizontal: 25,
    backgroundColor: '#FFFFFF',
    
  },
  scrollContainer: {
    flexGrow: 1, // Permite que o scroll ocupe a tela toda
  },
  innerContainer: {
    flex: 1,
    paddingVertical: 50,
    paddingHorizontal: 25,
    justifyContent: 'center', // Centraliza apenas o conteúdo interno
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 15,
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
  emailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 25,
  },
  emailTexto: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  senhaWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  labelSenha: {
    position: 'absolute',
    top: -10,
    left: 15,
    backgroundColor: '#fff',
    paddingHorizontal: 5,
    zIndex: 1,
    fontSize: 12,
    color: '#221A15'
  },
  senhaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#221A15',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  inputSenha: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 5,
  },
  textoTermos: {
    fontSize: 12,
    color: '#555',
    marginBottom: 30,
    marginLeft: 5,
  },
  linkRoxo: {
    color: '#A866FF',
  },
  botaoContinuar: {
    backgroundColor: '#EAEAEA',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 30,
  },
  textoBotaoContinuar: {
    color: '#999',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  linkAzul: {
    color: '#4A90E2',
    fontSize: 14,
  },
  linkLaranja: {
    color: '#E05A3D',
    fontSize: 14,
  },
});