import { apiClient } from './apiClient';

export const reservaService = {
  crear: (datos) => apiClient.post('/reservas', datos),
  misReservas: () => apiClient.get('/reservas/mias'),
  cancelar: (id) => apiClient.delete(`/reservas/${id}`),
};
