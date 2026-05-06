import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Switch, 
  Platform, 
  UIManager, 
  LayoutAnimation 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';


if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeAmbulante() {
  const [isAtivo, setIsAtivo] = useState(false);
  
  
  const [expandido, setExpandido] = useState(true);

  
  const alternarCard = () => {
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandido(!expandido);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      
      <View style={{ flex: 1 }} />

      <View style={styles.bottomCard}>
        
        
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={alternarCard} 
          style={styles.areaArrasto}
        >
          <View style={styles.dragIndicator} />
          
          <View style={styles.cabecalhoCard}>
            <Text style={styles.tituloCard}>Rastreamento de GPS ativo</Text>
            
            <MaterialCommunityIcons 
              name={expandido ? "chevron-down" : "chevron-up"} 
              size={24} 
              color="#000" 
            />
          </View>
        </TouchableOpacity>

        <View style={styles.statusContainer}>
          <Text style={styles.subtituloCard}>
            {isAtivo ? 'Clientes podem te encontrar' : 'Clientes não podem te encontrar'}
          </Text>
          
          {isAtivo && (
            <Switch
              value={isAtivo}
              onValueChange={setIsAtivo}
              trackColor={{ false: '#ccc', true: '#E05A3D' }}
              thumbColor={'#fff'}
              style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
            />
          )}
        </View>

        
        {expandido && (
          <View>
            {!isAtivo ? (
              <TouchableOpacity 
                style={[styles.botaoPadrao, { backgroundColor: '#E05A3D' }]} 
                activeOpacity={0.8}
                onPress={() => setIsAtivo(true)}
              >
                <Text style={styles.textoBotaoPadrao}>Estou na praia!</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.botaoPadrao, { backgroundColor: '#115D77' }]} 
                activeOpacity={0.8}
                onPress={() => setIsAtivo(false)}
              >
                <Text style={styles.textoBotaoPadrao}>Não estou na praia!</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.botaoPadrao, { backgroundColor: '#115D77', marginTop: 15 }]} 
              activeOpacity={0.8}
            >
              <View style={styles.btnConteudo}>
                <MaterialCommunityIcons name="pause" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.textoBotaoPadrao}>Pausar visibilidade</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3DAB8', 
    justifyContent: 'flex-end', 
  },
  bottomCard: {
    backgroundColor: '#EBE3CC',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20, 
    paddingTop: 10, 
    paddingBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 }, 
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden', 
  },
  areaArrasto: {
    alignItems: 'center',
    paddingBottom: 15,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#666', 
    borderRadius: 2,
    marginBottom: 15,
    marginTop: 5,
  },
  cabecalhoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  tituloCard: {
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#000',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    height: 30, 
  },
  subtituloCard: {
    fontSize: 14,
    color: '#444', 
  },
  botaoPadrao: {
    padding: 18, 
    borderRadius: 10, 
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  btnConteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoPadrao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18, 
  },
});