import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Types
interface Vendor {
  id: string;
  name: string;
  type: 'ambulante' | 'barraca';
  status: 'online' | 'paused' | 'offline';
  latitude: number;
  longitude: number;
  categories: string[];
  avatar?: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

export default function Mapa() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const mapRef = useRef<MapView>(null);

  // Request location permission and get user location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permissão negada',
            'A localização é necessária para encontrar vendedores próximos.'
          );
          setLocationPermission(false);
          setLoading(false);
          return;
        }

        setLocationPermission(true);
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const userLoc: UserLocation = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy,
        };

        setLocation(userLoc);
        setLoading(false);

        // Center map on user location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: userLoc.latitude,
            longitude: userLoc.longitude,
            latitudeDelta: 0.009,
            longitudeDelta: 0.009,
          });
        }
      } catch (error) {
        console.error('Error getting location:', error);
        setLoading(false);
      }
    })();
  }, []);

  // Fetch vendors nearby (mock data for now - replace with API call)
  useEffect(() => {
    if (location) {
      fetchVendors();
      const interval = setInterval(fetchVendors, 15000); // Poll every 15s
      return () => clearInterval(interval);
    }
  }, [location]);

  const fetchVendors = async () => {
    // TODO: Replace with actual API call to backend
    // Mock data for demonstration
    const mockVendors: Vendor[] = [
      {
        id: '1',
        name: 'João da Tapioca',
        type: 'ambulante',
        status: 'online',
        latitude: location!.latitude + 0.002,
        longitude: location!.longitude + 0.002,
        categories: ['Tapioca', 'Café'],
        avatar: undefined,
      },
      {
        id: '2',
        name: 'Barraca do Caranguejo',
        type: 'barraca',
        status: 'online',
        latitude: location!.latitude - 0.003,
        longitude: location!.longitude + 0.001,
        categories: ['Frutos do Mar', 'Bebidas'],
        avatar: undefined,
      },
      {
        id: '3',
        name: 'Maria da Água de Coco',
        type: 'ambulante',
        status: 'paused',
        latitude: location!.latitude + 0.004,
        longitude: location!.longitude - 0.002,
        categories: ['Bebidas'],
        avatar: undefined,
      },
    ];
    setVendors(mockVendors);
  };

  const handleMarkerPress = (vendor: Vendor) => {
    setSelectedVendor(vendor);
  };

  const handleCloseCard = () => {
    setSelectedVendor(null);
  };

  const handlePedirPress = () => {
    if (selectedVendor) {
      Alert.alert('Pedir', `Iniciando pedido com ${selectedVendor.name}`);
      // TODO: Navigate to order screen
    }
  };

  // Default location (Recife, PE) if permission denied
  const defaultLocation = {
    latitude: -8.0476,
    longitude: -34.8770,
  };

  const displayLocation = location || defaultLocation;
  const lowPrecision = location && location.accuracy && location.accuracy > 100;

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
      {/* Low precision banner */}
      {lowPrecision && (
        <View style={styles.warningBanner}>
          <MaterialCommunityIcons name="alert" size={20} color="#555" />
          <Text style={styles.warningText}>
            Localização aproximada. Alguns vendedores podem não ser exibidos
          </Text>
        </View>
      )}

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: displayLocation.latitude,
          longitude: displayLocation.longitude,
          latitudeDelta: 0.009,
          longitudeDelta: 0.009,
        }}
        showsUserLocation={locationPermission}
        followsUserLocation={false}
        showsMyLocationButton={true}
      >
        {/* Vendor markers */}
        {vendors.map((vendor) => (
          <Marker
            key={vendor.id}
            coordinate={{
              latitude: vendor.latitude,
              longitude: vendor.longitude,
            }}
            onPress={() => handleMarkerPress(vendor)}
          >
            <View
              style={[
                styles.markerContainer,
                vendor.status === 'paused' || vendor.status === 'offline'
                  ? styles.markerGray
                  : styles.markerOrange,
              ]}
            >
              <MaterialCommunityIcons
                name={vendor.type === 'barraca' ? 'store' : 'walk'}
                size={20}
                color="#FFF"
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Empty state */}
      {locationPermission && vendors.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🦀</Text>
          <Text style={styles.emptyTitle}>
            Nenhum vendedor ativo por perto no momento
          </Text>
          <Text style={styles.emptySubtitle}>Tente mais tarde!</Text>
        </View>
      )}

      {/* Vendor card (bottom sheet) */}
      {selectedVendor && (
        <View style={styles.card}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseCard}
          >
            <MaterialCommunityIcons name="close" size={24} color="#333" />
          </TouchableOpacity>

          {/* Vendor info */}
          <View style={styles.cardContent}>
            {/* Avatar */}
            <View style={styles.avatar}>
              <MaterialCommunityIcons
                name={selectedVendor.type === 'barraca' ? 'store' : 'account'}
                size={40}
                color="#E95822"
              />
            </View>

            {/* Name and categories */}
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorName}>{selectedVendor.name}</Text>
              <Text style={styles.vendorCategories}>
                {selectedVendor.categories.join(' • ')}
              </Text>
            </View>
          </View>

          {/* Paused message */}
          {selectedVendor.status === 'paused' && (
            <Text style={styles.pausedMessage}>
              Este Ambulante está em pausa no momento
            </Text>
          )}

          {/* Order button */}
          <TouchableOpacity
            style={[
              styles.pedirButton,
              selectedVendor.status === 'paused' && styles.pedirButtonDisabled,
            ]}
            onPress={handlePedirPress}
            disabled={selectedVendor.status === 'paused'}
          >
            <Text
              style={[
                styles.pedirButtonText,
                selectedVendor.status === 'paused' &&
                  styles.pedirButtonTextDisabled,
              ]}
            >
              Pedir
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  warningBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF9E6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E68C',
  },
  warningText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#555',
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  markerOrange: {
    backgroundColor: '#E95822',
  },
  markerGray: {
    backgroundColor: '#999',
  },
  emptyState: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E95822',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  vendorCategories: {
    fontSize: 14,
    color: '#666',
  },
  pausedMessage: {
    fontSize: 12,
    color: '#E05A3D',
    marginBottom: 15,
    textAlign: 'center',
  },
  pedirButton: {
    backgroundColor: '#E95822',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  pedirButtonDisabled: {
    backgroundColor: '#EAEAEA',
  },
  pedirButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  pedirButtonTextDisabled: {
    color: '#999',
  },
});
