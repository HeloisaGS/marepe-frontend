import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useRouter, useFocusEffect } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../services/axiosApi';
import { barracaService } from '../../../services/barracaService';

interface StaticLocation {
  latitude: number;
  longitude: number;
}

export default function Mapa() {
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [staticLocation, setStaticLocation] = useState<StaticLocation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditingLocation, setIsEditingLocation] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false); 
  const [hasStand, setHasStand] = useState<boolean>(false); 
  const mapRef = useRef<MapView>(null);

  
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permissão negada',
            'A localização é necessária para fixar sua barraca no mapa.'
          );
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCurrentLocation(location);
        setLoading(false);
      } catch (error) {
        console.error('Error getting location:', error);
        setLoading(false);
      }
    })();
  }, []);

  
  useFocusEffect(
    React.useCallback(() => {
      const fetchBarracaDoUsuario = async () => {
        try {
          const profileRes = await api.get('/profile/my-profile');
          const meuVendorId = profileRes.data?.id;

          if (meuVendorId) {
            const response = await barracaService.listarTodasBarracas();
            const listaStands = response.data?.stands || [];

            const minhaBarracaSalva = listaStands.find(
              (stand: any) => stand.vendor_id === meuVendorId
            );

            if (minhaBarracaSalva) {
              setStaticLocation({
                latitude: Number(minhaBarracaSalva.latitude),
                longitude: Number(minhaBarracaSalva.longitude),
              });
              setHasStand(true); 
            } else {
              setHasStand(false);
            }
          }
        } catch (error) {
          console.error('Erro ao buscar coordenadas da barraca:', error);
        }
      };

      fetchBarracaDoUsuario();
    }, [])
  );

  const handleMapPress = (event: any) => {
    if (!isEditingLocation) return;

    const { latitude, longitude } = event.nativeEvent.coordinate;
    setStaticLocation({ latitude, longitude });
    setShowConfirmModal(true);
  };

  const handleConfirmLocation = async () => {
    if (!staticLocation) return;

    if (hasStand) {
      setIsUpdating(true);
      setShowConfirmModal(false);
      try {
        await barracaService.atualizarBarraca(
          staticLocation.latitude,
          staticLocation.longitude
        );
        await AsyncStorage.setItem('@barraca_location', JSON.stringify(staticLocation));
        Alert.alert('Sucesso', 'Localização da barraca atualizada com sucesso!');
      } catch (error: any) {
        Alert.alert('Erro', error.message || 'Erro ao atualizar localização.');
      } finally {
        setIsUpdating(false);
        setIsEditingLocation(false);
      }
    }
    else {
      // Barraca não existe - redireciona para cadastro completo
      setShowConfirmModal(false);
      setIsEditingLocation(false);

      router.push({
        pathname: '/(barraca)/cadastro-barraca',
        params: {
          latitude: staticLocation.latitude,
          longitude: staticLocation.longitude
        }
      });
    }
  };

  const handleRejectLocation = () => {
    setShowConfirmModal(false);
    if (!hasStand) setStaticLocation(null);
  };

  const handleCancelEdit = () => {
    setIsEditingLocation(false);
    if (!hasStand) setStaticLocation(null);
  };

  const centerLocation = staticLocation || (currentLocation
    ? {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      }
    : { latitude: -8.0476, longitude: -34.8770 });

  if (loading || isUpdating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E95822" />
        <Text style={styles.loadingText}>
          {isUpdating ? 'Atualizando localização...' : 'Carregando mapa...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        region={{
          latitude: centerLocation.latitude,
          longitude: centerLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        onPress={handleMapPress}
        showsUserLocation={true}
      >
        {staticLocation && (
          <Marker coordinate={staticLocation}>
            <View style={styles.markerContainer}>
              <MaterialCommunityIcons name="store" size={24} color="#FFF" />
            </View>
          </Marker>
        )}
      </MapView>

      {isEditingLocation && (
        <View style={styles.instructionBanner}>
          <MaterialCommunityIcons name="information" size={20} color="#115D77" />
          <Text style={styles.instructionText}>
            Toque no mapa para mudar o ponto da sua barraca
          </Text>
        </View>
      )}

      <View style={styles.controlPanel}>
        {!isEditingLocation && !hasStand && (
          <>
            <Text style={styles.panelTitle}>Localização da Barraca</Text>
            <Text style={styles.panelSubtitle}>
              Você ainda não fixou a localização da sua barraca no mapa.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setIsEditingLocation(true)}>
              <MaterialCommunityIcons name="map-marker-plus" size={20} color="#FFF" />
              <Text style={styles.primaryButtonText}>Adicionar Barraca</Text>
            </TouchableOpacity>
          </>
        )}

        {isEditingLocation && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
            <Text style={styles.cancelButtonText}>Cancelar Seleção</Text>
          </TouchableOpacity>
        )}

        {hasStand && !isEditingLocation && (
          <>
            <View style={styles.statusContainer}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
              <Text style={styles.statusText}>Localização Fixada</Text>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setIsEditingLocation(true)}>
              <MaterialCommunityIcons name="pencil" size={20} color="#FFF" />
              <Text style={styles.primaryButtonText}>Alterar Localização</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="map-marker-question" size={48} color="#E95822" />
            <Text style={styles.modalTitle}>Deseja mudar a barraca para este local?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonNo} onPress={handleRejectLocation}>
                <Text style={styles.modalButtonTextNo}>Não</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonYes} onPress={handleConfirmLocation}>
                <Text style={styles.modalButtonTextYes}>Sim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 16, color: '#555' },
  map: { flex: 1 },
  markerContainer: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#E95822',
    justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF',
    elevation: 5,
  },
  instructionBanner: {
    position: 'absolute', top: 60, left: 20, right: 20, backgroundColor: '#E0F2FE',
    padding: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', elevation: 3,
  },
  instructionText: { marginLeft: 10, fontSize: 13, color: '#115D77', flex: 1, fontWeight: '500' },
  controlPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF',
    borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25, elevation: 10,
  },
  panelTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 8 },
  panelSubtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  statusContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statusText: { fontSize: 18, fontWeight: 'bold', color: '#10B981', marginLeft: 8 },
  primaryButton: {
    backgroundColor: '#E95822', paddingVertical: 15, borderRadius: 12,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
  },
  primaryButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginLeft: 8 },
  cancelButton: { backgroundColor: '#F3F4F6', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#EF4444' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#FFF', padding: 25, borderRadius: 16, alignItems: 'center', elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginVertical: 15, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 10 },
  modalButtonNo: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 12, borderRadius: 8, marginRight: 8, alignItems: 'center' },
  modalButtonYes: { flex: 1, backgroundColor: '#E95822', paddingVertical: 12, borderRadius: 8, marginLeft: 8, alignItems: 'center' },
  modalButtonTextNo: { color: '#4B5563', fontWeight: 'bold', fontSize: 16 },
  modalButtonTextYes: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});