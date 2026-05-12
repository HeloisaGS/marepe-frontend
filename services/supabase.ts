import { createClient } from '@supabase/supabase-js';

// TODO: Substituir pelas variáveis de ambiente reais
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: undefined, // Usar AsyncStorage em produção
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Define o token de autenticação do Supabase
 */
export const setSupabaseAuth = (accessToken: string) => {
  supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: '', // TODO: implementar refresh token
  });
};

/**
 * Remove autenticação
 */
export const clearSupabaseAuth = async () => {
  await supabase.auth.signOut();
};
