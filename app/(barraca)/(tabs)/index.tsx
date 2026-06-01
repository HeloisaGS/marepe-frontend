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
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { authService } from '../../../services/authService';

interface StaticLocation {
  latitude: number;
  longitude: number;
}

export default function Mapa() {
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [staticLocation, setStaticLocation] = useState<StaticLocation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditingLocation, setIsEditingLocation] = useState<boolean>(false);
  const mapRef = useRef<MapView>(null);

  // Request location permission and get current location
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

  // Fetch saved static location
  useEffect(() => {
    const fetchStaticLocation = async () => {
      try {
        const response = await authService.getStaticLocation();
        if (response.data && response.data.latitude && response.data.longitude) {
          setStaticLocation({
            latitude: response.data.latitude,
            longitude: response.data.longitude,
          });
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.error('Error fetching static location:', error);
        }
      }
    };
    fetchStaticLocation();
  }, []);

  const handleMapPress = (event: any) => {
    if (!isEditingLocation) return;

    const { latitude, longitude } = event.nativeEvent.coordinate;
    setStaticLocation({ latitude, longitude });
  };

  const handleSaveLocation = async () => {
    if (!staticLocation) {
      Alert.alert('Erro', 'Selecione uma localização no mapa primeiro.');
      return;
    }

    try {
      await authService.saveStaticLocation(
        staticLocation.latitude,
        staticLocation.longitude
      );
      setIsEditingLocation(false);
      Alert.alert('Sucesso', 'Localização da barraca salva com sucesso!');
    } catch (error) {
      console.error('Error saving static location:', error);
      Alert.alert('Erro', 'Não foi possível salvar a localização. Tente novamente.');
    }
  };

  const handleEditLocation = () => {
    setIsEditingLocation(true);
  };

  const handleCancelEdit = () => {
    setIsEditingLocation(false);
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      setStaticLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setIsEditingLocation(true);
    }
  };

  const centerLocation = staticLocation || (currentLocation
    ? {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      }
    : { latitude: -8.0476, longitude: -34.8770 });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E95822" />
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: centerLocation.latitude,
          longitude: centerLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        onPress={handleMapPress}
        showsUserLocation={true}
      >
        {staticLocation && (
          <Marker
            coordinate={staticLocation}
            draggable={isEditingLocation}
            onDragEnd={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              setStaticLocation({ latitude, longitude });
            }}
          >
            <View style={styles.markerContainer}>
              <MaterialCommunityIcons name="store" size={24} color="#FFF" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Instructions banner when editing */}
      {isEditingLocation && (
        <View style={styles.instructionBanner}>
          <MaterialCommunityIcons name="information" size={20} color="#115D77" />
          <Text style={styles.instructionText}>
            {staticLocation
              ? 'Arraste o pin ou toque no mapa para ajustar a posição'
              : 'Toque no mapa para marcar a localização da sua barraca'}
          </Text>
        </View>
      )}

      {/* Control buttons */}
      <View style={styles.controlPanel}>
        {!staticLocation && !isEditingLocation && (
          <>
            <Text style={styles.panelTitle}>Localização da Barraca</Text>
            <Text style={styles.panelSubtitle}>
              Você ainda não fixou a localização da sua barraca no mapa.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleUseCurrentLocation}
            >
              <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#FFF" />
              <Text style={styles.primaryButtonText}>Usar Localização Atual</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setIsEditingLocation(true)}
            >
              <Text style={styles.secondaryButtonText}>Escolher no Mapa</Text>
            </TouchableOpacity>
          </>
        )}

        {staticLocation && !isEditingLocation && (
          <>
            <View style={styles.statusContainer}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
              <Text style={styles.statusText}>Localização Fixada</Text>
            </View>
            <Text style={styles.panelSubtitle}>
              Sua barraca está visível para os clientes nesta localização.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleEditLocation}>
              <MaterialCommunityIcons name="pencil" size={20} color="#FFF" />
              <Text style={styles.primaryButtonText}>Alterar Localização</Text>
            </TouchableOpacity>
          </>
        )}

        {isEditingLocation && (
          <>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveLocation}>
              <MaterialCommunityIcons name="content-save" size={20} color="#FFF" />
              <Text style={styles.saveButtonText}>Salvar Localização</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E95822',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  instructionBanner: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#E0F2FE',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    marginLeft: 10,
    fontSize: 13,
    color: '#115D77',
    flex: 1,
    fontWeight: '500',
  },
  controlPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  panelSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginLeft: 8,
  },
  primaryButton: {
    backgroundColor: '#E95822',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});