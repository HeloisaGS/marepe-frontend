# 🔧 Correções Realizadas - Tela de Perfil

## 📋 Problemas Identificados

### 1. **Conflito de IPs nos arquivos de configuração**
- ❌ `.env` tinha: `http://10.34.96.182:8001`
- ❌ `services/api.ts` fallback: `http://192.168.0.21:8000`
- ❌ `services/axiosApi.js` fallback: `http://192.168.0.21:8000`

### 2. **Inconsistência na porta**
- Backend usa porta `8001` mas alguns arquivos tinham `8000`

### 3. **Token de autenticação**
- ✅ O código já estava correto usando `AsyncStorage` nos interceptors

## ✅ Correções Aplicadas

### 1. Atualização do IP em todos os arquivos

**Arquivo: `.env`**
```env
EXPO_PUBLIC_API_URL=http://187.21.13.154:8001
```

**Arquivo: `services/api.ts`** (linha 5)
```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://187.21.13.154:8001';
```

**Arquivo: `services/axiosApi.js`** (linha 4)
```javascript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://187.21.13.154:8001';
```

## 🔍 Arquitetura Atual

### Backend
- **Endpoint de perfil**: `GET /profile/my-profile`
- **Localização**: `C:\Users\Valcann\Downloads\marepe\marepe-backend`
- **Arquivo do router**: `app/routers/profile.py`
- **Service**: `app/services/profile_service.py`

### Frontend
- **Serviço**: `services/profileService.ts`
- **Telas**:
  - Cliente: `app/(cliente)/(tabs)/perfil.tsx`
  - Ambulante: `app/(ambulante)/(tabs)/perfil.tsx`

### Fluxo de Autenticação
```
1. Login → authService.login()
2. Token salvo → AsyncStorage.setItem('userToken', token)
3. Requisição → profileService.getMeuPerfil()
4. Interceptor → Adiciona token automaticamente no header
5. Backend → Valida token e retorna dados do perfil
```

## 📊 Estrutura de Resposta Esperada

### Cliente
```json
{
  "id": "uuid-do-usuario",
  "nome": "João Silva",
  "role": "cliente",
  "vendedor": null
}
```

### Ambulante/Barraqueiro
```json
{
  "id": "uuid-do-usuario",
  "nome": "Maria Santos",
  "role": "ambulante",
  "vendedor": {
    "cpf": "12345678900",
    "telefone": "(11) 98765-4321",
    "foto_url": "https://storage.url/foto.jpg",
    "nome_barraca": "Barraca da Maria"
  }
}
```

## 🚀 Como Testar

### 1. Iniciar o Backend
```bash
cd C:\Users\Valcann\Downloads\marepe\marepe-backend

# Ativar ambiente virtual (se houver)
# source venv/bin/activate  # Linux/Mac
# .\venv\Scripts\activate   # Windows

# Instalar dependências
pip install -r requirements.txt

# Rodar o servidor
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### 2. Verificar Conectividade
```bash
cd C:\Users\Valcann\Downloads\marepe-frontend

# Testar conectividade
node test-profile.js
```

### 3. Testar no App
```bash
# Limpar cache do Expo
npx expo start -c

# Ou apenas rodar
npx expo start
```

### 4. Fluxo de Teste no App
1. ✅ Faça login com um usuário válido
2. ✅ Navegue até a aba "Perfil"
3. ✅ Verifique se os dados aparecem corretamente
4. ✅ Teste o botão "Finalizar sessão"

## 🐛 Troubleshooting

### Erro: "Sem resposta do servidor"
- ✅ Verifique se o backend está rodando
- ✅ Confirme o IP correto com `ipconfig` (Windows) ou `ifconfig` (Linux/Mac)
- ✅ Verifique se o firewall não está bloqueando a porta 8001

### Erro: 401 Unauthorized
- ✅ Faça logout e login novamente
- ✅ Verifique se o token está sendo salvo: console.log após o login
- ✅ Verifique os logs do interceptor no console

### Erro: "Resposta inválida do servidor"
- ✅ Verifique os logs do backend
- ✅ Confirme que o usuário existe no Supabase
- ✅ Verifique se a estrutura da resposta corresponde ao ProfileResponse

### Erro: ECONNREFUSED
- ✅ O IP 187.21.13.154 pode não ser o correto
- ✅ Se estiver testando localmente, use `localhost` ou `127.0.0.1`
- ✅ Se estiver testando em dispositivo físico, use o IP da sua máquina na rede local
- ✅ Para descobrir seu IP local:
  - Windows: `ipconfig` (procure por "IPv4 Address")
  - Mac/Linux: `ifconfig` ou `ip addr`

## 📝 Próximos Passos

1. ✅ Confirmar o IP correto do servidor backend
2. ✅ Iniciar o backend na porta 8001
3. ✅ Testar login e salvamento do token
4. ✅ Testar carregamento do perfil
5. ✅ Verificar se os dados são exibidos corretamente nas telas

## 🔐 Segurança

- ✅ Token JWT enviado no header `Authorization: Bearer <token>`
- ✅ Token armazenado de forma segura no AsyncStorage
- ✅ Interceptors adicionam o token automaticamente
- ✅ Backend valida o token em todas as rotas protegidas

## 📚 Referências

- **Backend**: `C:\Users\Valcann\Downloads\marepe\marepe-backend`
- **Documentação da API**: `http://187.21.13.154:8001/docs` (quando o backend estiver rodando)
- **Arquivo de teste**: `test-profile.js`
