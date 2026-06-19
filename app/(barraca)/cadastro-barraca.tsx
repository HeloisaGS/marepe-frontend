import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { barracaService } from '../../services/barracaService';

export default function CadastroBarraca() {
  const router = useRouter();
  const { latitude, longitude } = useLocalSearchParams<{ latitude: string; longitude: string }>();
  const [establishmentPhoto, setEstablishmentPhoto] = useState<any>(null);
  const [menuPhoto, setMenuPhoto] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState({ fotoEst: false, fotoCard: false });

  const pickImage = async (type: 'establishment' | 'menu') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos para continuar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      
      const photoObj = {
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      };

      if (type === 'establishment') {
        setEstablishmentPhoto(photoObj);
        setErrors(prev => ({ ...prev, fotoEst: false }));
      } else {
        setMenuPhoto(photoObj);
        setErrors(prev => ({ ...prev, fotoCard: false }));
      }
    }
  };

  const handleSave = async () => {
    
    const hasFotoEstError = !establishmentPhoto;
    const hasFotoCardError = !menuPhoto;

    if (hasFotoEstError || hasFotoCardError) {
      setErrors({ fotoEst: hasFotoEstError, fotoCard: hasFotoCardError });
      Alert.alert('Campos obrigatórios', 'Selecione as fotos obrigatórias antes de salvar.');
      return;
    }

    setSubmitting(true);
    try {
      const estPhotosArray = [establishmentPhoto];
      const menuPhotosArray = [menuPhoto];

      
      await barracaService.registrarBarraca(
        Number(latitude),
        Number(longitude),
        estPhotosArray,
        menuPhotosArray
      );

      Alert.alert('Sucesso 🎉', 'Barraca cadastrada com sucesso!', [
        { text: 'OK', onPress: () => router.replace('/(barraca)/(tabs)') }
      ]);
    } catch (error: any) {
      console.error('Erro ao salvar cadastro:', error);
      Alert.alert('Erro', 'Não foi possível salvar a barraca no momento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Cadastro', 
      'Deseja descartar as alterações e voltar ao mapa?', 
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim', onPress: () => router.back() }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      <View style={styles.coordContainer}>
        <MaterialCommunityIcons name="map-marker" size={18} color="#E95822" />
        <Text style={styles.coordText}>
          Coordenadas Fixadas: {Number(latitude).toFixed(5)}, {Number(longitude).toFixed(5)}
        </Text>
      </View>

      <Text style={styles.label}>Foto do Estabelecimento *</Text>
      <TouchableOpacity 
        style={[styles.photoBox, errors.fotoEst && styles.boxError, establishmentPhoto && styles.boxSuccess]} 
        onPress={() => pickImage('establishment')}
      >
        {establishmentPhoto ? (
          <Image source={{ uri: establishmentPhoto.uri }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderContent}>
            <MaterialCommunityIcons name="store-plus" size={36} color={errors.fotoEst ? '#EF4444' : '#E95822'} />
            <Text style={[styles.placeholderText, errors.fotoEst && { color: '#EF4444' }]}>Selecionar foto da barraca</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Foto do Cardápio *</Text>
      <TouchableOpacity 
        style={[styles.photoBox, errors.fotoCard && styles.boxError, menuPhoto && styles.boxSuccess]} 
        onPress={() => pickImage('menu')}
      >
        {menuPhoto ? (
          <Image source={{ uri: menuPhoto.uri }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderContent}>
            <MaterialCommunityIcons name="book-open-variant" size={36} color={errors.fotoCard ? '#EF4444' : '#E95822'} />
            <Text style={[styles.placeholderText, errors.fotoCard && { color: '#EF4444' }]}>Selecionar foto do cardápio</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={submitting}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 20, paddingBottom: 40 },
  coordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3CD', padding: 12, borderRadius: 10, marginBottom: 25, borderWidth: 1, borderColor: '#FFEBAA' },
  coordText: { fontSize: 13, color: '#856404', marginLeft: 6, fontWeight: '600' },
  label: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 14, fontSize: 16, color: '#333', marginBottom: 22, backgroundColor: '#F9FAFB' },
  photoBox: { height: 150, borderWidth: 2, borderStyle: 'dashed', borderColor: '#C4C4C4', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 22, backgroundColor: '#FAFAFA', overflow: 'hidden' },
  boxError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  boxSuccess: { borderStyle: 'solid', borderColor: '#10B981', backgroundColor: '#FFF' },
  placeholderContent: { alignItems: 'center' },
  placeholderText: { marginTop: 8, fontSize: 14, color: '#4B5563', fontWeight: '500' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelButton: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 16, borderRadius: 12, marginRight: 10, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: 'bold', color: '#4B5563' },
  saveButton: { flex: 1, backgroundColor: '#E95822', paddingVertical: 16, borderRadius: 12, marginLeft: 10, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
});