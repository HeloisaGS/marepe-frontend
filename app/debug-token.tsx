import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function DebugToken() {
  const [info, setInfo] = useState<string>('Carregando...');

  useEffect(() => {
    debugToken();
  }, []);

  const debugToken = async () => {
    try {
      let output = '';

      const token = await AsyncStorage.getItem('userToken');
      const role = await AsyncStorage.getItem('userRole');

      output += '========== TOKEN ==========\n';
      output += `Existe? ${token ? 'SIM' : 'NÃO'}\n\n`;

      if (token) {
        output += `Tamanho: ${token.length}\n`;
        output += `Tipo: ${typeof token}\n`;
        output += `Primeiros 50: ${token.substring(0, 50)}\n`;
        output += `Últimos 20: ${token.substring(token.length - 20)}\n`;
        output += `Primeiro charCode: ${token.charCodeAt(0)}\n`;
        output += `Último charCode: ${token.charCodeAt(token.length - 1)}\n\n`;

        // Verificar aspas extras
        if (token.startsWith('"') && token.endsWith('"')) {
          output += '⚠️ PROBLEMA: Token tem aspas extras!\n';
          output += `Token limpo: ${token.slice(1, -1).substring(0, 50)}...\n\n`;
        }

        // Verificar se é JSON
        try {
          const parsed = JSON.parse(token);
          output += '⚠️ PROBLEMA: Token é JSON!\n';
          output += `Parseado: ${JSON.stringify(parsed, null, 2)}\n\n`;
        } catch (e) {
          output += '✅ Token é string simples\n\n';
        }

        output += 'Token completo:\n';
        output += token + '\n\n';
      }

      output += '========== ROLE ==========\n';
      output += `Role: ${role}\n`;
      output += `Role normalizada: ${role?.toUpperCase()}\n\n`;

      setInfo(output);
    } catch (error: any) {
      setInfo(`❌ Erro: ${error.message}`);
    }
  };

  const limparToken = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userRole');
    setInfo('✅ Token limpo! Recarregue a página.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Token</Text>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.text}>{info}</Text>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={debugToken}>
          <Text style={styles.buttonText}>Recarregar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={limparToken}>
          <Text style={styles.buttonText}>Limpar Token</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F0',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 5,
  },
  text: {
    color: '#0F0',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#0F0',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#F00',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
