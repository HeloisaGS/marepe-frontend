# 🚀 Como Iniciar o Backend

## Passo a Passo

### 1. Navegar até o diretório do backend
```bash
cd C:\Users\Valcann\Downloads\marepe\marepe-backend
```

### 2. Verificar se existe ambiente virtual Python
```bash
# Verificar se existe a pasta venv
dir venv
# ou
ls venv
```

### 3. Ativar o ambiente virtual (se existir)

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
.\venv\Scripts\activate.bat
```

**Git Bash / Linux / Mac:**
```bash
source venv/bin/activate
```

### 4. Instalar dependências (primeira vez ou se houver mudanças)
```bash
pip install -r requirements.txt
```

### 5. Verificar arquivo .env
```bash
# Verificar se existe arquivo .env
type .env     # Windows CMD
cat .env      # Git Bash / Linux / Mac

# Deve conter pelo menos:
# SUPABASE_URL=https://ixfpjbrfglpbnhwinrsp.supabase.co
# SUPABASE_KEY=sua-chave-supabase
```

### 6. Iniciar o servidor
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

**Saída esperada:**
```
INFO:     Will watch for changes in these directories: ['C:\\Users\\Valcann\\Downloads\\marepe\\marepe-backend']
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [67890]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 7. Testar se está funcionando

**Opção 1: No navegador**
```
http://192.168.0.5:8001/
```

**Opção 2: Com curl**
```bash
curl http://192.168.0.5:8001/
```

**Opção 3: Script de teste (do frontend)**
```bash
cd C:\Users\Valcann\Downloads\marepe-frontend
node test-profile.js
```

### 8. Acessar documentação da API
```
http://192.168.0.5:8001/docs
```

## ⚠️ Troubleshooting

### Erro: "uvicorn: command not found"
**Solução:**
```bash
# Instalar uvicorn
pip install uvicorn

# Ou instalar todas as dependências
pip install -r requirements.txt
```

### Erro: "No module named 'app'"
**Solução:**
```bash
# Certifique-se de estar no diretório correto
cd C:\Users\Valcann\Downloads\marepe\marepe-backend

# O diretório deve conter a pasta 'app' com main.py
dir app\main.py    # Windows
ls app/main.py     # Linux/Mac
```

### Erro: "Port 8001 is already in use"
**Solução:**
```bash
# Encontrar processo usando a porta (Windows)
netstat -ano | findstr :8001

# Matar o processo (substitua PID pelo número encontrado)
taskkill /PID <PID> /F

# Ou use outra porta
uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
# (Lembre de atualizar o .env do frontend)
```

### Erro: "Supabase connection failed"
**Solução:**
```bash
# Verificar se as variáveis de ambiente estão corretas
type .env    # Windows
cat .env     # Linux/Mac

# Deve conter:
# SUPABASE_URL=https://ixfpjbrfglpbnhwinrsp.supabase.co
# SUPABASE_KEY=sua-chave-anon-key

# Se não existir, criar arquivo .env na raiz do projeto backend
```

### Erro: Firewall bloqueia conexões
**Solução (Windows):**
1. Painel de Controle
2. Sistema e Segurança
3. Firewall do Windows Defender
4. Configurações avançadas
5. Regras de Entrada
6. Nova Regra
7. Tipo: Porta
8. Porta TCP específica: 8001
9. Permitir a conexão
10. Aplicar para todos os perfis

## 🔄 Scripts Úteis

### Windows (criar arquivo `start-backend.bat`)
```batch
@echo off
cd C:\Users\Valcann\Downloads\marepe\marepe-backend
call .\venv\Scripts\activate.bat
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
pause
```

### Linux/Mac (criar arquivo `start-backend.sh`)
```bash
#!/bin/bash
cd ~/Downloads/marepe/marepe-backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Tornar executável:
```bash
chmod +x start-backend.sh
./start-backend.sh
```

## 📊 Verificar Status

**Enquanto o backend estiver rodando, você verá:**
```
INFO:     192.168.0.5:xxxxx - "GET /profile/my-profile HTTP/1.1" 200 OK
```

**Cada requisição do frontend aparecerá nos logs:**
- `200` = Sucesso
- `401` = Não autorizado (token inválido)
- `404` = Não encontrado
- `500` = Erro interno do servidor

## 🛑 Parar o Backend

**No terminal onde está rodando:**
```
Ctrl + C
```

## 📝 Checklist antes de rodar o frontend

- [ ] Backend está rodando (uvicorn)
- [ ] Porta 8001 está aberta
- [ ] Teste de conectividade passou (curl ou node test-profile.js)
- [ ] Documentação da API acessível em /docs
- [ ] Logs do backend aparecem no terminal
- [ ] Sem erros de conexão com Supabase

Agora você pode iniciar o frontend:
```bash
cd C:\Users\Valcann\Downloads\marepe-frontend
npx expo start -c
```
