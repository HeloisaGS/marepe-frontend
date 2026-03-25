import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack initialRouteName="cadastro/index"> {/* AQUI MUDA AS TELAS QUE TÔ VENDO*/}
      {/* Rotas para telas de cadastro */}
      <Stack.Screen name="cadastro/index" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro/cadastro-vendedor" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro/cadastro-cliente" options={{ headerShown: false }} />
      {/* Rotas para telas inicial e de login */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      {/* Rotas para esqueceu senha */}
      <Stack.Screen name="recuperacao-senha/index" options={{ headerShown: false }} />
      <Stack.Screen name="recuperacao-senha/nova-senha" options={{ headerShown: false }} />
      {/* Rotas para token */}
      <Stack.Screen name="verificar-token" options={{ headerShown: false }} />
    </Stack>
  );
}