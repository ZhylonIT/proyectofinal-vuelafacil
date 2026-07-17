import { apiClient } from './apiClient';

export const favoritoService = {
  agregar: (flightId) => apiClient.post('/favoritos', { flightId }),
  quitar: (flightId) => apiClient.delete(`/favoritos/${flightId}`),
  misFavoritos: () => apiClient.get('/favoritos/mios'),
};
