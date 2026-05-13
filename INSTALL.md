# 📱 Instalação - Frontend Marepe

## Dependências Instaladas

Foram adicionadas as seguintes dependências:

```json
{
  "@supabase/supabase-js": "^2.x",
  "@gorhom/bottom-sheet": "^4.x",
  "react-native-maps": "^1.x",
  "axios": "^1.x"
}
```

## Configuração

### 1. Variáveis de Ambiente

Criar arquivo `.env` na raiz do projeto:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Configurar BottomSheet

Adicionar no `app/_layout.tsx`:

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* ... resto do código */}
    </GestureHandlerRootView>
  );
}
```

### 3. Configurar React Native Maps (opcional, se usar mapa)

#### Android
No `android/app/src/main/AndroidManifest.xml`:

```xml
<application>
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
</application>
```

#### iOS
No `ios/Podfile`:

```ruby
# Uncomment the next line if you're using Swift or would like to use dynamic frameworks
# use_frameworks!
```

Executar: `cd ios && pod install`

## Executar

```bash
npm start
# ou
npx expo start
```

Pressione:
- `a` para Android
- `i` para iOS
- `w` para Web

## Componentes Criados

### Fluxo do Cliente

- **`FluxoPedidoCliente.tsx`** - Componente principal que integra:
  - Botão "Pedir"
  - BottomSheet de seleção de categorias
  - Modal "Aguardando confirmação"
  - Realtime listeners
  - Validações ALT01, ALT02, EX01

### Fluxo do Ambulante

- **`FluxoPedidoAmbulante.tsx`** - Componente principal que integra:
  - Badge de notificação
  - Fila FIFO
  - Modal de pedido
  - Botões Aceitar/Negar
  - Realtime listeners
  - Validação EX01

### Componentes Auxiliares

- `BottomSheetCategorias.tsx` - Bottom sheet para selecionar categorias
- `ModalAguardandoConfirmacao.tsx` - Modal de espera do cliente
- `ModalPedidoAmbulante.tsx` - Modal de pedido do ambulante
- `Toast.tsx` - Notificações toast

### Hooks

- `useRealtimePedidoCliente.ts` - Escuta eventos do cliente
- `useRealtimePedidoAmbulante.ts` - Escuta eventos do ambulante

### Services

- `api.ts` - Cliente HTTP para comunicação com backend
- `supabase.ts` - Cliente Supabase configurado

## Exemplo de Uso

### Tela do Cliente

```tsx
import { FluxoPedidoCliente } from '@/components/FluxoPedidoCliente';

export default function TelaCliente() {
  const ambulante = {
    id: 'uuid-ambulante',
    nome: 'João Vendedor',
    foto: 'https://...',
    categorias: [
      { id: '1', nome_categoria: 'Bebidas' },
      { id: '2', nome_categoria: 'Lanches' },
    ],
  };

  return (
    <FluxoPedidoCliente
      clienteId="uuid-cliente"
      ambulante={ambulante}
      onPedidoAceito={() => {
        // Navegar para tela de acompanhamento
        console.log('Pedido aceito!');
      }}
    />
  );
}
```

### Tela do Ambulante

```tsx
import { FluxoPedidoAmbulante } from '@/components/FluxoPedidoAmbulante';

export default function TelaAmbulante() {
  return (
    <FluxoPedidoAmbulante
      ambulanteId="uuid-ambulante"
      onPedidoAceito={(pedidoId) => {
        // Navegar para MAREPE-173 (tela de acompanhamento)
        console.log('Pedido aceito:', pedidoId);
      }}
    />
  );
}
```

## Features Implementadas

### Cliente (US-019)
- ✅ AC01: Bottom sheet com lista de categorias
- ✅ AC02: Botão "Confirmar pedido" habilitado ao selecionar ≥1 categoria
- ✅ AC03: Fila com horário e id do cliente
- ✅ AC04: Modal "Aguardando confirmação" com timer 60s, posição na fila, botão Cancelar
- ✅ AC05: Cancelamento remove da fila
- ✅ AC06: Pedido negado exibe mensagem 3s
- ✅ AC07: Timer zerado exibe mensagem 3s
- ✅ AC08: Avanço de fila cancela pendentes
- ✅ ALT01: Botão "Pedir" desabilitado se já tem solicitação ativa
- ✅ ALT02: Bottom sheet com "vendedor não cadastrou produtos"
- ✅ EX01: Toast de falha de conexão

### Ambulante (US-020)
- ✅ AC01: Modal com nome, categorias, distância, timer 60s, posição, botões
- ✅ AC02: Ordem FIFO
- ✅ AC03: Negar exibe "Pedido negado" 2s + próximo
- ✅ AC04: Aceitar muda status, pin vermelho, cancela fila
- ✅ AC05: Auto-negação (validado no backend)
- ✅ AC06: Expiração timer 60s
- ✅ ALT01: Fila vazia fecha modal
- ✅ EX01: Toast erro ao aceitar

## Próximos Passos

1. Configurar autenticação e obter tokens
2. Integrar com telas do mapa
3. Implementar US-021 (acompanhamento em tempo real)
4. Adicionar testes unitários
5. Configurar AsyncStorage para persistência
