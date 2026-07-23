import { apiClient } from './apiClient';

export const destinoService = {
  listar: () => apiClient.get('/destinos', { auth: false }),
  guardar: (payload) => apiClient.put('/destinos', payload),
};
