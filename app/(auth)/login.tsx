import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LogoMaré from '../../assets/images/logo.png'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);


  return (
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
        <View style={styles.emailContainer}>
          <TextInput 
            style={styles.emailTexto} 
            placeholder="usuario_teste@gmail.co" 
            value={email}
            onChangeText={setEmail}
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
          style={({ pressed }) => [
            styles.botaoContinuar,
            pressed && { backgroundColor: '#4CAF50' }
          ]}
        >
          <Text style={styles.textoBotaoContinuar}>Continuar</Text>
        </Pressable>

        {/* link */}
        <View style={styles.linksContainer}>
          <TouchableOpacity>
            <Text style={styles.linkAzul}>Esqueci minha senha</Text>
          </TouchableOpacity>
          
          <TouchableOpacity>
            <Text style={styles.linkLaranja}>Alterar e-mail.</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
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