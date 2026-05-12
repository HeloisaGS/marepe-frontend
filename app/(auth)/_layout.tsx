import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack initialRouteName="index"> {/* AQUI MUDA AS TELAS QUE TÔ VENDO*/}
      {/* Rotas para telas de cadastro */}
      <Stack.Screen name="cadastro/index" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro/cadastro-ambulante" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro/cadastro-barraqueiro" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro/cadastro-cliente" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro/sucesso-cadastro" options={{ headerShown: false }} />
      {/* Rotas para telas inicial e de login */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      {/* Rotas para pedir localização */}
      <Stack.Screen name="sucesso" options={{ headerShown: false }} />
      <Stack.Screen name="bloqueio-localizacao" options={{ headerShown: false }} />
      {/* Rotas para esqueceu senha */}
      <Stack.Screen name="recuperacao-senha/index" options={{ headerShown: false }} />
      <Stack.Screen name="recuperacao-senha/nova-senha" options={{ headerShown: false }} />
      {/* Rotas para token */}
      <Stack.Screen name="verificar-token" options={{ headerShown: false }} />
      <Stack.Screen name="termos"  />
    </Stack>
  );
}