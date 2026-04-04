import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Pressable, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams} from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LogoMaré from '../../../assets/images/logo.png';
import { authService } from '../../../services/authService';


export default function RecuperacaoSenha() {
  const { emailDigitado } = useLocalSearchParams();
  const emailInicial = Array.isArray(emailDigitado) ? emailDigitado[0] : emailDigitado || '';

  const [email, setEmail] = useState(emailInicial);
  const [carregando, setCarregando] = useState(false);

  const validarEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const emailValido = validarEmail(email);
 

  // Função para chamar a API
  const handleEnviarCodigo = async () => {
    
    if (!emailValido || carregando) return;

    setCarregando(true);
    

    try {
      
      const response = await authService.forgotPassword(email.trim());

      console.log("Resposta recuperação:", response.data);

      // se ok, vai p verficiar token
      router.push({
        pathname: '/(auth)/verificar-token',
        params: {
          origem: 'recuperacao',
          emailDigitado: email.trim()
        }
      });

    } catch (error: any) {
      console.log("Erro na recuperação:", error.response?.data || error.message);

      //  erro 
      const msgErro = error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.erro ||
        'Não foi possível enviar o código. Verifique se o e-mail está correto e tente novamente.';
      Alert.alert("Atenção", msgErro);

    } finally {
      setCarregando(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          {/* logo */}
          <View style={styles.logoContainer}>
            <Image source={LogoMaré} style={styles.logo} resizeMode="contain" />
            <Text style={styles.tituloLogo}>MaréPE</Text>
          </View>
          {/* email */}
          <View style={styles.emailContainer}>
            <TextInput
              style={styles.emailTexto}
              placeholder="usuario_teste@gmail.co"
              value={email}
              onChangeText={setEmail}
            />
            <MaterialCommunityIcons name="check" size={24} color="#333" />
          </View>
          {/* btn  */}
          <Pressable
            disabled={!emailValido}
            onPress={handleEnviarCodigo}
            style={({ pressed }) => [
              styles.botaoEnviar,
              { backgroundColor: emailValido ? '#79FF79' : '#EAEAEA' },
              pressed && emailValido && { opacity: 0.7 }
            ]}
          >
            <Text style={[styles.textoBotaoContinuar, { color: emailValido ? '#100101' : '#999' }]}>
              Enviar Código de Recuperação
            </Text>
          </Pressable>


        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    backgroundColor: '#FFFFFF',    
    paddingTop: 70,
  },
  header: {
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 250,
    height: 180,

  },
  tituloLogo: {
    fontSize: 38,
    fontWeight: 'bold',
    marginTop: 10,
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
  botaoEnviar: {
    backgroundColor: '#79FF79',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 30,
  },
  textoBotaoContinuar: {
    color: '#100101',
    fontSize: 16,
    fontWeight: 'bold',
  },


});