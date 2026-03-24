import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';

export default function CadastroEscolha() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Tela de Cadastro 
      </Text>

      <Button
        title="Ir para login"
        onPress={() => router.push('/login')}
      />

      <Button
        title="Ir para home (tabs)"
        onPress={() => router.push('/(tabs)')}
      />
    </View>
  );
}