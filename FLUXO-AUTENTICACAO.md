# 🔐 Fluxo de Autenticação - MaréPE

## 📱 Como o App Funciona

### 1️⃣ **Primeira Abertura (Sem Login)**

```
App Inicia (app/index.tsx)
    ↓
Verifica AsyncStorage
    ↓
Sem token? → Redireciona para (auth)/index.tsx
    ↓
Tela Inicial: Digite seu email
    ↓
Email existe? 
    ├─ SIM → (auth)/login.tsx (Tela de Login)
    └─ NÃO → (auth)/cadastro/index.tsx (Escolher tipo de conta)
```

### 2️⃣ **Cadastro de Novo Usuário**

```
(auth)/cadastro/index.tsx
    ↓
Escolher tipo de conta:
    ├─ 🏖️ Cliente (Banhista)
    ├─ 🚶 Ambulante (Vendedor móvel)
    └─ 🏠 Barraqueiro (Ponto fixo)
    ↓
Preencher dados do cadastro
    ↓
Verificar token (OTP) enviado por email
    ↓
Login automático
    ↓
Solicitar permissão de localização
    ↓
Entrar na tela principal
```

### 3️⃣ **Login de Usuário Existente**

```
(auth)/index.tsx - Digita email
    ↓
Email existe? SIM
    ↓
(auth)/login.tsx - Digita senha
    ↓
Backend valida credenciais
    ↓
Recebe token JWT + role
    ↓
Salva no AsyncStorage:
    - userToken: "eyJhbGciOiJIUzI1NiIsInR5cCI..."
    - userRole: "CLIENTE" | "AMBULANTE" | "BARRAQUEIRO"
    ↓
(auth)/sucesso.tsx - Solicita GPS
    ↓
Redireciona para tela correta:
    - CLIENTE → (cliente)/(tabs)
    - AMBULANTE → (ambulante)/(tabs)
    - BARRAQUEIRO → (barraca)/(tabs)
```

### 4️⃣ **Abertura Subsequente (Já Logado)**

```
App Inicia (app/index.tsx)
    ↓
Verifica AsyncStorage
    ↓
Token existe? SIM
    ↓
Redireciona direto para:
    - CLIENTE → (cliente)/(tabs)
    - AMBULANTE → (ambulante)/(tabs)
    - BARRAQUEIRO → (barraca)/(tabs)
    ↓
ProtectedRoute valida token
    ↓
Interceptor anexa token nas requisições
```

---

## 👥 Tipos de Usuário e Funcionalidades

### 🏖️ **CLIENTE (Banhista)**

**O que pode fazer:**
- ✅ Ver mapa com vendedores próximos
- ✅ Filtrar vendedores por categoria de produtos
- ✅ Ver cardápio completo dos vendedores
- ✅ Fazer pedidos com produtos específicos
- ✅ Acompanhar status dos pedidos

**Telas principais:**
- `(cliente)/(tabs)/index.tsx` - Mapa com vendedores
- `(cliente)/(tabs)/pedidos.tsx` - Meus pedidos
- `(cliente)/(tabs)/perfil.tsx` - Meu perfil

---

### 🚶 **AMBULANTE (Vendedor Móvel)**

**O que pode fazer:**
- ✅ Ativar/desativar localização em tempo real
- ✅ Aparecer no mapa para clientes próximos
- ✅ Gerenciar catálogo de categorias (vitrine)
- ✅ Gerenciar produtos do cardápio (nome, preço, descrição)
- ✅ Receber e gerenciar pedidos dos clientes
- ✅ Aceitar/negar pedidos

**Telas principais:**
- `(ambulante)/(tabs)/index.tsx` - Mapa + controle de GPS
- `(ambulante)/(tabs)/vitrine.tsx` - Selecionar categorias
- `(ambulante)/(tabs)/produtos.tsx` - Gerenciar cardápio
- `(ambulante)/(tabs)/pedidos.tsx` - Fila de pedidos
- `(ambulante)/(tabs)/bateria.tsx` - Status de bateria
- `(ambulante)/(tabs)/perfil.tsx` - Meu perfil

**Diferença Vitrine vs Cardápio:**
- **Vitrine**: Categorias gerais (Camarão, Bebidas, Milho, etc.)
- **Cardápio**: Produtos específicos (Água de Coco Gelada - R$ 5,00)

---

### 🏠 **BARRAQUEIRO (Ponto Fixo)**

**O que pode fazer:**
- ✅ Fixar localização estática da barraca no mapa
- ✅ Pin permanece no mapa mesmo offline
- ✅ Gerenciar produtos/serviços
- ✅ Associar ambulantes à barraca
- ✅ Receber pedidos

