// app/(cliente)/_layout.tsx
import { Stack } from 'expo-router';

export default function BarracaLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" /> 
    </Stack>
  );
}