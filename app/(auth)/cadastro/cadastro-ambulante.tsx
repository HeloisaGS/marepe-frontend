import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CadastroAmbulante() {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmarSenha, setVerConfirmarSenha] = useState(false);
  const [exibirOpcoesEmail, setExibirOpcoesEmail] = useState(false);
  const [foto, setFoto] = useState(null); // Vai ser opcional?
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');

  // E-mail mockado 
  const emailFixo = "exemplo@email.com";

  // Lógica de validação simplificada
  const formularioValido =
    nome.trim().length > 3 &&
    cpf.length === 14 && 
    telefone.length >= 14 && 
    senha.length >= 8 &&
    senha === confirmarSenha &&
    aceitouTermos;
  // Para ajustar telefone e CPF
  const aplicarMascaraCPF = (valor: string) => {
    return valor
      .replace(/\D/g, '') // Remove tudo que não é número
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1'); // Limita o tamanho
  };

  const aplicarMascaraTelefone = (valor: string) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
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

      <View style={styles.containerFoto}>
        <TouchableOpacity style={styles.circuloFoto} activeOpacity={0.8}>
          <MaterialCommunityIcons name="camera-plus-outline" size={35} color="#b2a199" />
        </TouchableOpacity>
      </View>
      <View style={{ zIndex: 10 }}> 
        <TouchableOpacity 
          style={styles.inputContainerFixo} 
          onPress={() => setExibirOpcoesEmail(!exibirOpcoesEmail)}
          activeOpacity={0.8}
        >
          <TextInput
            style={styles.inputFixo}
            value={emailFixo}
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
        <Text style={styles.labelFlutuante}>Nome Completo</Text>
        <View style={styles.inputComIcone}>
          <TextInput
            style={styles.textInputInterno}
            value={nome}
            onChangeText={setNome}
          />
          
        </View>
      </View>
      {/* Input CPF */}
      <View style={styles.inputWrapper}>
        <Text style={styles.labelFlutuante}>CPF</Text>
        <View style={styles.inputComIcone}>
          <TextInput
            style={styles.textInputInterno}
            placeholder="000.000.000-00"
            keyboardType="numeric"
            value={cpf}
            onChangeText={(txt) => setCpf(aplicarMascaraCPF(txt))}
          />
        </View>
      </View>

      {/* Input Telefone */}
      <View style={styles.inputWrapper}>
        <Text style={styles.labelFlutuante}>Telefone</Text>
        <View style={styles.inputComIcone}>
          <TextInput
            style={styles.textInputInterno}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            value={telefone}
            onChangeText={(txt) => setTelefone(aplicarMascaraTelefone(txt))}
          />
        </View>
      </View>
      
      {/* Input senha*/}
      <View style={styles.inputWrapper}>
        <Text style={styles.labelFlutuante}>Senha</Text>
        <View style={styles.inputComIcone}>
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
              color="#333" 
            />
          </TouchableOpacity>
        </View>
      </View>


      {/* Input confirmar senha */}
      <View style={styles.inputWrapper}>
        <Text style={styles.labelFlutuante}>Confirmar Nova Senha</Text>
        <View style={styles.inputComIcone}>
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
              color="#333" 
            />
          </TouchableOpacity>
        </View>
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
        onPress={() => {
          console.log("Dados enviados:", { nome, senha });
          // Navegar para a próxima tela (ex: OTP)
          console.log("Navegando...");
          router.push({
            pathname: '/(auth)/verificar-token',
            params: { origem: 'cadastro' } 
          });
        }}
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
  // foto
  containerFoto: {
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
  },
  circuloFoto: {
    width: 90,
    height: 90,
    borderRadius: 45, 
    backgroundColor: '#f9f9f9',
    borderWidth: 2,
    borderColor: '#b2a199',
    borderStyle: 'dashed', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendaFoto: {
    marginTop: 8,
    fontSize: 12,
    color: '#b2a199',
    fontWeight: '500',
  },
  linkRoxo: {
    color: '#A369F9',
  },

});