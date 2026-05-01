import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';

export default function Mapa() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Mapa - barraca
      </Text>
    </View>
  );
}