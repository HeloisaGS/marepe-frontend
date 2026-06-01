import { Stack } from 'expo-router';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function BarracaLayout() {
  return (
    <ProtectedRoute requiredRole="BARRAQUEIRO">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ProtectedRoute>
  );
}