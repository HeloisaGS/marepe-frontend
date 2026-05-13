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
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CardapioModal from '../cardapio-modal';

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
  const [showCardapioModal, setShowCardapioModal] = useState<boolean>(false);
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
  // Substitua o useEffect que busca vendedores por este:
  useEffect(() => {
    const fetchVendors = async () => {
  if (!location) return;

  // LOG PARA VOCÊ VER NO TERMINAL O QUE O CLIENTE ESTÁ PEDINDO
  console.log(`🔎 Buscando perto de: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);

  try {
    const response = await authService.getNearbyVendors(
      location.latitude,
      location.longitude,
      2000 // 2km
    );

    // Se chegar aqui, o erro 500 sumiu!
    const formattedVendors = response.data.map((v: any, index: number) => ({
    // A API retorna vendor_id, não id
    id: v.vendor_id || `temp-${index}`, 
    
    // Como a API de localização NÃO retorna o nome no JSON que você mostrou,
    // vamos colocar um nome padrão. 
    // DICA: Verifique se v.vendedor?.nome_barraca existe no retorno real
    name: v.nome_barraca || v.nome || `Vendedor ${index + 1}`,
    
    type: v.tipo || 'ambulante',
    status: v.status || 'online',
    latitude: Number(v.latitude),
    longitude: Number(v.longitude),
    categories: v.categorias || [],
    avatar: v.foto_url
  }));

    console.log(`📡 [CLIENTE] Sucesso! Vendedores encontrados: ${formattedVendors.length}`);
    setVendors(formattedVendors);
  } catch (err: any) {
    // Esse log vai te mostrar se o erro 500 tem uma mensagem interna do servidor
    console.log("❌ [ERRO DETALHADO]:", err.response?.data || err.message);
  }
};

    if (location) {
      fetchVendors();
      const interval = setInterval(fetchVendors, 15000); // Atualiza a cada 15s
      return () => clearInterval(interval);
    }
  }, [location]);
  const handleMarkerPress = (vendor: Vendor) => {
    setSelectedVendor(vendor);
  };

  const handleCloseCard = () => {
    setSelectedVendor(null);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userRole');
            router.replace('/(auth)');
          }
        }
      ]
    );
  };

  const handlePedirPress = () => {
    if (!selectedVendor) return;
    setShowCardapioModal(true);
  };

  const handleCardapioSuccess = () => {
    setShowCardapioModal(false);
    setSelectedVendor(null);
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
      {/* Logout button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={24} color="#E95822" />
      </TouchableOpacity>

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
              Ver Cardápio
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cardapio Modal */}
      {selectedVendor && (
        <CardapioModal
          visible={showCardapioModal}
          vendorId={selectedVendor.id}
          vendorName={selectedVendor.name}
          vendorCategories={selectedVendor.categories}
          onClose={() => setShowCardapioModal(false)}
          onSuccess={handleCardapioSuccess}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 20,
    backgroundColor: '#FFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 30,
    paddingHorizontal: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#555',
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
