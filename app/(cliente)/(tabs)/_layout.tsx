import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsClienteLayout() {
  return (
    <Tabs screenOptions={{
      tabBarStyle: { backgroundColor: '#E95822' },
      tabBarActiveTintColor: '#FFF',
      tabBarInactiveTintColor: '#FFF9',
      headerShown: false,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map-marker" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="associar"
        options={{
          title: 'Associar',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-plus" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pedidos"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}