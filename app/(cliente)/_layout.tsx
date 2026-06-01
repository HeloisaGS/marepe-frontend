// app/(cliente)/_layout.tsx
import { Stack } from 'expo-router';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function ClienteLayout() {
  return (
    <ProtectedRoute requiredRole="CLIENTE">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="cardapio-modal" />
      </Stack>
    </ProtectedRoute>
  );
}