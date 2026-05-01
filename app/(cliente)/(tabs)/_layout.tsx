import { Tabs } from 'expo-router';

export default function TabsClienteLayout() {
  return (
    <Tabs screenOptions={{
      tabBarStyle: { backgroundColor: '#E95822' }, 
      tabBarActiveTintColor: '#FFF',
    }}>
      <Tabs.Screen name="index" options={{ title: 'Mapa' }} />
      <Tabs.Screen name="associar" options={{ title: 'Associar' }} />
      <Tabs.Screen name="pedidos" options={{ title: 'Pedidos' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}