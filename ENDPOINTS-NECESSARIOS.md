# 🔌 Endpoints Necessários no Backend

## ⚠️ Endpoints Faltando para Produtos

A funcionalidade de **gerenciamento de produtos (cardápio)** do ambulante requer os seguintes endpoints no backend:

---

### 1. **Listar Produtos do Vendedor**

```http
GET /vendedor/produtos
Authorization: Bearer {token}
```

**Resposta esperada (200):**
```json
[
  {
    "id": "uuid",
    "nome": "Água de Coco Gelada",
    "preco": 5.00,
    "descricao": "Água de coco natural gelada",
    "categoria_id": "uuid-categoria", // opcional
    "disponivel": true,
    "created_at": "2026-06-01T10:00:00Z"
  }
]
```

---

### 2. **Criar Produto**

```http
POST /vendedor/produtos
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "Água de Coco Gelada",
  "preco": 5.00,
  "descricao": "Água de coco natural gelada", // opcional
  "categoria_id": "uuid-categoria" // opcional
}
```

**Resposta (201):**
```json
{
  "id": "uuid",
  "nome": "Água de Coco Gelada",
  "preco": 5.00,
  "descricao": "Água de coco natural gelada",
  "categoria_id": "uuid-categoria",
  "disponivel": true,
  "created_at": "2026-06-01T10:00:00Z"
}
```

---

### 3. **Atualizar Produto**

```http
PUT /vendedor/produtos/{produto_id}
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "Água de Coco Gelada Premium",
  "preco": 6.00,
  "descricao": "Água de coco natural gelada - tamanho grande",
  "categoria_id": "uuid-categoria"
}
```

**Resposta (200):**
```json
{
  "id": "uuid",
  "nome": "Água de Coco Gelada Premium",
  "preco": 6.00,
  "descricao": "Água de coco natural gelada - tamanho grande",
  "categoria_id": "uuid-categoria",
  "disponivel": true,
  "updated_at": "2026-06-01T11:00:00Z"
}
```

---

### 4. **Deletar Produto**

```http
DELETE /vendedor/produtos/{produto_id}
Authorization: Bearer {token}
```

**Resposta (204):** No content

**OU Resposta (200):**
```json
{
  "message": "Produto deletado com sucesso"
}
```

---

### 5. **Toggle Disponibilidade**

```http
PATCH /vendedor/produtos/{produto_id}/toggle
Authorization: Bearer {token}
```

**Resposta (200):**
```json
{
  "id": "uuid",
  "disponivel": false
}
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `produtos`

```sql
CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendedor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL CHECK (preco > 0),
    descricao TEXT,
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    disponivel BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_produtos_vendedor ON produtos(vendedor_id);
CREATE INDEX idx_produtos_disponivel ON produtos(disponivel);
```

---

## 📝 Regras de Negócio

1. **Autenticação:**
   - Todos os endpoints requerem token JWT válido
   - Vendedor só pode gerenciar seus próprios produtos

2. **Validações:**
   - `nome`: obrigatório, 3-255 caracteres
   - `preco`: obrigatório, maior que 0
   - `descricao`: opcional, máximo 1000 caracteres
   - `categoria_id`: opcional, deve existir na tabela categorias

3. **Disponibilidade:**
   - Produtos indisponíveis não aparecem no cardápio do cliente
   - Toggle permite ativar/desativar rapidamente

4. **Soft Delete (recomendado):**
   - Considere usar `deleted_at` ao invés de DELETE físico
   - Mantém histórico de pedidos

---

## 🔗 Endpoint Relacionado (já existe)

### **Cliente - Buscar Cardápio do Vendedor**

```http
GET /cliente/ambulante/{ambulante_id}/cardapio
Authorization: Bearer {token}
```

**Resposta (200):**
```json
[
  {
    "id": "uuid",
    "nome": "Água de Coco Gelada",
    "preco": 5.00,
    "descricao": "Água de coco natural gelada",
    "disponivel": true
  }
]
```

**Notas:**
- Este endpoint já existe e funciona
- Deve retornar apenas produtos com `disponivel = true`
- Deve filtrar por `vendedor_id = ambulante_id`

---

## 🚀 Prioridade de Implementação

### Alta (necessário para o app funcionar):
1. ✅ POST `/vendedor/produtos` - Criar produto
2. ✅ GET `/vendedor/produtos` - Listar meus produtos
3. ✅ PUT `/vendedor/produtos/{id}` - Atualizar produto
4. ✅ DELETE `/vendedor/produtos/{id}` - Deletar produto

### Média (melhora UX):
5. ✅ PATCH `/vendedor/produtos/{id}/toggle` - Toggle disponibilidade

### Baixa (futuro):
- Upload de fotos de produtos
- Ordenação customizada
- Produtos em destaque
- Limites de estoque

---

## 📞 Status Atual

- ❌ **Endpoints NÃO implementados** no backend
- ✅ **Frontend PRONTO** e esperando backend
- ⏳ **Tela de produtos desabilitada temporariamente**

**Arquivos frontend prontos:**
- `app/(ambulante)/(tabs)/produtos.tsx` - Tela completa
- `services/cardapioService.js` - Service com todos os métodos
- `components/CategoryFilter.tsx` - Filtro de categorias

---

## 🧪 Testar Endpoints

Quando implementados, testar com:

```bash
# 1. Login e obter token
curl -X POST https://api.marepe.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ambulante@test.com","password":"senha123"}'

# 2. Criar produto
curl -X POST https://api.marepe.com/vendedor/produtos \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Água de Coco",
    "preco": 5.00,
    "descricao": "Gelada"
  }'

# 3. Listar produtos
curl -X GET https://api.marepe.com/vendedor/produtos \
  -H "Authorization: Bearer SEU_TOKEN"

# 4. Atualizar produto
curl -X PUT https://api.marepe.com/vendedor/produtos/PRODUTO_ID \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Água de Coco Premium",
    "preco": 6.00
  }'

# 5. Toggle disponibilidade
curl -X PATCH https://api.marepe.com/vendedor/produtos/PRODUTO_ID/toggle \
  -H "Authorization: Bearer SEU_TOKEN"

# 6. Deletar produto
curl -X DELETE https://api.marepe.com/vendedor/produtos/PRODUTO_ID \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## ✅ Checklist de Implementação Backend

- [ ] Criar tabela `produtos` no banco
- [ ] Implementar GET `/vendedor/produtos`
- [ ] Implementar POST `/vendedor/produtos`
- [ ] Implementar PUT `/vendedor/produtos/{id}`
- [ ] Implementar DELETE `/vendedor/produtos/{id}`
- [ ] Implementar PATCH `/vendedor/produtos/{id}/toggle`
- [ ] Adicionar validações (nome, preço, etc)
- [ ] Testar autenticação em todos os endpoints
- [ ] Garantir que vendedor só acessa seus produtos
- [ ] Atualizar GET `/cliente/ambulante/{id}/cardapio` para usar tabela produtos
- [ ] Documentar no Swagger
- [ ] Testar integração com frontend
