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
import { authService } from '../../../services/authService';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CardapioModal from '../cardapio-modal';
import CategoryFilter from '../../../components/CategoryFilter';
import BottomSheetBarraca from '../../../components/BottomSheetBarraca';
import { barracaService } from '../../../services/barracaService';


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
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCardapioModal, setShowCardapioModal] = useState<boolean>(false);
  const [showBarracaSheet, setShowBarracaSheet] = useState<boolean>(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const mapRef = useRef<MapView>(null);
  const [associationStatus, setAssociationStatus] = useState<string>('none');
  const [hasAnyActiveAssoc, setHasAnyActiveAssoc] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [loadingBtn, setLoadingBtn] = useState<boolean>(false);

  // Fetch available categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await authService.getAvailableCategories();
        const formattedCategories = response.data.map((cat: any) => ({
          id: cat.id || cat.categoria_id,
          name: cat.nome_categoria || cat.name,
        }));
        setCategories(formattedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

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
  // Fetch vendors AND stands nearby (Une ambulantes ativos e barracas fixas no mesmo mapa)
  useEffect(() => {
    const fetchVendorsAndStands = async () => {
      if (!location) return;

      console.log(`🔎 [MAPA] Atualizando posições perto de: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);

      try {
        // Executa as duas buscas em paralelo para não travar o app
        const [ambulantesRes, barracasRes] = await Promise.all([
          authService.getNearbyVendors(location.latitude, location.longitude, 2000),
          barracaService.listarTodasBarracas() // Rota que traz as barracas cadastradas pelas coordenadas fixas
        ]);

        // 1. Formata os Ambulantes vindo do endpoint de localização
        const listaAmbulantes = (ambulantesRes.data || []).map((v: any, index: number) => ({
          id: v.vendor_id || `ambulante-${index}`,
          name: v.nome_barraca || v.nome || `Ambulante ${index + 1}`,
          type: 'ambulante' as const,
          status: (v.status || 'online') as 'online' | 'paused' | 'offline',
          latitude: Number(v.latitude),
          longitude: Number(v.longitude),
          categories: v.categorias || [],
          avatar: v.foto_url
        }));

        // 2. Formata as Barracas Fixas vindas do endpoint de estabelecimentos
        // O Swagger do Allan mostra que o retorno é { stands: [ { vendor_id, latitude, longitude } ] }
        const standsArray = barracasRes.data?.stands || [];
        const listaBarracas = standsArray.map((b: any, index: number) => ({
          id: b.vendor_id || `barraca-${index}`,
          name: b.establishment_name || `Barraca de Praia`, // Se a rota geral não der o nome, depois o BottomSheet busca pelo ID
          type: 'barraca' as const,
          status: 'online' as const, // Barraca fixa cadastrada assume-se online/visível
          latitude: Number(b.latitude),
          longitude: Number(b.longitude),
          categories: b.categories || [], // Se houver categorias cadastradas na barraca
          avatar: undefined
        }));

        // 3. Junta as duas listas no estado do componente
        const todosOsVendedores = [...listaAmbulantes, ...listaBarracas];
        
        console.log(`📡 [CLIENTE] Mapa atualizado! Ambulantes: ${listaAmbulantes.length} | Barracas: ${listaBarracas.length}`);
        setVendors(todosOsVendedores);

      } catch (err: any) {
        console.log("❌ [ERRO AO CARREGAR MAPA VENDEDORES]:", err.response?.data || err.message);
      }
    };

    if (location) {
      fetchVendorsAndStands();
      const interval = setInterval(fetchVendorsAndStands, 15000); // Mantém atualizando a cada 15s
      return () => clearInterval(interval);
    }
  }, [location]);

  // Filter vendors based on selected categories
  useEffect(() => {
    if (selectedCategories.length === 0) {
      setFilteredVendors(vendors);
    } else {
      const filtered = vendors.filter((vendor) =>
        vendor.categories.some((cat) => selectedCategories.includes(cat))
      );
      setFilteredVendors(filtered);
    }
  }, [vendors, selectedCategories]);

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleClearCategories = () => {
    setSelectedCategories([]);
  };
  const handleMarkerPress = async (vendor: Vendor) => {
    setSelectedVendor(vendor);
    
    if (vendor.type === 'barraca') {
      try {
        // Busca se o cliente já está associado a esta barraca específica
        const resDetalhes = await barracaService.obterDetalhesBarraca(vendor.id);
        setAssociationStatus(resDetalhes.data?.association_status || 'none');

        // AC04: Busca se o cliente tem qualquer outra associação ativa no app
        const resMinhaAssoc = await barracaService.obterMinhaAssociacao();
        if (resMinhaAssoc.data && resMinhaAssoc.data !== "") {
          setHasAnyActiveAssoc(true);
        } else {
          setHasAnyActiveAssoc(false);
        }
      } catch (error) {
        console.error("Erro ao checar dados de associação:", error);
      }
      setShowBarracaSheet(true);
    }
  };

  const handleCloseCard = () => {
    setSelectedVendor(null);
    setShowBarracaSheet(false);
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

  // REPE-253 & REPE-254: Chamada ao confirmar no modal
  const handleConfirmarAssociacao = async () => {
    if (!selectedVendor) return;
    setLoadingBtn(true);
    setShowConfirmModal(false); // REPE-254: Fecha o pop-up

    try {
      // Importe o barracaService no topo do arquivo se ainda não importou
      await barracaService.criarAssociacao(selectedVendor.id);
      
      // REPE-254: Atualiza o estado na hora sem dar refresh
      setAssociationStatus('ativa');
      setHasAnyActiveAssoc(true);
      Alert.alert("Sucesso", "Associação realizada com sucesso!");
    } catch (error) {
      // REPE-256 (EX01): Tratamento de erro
      Alert.alert("Erro", "Não foi possível se associar no momento. Tente novamente.");
    } finally {
      setLoadingBtn(false);
    }
  };

  // Esta é a função que o TypeScript não estava achando!
  const handleBotaoAssociarPress = () => {
    // AC04: Bloqueia se já tiver outra associação ativa
    if (hasAnyActiveAssoc && associationStatus !== 'ativa') {
      Alert.alert("Bloqueado", "Você já possui uma associação ativa com outra barraca.");
      return;
    }
    // REPE-252: Abre o pop-up de confirmação
    setShowConfirmModal(true);
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

      {/* Category Filter */}
      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          selectedCategories={selectedCategories}
          onToggleCategory={handleToggleCategory}
          onClearAll={handleClearCategories}
        />
      )}

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
        {filteredVendors.map((vendor) => (
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
      {locationPermission && filteredVendors.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🦀</Text>
          <Text style={styles.emptyTitle}>
            {selectedCategories.length > 0
              ? 'Nenhum vendedor encontrado para as categorias selecionadas'
              : 'Nenhum vendedor ativo por perto no momento'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {selectedCategories.length > 0 ? 'Tente outras categorias!' : 'Tente mais tarde!'}
          </Text>
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

      {/* Bottom Sheet Barraca */}
      {selectedVendor && selectedVendor.type === 'barraca' && (
        <BottomSheetBarraca
          vendorId={selectedVendor.id}
          onClose={handleCloseCard}
          onAssociate={handleBotaoAssociarPress}
          onOpenChat={() => Alert.alert("Chat", "Abrindo conversa com a barraca...")}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  btnCancelText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnConfirm: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    backgroundColor: '#E95822',
    borderRadius: 8,
    alignItems: 'center',
  },
  btnConfirmText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
