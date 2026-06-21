import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Message } from '../services/chatService';

interface RealtimeChatEvent {
  type: 'new_message' | 'association_closed' | 'charge_sent' | 'payment_confirmed';
  payload: any;
}

interface ConnectionStatus {
  connected: boolean;
  message: string | null;
}

export const useRealtimeChat = (associationId: string | null) => {
  const [event, setEvent] = useState<RealtimeChatEvent | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: true,
    message: null,
  });

  useEffect(() => {
    if (!associationId) return;

    const channel = supabase.channel(`association:${associationId}`);

    // Monitor connection status
    channel.on('system', {}, (payload: any) => {
      if (payload.status === 'SUBSCRIBED') {
        setConnectionStatus({ connected: true, message: null });
      }
    });

    // Listen to new messages
    channel.on('broadcast', { event: 'new_message' }, (payload) => {
      console.log('🆕 Nova mensagem recebida:', payload);
      setEvent({ type: 'new_message', payload: payload.payload });
    });

    // Listen to association closed
    channel.on('broadcast', { event: 'association_closed' }, (payload) => {
      console.log('🔒 Associação encerrada:', payload);
      setEvent({ type: 'association_closed', payload: payload.payload });
    });

    // Listen to charge sent
    channel.on('broadcast', { event: 'charge_sent' }, (payload) => {
      console.log('💰 Cobrança enviada:', payload);
      setEvent({ type: 'charge_sent', payload: payload.payload });
    });

    // Listen to payment confirmed
    channel.on('broadcast', { event: 'payment_confirmed' }, (payload) => {
      console.log('✅ Pagamento confirmado:', payload);
      setEvent({ type: 'payment_confirmed', payload: payload.payload });
    });

    channel.subscribe((status) => {
      console.log(`📡 Realtime Chat [${associationId}]: ${status}`);
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setConnectionStatus({
          connected: false,
          message: 'Conexão instável.',
        });
      }
    });

    return () => {
      console.log('🔌 Desconectando Realtime Chat');
      supabase.removeChannel(channel);
    };
  }, [associationId]);

  return {
    event,
    clearEvent: () => setEvent(null),
    connectionStatus,
  };
};
