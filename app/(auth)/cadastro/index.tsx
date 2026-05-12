import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LogoMaré from '../../../assets/images/logo.png'; 

export default function CadastroEscolha() {
  const { emailDigitado } = useLocalSearchParams();
  return (
    <View style={styles.container}>
      {/* Inicío */}
      <Text style={styles.tituloPrincipal}>Parece que você é novo aqui!</Text>
      <Text style={styles.subtitulo}>Como você deseja usar o<Text style={{ fontWeight: 'bold' }}> MaréPE</Text>?</Text>

      {/* Cards*/}
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push({
          pathname: '/(auth)/cadastro/cadastro-cliente',
          params: { emailDigitado: emailDigitado, role: 'CLIENTE' }
        })}
        
      >
        <View style={styles.quadradoColorido}>
          <MaterialCommunityIcons name="account-circle" size={50} color="black" />
        </View>
        
        <View style={styles.containerTexto}>
          <Text style={styles.textoMaior}>Sou banhista e quero criar conta como <Text style={{ fontWeight: 'bold' }}>Cliente</Text>!</Text>
          <Text style={styles.textoMenor}>Usar o aplicativo para encontrar vendedores na praia.</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push({
          pathname: '/(auth)/cadastro/cadastro-ambulante',
          params: { emailDigitado: emailDigitado, role: 'AMBULANTE' }
        })}
      >
        <View style={styles.quadradoColorido}>
          <MaterialCommunityIcons name="walk" size={50} color="black" />
        </View>
        
        <View style={styles.containerTexto}>
          <Text style={styles.textoMaior}>Sou vendedor e quero criar conta como <Text style={{ fontWeight: 'bold' }}>Ambulante</Text>!</Text>
          <Text style={styles.textoMenor}>Para dar visibilidade aos meus produtos na praia.</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push({
          pathname: '/(auth)/cadastro/cadastro-barraqueiro',
          params: { emailDigitado: emailDigitado, role: 'BARRAQUEIRO' }
        })}
      >
        <View style={styles.quadradoColorido}>
          <MaterialCommunityIcons name="umbrella-beach" size={50} color="black" />
        </View>
        
        <View style={styles.containerTexto}>
          <Text style={styles.textoMaior}>Sou vendedor e quero registrar a minha <Text style={{ fontWeight: 'bold' }}>Barraca</Text>!</Text>
          <Text style={styles.textoMenor}>Para aqueles que já tem ponto fixo e buscam segurança</Text>
        </View>
      </TouchableOpacity>

      {/* Navegação para a tela inicial*/}
      <TouchableOpacity style={{ marginTop: 5 }} onPress={() => router.push('/(auth)')}>
        <Text style={{ color: 'red' }}>Alterar e-mail.</Text>
      </TouchableOpacity>

      {/* Imagem assets/images/logo.png*/}
      <View style={styles.containerLogo}>
        <Image source={LogoMaré} style={styles.logo} resizeMode="contain" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  tituloPrincipal: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,

  },
  subtitulo: {
    fontSize: 20,
    color: '#000',
    marginBottom: 30,
  },
  card: {
    flexDirection: 'row', // Alinha ícone e texto lado a lado
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b2a199',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  quadradoColorido: {
    width: 80,
    height: 80,
    backgroundColor: '#F5DBB0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  containerTexto: {
    flex: 1, // Faz o texto ocupar o resto do espaço
  },
  textoMaior: {
    fontSize: 18,
    color: '#000',
  },
  textoMenor: {
    fontSize: 14,
    color: '#555',
  },
  containerLogo: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    height: 120,
  },
});