import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsBarracaLayout() {
  return (
    <Tabs screenOptions={{
      tabBarStyle: { backgroundColor: '#E95822' }, 
      tabBarActiveTintColor: '#FFF',
    }}>
      <Tabs.Screen name="index" options={{ title: 'Mapa' }} />
      <Tabs.Screen name="estabelecimentos" options={{ title: 'Estabelecimentos' }} />
      <Tabs.Screen name="associados" options={{ title: 'Associados' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}