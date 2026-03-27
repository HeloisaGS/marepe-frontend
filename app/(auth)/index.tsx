import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Pressable, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LogoMaré from '../../assets/images/logo.png';
export default function TelaInicial() {
  const [email, setEmail] = useState('');
  const validarEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };
  const emailValido = validarEmail(email);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>

          {/* logo */}
          <View style={styles.logoContainer}>
            <Image source={LogoMaré} style={styles.logo} resizeMode="contain" />
            <Text style={styles.tituloLogo}>MaréPE</Text>
          </View>
          {/* email */}
          <View style={styles.emailWrapper}>
            <Text style={styles.labelEmail}>Digite um Email</Text>

            <View style={styles.emailContainer}>
              <TextInput
                style={styles.emailTexto}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {email.length > 0 && (
                <MaterialCommunityIcons
                  name={emailValido ? "check" : "close"}
                  size={20}
                  color={emailValido ? "green" : "#333"}
                />
              )}


            </View>
          </View>
          {/* Termos de Uso */}
          <Text style={styles.textoTermos}>
            Ao continuar, você concorda com as <Text style={styles.linkRoxo}>Condições de Uso</Text>
          </Text>
          {/* btn continuar */}
          <Pressable
            style={({ pressed }) => [
              styles.botaoContinuar,
              { backgroundColor: emailValido ? '#79FF79' : '#EAEAEA' }
            ]}
            disabled={!emailValido}
          >
            <Text style={styles.textoBotaoContinuar}>Continuar</Text>
          </Pressable>
          {/* link */}
          <View style={styles.linksContainer}>
            <TouchableOpacity>
              <Text style={styles.linkAzul}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: 'center',
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
    borderColor: '#49454F',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 10,
  },
  emailTexto: {
    flex: 1,
    fontSize: 16,
    color: '#49454F',
  },
  emailWrapper: {
    position: 'relative',
    marginBottom: 5,
  },

  labelEmail: {
    position: 'absolute',
    top: -10,
    left: 15,
    backgroundColor: '#fff',
    paddingHorizontal: 5,
    zIndex: 1,
    fontSize: 12,
    color: '#221A15',
  },
  textoTermos: {
    fontSize: 12,
    color: '#555',
    marginBottom: 30,
    marginLeft: 5,
  },
  linkRoxo: {
    color: '#A369F9',
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
    color: '#100101',
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
    color: '#4E8CFF',
    fontSize: 14,
  },
});