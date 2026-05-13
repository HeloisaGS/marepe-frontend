/**
 * Script para descobrir o IP correto da máquina na rede local
 * Execute com: node discover-ip.js
 */

const os = require('os');

function discoverLocalIP() {
  console.log('🔍 Descobrindo IPs disponíveis na sua máquina...\n');

  const networkInterfaces = os.networkInterfaces();
  const ips = [];

  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];

    for (const iface of interfaces) {
      // Ignorar loopback e interfaces não IPv4
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({
          interface: interfaceName,
          address: iface.address,
          mac: iface.mac
        });
      }
    }
  }

  if (ips.length === 0) {
    console.log('❌ Nenhum IP de rede local encontrado.');
    console.log('💡 Certifique-se de estar conectado a uma rede (Wi-Fi ou Ethernet).\n');
    return;
  }

  console.log('✅ IPs encontrados:\n');
  ips.forEach((ip, index) => {
    console.log(`${index + 1}. Interface: ${ip.interface}`);
    console.log(`   IP: ${ip.address}`);
    console.log(`   MAC: ${ip.mac}\n`);
  });

  const recommendedIP = ips[0].address;
  console.log(`🎯 IP recomendado para usar: ${recommendedIP}\n`);

  console.log('📝 Atualize o arquivo .env com:');
  console.log(`EXPO_PUBLIC_API_URL=http://${recommendedIP}:8001\n`);

  console.log('📝 Para testar no Expo:');
  console.log(`1. Inicie o backend: uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload`);
  console.log(`2. Atualize o .env com o IP acima`);
  console.log(`3. Reinicie o Expo: npx expo start -c`);
  console.log(`4. Teste a conexão\n`);

  console.log('⚠️ Notas importantes:');
  console.log('- Se estiver usando emulador Android: use 10.0.2.2 para acessar localhost');
  console.log('- Se estiver usando simulador iOS: use localhost ou 127.0.0.1');
  console.log('- Se estiver usando dispositivo físico: use o IP da rede local (listado acima)');
  console.log('- Certifique-se de que o firewall permite conexões na porta 8001\n');
}

discoverLocalIP();
