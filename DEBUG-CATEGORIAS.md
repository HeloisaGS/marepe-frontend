# 🔍 Debug do Sistema de Categorias

## Logs Adicionados

Foram adicionados logs detalhados em todo o fluxo para identificar onde está o problema.

### No Frontend (Console do Expo)

```
📦 Categorias recebidas: [...]           // Categorias disponíveis
📋 Catálogo atual do vendedor: [...]     // Categorias com is_active
✅ IDs selecionados: [...]               // IDs que ficaram ativas após filtro
💾 Salvando categorias: [...]            // IDs sendo enviados para backend
✅ Resposta do servidor: {...}           // Resposta do backend
```

### No Backend (Terminal)

```
[ROUTER] GET /vendedor/catalogo - user_id: xxx
[SERVICE] Buscando categorias para vendedor: xxx
[SERVICE] Total de categorias no sistema: 6
[SERVICE] Categoria xxx: vinculo=[...]
[SERVICE] Retornando 6 categorias, ativas: N
[ROUTER] Retornando 6 categorias

[ROUTER] PUT /vendedor/catalogo - user_id: xxx
[ROUTER] Categorias recebidas: [...]
[SERVICE] Categorias selecionadas (como string): [...]
[SERVICE] Processando categoria xxx: is_active=True
[SERVICE] Inserindo categoria xxx: is_active=True
[ROUTER] Resultado: {...}
```

## Como Reproduzir o Problema

1. **Abra o terminal do backend** e observe os logs
2. **No app**:
   - Login como ambulante
   - Vá para aba "Vitrine"
   - Selecione 2 categorias (exemplo: Peixes e Castanha)
   - Clique "Salvar catálogo"
   - Observe os logs no Expo
3. **No terminal do backend**, você verá:
   - `[ROUTER] PUT /vendedor/catalogo`
   - `[ROUTER] Categorias recebidas: [uuid1, uuid2]`
   - Para cada categoria no sistema (6 no total):
     - `[SERVICE] Processando categoria xxx: is_active=True/False`
     - `[SERVICE] Inserindo/Atualizando categoria xxx`

4. **Recarregue a tela** (pull to refresh ou feche/abra):
   - No Expo verá: `📋 Catálogo atual do vendedor: [...]`
   - No backend verá: `[ROUTER] GET /vendedor/catalogo`
   - Deve retornar as 6 categorias com `is_active: true` nas que selecionou

## Possíveis Causas do Problema

### 1. Tabela `vendedor_catalogo` não existe
**Como verificar:** No Supabase, verifique se a tabela existe

**Estrutura esperada:**
```sql
CREATE TABLE vendedor_catalogo (
  id_vendedor UUID REFERENCES users(id),
  id_categoria UUID REFERENCES catalogo(id),
  is_active BOOLEAN DEFAULT false,
  PRIMARY KEY (id_vendedor, id_categoria)
);
```

### 2. IDs das categorias são diferentes no frontend e backend
**Como verificar:**
- Frontend envia: `"36499e35-def6-47a9-a8d5-7aa7e45e6aa7"`
- Backend espera: mesmo formato UUID

**Logs para comparar:**
```
Frontend: 💾 Salvando categorias: ["36499e35-def6-47a9-a8d5-7aa7e45e6aa7"]
Backend:  [ROUTER] Categorias recebidas: [UUID('36499e35-def6-47a9-a8d5-7aa7e45e6aa7')]
```

### 3. Conversão de UUID está falhando
O backend converte para string antes de salvar:
```python
categoria_id_str = str(categoria_id)  # UUID -> "uuid-string"
```

**Como verificar:** Logs mostrarão o valor exato sendo usado

### 4. Query no Supabase está falhando silenciosamente
**Como verificar:** Os logs mostrarão:
```
[SERVICE] Categoria xxx: vinculo=[]        # Não encontrou
[SERVICE] Categoria xxx: vinculo=[{...}]   # Encontrou
```

## Script de Teste Manual

