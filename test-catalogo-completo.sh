#!/bin/bash

# Script de teste completo do sistema de catálogo
# Execute com: bash test-catalogo-completo.sh

API_URL="http://192.168.0.5:8001"

echo "🧪 Teste Completo do Sistema de Catálogo"
echo "=========================================="
echo ""

# Passo 1: Listar categorias disponíveis
echo "1️⃣ Listando categorias disponíveis..."
curl -s -X GET "$API_URL/vendedor/catalogo/categorias" | python -m json.tool
echo ""
echo ""

# Passo 2: Login (você precisa substituir com suas credenciais)
echo "2️⃣ Faça login primeiro para obter o token:"
echo ""
echo "curl -X POST \"$API_URL/auth/login\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\":\"seu@email.com\",\"password\":\"suasenha\"}'"
echo ""
echo "Cole o access_token abaixo:"
read -r TOKEN
echo ""

if [ -z "$TOKEN" ]; then
    echo "❌ Token não fornecido. Saindo..."
    exit 1
fi

# Passo 3: Buscar catálogo atual
echo "3️⃣ Buscando catálogo atual do vendedor..."
curl -s -X GET "$API_URL/vendedor/catalogo" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo ""
echo ""

# Passo 4: Atualizar catálogo
echo "4️⃣ Atualizando catálogo (selecionando Milho e Queijo)..."
curl -s -X PUT "$API_URL/vendedor/catalogo" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categorias": [
      "5ce55ff2-44b1-4083-9e11-87b42d7f998d",
      "260e0b90-9cb5-430a-b737-65a532208b28"
    ]
  }' | python -m json.tool
echo ""
echo ""

# Passo 5: Verificar se foi salvo
echo "5️⃣ Verificando catálogo após atualização..."
curl -s -X GET "$API_URL/vendedor/catalogo" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo ""
echo ""

echo "✅ Teste completo!"
echo ""
echo "📝 Notas:"
echo "- As categorias com is_active: true são as que você selecionou"
echo "- As categorias com is_active: false não estão selecionadas"
echo "- No app, apenas as categorias ativas devem aparecer com fundo laranja"
