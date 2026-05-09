import api from './api';

export const authService = {
  // 1. CADASTRO (Rota única conforme seu Swagger)
  
  register: async (formData) => {
    return api.post('/auth/signup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 2. VERIFICAÇÃO DE E-MAIL (Rota: /auth/signup-otp conforme Swagger)
  verifyEmail: async (email, token) => {
    return api.post('/auth/signup-otp', { 
      email: email, 
      token: token 
    });
  },

  // 3. REENVIO DE TOKEN 
  // Separação entre envio por signup e por senha esquecida
  resendSignup: async (email) => {
    return api.post('/auth/resend-signup', { email });
  },
  resendForgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email });
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

  // 7. Validar OTP
  verifyResetToken: async (email, token) => {
    return api.post('/auth/verify-recovery-otp', { email, token });
  },

  // 8. RESETAR SENHA
  resetPassword: async (accessToken, refreshToken, newPassword) => {
    return api.post('/auth/reset-password', { 
      access_token: accessToken, 
      refresh_token: refreshToken, 
      new_password: newPassword 
    });
  },

  // 8. LOGOUT
  logout: async () => {
    return api.post('/auth/logout');
  },
  //9. MAPAS
  updateStatus: async (status) => {
    // status deve ser 'online' ou 'offline'
    return api.put('/vendedor/status', { status });
  },

  saveLocation: async (latitude, longitude, accuracy) => {
    return api.post('/vendedor/location', {
      latitude,
      longitude,
      accuracy: accuracy || 0
    });
  }
};