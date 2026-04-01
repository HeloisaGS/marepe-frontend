import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../../../services/authService';


export default function CadastroCliente() {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmarSenha, setVerConfirmarSenha] = useState(false);
  const [exibirOpcoesEmail, setExibirOpcoesEmail] = useState(false);
  const [carregando, setCarregando] = useState(false);
  
  // E-mail mockado 
  const { emailDigitado, role } = useLocalSearchParams()
  const emailExibicao = Array.isArray(emailDigitado) ? emailDigitado[0] : (emailDigitado);
  const emailFixo = "exemplo@email.com";

  const senhaCurta = senha.length > 0 && senha.length < 8;
  const senhasDiferentes = confirmarSenha.length > 0 && senha !== confirmarSenha;
  const nomeCurto = nome.trim().length > 0 && nome.trim().length <= 3;

  // Lógica de validação simplificada
  const formularioValido =
    nome.trim().length > 3 &&
    senha.length >= 8 &&
    !senhasDiferentes &&
    aceitouTermos;

  // Registro no banco
  const handleRegistro = async () => {
  setCarregando(true);
  console.log("PAYLOAD QUE SERÁ ENVIADO:", {
    nome: nome,
    email: emailExibicao,
    password: senha,
    role: role || 'CLIENTE'
  });
  try {
    // Montamos o objeto exatamente como a API espera
    const payload = {
      nome: nome,
      email: emailExibicao,
      password: senha,
      role: role || 'cliente' // 'role' veio do useLocalSearchParams
    };

    // Chamada para a função que você acabou de criar
    const response = await authService.register(payload);
    if (response.status === 201 || response.status === 200) {
      router.push({
        pathname: '/(auth)/verificar-token',
        params: { email: emailExibicao, origem: 'cadastro' } 
      });
    }
  } catch (error:any) {
    const mensagem = error.response?.data?.message || "Erro de conexão";
    Alert.alert("Erro", mensagem);
    console.log("ERRO AO REGISTRAR:", error.response?.data || error.message);
  } finally {
    setCarregando(false);
  }
};

  return (
    <ScrollView 
      contentContainerStyle={styles.container} 
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>Registro</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={{ zIndex: 10 }}> 
        <TouchableOpacity 
          style={styles.inputContainerFixo} 
          onPress={() => setExibirOpcoesEmail(!exibirOpcoesEmail)}
          activeOpacity={0.8}
        >
          <TextInput
            style={styles.inputFixo}
            value={emailExibicao}
            editable={false}
            pointerEvents="none"
          />
          <MaterialCommunityIcons 
            name={exibirOpcoesEmail ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#C6C6C6" 
          />
        </TouchableOpacity>

        {/* A Lista "Dropdown" */}
        {exibirOpcoesEmail && (
          <View style={styles.dropdownEmail}>
            <TouchableOpacity 
              style={styles.opcaoDropdown} 
              onPress={() => router.push('/(auth)')}
            >
              <Text style={styles.textoOpcao}>Trocar o e-mail</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.opcaoDropdown, { borderBottomWidth: 0 }]} 
              onPress={() => setExibirOpcoesEmail(false)}
            >
              <Text style={styles.textoOpcao}>Continuar com este e-mail</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      
      {/* Input nome*/}
      <View style={styles.inputWrapper}>
        <Text style={[styles.labelFlutuante, nomeCurto && { color: '#e74c3c' }]}>Nome Completo</Text>
        <View style={[
          styles.inputComIcone, 
          nomeCurto && { borderColor: '#e74c3c' }
        ]}>
          <TextInput
            style={styles.textInputInterno}
            value={nome}
            onChangeText={setNome}
          />
          
        </View>
        {nomeCurto && (
          <Text style={styles.textoErro}>O nome deve ter mais de 3 caracteres.</Text>
        )}
      </View>

      
      {/* Input senha*/}
      <View style={styles.inputWrapper}>
        <Text style={[styles.labelFlutuante, senhaCurta && { color: '#e74c3c' }]}>Senha</Text>
        <View style={[
          styles.inputComIcone, 
          senhaCurta && { borderColor: '#e74c3c' } 
          ]}>
          <TextInput
            style={styles.textInputInterno}
            secureTextEntry={!verSenha} 
            value={senha}
            onChangeText={setSenha}
          />
          
          <TouchableOpacity onPress={() => setVerSenha(!verSenha)}>
            <MaterialCommunityIcons 
              name={verSenha ? "eye-outline" : "eye-off-outline"} 
              size={24} 
              color={senhaCurta ? "#e74c3c" : "#333"}
            />
          </TouchableOpacity>
        </View>
        {senhaCurta && <Text style={styles.textoErro}>A senha deve ter pelo menos 8 caracteres.</Text>}
      </View>


      {/* Input confirmar senha */}
      <View style={styles.inputWrapper}>
        <Text style={[styles.labelFlutuante, senhasDiferentes && { color: '#e74c3c' }]}>Confirmar Nova Senha</Text>
        <View style={[
          styles.inputComIcone, 
          senhasDiferentes && { borderColor: '#e74c3c' } 
        ]}>
          <TextInput
            style={styles.textInputInterno}
            secureTextEntry={!verConfirmarSenha} 
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
          />
          
          <TouchableOpacity onPress={() => setVerConfirmarSenha(!verConfirmarSenha)}>
            <MaterialCommunityIcons 
              name={verConfirmarSenha ? "eye-outline" : "eye-off-outline"} 
              size={24} 
              color={senhasDiferentes ? "#e74c3c" : "#333"} 
            />
          </TouchableOpacity>
        </View>
        {senhasDiferentes && <Text style={styles.textoErro}>As senhas não coincidem.</Text>}
      </View>

      <TouchableOpacity
        style={styles.checkboxContainer}
        activeOpacity={0.7}
        onPress={() => setAceitouTermos(!aceitouTermos)}
      >
        <MaterialCommunityIcons
          name={aceitouTermos ? "checkbox-marked" : "checkbox-blank-outline"}
          size={24}
          color={aceitouTermos ? "#6750A4" : "#666"}
        />
        <Text style={styles.textoCheckbox}>Li e aceito os 
            <Text
              style={styles.linkRoxo}
              onPress={()=>router.push('/(auth)/termos')}
            > Termos de uso
            </Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.botao, 
          { backgroundColor: formularioValido ? '#2ecc71' : '#ccc' }
        ]}
        disabled={!formularioValido}
        onPress={handleRegistro}
      >
        <Text style={styles.textoBotao}>Continuar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 20,
  },
  tituloHeader: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitulo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
  },
  // inputs
  inputContainerFixo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  inputFixo: {
    flex: 1,
    paddingVertical: 12,
    color: '#999',
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },
  textoCheckbox: {
    marginLeft: 10,
    color: '#444',
  },
  
  inputWrapper: {
    marginTop: 20,
    width: '100%',
  },
  labelFlutuante: {
    position: 'absolute',
    top: -10, 
    left: 15,
    backgroundColor: '#fff', 
    paddingHorizontal: 5,
    zIndex: 1, 
    fontSize: 14,
    color: '#634d42', 
  },
  inputComIcone: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b2a199', 
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 55, 
  },
  textInputInterno: {
    flex: 1, 
    height: '100%',
    fontSize: 16,
  },
  // Botão
  botao: {
    marginTop: 40,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },

  // Dropdown para trocar o email
  dropdownEmail: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginTop: -5, 
    padding: 10,
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  opcaoDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  textoOpcao: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  linkRoxo: {
    color: '#A369F9',
  },
  // Erros no campo de senha
  textoErro: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
    fontWeight: '500',
  },
  labelErro: {
    color: '#e74c3c',
  }

});