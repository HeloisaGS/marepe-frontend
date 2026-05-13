# ✅ Checklist - Correção da Tela de Perfil

## 📋 Mudanças Realizadas

### 1. ✅ Correção de IPs e Configuração
- [x] Atualizado `.env` para `http://192.168.0.5:8001`
- [x] Atualizado `services/api.ts` com IP correto
- [x] Atualizado `services/axiosApi.js` com IP correto
- [x] Unificado porta para `8001` em todos os arquivos

### 2. ✅ Validação da Estrutura
- [x] Verificado endpoint no backend: `GET /profile/my-profile`
- [x] Confirmado estrutura de resposta no `profile_service.py`
- [x] Validado que `profileService.ts` usa o endpoint correto
- [x] Confirmado que ambas as telas de perfil usam `profileService`

### 3. ✅ Sistema de Autenticação
- [x] Confirmado que token é salvo no `AsyncStorage`
- [x] Validado interceptor no `axiosApi.js` que adiciona token automaticamente
- [x] Validado interceptor no `api.ts` que adiciona token automaticamente

## 🚀 Próximos Passos para Testar

### Passo 1: Iniciar o Backend
```bash
cd C:\Users\Valcann\Downloads\marepe\marepe-backend

# Ativar ambiente virtual (se existir)
.\venv\Scripts\activate

# Instalar dependências (se necessário)
pip install -r requirements.txt

# Rodar o backend
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

**Resultado esperado:**
```
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Passo 2: Testar Conectividade
```bash
cd C:\Users\Valcann\Downloads\marepe-frontend

# Testar conexão com o backend
node test-profile.js
```

**Resultado esperado:**
```
✅ Teste 1: Verificando conectividade...
✅ Servidor está online!

✅ Teste 2: Verificando endpoint de perfil sem autenticação...
✅ Endpoint protegido corretamente (401 Unauthorized)
```

### Passo 3: Limpar Cache e Rodar o App
```bash
# Limpar cache do Metro bundler
npx expo start -c
```

**Escolha o dispositivo:**
- `a` - Android (emulador ou dispositivo físico)
- `i` - iOS (simulador)
- `w` - Web

### Passo 4: Testar no App

#### 4.1. Fazer Login
1. Abra o app
2. Faça login com usuário válido
3. **Verifique no console/logs** se aparece:
   ```
   🔑 Token encontrado, enviando na requisição
   ```

#### 4.2. Acessar Perfil
1. Navegue até a aba "Perfil"
2. Aguarde o carregamento
3. **Verifique se os dados aparecem**:
   - Nome do usuário
   - (Para ambulantes) Foto, nome da barraca
   - (Para ambulantes) Estrelas de avaliação

#### 4.3. Verificar Logs
No terminal do Expo, procure por:
```
✅ Logs de sucesso:
🔑 Token encontrado, enviando na requisição
[200] GET /profile/my-profile

❌ Logs de erro (se houver):
❌ [API ERROR] Status: 401 (token inválido ou expirado)
❌ [API ERROR] Status: 404 (usuário não encontrado)
❌ [NETWORK ERROR] Sem resposta do servidor (backend offline)
```

## 🐛 Troubleshooting

### ❌ Erro: "Sem resposta do servidor"

**Possíveis causas:**
1. Backend não está rodando
2. IP ou porta incorretos
3. Firewall bloqueando conexão

**Soluções:**
```bash
# 1. Verificar se backend está rodando
# No terminal do backend, deve aparecer:
# INFO:     Uvicorn running on http://0.0.0.0:8001

# 2. Testar conectividade
curl http://192.168.0.5:8001/
# ou
node test-profile.js

# 3. Verificar firewall (Windows)
# Permita conexões na porta 8001:
# Painel de Controle → Firewall → Configurações avançadas → Regra de entrada
```

### ❌ Erro: 401 Unauthorized

**Possíveis causas:**
1. Token não está sendo enviado
2. Token expirou
3. Token inválido

**Soluções:**
```bash
# 1. Verificar logs do interceptor
# Deve aparecer: "🔑 Token encontrado, enviando na requisição"
# Se aparecer: "⚠️ Token não encontrado no AsyncStorage"
# → Faça logout e login novamente

# 2. Limpar cache e fazer novo login
# No simulador iOS: Device → Erase All Content and Settings
# No emulador Android: Settings → Apps → App → Clear Data
# Ou programaticamente:
await AsyncStorage.removeItem('userToken');
```

### ❌ Erro: "Resposta inválida do servidor"

