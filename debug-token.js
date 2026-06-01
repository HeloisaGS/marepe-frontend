// Script de debug para verificar o token salvo
// Execute com: node debug-token.js

const AsyncStorage = require('@react-native-async-storage/async-storage').default;

async function debugToken() {
  try {
    console.log('🔍 Buscando token do AsyncStorage...\n');

    const token = await AsyncStorage.getItem('userToken');
    const role = await AsyncStorage.getItem('userRole');

    console.log('========== TOKEN ==========');
    console.log('Existe?', token ? 'SIM' : 'NÃO');

    if (token) {
      console.log('Tamanho:', token.length);
      console.log('Tipo:', typeof token);
      console.log('Primeiros 50 caracteres:', token.substring(0, 50));
      console.log('Últimos 20 caracteres:', token.substring(token.length - 20));
      console.log('Primeiro char code:', token.charCodeAt(0));
      console.log('Último char code:', token.charCodeAt(token.length - 1));

      // Verificar se tem aspas extras
      if (token.startsWith('"') && token.endsWith('"')) {
        console.warn('\n⚠️  PROBLEMA: Token tem aspas extras!');
        console.log('Token sem aspas seria:', token.slice(1, -1));
      }

      // Verificar se é um JSON
      try {
        const parsed = JSON.parse(token);
        console.warn('\n⚠️  PROBLEMA: Token é um JSON, não uma string simples!');
        console.log('Conteúdo parseado:', parsed);
      } catch (e) {
        console.log('\n✅ Token é uma string simples (correto)');
      }
    }

    console.log('\n========== ROLE ==========');
    console.log('Role:', role);
    console.log('Role normalizada:', role?.toUpperCase());

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Para React Native, expor como componente
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { debugToken };
}

debugToken();
