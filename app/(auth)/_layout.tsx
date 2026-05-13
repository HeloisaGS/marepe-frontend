import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
      {/* Rotas para telas de cadastro */}
      <Stack.Screen name="cadastro/index" />
      <Stack.Screen name="cadastro/cadastro-ambulante" />
      <Stack.Screen name="cadastro/cadastro-barraqueiro" />
      <Stack.Screen name="cadastro/cadastro-cliente" />
      <Stack.Screen name="cadastro/sucesso-cadastro" />
      {/* Rotas para telas inicial e de login */}
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      {/* Rotas para pedir localização */}
      <Stack.Screen name="sucesso" />
      <Stack.Screen name="bloqueio-localizacao" />
      {/* Rotas para esqueceu senha */}
      <Stack.Screen name="recuperacao-senha/index" />
      <Stack.Screen name="recuperacao-senha/nova-senha" />
      {/* Rotas para token */}
      <Stack.Screen name="verificar-token" />
      <Stack.Screen name="termos" options={{ headerShown: true, title: 'Termos de Uso' }} />
    </Stack>
  );
}