**Possíveis causas:**
1. Estrutura da resposta não corresponde ao esperado
2. Usuário não tem dados de vendedor (para ambulantes)

**Soluções:**
```bash
# Verificar logs do backend
# Deve aparecer a resposta JSON completa

# Verificar estrutura no Supabase
# Acesse: https://ixfpjbrfglpbnhwinrsp.supabase.co
# Table Editor → users → buscar pelo seu usuário
# Table Editor → vendedores → verificar se existe registro
```

### ❌ Dispositivo físico não conecta

**Para Android:**
- Certifique-se de que está na mesma rede Wi-Fi
- Use o IP local: `192.168.0.5`

**Para iOS:**
- Certifique-se de que está na mesma rede Wi-Fi
- Use o IP local: `192.168.0.5`
- Verifique permissões de rede local no iOS 14+

**Para Emulador Android:**
- Use `10.0.2.2` em vez de `localhost`
- Ou use o IP da rede: `192.168.0.5`

**Para Simulador iOS:**
- Use `localhost` ou `127.0.0.1`

## 📊 Resumo das Telas de Perfil

### Cliente (`app/(cliente)/(tabs)/perfil.tsx`)
**Dados exibidos:**
- Nome do usuário
- Versão do app
- Botão "Finalizar sessão"

**Estrutura de dados:**
```typescript
{
  id: string;
  nome: string;
  role: "cliente";
}
```

### Ambulante (`app/(ambulante)/(tabs)/perfil.tsx`)
**Dados exibidos:**
- Nome do usuário
- Foto do vendedor (ou placeholder)
- Estrelas de avaliação (fixo em 4, por enquanto)
- Botão "Alterar categorias"
- Versão do app
- Botão "Finalizar sessão"

**Estrutura de dados:**
```typescript
{
  id: string;
  nome: string;
  role: "ambulante";
  vendedor: {
    cpf: string;
    telefone: string;
    foto_url: string | null;
    nome_barraca: string | null;
  }
}
```

## 🔐 Fluxo de Autenticação

```
┌─────────────┐
│   Login     │
│ (authService│
│   .login)   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ Token salvo no          │
│ AsyncStorage            │
│ key: 'userToken'        │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Tela de Perfil carrega  │
│ useEffect chama         │
│ profileService          │
│ .getMeuPerfil()         │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Interceptor do axios    │
│ pega token do           │
│ AsyncStorage e adiciona │
│ no header:              │
│ Authorization:          │
│ Bearer <token>          │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Backend valida token    │
│ get_supabase_user       │
│ extrai user_id          │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ profile_service busca   │
│ dados no Supabase       │
│ - users table           │
│ - vendedores table      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Retorna ProfileResponse │
│ para o frontend         │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Tela exibe os dados     │
│ setPerfil(response.data)│
└─────────────────────────┘
```

## ✅ Checklist Final

Antes de considerar a correção completa, verifique:

- [ ] Backend está rodando na porta 8001
- [ ] IP correto configurado (192.168.0.5)
- [ ] Teste de conectividade passou (node test-profile.js)
- [ ] App do Expo iniciado (npx expo start -c)
- [ ] Login realizado com sucesso
- [ ] Token salvo no AsyncStorage
- [ ] Tela de perfil carrega sem erros
- [ ] Dados do perfil são exibidos corretamente
- [ ] (Para ambulantes) Foto e dados do vendedor aparecem
- [ ] Botão "Finalizar sessão" funciona
- [ ] Logout redireciona para tela de login

## 📚 Arquivos Modificados

```
.env                        # IP atualizado
services/api.ts            # IP fallback atualizado
services/axiosApi.js       # IP fallback atualizado
```

## 📚 Arquivos Criados

```
test-profile.js            # Script de teste de conectividade
discover-ip.js             # Script para descobrir IP local
CORRECOES-PERFIL.md        # Documentação detalhada
CHECKLIST-PERFIL.md        # Este arquivo
```

## 🎯 Resultado Final Esperado

### Para Cliente
- Tela de perfil exibe o nome
- Botão de logout funciona
- Sem erros no console

### Para Ambulante
- Tela de perfil exibe:
  - Nome
  - Foto (se houver) ou placeholder
  - 4 estrelas
  - Botão "Alterar categorias"
  - Botão de logout
- Sem erros no console

---

**Data:** 2026-05-13  
**IP Configurado:** 192.168.0.5:8001  
**Backend:** C:\Users\Valcann\Downloads\marepe\marepe-backend  
**Frontend:** C:\Users\Valcann\Downloads\marepe-frontend
