import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface RealtimeEventAmbulante {
  tipo: 'novo_pedido' | 'pedido_cancelado';
  payload: any;
}

/**
 * Hook para escutar eventos Realtime do pedido (visão do ambulante)
 */
export const useRealtimePedidoAmbulante = (ambulanteId: string) => {
  const [evento, setEvento] = useState<RealtimeEventAmbulante | null>(null);

  useEffect(() => {
    if (!ambulanteId) return;

    // Criar canal específico do ambulante
    const channel = supabase.channel(`ambulante:${ambulanteId}`);

    // Escutar evento: novo pedido
    channel.on('broadcast', { event: 'novo_pedido' }, (payload) => {
      console.log('🔔 Novo pedido recebido:', payload);
      setEvento({ tipo: 'novo_pedido', payload: payload.payload });
    });

    // Escutar evento: pedido cancelado
    channel.on('broadcast', { event: 'pedido_cancelado' }, (payload) => {
      console.log('🚫 Pedido cancelado:', payload);
      setEvento({ tipo: 'pedido_cancelado', payload: payload.payload });
    });

    // Subscribe
    channel.subscribe((status) => {
      console.log(`📡 Realtime Ambulante [${ambulanteId}]: ${status}`);
    });

    // Cleanup
    return () => {
      console.log('🔌 Desconectando Realtime Ambulante');
      supabase.removeChannel(channel);
    };
  }, [ambulanteId]);

  return { evento, clearEvento: () => setEvento(null) };
};
