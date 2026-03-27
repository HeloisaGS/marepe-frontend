import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import LogoMaré from '../../assets/images/logo.png'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Token() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const inputs = useRef<(TextInput | null)[]>([]);
  const [erro, setErro] = useState('');

  // Lógica do cronômetro
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Função para lidar com a digitação
  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Pula para o próximo input se digitou algo
    if (text && index < 5) {
      inputs.current?.[index + 1]?.focus();
    }
  };

  // Lógica para apagar (BackSpace)
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current?.[index - 1]?.focus();
    }
  };

  const isComplete = code.every(digit => digit !== '');

  const handleResend = () => {
    if (timer === 0) {
      setTimer(30);
      // Aqui você chamaria sua API de reenvio
      console.log("Código reenviado!");
    }
  };
  
  // Para saber de onde vem
  const { origem } = useLocalSearchParams();

  const handleVerify = () => {
    if (isComplete) {
      const tokenDigitado = code.join('');
      const TOKEN_CORRETO = "123456"; //Mock do token alterar para o da API
      setErro('');
      
      if (tokenDigitado === TOKEN_CORRETO) {
      console.log("Código correto! Navegando...");
        if (origem === 'recuperacao') {
          router.push('/(auth)/recuperacao-senha/nova-senha');
        } else if (origem === 'cadastro') {
          router.push('/(auth)/cadastro/sucesso-cadastro'); // Tela temporária
          // router.push('/'); 
        } else {
          router.push('/'); 
        }
      } else {
        console.log("Código incorreto!");
        setErro('Código inválido. Verifique se digitou corretamente ou peça um novo código.');
        setCode(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={{ fontSize: 24 }}>←</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Image source={LogoMaré} style={styles.logo} resizeMode="contain" />
        <Text style={styles.brandName}>MaréPE</Text>
        {/* Aviso de erro */}
        {erro ? (
          <View style={styles.alertaErro}>
            <MaterialCommunityIcons name="alert-circle" size={20} color="#e74c3c" />
            <Text style={styles.textoErroAlerta}>{erro}</Text>
          </View>
        ) : null}

        <Text style={styles.title}>Verifique seu e-mail</Text>
        <Text style={styles.subtitle}>
          Enviamos um código de 6 dígitos para o seu e-mail. Insira-o abaixo
        </Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => { inputs.current[index] = el; }}
              style={[styles.input, digit ? styles.inputActive : null]}
              keyboardType="number-pad"
              maxLength={1}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              value={digit}
            />
          ))}
        </View>

        <TouchableOpacity
          disabled={!isComplete}
          style={[
            styles.button, 
            { backgroundColor: isComplete ? '#2ecc71' : '#E0E0E0' }
          ]}
          onPress={handleVerify}
        >
          <Text style={[styles.buttonText, { color: isComplete ? '#fff' : '#A0A0A0' }]}>
            Verificar
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          {timer > 0 ? (
    <Text style={styles.timerText}>
      Reenviar código em <Text style={{ fontWeight: 'bold' }}>{timer}s</Text>
    </Text>
      ) : (
        <TouchableOpacity onPress={handleResend}>
          <Text style={[styles.resendText, { color: '#E67E22', fontWeight: 'bold' }]}>
            Reenviar código
          </Text>
        </TouchableOpacity>
      )}
          
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.resendText}>Alterar contatos</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 20,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    height: 250,
    width: 250,
  },
  brandName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    alignSelf: 'flex-start',
    marginBottom: 30,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
  },
  input: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputActive: {
    borderColor: '#2ecc71',
    borderWidth: 2,
  },
  button: {
    width: '60%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    // Sombra leve para o botão
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 40,
  },
  timerText: {
    fontSize: 12,
    color: '#333',
  },
  resendText: {
    fontSize: 12,
    color: '#E67E22', 
    fontWeight: '600',
  },
  alertaErro: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2', // Cinza clarinho de fundo
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  textoErroAlerta: {
    color: '#333',
    fontSize: 12,
    marginLeft: 10,
    flex: 1, // Para o texto quebrar linha se for grande
    fontWeight: '500',
  },

});