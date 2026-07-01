import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ModalAssociacaoBarraca from './ModalAssociacaoBarraca';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_ITEM_WIDTH = SCREEN_WIDTH - 40;

interface BottomSheetBarracaProps {
  vendorId: string;
  onClose: () => void;
  onAssociate: () => void;
  onOpenChat: (associationId: string) => void;
}

interface EstablishmentDetails {
  vendor_id: string;
  establishment_name: string;
  owner_name: string;
  establishment_photos: string[];
  menu_photos: string[];
  association_status: 'none' | 'this' | 'other';
  association_id?: string;
}

export default function BottomSheetBarraca({
  vendorId,
  onClose,
  onAssociate,
  onOpenChat,
}: BottomSheetBarracaProps) {
  const [details, setDetails] = useState<EstablishmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [establishmentPhotoIndex, setEstablishmentPhotoIndex] = useState(0);
  const [menuPhotoIndex, setMenuPhotoIndex] = useState(0);
  const [establishmentPhotoErrors, setEstablishmentPhotoErrors] = useState<Set<number>>(new Set());
  const [menuPhotoErrors, setMenuPhotoErrors] = useState<Set<number>>(new Set());
  const [showAssociationModal, setShowAssociationModal] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [vendorId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const { authService } = await import('../services/authService');
      const response = await authService.getEstablishmentDetails(vendorId);
      const detailsData = response.data;

      // Verificar se o cliente já está associado a esta barraca
      try {
        const clientAssociation = await authService.getClientAssociation();
        if (clientAssociation.data?.vendor_id === vendorId) {
          detailsData.association_status = 'this';
          detailsData.association_id = clientAssociation.data.association_id;
        }
      } catch {
        // Sem associação ativa — mantém o status vindo da API
      }

      setDetails(detailsData);
    } catch (error: any) {
      console.error('Erro ao buscar detalhes do estabelecimento:', error);
      Alert.alert('Erro', 'Não foi possível carregar as informações do estabelecimento');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleEstablishmentPhotoError = (index: number) => {
    setEstablishmentPhotoErrors(prev => new Set(prev).add(index));
  };

  const handleMenuPhotoError = (index: number) => {
    setMenuPhotoErrors(prev => new Set(prev).add(index));
  };

  const renderCarousel = (
    photos: string[],
    currentIndex: number,
    setIndex: (index: number) => void,
    errors: Set<number>,
    placeholderIcon: string
  ) => {
    const validPhotos = photos.filter((_, idx) => !errors.has(idx));

    if (validPhotos.length === 0) {
      return (
        <View style={styles.carouselPlaceholder}>
          <MaterialCommunityIcons name={placeholderIcon as any} size={60} color="#E95822" />
          <Text style={styles.placeholderText}>Sem fotos disponíveis</Text>
        </View>
      );
    }

    return (
      <View>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const contentOffsetX = event.nativeEvent.contentOffset.x;
            const newIndex = Math.round(contentOffsetX / CAROUSEL_ITEM_WIDTH);
            setIndex(newIndex);
          }}
          style={styles.carousel}
        >
          {photos.map((photo, index) => (
            <View key={index} style={styles.carouselItem}>
              {errors.has(index) ? (
                <View style={styles.carouselImageError}>
                  <MaterialCommunityIcons name="image-broken" size={40} color="#999" />
                  <Text style={styles.errorText}>Erro ao carregar</Text>
                </View>
              ) : (
                <Image
                  source={{ uri: photo }}
                  style={styles.carouselImage}
                  resizeMode="cover"
                  onError={() => handleEstablishmentPhotoError(index)}
                />
              )}
            </View>
          ))}
        </ScrollView>
        {photos.length > 1 && (
          <View style={styles.paginationContainer}>
            {photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const handleAssociateClick = () => {
    setShowAssociationModal(true);
  };

  const handleAssociationSuccess = async (associationId?: string) => {
    setShowAssociationModal(false);
    // Atualização otimista: já mostra o botão Chat imediatamente
    setDetails((prev) => prev ? {
      ...prev,
      association_status: 'this',
      association_id: associationId || prev.association_id || '',
    } : prev);
    await fetchDetails();
    onAssociate();
  };

  const renderActionButton = () => {
    if (!details) return null;

    switch (details.association_status) {
      case 'this':
        return (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (details.association_id) {
                onOpenChat(details.association_id);
              } else {
                Alert.alert('Erro', 'ID de associação não encontrado');
              }
            }}
          >
            <MaterialCommunityIcons name="chat" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Chat</Text>
          </TouchableOpacity>
        );

      case 'other':
        return (
          <View style={styles.actionButtonDisabled}>
            <Text style={styles.actionButtonTextDisabled}>
              Você já está associado a outro estabelecimento
            </Text>
          </View>
        );

      case 'none':
      default:
        return (
          <TouchableOpacity style={styles.actionButton} onPress={handleAssociateClick}>
            <MaterialCommunityIcons name="link-variant" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Se associar</Text>
          </TouchableOpacity>
        );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialCommunityIcons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E95822" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </View>
    );
  }

  if (!details) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <MaterialCommunityIcons name="close" size={24} color="#333" />
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Nome do estabelecimento */}
        <View style={styles.header}>
          <Text style={styles.establishmentName}>{details.establishment_name}</Text>
          <Text style={styles.ownerName}>Proprietário: {details.owner_name}</Text>
        </View>

        {/* Carrossel de fotos do estabelecimento */}
        {details.establishment_photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotos do estabelecimento</Text>
            {renderCarousel(
              details.establishment_photos,
              establishmentPhotoIndex,
              setEstablishmentPhotoIndex,
              establishmentPhotoErrors,
              'store'
            )}
          </View>
        )}

        {/* Carrossel de fotos do cardápio */}
        {details.menu_photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotos do cardápio</Text>
            {renderCarousel(
              details.menu_photos,
              menuPhotoIndex,
              setMenuPhotoIndex,
              menuPhotoErrors,
              'food'
            )}
          </View>
        )}
      </ScrollView>

      {/* Botão de ação */}
      <View style={styles.footer}>{renderActionButton()}</View>

      {/* Modal de confirmação de associação */}
      {details && (
        <ModalAssociacaoBarraca
          visible={showAssociationModal}
          establishmentName={details.establishment_name}
          ownerName={details.owner_name}
          vendorId={vendorId}
          onClose={() => setShowAssociationModal(false)}
          onSuccess={handleAssociationSuccess}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    backgroundColor: '#FFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
  },
  scrollView: {
    maxHeight: '80%',
  },
  header: {
    padding: 20,
    paddingTop: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  establishmentName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  ownerName: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  carousel: {
    flexDirection: 'row',
  },
  carouselItem: {
    width: CAROUSEL_ITEM_WIDTH,
    height: 240,
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselImageError: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  carouselPlaceholder: {
    height: 240,
    marginHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDD',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#E95822',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  actionButton: {
    backgroundColor: '#E95822',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 8,
  },
  actionButtonDisabled: {
    backgroundColor: '#EAEAEA',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonTextDisabled: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
