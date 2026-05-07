import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Switch, 
  Platform, 
  UIManager, 
  LayoutAnimation,
  Modal,
  Alert, 
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeAmbulante() {
  const [isAtivo, setIsAtivo] = useState(false);
  const [expandido, setExpandido] = useState(true);
  const [modalPermissaoVisivel, setModalPermissaoVisivel] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  // para localização
  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);
  const [gpsRuim, setGpsRuim] = useState(false); 

  const alternarCard = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandido(!expandido);
  };

  const iniciarTracking = async () => {
    // Limpa qualquer rastro anterior para não bugar
    if (subscription) subscription.remove();

    const sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 30000, // 30 segundos 
        distanceInterval: 0, // ou 10 metros
      },
      (newLocation) => {
        setLocation(newLocation);
        
        // Lógica da Barra Amarela (Tarefa 3)
        const precisao = newLocation.coords.accuracy || 0;
        setGpsRuim(precisao > 50);

        console.log("Coordenada capturada:", newLocation.coords.latitude);
      }
    );
    setSubscription(sub);
  };

  //  online/off
  const gerenciarStatusPraia = async (querFicarOnline: boolean) => {
    if (querFicarOnline) {
      // verifica se ele já tem a permissão de Background
      const bg = await Location.getBackgroundPermissionsAsync();
      
      if (bg.status === 'granted') {
        // ja tem - modal
        setIsAtivo(true); 
        iniciarTracking();
      } else {
        // se não tem SEMPRE abre o modal explicativo primeiro
        setModalPermissaoVisivel(true); 
      }
    } else {
      // Se ele clicar em "Não estou na praia", desliga a chave.
      setIsAtivo(false);
      if (subscription) {
        subscription.remove();
        setSubscription(null);
      }
      setGpsRuim(false);
    }
  };

 // botao entendi do modal, que chama a permissão nativa do celular
  const aceitarModalEPermitir = () => {
    setModalPermissaoVisivel(false);
    
    setTimeout(async () => {
      try {
        
        const fgStatus = await Location.requestForegroundPermissionsAsync();
        
        if (fgStatus.status !== 'granted') {
          Alert.alert("Ops!", "Precisamos da permissão básica para continuar.");
          return;
        }

        // Chama a permissão nativa de Background (O tempo todo)
        let bgResponse = await Location.requestBackgroundPermissionsAsync();
        
        if (bgResponse.status === 'granted') {
          // permitiu o tempo todo- acende o toggle.
          setIsAtivo(true);
        } else {
          // negado
          if (!bgResponse.canAskAgain) {
            // O celular bloqueou o popup de aparecer. Levamos ele paras Configurações do Android/iOS.
            Alert.alert(
              "Ação Necessária", 
              "Seu celular bloqueou o aviso de GPS. Para trabalhar com a tela bloqueada, vá em Configurações > Permissões > Localização e escolha 'Permitir o tempo todo'.",
              [
                { text: "Cancelar", style: "cancel" },
                { text: "Abrir Configurações", onPress: () => Linking.openSettings() }
              ]
            );
            
            setIsAtivo(true); 
          } else {
            // O popup abriu e ele escolheu apenas "Durante o uso"
            Alert.alert(
              "Atenção", 
              "Como você escolheu 'Durante o uso', seu rastreio vai parar se bloquear a tela do celular."
            );
            setIsAtivo(true); 
          }
        }
        
      } catch (error) {
        console.log("Erro no popup nativo de permissão:", error);
        // Fallback
        setIsAtivo(true);
      }
    }, 500); 
  };

  
  useEffect(() => {
  (async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permissão negada", "Precisamos do acesso ao GPS para mostrar sua posição.");
      return;
    }

    let locationActual = await Location.getCurrentPositionAsync({});
    setLocation(locationActual);
  })();
}, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Container do Mapa */}
      <View style={{ flex: 1 }}> 
        {/* 1. O MAPA (Ocupa tudo) */}
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          showsUserLocation={true}
          region={{
            latitude: location ? location.coords.latitude : -8.0631,
            longitude: location ? location.coords.longitude : -34.8711,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          {location && (
            <Marker
              coordinate={{ 
                latitude: location.coords.latitude, 
                longitude: location.coords.longitude 
              }}
              title="Minha Localização"
            >
              <MaterialCommunityIcons name="map-marker-account" size={35} color="#E05A3D" />
            </Marker>
          )}
        </MapView>

        {/* 2. A BARRA (Dentro da View do mapa, mas DEPOIS do MapView) */}
        {gpsRuim && (
          <View style={styles.barraAlertaAmarela}>
            <MaterialCommunityIcons name="alert" size={16} color="#856404" />
            <Text style={styles.textoAlerta}>Sinal de GPS fraco. Aproxime-se do mar.</Text>
          </View>
        )}
      </View>
      {/* modal*/}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalPermissaoVisivel}
        onRequestClose={() => setModalPermissaoVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconeModalContainer}>
              <MaterialCommunityIcons name="map-marker-radius" size={40} color="#E05A3D" />
            </View>
            <Text style={styles.modalTitulo}>Seja visto no mapa!</Text>
            <Text style={styles.modalTexto}>
              Para que os banhistas te encontrem na praia, o MaréPE precisa acessar sua localização. 
              {'\n\n'}
              No próximo passo, clique em <Text style={{fontWeight: 'bold'}}>"Permitir o tempo todo"</Text> para o rastreio não parar quando você bloquear a tela.
            </Text>
            <View style={styles.modalBotoes}>
              <TouchableOpacity 
                style={[styles.btnModal, styles.btnCancelar]} 
                onPress={() => setModalPermissaoVisivel(false)}
              >
                <Text style={styles.txtBtnCancelar}>Agora Não</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.btnModal, styles.btnConfirmar]} 
                onPress={aceitarModalEPermitir} // Chama a função com o delay corretivo
              >
                <Text style={styles.txtBtnConfirmar}>Entendi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* card */}
      <View style={styles.bottomCard}>
        <TouchableOpacity activeOpacity={0.8} onPress={alternarCard} style={styles.areaArrasto}>
          <View style={styles.dragIndicator} />
          <View style={styles.cabecalhoCard}>
            <Text style={styles.tituloCard}>Rastreamento de GPS ativo</Text>
            <MaterialCommunityIcons name={expandido ? "chevron-down" : "chevron-up"} size={24} color="#000" />
          </View>
        </TouchableOpacity>

        <View style={styles.statusContainer}>
          <Text style={styles.subtituloCard}>
            {isAtivo ? 'Clientes podem te encontrar' : 'Clientes não podem te encontrar'}
          </Text>
          
          {/* toggle */}
          <Switch
            value={isAtivo}
            onValueChange={(valor) => gerenciarStatusPraia(valor)}
            trackColor={{ false: '#D4D4D4', true: '#E05A3D' }}
            thumbColor={'#fff'}
            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
          />
        </View>

        {expandido && (
          <View>
            {!isAtivo ? (
              // Botão para ATIVAR
              <TouchableOpacity 
                style={[styles.botaoPadrao, { backgroundColor: '#E05A3D' }]} 
                activeOpacity={0.8}
                onPress={() => gerenciarStatusPraia(true)} 
              >
                <Text style={styles.textoBotaoPadrao}>Estou na praia!</Text>
              </TouchableOpacity>
            ) : (
              // Botão para DESATIVAR
              <TouchableOpacity 
                style={[styles.botaoPadrao, { backgroundColor: '#115D77' }]} 
                activeOpacity={0.8}
                onPress={() => gerenciarStatusPraia(false)}
              >
                <Text style={styles.textoBotaoPadrao}>Não estou na praia!</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.botaoPadrao, { backgroundColor: '#115D77', marginTop: 15 }]} 
              activeOpacity={0.8} onPress={()=> gerenciarStatusPraia(false)}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconeModalContainer: {
    backgroundColor: '#FEEDE9', 
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalTexto: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  modalBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  btnModal: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnCancelar: {
    backgroundColor: '#F5F5F5',
    marginRight: 10,
  },
  btnConfirmar: {
    backgroundColor: '#E05A3D',
    marginLeft: 10,
  },
  txtBtnCancelar: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  txtBtnConfirmar: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
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

  // Mapas e notificações
  barraAlertaAmarela: {
  position: 'absolute',
  top: 10,
  left: 20,
  right: 20,
  backgroundColor: '#FFF3CD',
  padding: 10,
  borderRadius: 8,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: '#FFEEBA',
  elevation: 3,
},
textoAlerta: {
  color: '#856404',
  fontSize: 12,
  fontWeight: '600',
  marginLeft: 8,
},

});