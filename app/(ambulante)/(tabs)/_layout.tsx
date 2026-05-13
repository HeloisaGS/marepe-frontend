import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsAmbulanteLayout() {
  return (
    <Tabs 
      screenOptions={{
        tabBarStyle: { 
          backgroundColor: '#E95822', 
           
        }, 
        tabBarActiveTintColor: '#FFF', 
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)', 
        headerShown: false,
        
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Mapa',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map-marker" size={size} color={color} />
          )
        }} 
      />
      <Tabs.Screen
        name="pedidos"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-list-outline" size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="vitrine"
        options={{
          title: 'Vitrine',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="folder-outline" size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="bateria"
        options={{
          title: 'Bateria',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="moon-waning-crescent" size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen 
        name="perfil" 
        options={{ 
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-outline" size={size} color={color} />
          )
        }} 
      />
    </Tabs>
  );
}