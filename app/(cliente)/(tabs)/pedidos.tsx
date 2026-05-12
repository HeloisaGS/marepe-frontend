import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';

export default function Pedidos() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Pedidos - cliente
      </Text>
    </View>
  );
}