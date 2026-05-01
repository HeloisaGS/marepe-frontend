import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';

export default function Perfil() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Perfil - ambulante
      </Text>
    </View>
  );
}