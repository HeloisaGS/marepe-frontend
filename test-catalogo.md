# 🧪 Teste do Sistema de Catálogo

## Problema Identificado

As categorias não estão sendo salvas quando o usuário clica em "Salvar catálogo" na tela de Vitrine.

## Correções Aplicadas

### Backend

**Arquivo: `app/services/vendedor_service.py`**

Mudanças na função `atualizar_catalogo()`:

**Antes:**
- Usava `UPDATE` global para desativar todas
- Usava `UPSERT` para ativar selecionadas
- Poderia falhar se registros não existissem

**Depois:**
- Busca todas as categorias disponíveis no sistema
- Para cada categoria, verifica se já existe registro
- Se existe: atualiza `is_active` (true ou false)
- Se não existe: insere novo registro com `is_active` correto
- Adiciona logs detalhados para debug

### Frontend

**Arquivo: `app/(ambulante)/(tabs)/vitrine.tsx`**
- Adicionados console.logs na função `salvarCatalogo()`
- Logs mostram IDs sendo enviados e resposta do servidor

**Arquivo: `app/(ambulante)/(tabs)/perfil.tsx`**
- Botão "Alterar categorias" agora navega para tela de Vitrine
- Usa `router.push('/(ambulante)/(tabs)/vitrine')`

## Como Testar

### 1. Testar Backend Diretamente

```bash
# Fazer login e obter token
curl -X POST "http://192.168.0.5:8001/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"suasenha"}'

# Extrair o access_token da resposta

# Listar categorias disponíveis (não precisa de token)
curl -X GET "http://192.168.0.5:8001/vendedor/catalogo/categorias"

# Buscar catálogo atual (precisa de token)
curl -X GET "http://192.168.0.5:8001/vendedor/catalogo" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Atualizar catálogo (precisa de token)
curl -X PUT "http://192.168.0.5:8001/vendedor/catalogo" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "categorias": [
      "5ce55ff2-44b1-4083-9e11-87b42d7f998d",
      "260e0b90-9cb5-430a-b737-65a532208b28"
    ]
  }'
```

### 2. Testar no App

1. **Fazer login** como ambulante
2. **Navegar** para a aba "Vitrine" ou "Meus Produtos"
3. **Selecionar** algumas categorias (elas ficam com fundo laranja)
4. **Clicar** em "Salvar catálogo"
5. **Verificar** no console do Expo:
   ```
   💾 Salvando categorias: [array de IDs]
   ✅ Resposta do servidor: {success: true, ...}
   ```
6. **Recarregar** a tela (pull to refresh ou fechar e abrir)
7. **Verificar** se as categorias selecionadas permaneceram ativas

### 3. Testar Botão no Perfil

1. **Fazer login** como ambulante
2. **Navegar** para a aba "Perfil"
3. **Clicar** no botão "Alterar categorias"
4. **Verificar** se navega para tela de Vitrine
5. **Selecionar** categorias e salvar
6. **Voltar** para o perfil

## Estrutura de Dados

### Request para salvar catálogo

```json
{
  "categorias": [
    "5ce55ff2-44b1-4083-9e11-87b42d7f998d",
    "260e0b90-9cb5-430a-b737-65a532208b28"
  ]
}
```

### Response de sucesso

```json
{
  "success": true,
  "message": "Catálogo atualizado com sucesso"
}
```

### Tabela `vendedor_catalogo` (Supabase)

```
id_vendedor | id_categoria | is_active
------------|-------------|----------
user-uuid   | cat-uuid-1  | true
user-uuid   | cat-uuid-2  | true
user-uuid   | cat-uuid-3  | false
user-uuid   | cat-uuid-4  | false
```

## Logs Esperados no Backend

```
INFO | Atualizando catálogo para user: xxx, categorias: [...]
INFO | Categorias disponíveis no sistema: [...]
INFO | Processando categoria xxx: is_active=True
INFO | Categoria xxx atualizada
INFO | Processando categoria yyy: is_active=False
INFO | Categoria yyy inserida
INFO | Catálogo atualizado com sucesso para user xxx
```

## Troubleshooting

### Categorias não ficam salvas
- ✅ Verificar logs no console do Expo
- ✅ Verificar logs no terminal do backend
- ✅ Verificar se token está sendo enviado corretamente
- ✅ Verificar tabela `vendedor_catalogo` no Supabase

### Erro 401 Unauthorized
- Token expirado ou inválido
- Fazer logout e login novamente

### Erro 500 Internal Server Error
- Verificar logs do backend
- Pode ser problema de conexão com Supabase
- Pode ser problema de estrutura de tabela

### Botão "Alterar categorias" não funciona
- ✅ Corrigido - agora navega para tela de Vitrine
- Usar `router.push('/(ambulante)/(tabs)/vitrine')`

## Checklist de Validação

- [ ] Backend está rodando (porta 8001)
- [ ] Endpoint GET `/vendedor/catalogo/categorias` retorna lista de categorias
- [ ] Endpoint GET `/vendedor/catalogo` retorna catálogo do vendedor
- [ ] Endpoint PUT `/vendedor/catalogo` aceita array de UUIDs
- [ ] Frontend envia token no header Authorization
- [ ] Tela de Vitrine carrega categorias disponíveis
- [ ] Tela de Vitrine mostra categorias já selecionadas
- [ ] Ao clicar em categoria, estado local é atualizado (fundo laranja)
- [ ] Ao clicar em "Salvar catálogo", request é enviado
- [ ] Alert de sucesso é exibido
- [ ] Ao recarregar tela, categorias salvas permanecem ativas
- [ ] Botão no perfil navega para tela de Vitrine

## Arquivos Modificados

1. `app/services/vendedor_service.py` - Lógica de salvamento melhorada
2. `app/(ambulante)/(tabs)/vitrine.tsx` - Logs adicionados
3. `app/(ambulante)/(tabs)/perfil.tsx` - Botão com navegação
