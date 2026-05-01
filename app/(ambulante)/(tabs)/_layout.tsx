import { Tabs } from 'expo-router';

export default function TabsAmbulanteLayout() {
  return (
    <Tabs screenOptions={{
      tabBarStyle: { backgroundColor: '#E95822' }, 
      tabBarActiveTintColor: '#FFF',
    }}>
      <Tabs.Screen name="index" options={{ title: 'Mapa' }} />
      <Tabs.Screen name="vitrine" options={{ title: 'Vitrine' }} />
      <Tabs.Screen name="bateria" options={{ title: 'Bateria' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}