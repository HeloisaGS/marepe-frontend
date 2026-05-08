import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsBarracaLayout() {
  return (
    <Tabs screenOptions={{
      tabBarStyle: { backgroundColor: '#E95822' }, 
      tabBarActiveTintColor: '#FFF', 
      tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)', 
      headerShown: false,
      
    }}>
      <Tabs.Screen name="index" 
        options={{ 
          title: 'Mapa',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map-marker" size={size} color={color} />
          )
        }} />
      <Tabs.Screen name="estabelecimento" 
        options={{ 
          title: 'Estabelecimento',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="folder" size={size} color={color} />
          )
        }} />
      <Tabs.Screen name="associados" 
        options={{ 
          title: 'Associados',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          )
           }} />
      <Tabs.Screen name="perfil" 
        options={{ 
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-outline" size={size} color={color} />
          )
          }} />
    </Tabs>
  );
}