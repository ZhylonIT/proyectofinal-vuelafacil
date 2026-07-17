import { apiClient } from './apiClient';

export const authService = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }, { auth: false }),
  registro: (datos) => apiClient.post('/auth/registro', datos, { auth: false }),
};
