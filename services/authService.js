import api from './api';

export const authService = {
  // POST /auth/check-email
  checkEmail: async (email) => {
    return api.post('/auth/check-email', { email });
  },

  // POST /auth/login
  login: async (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  // POST /auth/forgot-password
  forgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  // POST /auth/reset-password
  resetPassword: async (email, token, newPassword) => {
    return api.post('/auth/reset-password', { 
      email, 
      token, 
      new_password: newPassword 
    });
  }
};