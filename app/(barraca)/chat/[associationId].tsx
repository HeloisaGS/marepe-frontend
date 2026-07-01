import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatService, Message } from '../../../services/chatService';
import { useRealtimeChat } from '../../../hooks/useRealtimeChat';
import { Toast } from '../../../components/Toast';
import ModalEncerrarAssociacao from '../../../components/ModalEncerrarAssociacao';

export default function VendorChatScreen() {
  const { associationId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>('Cliente');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoQueue, setPhotoQueue] = useState<string[]>([]);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' as 'error' | 'success' | 'info' });
  const [showCloseModal, setShowCloseModal] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const { event, clearEvent, connectionStatus } = useRealtimeChat(associationId as string);

  useEffect(() => {
    loadUserData();
    loadMessages();
    loadCustomerData();
  }, []);

  useEffect(() => {
    if (event) {
      handleRealtimeEvent(event);
      clearEvent();
    }
  }, [event]);

  useEffect(() => {
    if (connectionStatus.connected && photoQueue.length > 0) {
      retryPhotoQueue();
    }
  }, [connectionStatus.connected]);

  const loadUserData = async () => {
    const userId = await AsyncStorage.getItem('userId');
    setCurrentUserId(userId);
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const history = await chatService.getMessages(associationId as string);
      setMessages(history);
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      showToast('Erro ao carregar histórico', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerData = async () => {
    try {
      const { authService } = await import('../../../services/authService');
      const response = await authService.getBarracaAssociations();
      const association = response.data.customers?.find(
        (c: any) => c.association_id === associationId
      );
      if (association) {
        setCustomerName(association.nome);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
    }
  };

  const handleRealtimeEvent = (realtimeEvent: any) => {
    switch (realtimeEvent.type) {
      case 'new_message':
        const newMsg = realtimeEvent.payload as Message;
        if (newMsg.sender_id !== currentUserId) {
          setMessages((prev) => [...prev, newMsg]);
          setTimeout(() => scrollToBottom(), 100);
        }
        break;

      case 'payment_confirmed':
        setShowCloseModal(false);
        showToast('Pagamento confirmado!', 'success');
        setTimeout(() => router.replace('/(barraca)/(tabs)/associados'), 3000);
        break;
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();

    try {
      setSending(true);
      const tempMessage: Message = {
        id: Date.now().toString(),
        association_id: associationId as string,
        sender_id: currentUserId!,
        message_type: 'text',
        content: messageText,
        created_at: new Date().toISOString(),
      };

      // Limpa o input e fecha o teclado ANTES
      setInputText('');
      Keyboard.dismiss();

      setMessages((prev) => [...prev, tempMessage]);
      setTimeout(() => scrollToBottom(), 100);

      await chatService.sendTextMessage(associationId as string, messageText);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      showToast('Erro ao enviar mensagem', 'error');
    } finally {
      setSending(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de permissão para acessar suas fotos.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadPhoto(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string) => {
    try {
      setUploadingPhoto(true);

      const photo = {
        uri,
        type: 'image/jpeg',
        name: `photo_${Date.now()}.jpg`,
      };

      const response = await chatService.sendPhotoMessage(associationId as string, photo);

      setMessages((prev) => [...prev, response]);
      setTimeout(() => scrollToBottom(), 100);
      showToast('Foto enviada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao enviar foto:', error);
      showToast('Erro ao enviar foto', 'error');

      // Adicionar à fila para reenvio
      if (!connectionStatus.connected) {
        setPhotoQueue((prev) => [...prev, uri]);
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  const retryPhotoQueue = async () => {
    if (photoQueue.length === 0) return;

    const uri = photoQueue[0];
    setPhotoQueue((prev) => prev.slice(1));
    uploadPhoto(uri);
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const showToast = (message: string, type: 'error' | 'success' | 'info') => {
    setToast({ visible: true, message, type });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === currentUserId;
    const isPhoto = item.message_type === 'photo';

    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleOther]}>
          {isPhoto ? (
            <TouchableOpacity onPress={() => setSelectedPhoto(item.content)}>
              <Image source={{ uri: item.content }} style={styles.messagePhoto} />
            </TouchableOpacity>
          ) : (
            <Text style={[styles.messageText, isMe && styles.messageTextMe]}>{item.content}</Text>
          )}
          <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
            {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="account" size={24} color="#E95822" />
          </View>
          <Text style={styles.headerTitle}>{customerName}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowCloseModal(true)}>
            <MaterialCommunityIcons name="close-circle-outline" size={24} color="#E95822" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.replace('/(barraca)/(tabs)')}>
            <MaterialCommunityIcons name="minus" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Connection Status Warning */}
      {!connectionStatus.connected && (
        <View style={styles.warningBanner}>
          <MaterialCommunityIcons name="alert" size={16} color="#92400E" />
          <Text style={styles.warningText}>{connectionStatus.message}</Text>
          {photoQueue.length > 0 && (
            <Text style={styles.warningText}> ({photoQueue.length} foto(s) na fila)</Text>
          )}
        </View>
      )}

      {/* Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E95822" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => scrollToBottom()}
        />
      )}

      {/* Input Area */}
      <KeyboardAvoidingView behavior="padding">
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={() => {
              Keyboard.dismiss(); // Fecha teclado antes de abrir galeria
              pickImage();
            }}
            disabled={uploadingPhoto}
          >
            {uploadingPhoto ? (
              <ActivityIndicator size="small" color="#E95822" />
            ) : (
              <MaterialCommunityIcons name="camera" size={24} color="#E95822" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.keyboardDismissButton}
            onPress={() => Keyboard.dismiss()}
          >
            <MaterialCommunityIcons name="keyboard-off" size={20} color="#666" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => {
              if (inputText.trim()) {
                sendMessage();
              }
            }}
            blurOnSubmit={true}
            multiline={false}
            maxLength={500}
            returnKeyType="send"
          />

          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <MaterialCommunityIcons name="send" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Lightbox para fotos */}
      <Modal visible={!!selectedPhoto} transparent animationType="fade">
        <View style={styles.lightboxContainer}>
          <TouchableOpacity style={styles.lightboxClose} onPress={() => setSelectedPhoto(null)}>
            <MaterialCommunityIcons name="close" size={32} color="#FFF" />
          </TouchableOpacity>
          {selectedPhoto && (
            <Image source={{ uri: selectedPhoto }} style={styles.lightboxImage} resizeMode="contain" />
          )}
        </View>
      </Modal>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <ModalEncerrarAssociacao
        visible={showCloseModal}
        associationId={associationId as string}
        customerName={customerName}
        onClose={() => setShowCloseModal(false)}
        onSuccess={() => {
          showToast('Aguardando pagamento do cliente...', 'info');
          setShowCloseModal(false);
        }}
        onPaymentConfirmed={() => {
          showToast('Pagamento confirmado!', 'success');
          setShowCloseModal(false);
          setTimeout(() => router.replace('/(barraca)/(tabs)/associados'), 3000);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageRow: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  messageBubbleMe: {
    backgroundColor: '#E95822',
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#000',
  },
  messageTextMe: {
    color: '#FFF',
  },
  messageTime: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  messageTimeMe: {
    color: '#FFE5DC',
  },
  messagePhoto: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  photoButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardDismissButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#E95822',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#FBBF9C',
  },
  lightboxContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  lightboxImage: {
    width: '90%',
    height: '80%',
  },
});
