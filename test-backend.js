#!/usr/bin/env node

/**
 * Script de diagnóstico do backend MarePE
 * Uso: node test-backend.js
 */

const https = require('https');
const http = require('http');

const RENDER_URL = 'https://marepe-backend.onrender.com';
const LOCAL_URL = 'http://localhost:8000';

console.log('🔍 Testando conectividade do backend MarePE...\n');

function testUrl(url, timeout = 30000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.get(url, (res) => {
      const duration = Date.now() - startTime;
      resolve({
        success: true,
        status: res.statusCode,
        duration,
        headers: res.headers,
      });
    });

    req.setTimeout(timeout);

    req.on('timeout', () => {
      req.destroy();
      const duration = Date.now() - startTime;
      resolve({
        success: false,
        error: 'Timeout',
        duration,
      });
    });

    req.on('error', (err) => {
      const duration = Date.now() - startTime;
      resolve({
        success: false,
        error: err.message,
        duration,
      });
    });
  });
}

async function main() {
  // Teste 1: Backend Render
  console.log('1️⃣  Testando backend Render...');
  console.log(`   URL: ${RENDER_URL}`);
  const renderResult = await testUrl(RENDER_URL);

  if (renderResult.success) {
    console.log(`   ✅ Resposta: ${renderResult.status}`);
    console.log(`   ⏱️  Tempo: ${renderResult.duration}ms`);
    if (renderResult.duration > 10000) {
      console.log(`   ⚠️  Cold start detectado (>${(renderResult.duration/1000).toFixed(1)}s)`);
      console.log(`   💡 Próximas requisições serão mais rápidas`);
    }
  } else {
    console.log(`   ❌ Erro: ${renderResult.error}`);
    console.log(`   ⏱️  Timeout após: ${renderResult.duration}ms`);
  }

  console.log('');

  // Teste 2: Backend Local
  console.log('2️⃣  Testando backend local...');
  console.log(`   URL: ${LOCAL_URL}`);
  const localResult = await testUrl(LOCAL_URL, 5000);

  if (localResult.success) {
    console.log(`   ✅ Resposta: ${localResult.status}`);
    console.log(`   ⏱️  Tempo: ${localResult.duration}ms`);
    console.log(`   💡 Backend local está rodando!`);
  } else {
    console.log(`   ❌ Erro: ${localResult.error}`);
    console.log(`   💡 Backend local não está rodando`);
  }

  console.log('');
  console.log('📋 Resumo:');
  console.log('─────────────────────────────────────');

  if (renderResult.success) {
    console.log('✅ Backend Render: Disponível');
    if (renderResult.duration > 10000) {
      console.log('   ⚠️  Primeira requisição pode demorar até 30s (cold start)');
    }
  } else {
    console.log('❌ Backend Render: Indisponível');
  }

  if (localResult.success) {
    console.log('✅ Backend Local: Rodando');
    console.log('   💡 Recomendado para desenvolvimento');
  } else {
    console.log('⚪ Backend Local: Não detectado');
    console.log('   💡 Para iniciar: cd marepe-backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000');
  }

  console.log('');

  if (renderResult.success && !localResult.success) {
    console.log('🎯 Recomendação: Use backend Render (já configurado)');
    console.log('   ⏳ Aguarde até 30s na primeira requisição');
  } else if (localResult.success) {
    console.log('🎯 Recomendação: Use backend local para desenvolvimento');
    console.log('   📝 Configure em .env.local:');
    console.log('   EXPO_PUBLIC_API_URL=http://SEU_IP:8000');
    console.log('   (substitua SEU_IP pelo IP da sua máquina)');
  } else {
    console.log('⚠️  Nenhum backend disponível!');
    console.log('   1. Verifique se o Render está online');
    console.log('   2. Ou inicie o backend local');
  }
}

main().catch(console.error);
