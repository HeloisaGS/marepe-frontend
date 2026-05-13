/**
 * Script de teste para validar a integração do endpoint de perfil
 *
 * Execute com: node test-profile.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://192.168.0.5:8001';

async function testProfileEndpoint() {
  console.log('🔍 Testando endpoint de perfil...\n');
  console.log(`📍 URL Base: ${API_BASE_URL}`);
  console.log(`🎯 Endpoint: /profile/my-profile\n`);

  try {
    // Teste 1: Verificar se o servidor está respondendo
    console.log('✅ Teste 1: Verificando conectividade...');
    const healthCheck = await axios.get(`${API_BASE_URL}/`, { timeout: 5000 });
    console.log('✅ Servidor está online!\n');
  } catch (error) {
    console.error('❌ Erro de conectividade:', error.message);
    console.log('\n💡 Verifique:');
    console.log('  1. O backend está rodando?');
    console.log('  2. O IP 187.21.13.154:8001 está correto?');
    console.log('  3. Há firewall bloqueando a conexão?\n');
    return;
  }

  // Teste 2: Verificar endpoint sem token (deve retornar 401)
  console.log('✅ Teste 2: Verificando endpoint de perfil sem autenticação...');
  try {
    await axios.get(`${API_BASE_URL}/profile/my-profile`, { timeout: 5000 });
    console.log('⚠️ Atenção: endpoint deveria exigir autenticação!\n');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Endpoint protegido corretamente (401 Unauthorized)\n');
    } else {
      console.error('❌ Erro inesperado:', error.message, '\n');
    }
  }

  console.log('📝 Próximos passos:');
  console.log('  1. Faça login no app para obter um token válido');
  console.log('  2. O token será salvo no AsyncStorage');
  console.log('  3. As telas de perfil usarão o profileService.getMeuPerfil()');
  console.log('  4. O interceptor do axios adicionará automaticamente o token\n');

  console.log('📊 Estrutura esperada da resposta:');
  console.log(JSON.stringify({
    id: "uuid",
    nome: "Nome do Usuário",
    role: "cliente | ambulante | barraqueiro",
    vendedor: {
      cpf: "12345678900",
      telefone: "(11) 99999-9999",
      foto_url: "https://...",
      nome_barraca: "Nome da Barraca"
    }
  }, null, 2));
}

testProfileEndpoint();
