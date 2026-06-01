// app/(ambulante)/_layout.tsx
import { Stack } from 'expo-router';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function AmbulanteLayout() {
  return (
    <ProtectedRoute requiredRole="AMBULANTE">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ProtectedRoute>
  );
}