**Telas principais:**
- `(barraca)/(tabs)/index.tsx` - Fixar localização no mapa
- `(barraca)/(tabs)/estabelecimento.tsx` - Dados da barraca
- `(barraca)/(tabs)/associados.tsx` - Ambulantes associados
- `(barraca)/(tabs)/perfil.tsx` - Meu perfil

**Como funciona:**
1. Barraqueiro fixa o pin no mapa (arrasta ou clica)
2. Localização é salva no backend
3. Pin aparece para clientes próximos
4. Não precisa estar com app aberto

---

## 🧪 Como Testar Cada Tipo de Usuário

### 🔑 **Limpar Dados e Começar do Zero**

```javascript
// Abra o console do app e execute:
await AsyncStorage.removeItem('userToken');
await AsyncStorage.removeItem('userRole');
await AsyncStorage.removeItem('gps_permitido');

// Ou use a tela de debug:
// Navegue para /debug-token
```

### 📝 **Criar Conta de Teste**

1. **Abra o app** → Tela inicial de email
2. **Digite um email** que não existe: `teste-cliente@marepe.com`
3. **Clique Continuar** → Vai para escolha de tipo
4. **Escolha o tipo** (Cliente, Ambulante ou Barraqueiro)
5. **Preencha o formulário**:
   - Nome completo
   - CPF (use: 123.456.789-10 para testes)
   - Telefone
   - Senha (mínimo 8 caracteres)
   - Se Barraqueiro: nome da barraca
6. **Verifique o email** - Recebe código OTP
7. **Digite o código** de 6 dígitos
8. **Permita localização** quando solicitado
9. **Pronto!** Você está logado

### 🔄 **Testar Login Existente**

1. **Abra o app** → Tela inicial
2. **Digite email cadastrado** 
3. **Clique Continuar** → Vai para tela de senha
4. **Digite senha**
5. **Clique Entrar**
6. **Pronto!** Você está logado

### 🗺️ **Testar Barraca**

Para ver barracas no mapa como cliente:

1. **Crie uma conta de Barraqueiro** (passos acima)
2. **Na tela do mapa**, fixe o pin:
   - Opção 1: "Usar Localização Atual"
   - Opção 2: "Escolher no Mapa" (toque no mapa)
3. **Clique "Salvar Localização"**
4. **Faça logout** ou abra em outro dispositivo
5. **Entre como Cliente**
6. **Veja o mapa** - A barraca aparece como pin laranja 🏠

---

## 🐛 Problemas Comuns

### ❌ "Falha na autenticação" (401)

**Causa:** Token inválido ou expirado

**Solução:**
1. Limpe o AsyncStorage (veja acima)
2. Faça login novamente
3. Se persistir, verifique o token em `/debug-token`

### ❌ App abre direto sem login

**Causa:** Token ainda está salvo

**Solução:**
- Use a tela `/debug-token` para limpar
- OU desinstale e reinstale o app

### ❌ Token com aspas extras

**Causa:** Salvamento incorreto do token

**Solução:**
- Já corrigido! Faça login novamente
- O novo código não usa `JSON.stringify()`

### ❌ Não aparece no mapa

**Para Ambulantes:**
- ✅ Certifique que o toggle está ATIVO
- ✅ Permissão de GPS concedida
- ✅ Status é "online" (não "paused" ou "offline")

**Para Barracas:**
- ✅ Localização foi fixada e salva
- ✅ Pin aparece no próprio mapa primeiro

---

## 🔐 Segurança

### Camadas de Proteção

1. **`app/index.tsx`** - Verifica token inicial
2. **`ProtectedRoute`** - Valida role por grupo
3. **Interceptor API** - Anexa Bearer token
4. **Backend** - Valida JWT
5. **Logout automático** - Se receber 401

### Onde o Token é Usado

Todas as requisições autenticadas incluem:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Requisições que NÃO precisam de token:**
- `/auth/signup` - Cadastro
- `/auth/login` - Login
- `/auth/check-email` - Verificar se email existe
- `/auth/signup-otp` - Verificar código
- `/auth/forgot-password` - Esqueci senha

**Requisições que PRECISAM de token:**
- `/profile/*` - Perfil
- `/vendedor/*` - Vendedor
- `/cliente/*` - Cliente
- `/barraca/*` - Barraca

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no console
2. Use `/debug-token` para inspecionar
3. Limpe credenciais e tente novamente
4. Reporte com screenshot dos logs
