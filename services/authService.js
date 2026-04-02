import api from './api';

export const authService = {
  // 1. CADASTRO (Rota única conforme seu Swagger)
  register: async (userData) => {
    return api.post('/auth/signup', userData);
  },

  // 2. VERIFICAÇÃO DE E-MAIL (Rota: /auth/signup-otp conforme Swagger)
  verifyEmail: async (email, token) => {
    return api.post('/auth/signup-otp', { 
      email: email, 
      token: token 
    });
  },

  // 3. REENVIO DE TOKEN (Geralmente usa a mesma lógica de check ou forgot)
  // Se o seu backend tiver uma rota específica '/auth/resend-token', mantenha assim:
  resendToken: async (email) => {
    return api.post('/auth/resend-token', { email });
  },

  // 4. LOGIN
  login: async (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  // 5. CHECAR SE E-MAIL EXISTE
  checkEmail: async (email) => {
    return api.post('/auth/check-email', { email });
  },

  // 6. ESQUECI A SENHA
  forgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  // 7. RESETAR SENHA (Nova Senha)
  resetPassword: async (email, token, newPassword) => {
    return api.post('/auth/reset-password', { 
      email, 
      token, 
      new_password: newPassword 
    });
  },

  // 8. LOGOUT
  logout: async () => {
    return api.post('/auth/logout');
  }
};