import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface RealtimeEventCliente {
  tipo: 'pedido_aceito' | 'pedido_negado' | 'pedido_expirado' | 'avanco_fila';
  payload: any;
}

/**
 * Hook para escutar eventos Realtime do pedido (visão do cliente)
 */
export const useRealtimePedidoCliente = (clienteId: string) => {
  const [evento, setEvento] = useState<RealtimeEventCliente | null>(null);

  useEffect(() => {
    if (!clienteId) return;

    // Criar canal específico do cliente
    const channel = supabase.channel(`cliente:${clienteId}`);

    // Escutar evento: pedido aceito
    channel.on('broadcast', { event: 'pedido_aceito' }, (payload) => {
      console.log('🎉 Pedido aceito:', payload);
      setEvento({ tipo: 'pedido_aceito', payload: payload.payload });
    });

    // Escutar evento: pedido negado
    channel.on('broadcast', { event: 'pedido_negado' }, (payload) => {
      console.log('❌ Pedido negado:', payload);
      setEvento({ tipo: 'pedido_negado', payload: payload.payload });
    });

    // Escutar evento: pedido expirado
    channel.on('broadcast', { event: 'pedido_expirado' }, (payload) => {
      console.log('⏰ Pedido expirado:', payload);
      setEvento({ tipo: 'pedido_expirado', payload: payload.payload });
    });

    // Escutar evento: avanço de fila (ambulante aceitou outro)
    channel.on('broadcast', { event: 'avanco_fila' }, (payload) => {
      console.log('🚶 Avanço de fila:', payload);
      setEvento({ tipo: 'avanco_fila', payload: payload.payload });
    });

    // Subscribe
    channel.subscribe((status) => {
      console.log(`📡 Realtime Cliente [${clienteId}]: ${status}`);
    });

    // Cleanup
    return () => {
      console.log('🔌 Desconectando Realtime Cliente');
      supabase.removeChannel(channel);
    };
  }, [clienteId]);

  return { evento, clearEvento: () => setEvento(null) };
};
