import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Pressable, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LogoMaré from '../../../assets/images/logo.png';

export default function DefinirSenha() {
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={28} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.container}>
            {/* logo */}
            <View style={styles.logoContainer}>
              <Image source={LogoMaré} style={styles.logo} resizeMode="contain" />
              <Text style={styles.tituloLogo}>MaréPE</Text>
            </View>

            {/* senha */}
            <View style={styles.senhaWrapper}>
              <Text style={styles.labelSenha}>Nova Senha</Text>
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
            {/*  confirmar senha */}
            <View style={styles.senhaWrapper}>
              <Text style={styles.labelSenha}>Confirmar Nova Senha</Text>
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

            {/* btn continuar */}
            <Pressable
              style={({ pressed }) => [
                styles.botaoContinuar,
                pressed && { backgroundColor: '#79FF79' }
              ]}
            >
              <Text style={styles.textoBotaoContinuar}>Continuar</Text>
            </Pressable>


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
    justifyContent: "center"
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
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
  senhaWrapper: {
    position: 'relative',
    marginBottom: 25,
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
    paddingVertical: 10,

  },
  inputSenha: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 5,
  },
  botaoContinuar: {
    backgroundColor: '#EAEAEA',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 30,
  },
  textoBotaoContinuar: {
    color: '#999',
    fontSize: 16,
    fontWeight: 'bold',
  },
});