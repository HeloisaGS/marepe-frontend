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
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatService, Message } from '../../../services/chatService';
import { useRealtimeChat } from '../../../hooks/useRealtimeChat';
import { Toast } from '../../../components/Toast';
import ModalEncerrarCliente from '../../../components/ModalEncerrarCliente';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ChatScreen() {
  const { associationId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [establishmentData, setEstablishmentData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'menu'>('chat');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' as 'error' | 'success' | 'info' });
  const [showCloseModal, setShowCloseModal] = useState(false);
  const closeModalRef = useRef<any>(null);

  const flatListRef = useRef<FlatList>(null);
  const { event, clearEvent, connectionStatus } = useRealtimeChat(associationId as string);

  useEffect(() => {
    loadUserData();
    loadMessages();
    loadEstablishmentData();
  }, []);

  useEffect(() => {
    if (event) {
      handleRealtimeEvent(event);
      clearEvent();
    }
  }, [event]);

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

  const loadEstablishmentData = async () => {
    try {
      const { authService } = await import('../../../services/authService');
      const response = await authService.getClientAssociation();
      console.log('📋 Dados do estabelecimento:', response.data);
      console.log('🍽️ Fotos do cardápio:', response.data?.menu_photos);
      setEstablishmentData(response.data);
    } catch (error) {
      console.error('Erro ao carregar dados do estabelecimento:', error);
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

      case 'association_closed':
        const closureData = realtimeEvent.payload;
        if (closureData.no_charge) {
          showToast(closureData.message || 'Atendimento encerrado', 'info');
          setTimeout(() => router.replace('/(cliente)/(tabs)'), 3000);
        }
        break;

      case 'charge_sent':
        const chargeData = realtimeEvent.payload;
        closeModalRef.current?.handleChargeSent(chargeData);
        break;
    }
  };

  const sendMessage = async () => {
    console.log('📤 sendMessage chamado');
    console.log('📝 inputText:', inputText);
    console.log('📨 sending:', sending);

    if (!inputText.trim()) {
      console.log('⚠️ Texto vazio, abortando');
      return;
    }

    if (sending) {
      console.log('⚠️ Já está enviando, abortando');
      return;
    }

    const messageText = inputText.trim();

    try {
      setSending(true);
      console.log('👤 currentUserId:', currentUserId);
      console.log('🔗 associationId:', associationId);

      const tempMessage: Message = {
        id: Date.now().toString(),
        association_id: associationId as string,
        sender_id: currentUserId!,
        message_type: 'text',
        content: messageText,
        created_at: new Date().toISOString(),
      };

      // Limpa o input e fecha o teclado ANTES de adicionar a mensagem
      setInputText('');
      Keyboard.dismiss();

      setMessages((prev) => [...prev, tempMessage]);
      setTimeout(() => scrollToBottom(), 100);

      console.log('🌐 Enviando para API...');
      await chatService.sendTextMessage(associationId as string, messageText);
      console.log('✅ Mensagem enviada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      showToast('Erro ao enviar mensagem', 'error');
    } finally {
      setSending(false);
    }
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

  if (minimized) {
    return (
      <TouchableOpacity style={styles.minimizedBar} onPress={() => setMinimized(false)}>
        <MaterialCommunityIcons name="chat" size={20} color="#FFF" />
        <Text style={styles.minimizedText}>{establishmentData?.establishment_name || 'Chat'}</Text>
        <Text style={styles.minimizedLabel}>Atendimento ativo</Text>
      </TouchableOpacity>
    );
  }

  // Se minimizado, mostrar apenas barra flutuante
  if (minimized) {
    return (
      <TouchableOpacity
        style={styles.minimizedBar}
        onPress={() => setMinimized(false)}
        activeOpacity={0.8}
      >
        <View style={styles.minimizedContent}>
          <MaterialCommunityIcons name="chat" size={24} color="#FFF" />
          <Text style={styles.minimizedText}>{establishmentData?.establishment_name || 'Chat'}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-up" size={24} color="#FFF" />
      </TouchableOpacity>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {establishmentData?.establishment_photos?.[0] && (
            <Image source={{ uri: establishmentData.establishment_photos[0] }} style={styles.headerPhoto} />
          )}
          <View>
            <Text style={styles.headerTitle}>{establishmentData?.establishment_name || 'Chat'}</Text>
            <Text style={styles.headerSubtitle}>{establishmentData?.owner_name || ''}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowCloseModal(true)}>
            <MaterialCommunityIcons name="close-circle-outline" size={24} color="#E95822" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => setMinimized(true)}>
            <MaterialCommunityIcons name="minus" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Toggle Chat/Cardápio */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, activeTab === 'chat' && styles.toggleButtonActive]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.toggleText, activeTab === 'chat' && styles.toggleTextActive]}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, activeTab === 'menu' && styles.toggleButtonActive]}
          onPress={() => setActiveTab('menu')}
        >
          <Text style={[styles.toggleText, activeTab === 'menu' && styles.toggleTextActive]}>Cardápio</Text>
        </TouchableOpacity>
      </View>

      {/* Connection Status Warning */}
      {!connectionStatus.connected && (
        <View style={styles.warningBanner}>
          <MaterialCommunityIcons name="alert" size={16} color="#92400E" />
          <Text style={styles.warningText}>{connectionStatus.message}</Text>
        </View>
      )}

      {/* Content Area */}
      {activeTab === 'chat' ? (
        <>
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
              keyboardShouldPersistTaps="handled"
            />
          )}

          {/* Input Area */}
          <KeyboardAvoidingView behavior="padding">
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={styles.keyboardDismissButton}
                onPress={() => {
                  console.log('⌨️ Fechando teclado manualmente');
                  Keyboard.dismiss();
                }}
              >
                <MaterialCommunityIcons name="keyboard-off" size={20} color="#666" />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Digite sua mensagem..."
                placeholderTextColor="#999"
                value={inputText}
                onChangeText={(text) => {
                  console.log('⌨️ Texto digitado:', text);
                  setInputText(text);
                }}
                onFocus={() => console.log('🎯 Input focado')}
                onBlur={() => console.log('🎯 Input desfocado')}
                onSubmitEditing={() => {
                  console.log('🎯 Submit do input');
                  if (inputText.trim()) {
                    sendMessage();
                  }
                }}
                blurOnSubmit={true}
                multiline={false}
                maxLength={500}
                editable={true}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
                onPress={() => {
                  console.log('👆 Botão Send pressionado');
                  sendMessage();
                }}
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
        </>
      ) : (
        // Cardápio View
        <View style={styles.menuContainer}>
          {establishmentData?.menu_photos && establishmentData.menu_photos.length > 0 ? (
            <FlatList
              data={establishmentData.menu_photos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setSelectedPhoto(item)}>
                  <Image source={{ uri: item }} style={styles.menuPhoto} />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.emptyMenu}>
              <MaterialCommunityIcons name="food-off" size={60} color="#CCC" />
              <Text style={styles.emptyMenuText}>Nenhum item no cardápio</Text>
            </View>
          )}
        </View>
      )}

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

      <ModalEncerrarCliente
        ref={closeModalRef}
        visible={showCloseModal}
        associationId={associationId as string}
        establishmentName={establishmentData?.establishment_name || 'Estabelecimento'}
        onClose={() => setShowCloseModal(false)}
        onSuccess={() => {
          showToast('Atendimento finalizado!', 'success');
          setTimeout(() => router.replace('/(cliente)/(tabs)'), 2000);
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
  headerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#E95822',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#FFF',
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
  menuContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  menuPhoto: {
    width: SCREEN_WIDTH,
    height: 400,
    resizeMode: 'contain',
  },
  emptyMenu: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMenuText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
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
  minimizedBar: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: '#E95822',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  minimizedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  minimizedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
  },
  minimizedLabel: {
    fontSize: 12,
    color: '#FFE5DC',
  },
});