```bash
# 1. Obter token (faça login no app ou use curl)
TOKEN="seu_token_aqui"

# 2. Verificar categorias disponíveis
curl -X GET "http://192.168.0.5:8001/vendedor/catalogo/categorias"

# 3. Verificar catálogo atual
curl -X GET "http://192.168.0.5:8001/vendedor/catalogo" \
  -H "Authorization: Bearer $TOKEN"

# 4. Salvar categorias (Peixes e Castanha)
curl -X PUT "http://192.168.0.5:8001/vendedor/catalogo" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categorias": [
      "36499e35-def6-47a9-a8d5-7aa7e45e6aa7",
      "13847df9-3733-4126-8049-de2fd43e46c4"
    ]
  }'

# 5. Verificar se foi salvo
curl -X GET "http://192.168.0.5:8001/vendedor/catalogo" \
  -H "Authorization: Bearer $TOKEN"
```

## O Que Esperar nos Logs

### Cenário de Sucesso

**No backend após PUT:**
```
[ROUTER] PUT /vendedor/catalogo - user_id: 9f1e2c26-ba2f-457f-bd7e-4b3785d58d40
[ROUTER] Categorias recebidas: [UUID('36499e35-def6-47a9-a8d5-7aa7e45e6aa7'), UUID('13847df9-3733-4126-8049-de2fd43e46c4')]
[SERVICE] Categorias selecionadas (como string): ['36499e35-def6-47a9-a8d5-7aa7e45e6aa7', '13847df9-3733-4126-8049-de2fd43e46c4']
[SERVICE] Processando categoria 5ce55ff2-44b1-4083-9e11-87b42d7f998d: is_active=False
[SERVICE] Inserindo categoria 5ce55ff2-44b1-4083-9e11-87b42d7f998d: is_active=False
[SERVICE] Processando categoria 36499e35-def6-47a9-a8d5-7aa7e45e6aa7: is_active=True
[SERVICE] Inserindo categoria 36499e35-def6-47a9-a8d5-7aa7e45e6aa7: is_active=True
[SERVICE] Processando categoria 13847df9-3733-4126-8049-de2fd43e46c4: is_active=True
[SERVICE] Inserindo categoria 13847df9-3733-4126-8049-de2fd43e46c4: is_active=True
...
[ROUTER] Resultado: {'success': True, 'message': '...'}
```

**No backend após GET:**
```
[ROUTER] GET /vendedor/catalogo - user_id: 9f1e2c26-ba2f-457f-bd7e-4b3785d58d40
[SERVICE] Buscando categorias para vendedor: 9f1e2c26-ba2f-457f-bd7e-4b3785d58d40
[SERVICE] Total de categorias no sistema: 6
[SERVICE] Categoria 5ce55ff2-44b1-4083-9e11-87b42d7f998d: vinculo=[{'is_active': False}]
[SERVICE] Categoria 36499e35-def6-47a9-a8d5-7aa7e45e6aa7: vinculo=[{'is_active': True}]
[SERVICE] Categoria 13847df9-3733-4126-8049-de2fd43e46c4: vinculo=[{'is_active': True}]
...
[SERVICE] Retornando 6 categorias, ativas: 2
[ROUTER] Retornando 6 categorias
```

## Próximos Passos

1. ✅ **Teste no app** e envie os logs do terminal do backend
2. ✅ **Verifique no Supabase** se os registros estão sendo inseridos na tabela `vendedor_catalogo`
3. ✅ **Compare os UUIDs** - frontend envia, backend recebe, backend salva
4. ✅ Se os logs mostrarem sucesso mas não persistir, problema está no Supabase (permissões RLS)

## Checklist de Validação

- [ ] Terminal do backend está aberto e mostrando logs
- [ ] Logs aparecem quando faz PUT
- [ ] Logs aparecem quando faz GET
- [ ] UUIDs batem entre frontend e backend
- [ ] Tabela `vendedor_catalogo` existe no Supabase
- [ ] RLS (Row Level Security) não está bloqueando INSERT/UPDATE
- [ ] Após reload, GET retorna categorias com is_active correto
